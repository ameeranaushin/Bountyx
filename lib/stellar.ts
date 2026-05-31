import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';
import { Horizon, Transaction } from '@stellar/stellar-sdk';

export function getNetworkConfig() {
  return {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org',
    networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  };
}

export async function getFreighterPublicKey(): Promise<string> {
  const connected = await isConnected();
  if (!connected) {
    throw new Error('Freighter wallet is not installed. Please install the browser extension and reload.');
  }
  const publicKey = await getPublicKey();
  if (!publicKey) {
    throw new Error('Failed to retrieve public key. Please make sure Freighter is unlocked and connected.');
  }
  return publicKey;
}

export async function signAndSubmitTransaction(xdr: string): Promise<any> {
  const config = getNetworkConfig();
  
  let signedXdr: string;
  try {
    signedXdr = await signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: config.networkPassphrase,
    });
  } catch (err: any) {
    throw new Error(`Freighter signing cancelled or failed: ${err.message || err}`);
  }

  try {
    const horizon = new Horizon.Server(config.horizonUrl);
    const tx = new Transaction(signedXdr, config.networkPassphrase);
    const response = await horizon.submitTransaction(tx);
    return response;
  } catch (err: any) {
    console.error('Horizon transaction submission error:', err);
    if (err.response?.data?.extras?.result_codes) {
      const codes = err.response.data.extras.result_codes;
      throw new Error(`Transaction failed. Codes: ${JSON.stringify(codes)}`);
    }
    throw new Error(err.message || 'Transaction submission failed.');
  }
}

export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  const url = `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Friendbot error: ${res.status} ${res.statusText}`);
    }
    return true;
  } catch (err: any) {
    throw new Error(err.message || 'Friendbot funding request failed.');
  }
}
