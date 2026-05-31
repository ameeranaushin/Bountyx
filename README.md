# Stellar BountyX — On-Chain Task Bounty Board

Stellar BountyX is a decentralized bounty platform built on the Stellar Soroban smart contract network. It allows anyone to post tasks with an XLM reward locked in a secure on-chain escrow contract. Workers can browse and claim active tasks to mark them in-progress, and submit completed work. The bounty poster can then approve the work to release the locked XLM reward directly to the worker's wallet, or reject it to reset the bounty. If a task remains uncompleted past a user-defined timeout, the poster can claim a refund to recover their locked funds.

## Tech Stack
- **Smart Contract**: Rust with Soroban SDK (`soroban-sdk = "21.0.0"`)
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Stellar Client**: `@stellar/stellar-sdk` (latest)
- **Wallet Integration**: Freighter browser extension (`@stellar/freighter-api`)
- **Network target**: Stellar Testnet Only

## Prerequisites
- **Rust installed**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Wasm target**: `rustup target add wasm32-unknown-unknown`
- **Stellar CLI**: `cargo install --locked stellar-cli --features opt`
- **Node.js**: Version 18+
- **Freighter Wallet Extension**: Installed from [freighter.app](https://www.freighter.app/)

## Project Structure
```text
├── contracts/
│   ├── src/
│   │   └── lib.rs                  # Full Soroban smart contract in Rust (escrow, claim, timeout)
│   └── Cargo.toml                  # Crate config using soroban-sdk version 21.0.0
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # Next.js App Router root layout
│   │   ├── page.tsx                # Home page binding wallet connection and main features
│   │   └── globals.css             # Tailwind imports and animations
│   ├── components/
│   │   ├── WalletConnect.tsx       # Freighter connect/disconnect and Friendbot funding button
│   │   └── MainFeature.tsx         # Bounty board UI: post form, tabs, actions, and timers
│   ├── lib/
│   │   ├── stellar.ts              # Freighter and Horizon helper functions
│   │   └── contract.ts             # RPC/Simulation wrapper calling the Soroban contract
│   ├── types/
│   │   └── index.ts                # TypeScript interface declarations for bounties and state
│   ├── package.json                # Frontend package dependencies and build scripts
│   └── tailwind.config.ts          # Tailwind styling path configuration
├── .env.example                    # Template environment variables for local run
└── README.md                       # Comprehensive guide and reference document
```

---

## Step 1 — Build the Smart Contract
1. Navigate into the contracts directory:
   ```bash
   cd contracts
   ```
2. Build the optimized WebAssembly file:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```
This command compiles the contract and produces the optimized `.wasm` bytecode inside:
`target/wasm32-unknown-unknown/release/bounty_board.wasm`

---

## Step 2 — Set Up a Testnet Identity
Before deploying, generate a Stellar account keypair for signing transactions on the Testnet network:
```bash
stellar keys generate --global my-key --network testnet
```
Verify the generated public key address using:
```bash
stellar keys address my-key
```
*Note: This command automatically hits the Testnet Friendbot to fund your new account with free testnet XLM.*

---

## Step 3 — Deploy Contract to Testnet
Deploy your contract bytecode to the Stellar Testnet using the identity set up in Step 2:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/bounty_board.wasm \
  --source my-key \
  --network testnet
```
Copy the returned **Contract ID** (looks like `CDLZ...` or similar) — you will need this to configure the frontend environment variable in Step 5.

---

## Step 4 — Install Frontend Dependencies
Navigate into the frontend folder and install the Node packages:
```bash
cd ../frontend
npm install
```

---

## Step 5 — Configure Environment Variables
Copy the env template from the root into the frontend directory:
```bash
cp ../.env.example .env.local
```
Open `.env.local` in a text editor and fill in your deployed contract ID:
```env
NEXT_PUBLIC_CONTRACT_ID=YOUR_DEPLOYED_CONTRACT_ID_HERE
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

---

## Step 6 — Run the Frontend
Launch the Next.js development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## Step 7 — Using the App
1. **Wallet Setup**: Install the Freighter browser extension from [freighter.app](https://www.freighter.app/). Switch Freighter to Testnet mode: **Settings** → **Network** → **Testnet**.
2. **Connect Wallet**: Click the **Connect Freighter Wallet** button at the top of the page. Once connected, your truncated address and balance will display.
3. **Fund Wallet**: If your wallet is new and holds 0 XLM, click the **Get Testnet XLM** button next to your address to trigger a Friendbot request and fund your account.
4. **Post a Bounty**: Enter a description (e.g. "Build custom CSS theme"), a reward in XLM (e.g. 50), select a refund timeout (e.g. "2 Minutes" for testing, or "1 Hour"), and click **Post Bounty**. Approve the transaction in your Freighter popup.
5. **Claim a Bounty**: (To test this fully, switch to a second Freighter wallet or account). Click **Claim Bounty** on an open bounty.
6. **Submit Work**: Once claimed, the worker can click **Submit Work** on the bounty card.
7. **Approve / Reject**: The poster will see the status update to "Submitted" and can click **Approve Completion** (releasing XLM to the worker) or **Reject Work** (resetting the task to "Open" for anyone to claim).
8. **Claim Refund**: If the task timeout expires before work is approved, the poster can click **Claim Refund** on their card to unlock their XLM and close the bounty.

---

## Smart Contract Functions

| Function Name | Parameters | Description | Call Type |
|---|---|---|---|
| `init` | `token: Address` | Binds the contract to a payment asset token (e.g. the native Stellar Asset Contract Address for XLM). | Write |
| `create_bounty` | `poster: Address`, `amount: i128`, `description: String`, `timeout_duration: u64` | Transferson amount of XLM to the contract, increments the bounty ID, and registers a new bounty. | Write |
| `claim_bounty` | `worker: Address`, `bounty_id: u32` | Binds a worker's address to a bounty and changes its state to `InProgress`. | Write |
| `submit_work` | `worker: Address`, `bounty_id: u32` | Flags a claimed bounty as `Submitted` and awaits poster approval. | Write |
| `approve_bounty` | `poster: Address`, `bounty_id: u32` | Releases locked XLM from the contract escrow to the worker and marks state as `Completed`. | Write |
| `reject_work` | `poster: Address`, `bounty_id: u32` | Rejects the worker's work, clears the worker, and reverts the state back to `Open`. | Write |
| `refund_bounty` | `poster: Address`, `bounty_id: u32` | Returns the locked XLM back to the poster if the bounty is not completed and the timeout has expired. | Write |
| `get_bounty` | `bounty_id: u32` | Returns details (poster, worker, amount, description, state, expiry) of a single bounty. | Read |
| `get_bounties` | `from_id: u32`, `limit: u32` | Returns an array of bounties for list views, starting from the given ID. | Read |

---

## Common Errors & Fixes
- **"Transaction simulation failed: Error"**: Verify that you have filled `NEXT_PUBLIC_CONTRACT_ID` in `.env.local` and that the contract was successfully initialized using Freighter.
- **"Freighter wallet is not installed"**: Ensure the Freighter browser extension is active in your browser and refresh the page.
- **"Account not found or unfunded on Testnet"**: Click **Get Testnet XLM** next to your address to register and fund your address on the Testnet ledger.
- **"wasm32 target not found"**: If contract build fails, run `rustup target add wasm32-unknown-unknown` and try compiling again.

## Testnet Resources
- **Stellar Testnet Explorer**: [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
- **Stellar Lab (manual transactions)**: [lab.stellar.org](https://lab.stellar.org/)
- **Friendbot Endpoint**: `https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY`
