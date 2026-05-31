#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, token, Address, Env, String, Vec,
};

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum BountyState {
    Open = 0,
    InProgress = 1,
    Submitted = 2,
    Completed = 3,
    Refunded = 4,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Bounty {
    pub id: u32,
    pub poster: Address,
    pub worker: Option<Address>,
    pub amount: i128,
    pub description: String,
    pub state: BountyState,
    pub expiry: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Token,
    BountyCount,
    Bounty(u32),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum BountyError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    BountyNotFound = 3,
    InvalidState = 4,
    NotAuthorized = 5,
    Expired = 6,
    NotExpired = 7,
    InvalidAmount = 8,
}

#[contract]
pub struct BountyBoardContract;

#[contractimpl]
impl BountyBoardContract {
    /// Initialize the contract with the token address (e.g. native XLM asset address)
    pub fn init(env: Env, token: Address) -> Result<(), BountyError> {
        if env.storage().instance().has(&DataKey::Token) {
            return Err(BountyError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::BountyCount, &0u32);
        Ok(())
    }

    /// Post a task with an XLM reward locked in the contract
    pub fn create_bounty(
        env: Env,
        poster: Address,
        amount: i128,
        description: String,
        timeout_duration: u64,
    ) -> Result<u32, BountyError> {
        poster.require_auth();

        if amount <= 0 {
            return Err(BountyError::InvalidAmount);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(BountyError::NotInitialized)?;

        // Transfer funds from poster to contract to lock the reward
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&poster, &env.current_contract_address(), &amount);

        // Get the next bounty ID
        let mut count: u32 = env.storage().instance().get(&DataKey::BountyCount).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::BountyCount, &count);

        let expiry = env.ledger().timestamp() + timeout_duration;

        let bounty = Bounty {
            id: count,
            poster: poster.clone(),
            worker: None,
            amount,
            description,
            state: BountyState::Open,
            expiry,
        };

        env.storage().persistent().set(&DataKey::Bounty(count), &bounty);

        // Emit creation event
        env.events().publish(
            (soroban_sdk::symbol_short!("created"), count),
            (poster, amount),
        );

        Ok(count)
    }

    /// Claim the task, marking it in-progress
    pub fn claim_bounty(env: Env, worker: Address, bounty_id: u32) -> Result<(), BountyError> {
        worker.require_auth();

        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.state != BountyState::Open {
            return Err(BountyError::InvalidState);
        }

        // Verify that the bounty hasn't expired yet
        if env.ledger().timestamp() >= bounty.expiry {
            return Err(BountyError::Expired);
        }

        bounty.worker = Some(worker.clone());
        bounty.state = BountyState::InProgress;

        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit claim event
        env.events().publish(
            (soroban_sdk::symbol_short!("claimed"), bounty_id),
            worker,
        );

        Ok(())
    }

    /// Worker submits work for review
    pub fn submit_work(env: Env, worker: Address, bounty_id: u32) -> Result<(), BountyError> {
        worker.require_auth();

        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.state != BountyState::InProgress {
            return Err(BountyError::InvalidState);
        }

        match &bounty.worker {
            Some(w) => {
                if *w != worker {
                    return Err(BountyError::NotAuthorized);
                }
            }
            None => return Err(BountyError::NotAuthorized),
        }

        bounty.state = BountyState::Submitted;

        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit submit event
        env.events().publish(
            (soroban_sdk::symbol_short!("submitted"), bounty_id),
            worker,
        );

        Ok(())
    }

    /// Poster approves work and releases locked reward to worker
    pub fn approve_bounty(env: Env, poster: Address, bounty_id: u32) -> Result<(), BountyError> {
        poster.require_auth();

        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.poster != poster {
            return Err(BountyError::NotAuthorized);
        }

        if bounty.state != BountyState::Submitted {
            return Err(BountyError::InvalidState);
        }

        let worker = bounty.worker.as_ref().ok_or(BountyError::InvalidState)?.clone();

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(BountyError::NotInitialized)?;

        // Transfer funds from contract to worker
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &worker, &bounty.amount);

        bounty.state = BountyState::Completed;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit approve event
        env.events().publish(
            (soroban_sdk::symbol_short!("approved"), bounty_id),
            worker,
        );

        Ok(())
    }

    /// Poster rejects work, resetting state to Open and clearing worker
    pub fn reject_work(env: Env, poster: Address, bounty_id: u32) -> Result<(), BountyError> {
        poster.require_auth();

        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.poster != poster {
            return Err(BountyError::NotAuthorized);
        }

        if bounty.state != BountyState::Submitted {
            return Err(BountyError::InvalidState);
        }

        bounty.worker = None;
        bounty.state = BountyState::Open;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit reject event
        env.events().publish(
            (soroban_sdk::symbol_short!("rejected"), bounty_id),
            poster,
        );

        Ok(())
    }

    /// Refund locked reward back to poster if bounty has expired and is not completed
    pub fn refund_bounty(env: Env, poster: Address, bounty_id: u32) -> Result<(), BountyError> {
        poster.require_auth();

        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.poster != poster {
            return Err(BountyError::NotAuthorized);
        }

        if env.ledger().timestamp() < bounty.expiry {
            return Err(BountyError::NotExpired);
        }

        if bounty.state == BountyState::Completed || bounty.state == BountyState::Refunded {
            return Err(BountyError::InvalidState);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(BountyError::NotInitialized)?;

        // Transfer funds back to poster
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &poster, &bounty.amount);

        bounty.state = BountyState::Refunded;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit refund event
        env.events().publish(
            (soroban_sdk::symbol_short!("refunded"), bounty_id),
            poster,
        );

        Ok(())
    }

    /// Read-only: get details of a single bounty
    pub fn get_bounty(env: Env, bounty_id: u32) -> Option<Bounty> {
        env.storage().persistent().get(&DataKey::Bounty(bounty_id))
    }

    /// Read-only: fetch a range of bounties for pagination/list views
    pub fn get_bounties(env: Env, from_id: u32, limit: u32) -> Vec<Bounty> {
        let count: u32 = env.storage().instance().get(&DataKey::BountyCount).unwrap_or(0);
        let mut list = Vec::new(&env);
        let mut id = from_id;
        let mut fetched = 0;
        
        while id <= count && fetched < limit {
            if let Some(bounty) = env.storage().persistent().get(&DataKey::Bounty(id)) {
                list.push_back(bounty);
                fetched += 1;
            }
            id += 1;
        }
        list
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, String, Address, testutils::{Address as _, Ledger}};

    #[test]
    fn test_bounty_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, BountyBoardContract);
        let client = BountyBoardContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract(admin.clone());
        let token = token::Client::new(&env, &token_address);

        client.init(&token_address);

        let poster = Address::generate(&env);
        let worker = Address::generate(&env);

        let token_admin = token::StellarAssetClient::new(&env, &token_address);
        token_admin.mint(&poster, &1000);

        assert_eq!(token.balance(&poster), 1000);

        // Create bounty
        let description = String::from_str(&env, "Build a bounty board");
        let bounty_id = client.create_bounty(&poster, &400, &description, &3600);
        assert_eq!(bounty_id, 1);
        assert_eq!(token.balance(&poster), 600);
        assert_eq!(token.balance(&contract_id), 400);

        // Check details
        let bounty = client.get_bounty(&bounty_id).unwrap();
        assert_eq!(bounty.amount, 400);
        assert_eq!(bounty.state, BountyState::Open);
        assert_eq!(bounty.worker, None);

        // Claim
        client.claim_bounty(&worker, &bounty_id);
        let bounty = client.get_bounty(&bounty_id).unwrap();
        assert_eq!(bounty.state, BountyState::InProgress);
        assert_eq!(bounty.worker, Some(worker.clone()));

        // Submit work
        client.submit_work(&worker, &bounty_id);
        let bounty = client.get_bounty(&bounty_id).unwrap();
        assert_eq!(bounty.state, BountyState::Submitted);

        // Approve work
        client.approve_bounty(&poster, &bounty_id);
        let bounty = client.get_bounty(&bounty_id).unwrap();
        assert_eq!(bounty.state, BountyState::Completed);

        // Check balances
        assert_eq!(token.balance(&worker), 400);
        assert_eq!(token.balance(&contract_id), 0);
    }

    #[test]
    fn test_refund_and_reject_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, BountyBoardContract);
        let client = BountyBoardContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract(admin.clone());
        let token = token::Client::new(&env, &token_address);

        client.init(&token_address);

        let poster = Address::generate(&env);
        let worker = Address::generate(&env);

        let token_admin = token::StellarAssetClient::new(&env, &token_address);
        token_admin.mint(&poster, &1000);

        // Create bounty with 10 seconds timeout
        let description = String::from_str(&env, "Short task");
        let bounty_id = client.create_bounty(&poster, &500, &description, &10);

        // Claim and Submit
        client.claim_bounty(&worker, &bounty_id);
        client.submit_work(&worker, &bounty_id);

        // Reject work
        client.reject_work(&poster, &bounty_id);
        let bounty = client.get_bounty(&bounty_id).unwrap();
        assert_eq!(bounty.state, BountyState::Open);
        assert_eq!(bounty.worker, None);

        // Wait for timeout (ledger time starts at 0, let's set it to 15)
        env.ledger().set(soroban_sdk::testutils::LedgerInfo {
            timestamp: 15,
            sequence_number: 0,
            network_id: [0; 32],
            base_reserve: 0,
            min_temp_entry_ttl: 0,
            min_persistent_entry_ttl: 0,
            max_entry_ttl: 0,
            protocol_version: 21,
        });

        // Refund
        client.refund_bounty(&poster, &bounty_id);
        let bounty = client.get_bounty(&bounty_id).unwrap();
        assert_eq!(bounty.state, BountyState::Refunded);
        assert_eq!(token.balance(&poster), 1000);
        assert_eq!(token.balance(&contract_id), 0);
    }
}
