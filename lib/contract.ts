import {
  Contract,
  Operation,
  xdr,
  Address,
  Account,
  TransactionBuilder,
  SorobanRpc,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk';
import { getNetworkConfig, signAndSubmitTransaction } from './stellar';
import { Bounty, BountyState } from '../types';

const DUMMY_SOURCE = 'GBRPJSZMTQC6FJVEFSG2V2ZXG3JQ4QWECMQWCTFX26I2YPFK7C64GN4C';

function getRpcServer(): SorobanRpc.Server {
  const config = getNetworkConfig();
  return new SorobanRpc.Server(config.rpcUrl);
}

function getContractId(): string {
  const id = process.env.NEXT_PUBLIC_CONTRACT_ID;
  if (!id) {
    throw new Error('NEXT_PUBLIC_CONTRACT_ID is not configured in environment variables.');
  }
  return id;
}

function parseBountyState(nativeState: any): BountyState {
  if (typeof nativeState === 'string') {
    return parseStateStr(nativeState);
  }
  if (nativeState && typeof nativeState === 'object') {
    if (nativeState.name) return parseStateStr(nativeState.name);
    if (nativeState.switch) return parseStateStr(nativeState.switch);
    const keys = Object.keys(nativeState);
    if (keys.length > 0) return parseStateStr(keys[0]);
  }
  return BountyState.Open;
}

function parseStateStr(str: string): BountyState {
  switch (str) {
    case 'Open': return BountyState.Open;
    case 'InProgress': return BountyState.InProgress;
    case 'Submitted': return BountyState.Submitted;
    case 'Completed': return BountyState.Completed;
    case 'Refunded': return BountyState.Refunded;
    default: return BountyState.Open;
  }
}

function mapBounty(val: any): Bounty {
  return {
    id: Number(val.id),
    poster: typeof val.poster === 'string' ? val.poster : val.poster.toString(),
    worker: val.worker ? (typeof val.worker === 'string' ? val.worker : val.worker.toString()) : undefined,
    amount: (Number(BigInt(val.amount)) / 10000000).toString(),
    description: val.description.toString(),
    state: parseBountyState(val.state),
    expiry: Number(val.expiry),
  };
}

async function simulateCall(funcName: string, args: xdr.ScVal[]): Promise<any> {
  const server = getRpcServer();
  const contractId = getContractId();
  const config = getNetworkConfig();

  const source = new Account(DUMMY_SOURCE, '0');
  const tx = new TransactionBuilder(source, {
    fee: '100000',
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: funcName,
        args,
      })
    )
    .setTimeout(30)
    .build();

  const simResponse = await server.simulateTransaction(tx);
  if ('error' in simResponse && simResponse.error) {
    throw new Error(`Simulation failed: ${simResponse.error}`);
  }

  let resultVal: any = null;
  if ('result' in simResponse && simResponse.result) {
    resultVal = simResponse.result.retval;
  } else if ('results' in simResponse && simResponse.results && simResponse.results[0]) {
    resultVal = simResponse.results[0].retval;
  }

  return resultVal;
}

async function executeTransaction(
  sourceAddress: string,
  funcName: string,
  args: xdr.ScVal[]
): Promise<any> {
  const server = getRpcServer();
  const contractId = getContractId();
  const config = getNetworkConfig();

  // Fetch sequence number
  const horizonUrl = config.horizonUrl;
  const res = await fetch(`${horizonUrl}/accounts/${sourceAddress}`);
  if (!res.ok) {
    throw new Error(`Account not found or unfunded on Testnet. Please fund ${sourceAddress} using the "Get Testnet XLM" button.`);
  }
  const accountData = await res.json();
  const sourceAccount = new Account(sourceAddress, accountData.sequence);

  // Build txn
  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: funcName,
        args,
      })
    )
    .setTimeout(180);

  let tx: any = txBuilder.build();

  // Simulate
  const simResponse = await server.simulateTransaction(tx);
  if ('error' in simResponse && simResponse.error) {
    throw new Error(`Transaction simulation failed: ${simResponse.error}`);
  }

  // Assemble resources
  tx = SorobanRpc.assembleTransaction(tx, simResponse);

  // Submit to Freighter + Horizon
  const result = await signAndSubmitTransaction(tx.toXDR());
  return result;
}

