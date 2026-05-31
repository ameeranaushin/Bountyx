'use client';

import React, { useState, useEffect } from 'react';
import WalletConnect from '../components/WalletConnect';
import MainFeature from '../components/MainFeature';
import { getNetworkConfig } from '../lib/stellar';
import { ShieldCheck, Info } from 'lucide-react';

export default function Home() {
  const [publicKey, setPublicKey] = useState('');
  const [balance, setBalance] = useState<string | undefined>(undefined);

  const refreshBalance = async () => {
    if (!publicKey) {
      setBalance(undefined);
      return;
    }
    try {
      const config = getNetworkConfig();
      const res = await fetch(`${config.horizonUrl}/accounts/${publicKey}`);
      if (res.ok) {
        const data = await res.json();
        const nativeBalance = data.balances.find((b: any) => b.asset_type === 'native');
        if (nativeBalance) {
          setBalance(
            Number(nativeBalance.balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        }
      } else {
        // Account exists but may be unactivated
        setBalance('0.00');
      }
    } catch (err) {
      console.error('Error loading account balance:', err);
      setBalance('0.00');
    }
  };

  useEffect(() => {
    refreshBalance();
    // Refresh balance periodically
    const interval = setInterval(refreshBalance, 20000);
    return () => clearInterval(interval);
  }, [publicKey]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Testnet Information Banner */}
      <div className="flex items-center gap-2.5 p-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl text-slate-300 text-xs">
        <ShieldCheck className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0" />
        <p className="font-medium">
          Target Network: <span className="text-indigo-400 font-bold">STELLAR TESTNET ONLY</span>. Please ensure your Freighter wallet extension is switched to Testnet mode under settings.
        </p>
      </div>

      {/* Wallet Connect Header */}
      <WalletConnect
        publicKey={publicKey}
        setPublicKey={setPublicKey}
        balance={balance}
        onRefreshBalance={refreshBalance}
      />

      {/* Main Feature Component */}
      <div className="bg-slate-900/10 p-1 border border-slate-900/20 rounded-3xl">
        <MainFeature publicKey={publicKey} />
      </div>

      {/* Footer Info */}
      <footer className="flex items-center justify-center gap-2 text-center text-[10px] text-slate-500 font-medium py-8 border-t border-slate-900/40">
        <Info className="h-3.5 w-3.5 text-slate-600" />
        <span>Stellar BountyX • Designed for Stellar Testnet Soroban Smart Contracts.</span>
      </footer>
    </main>
  );
}
