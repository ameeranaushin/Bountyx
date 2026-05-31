'use client';

import React, { useState, useEffect } from 'react';
import { getFreighterPublicKey, fundWithFriendbot } from '../lib/stellar';
import { Wallet, LogOut, Coins, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WalletConnectProps {
  publicKey: string;
  setPublicKey: (key: string) => void;
  onRefreshBalance?: () => void;
  balance?: string;
}

export default function WalletConnect({
  publicKey,
  setPublicKey,
  onRefreshBalance,
  balance,
}: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const truncateKey = (key: string) => {
    if (!key) return '';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const key = await getFreighterPublicKey();
      setPublicKey(key);
      setSuccess('Wallet connected successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to connect Freighter wallet.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setError(null);
    setSuccess(null);
  };

  const handleFund = async () => {
    if (!publicKey) return;
    setFunding(true);
    setError(null);
    setSuccess(null);
    try {
      await fundWithFriendbot(publicKey);
      setSuccess('Account funded with 10,000 Testnet XLM!');
      if (onRefreshBalance) {
        setTimeout(onRefreshBalance, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Friendbot funding failed.');
    } finally {
      setFunding(false);
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stellar BountyX
            </h1>
            <p className="text-xs text-slate-400 font-medium">Decentralized Task Bounty Board</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {publicKey ? (
            <>
              <div className="flex flex-col items-end mr-2 text-right">
                <span className="text-xs text-slate-400">Wallet Connected</span>
                <span className="font-mono text-sm text-slate-200 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                  {truncateKey(publicKey)}
                </span>
                {balance !== undefined && (
                  <span className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {balance} XLM
                  </span>
                )}
              </div>

              <button
                onClick={handleFund}
                disabled={funding}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02]"
              >
                {funding ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Funding...
                  </>
                ) : (
                  <>
                    <Coins className="h-3.5 w-3.5" />
                    Get Testnet XLM
                  </>
                )}
              </button>

              <button
                onClick={handleDisconnect}
                className="p-2.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 rounded-xl transition-all duration-200"
                title="Disconnect Wallet"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-100 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Connect Freighter Wallet
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mt-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-fadeIn">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 mt-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
    </div>
  );
}