// CONTRACT ACTIONS

export async function initContract(sourceAddress: string, tokenAddress: string): Promise<any> {
  const tokenScVal = Address.fromString(tokenAddress).toScVal();
  return executeTransaction(sourceAddress, 'init', [tokenScVal]);
}

export async function createBounty(
  posterAddress: string,
  amountXlm: string,
  description: string,
  timeoutDurationSec: number
): Promise<any> {
  // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
  const stroops = BigInt(Math.floor(Number(amountXlm) * 10000000));
  
  const posterScVal = Address.fromString(posterAddress).toScVal();
  const amountScVal = nativeToScVal(stroops, { type: 'i128' });
  const descScVal = nativeToScVal(description, { type: 'string' });
  const timeoutScVal = nativeToScVal(BigInt(timeoutDurationSec), { type: 'u64' });

  return executeTransaction(posterAddress, 'create_bounty', [
    posterScVal,
    amountScVal,
    descScVal,
    timeoutScVal,
  ]);
}

export async function claimBounty(workerAddress: string, bountyId: number): Promise<any> {
  const workerScVal = Address.fromString(workerAddress).toScVal();
  const idScVal = nativeToScVal(bountyId, { type: 'u32' });

  return executeTransaction(workerAddress, 'claim_bounty', [workerScVal, idScVal]);
}

export async function submitWork(workerAddress: string, bountyId: number): Promise<any> {
  const workerScVal = Address.fromString(workerAddress).toScVal();
  const idScVal = nativeToScVal(bountyId, { type: 'u32' });

  return executeTransaction(workerAddress, 'submit_work', [workerScVal, idScVal]);
}

export async function approveBounty(posterAddress: string, bountyId: number): Promise<any> {
  const posterScVal = Address.fromString(posterAddress).toScVal();
  const idScVal = nativeToScVal(bountyId, { type: 'u32' });

  return executeTransaction(posterAddress, 'approve_bounty', [posterScVal, idScVal]);
}

export async function rejectWork(posterAddress: string, bountyId: number): Promise<any> {
  const posterScVal = Address.fromString(posterAddress).toScVal();
  const idScVal = nativeToScVal(bountyId, { type: 'u32' });

  return executeTransaction(posterAddress, 'reject_work', [posterScVal, idScVal]);
}

export async function refundBounty(posterAddress: string, bountyId: number): Promise<any> {
  const posterScVal = Address.fromString(posterAddress).toScVal();
  const idScVal = nativeToScVal(bountyId, { type: 'u32' });

  return executeTransaction(posterAddress, 'refund_bounty', [posterScVal, idScVal]);
}

export async function getBounty(bountyId: number): Promise<Bounty | null> {
  const idScVal = nativeToScVal(bountyId, { type: 'u32' });
  try {
    const resVal = await simulateCall('get_bounty', [idScVal]);
    if (!resVal) return null;
    const nativeVal = scValToNative(resVal);
    if (!nativeVal) return null;
    return mapBounty(nativeVal);
  } catch (err) {
    console.error('getBounty error:', err);
    return null;
  }
}

export async function getBounties(fromId: number, limit: number): Promise<Bounty[]> {
  const fromIdScVal = nativeToScVal(fromId, { type: 'u32' });
  const limitScVal = nativeToScVal(limit, { type: 'u32' });
  try {
    const resVal = await simulateCall('get_bounties', [fromIdScVal, limitScVal]);
    if (!resVal) return [];
    const nativeVal = scValToNative(resVal);
    if (!Array.isArray(nativeVal)) return [];
    return nativeVal.map(mapBounty);
  } catch (err) {
    console.error('getBounties error:', err);
    return [];
  }
}
