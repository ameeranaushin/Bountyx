'use client';

import React, { useState, useEffect } from 'react';
import { Bounty, BountyState } from '../types';
import {
  getBounties,
  createBounty,
  claimBounty,
  submitWork,
  approveBounty,
  rejectWork,
  refundBounty,
} from '../lib/contract';
import {
  PlusCircle,
  Clock,
  User,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Play,
  Send,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface MainFeatureProps {
  publicKey: string;
}

export default function MainFeature({ publicKey }: MainFeatureProps) {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'open' | 'claimed' | 'posted' | 'history'>('open');

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [timeout, setTimeoutVal] = useState('3600'); // Default: 1 hour

  // Error/Success overlays
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Time updater for cards
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    loadBounties();
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBounties = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getBounties(1, 100);
      // Sort newest (highest ID) first
      setBounties(list.sort((a, b) => b.id - a.id));
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch bounties from contract. Make sure you set the correct CONTRACT_ID in .env.local');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setError('Please connect your Freighter wallet first.');
      return;
    }
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setError('Please fill in all bounty fields correctly.');
      return;
    }

    setActionLoading('create');
    setError(null);
    setSuccess(null);
    try {
      await createBounty(publicKey, amount, description, Number(timeout));
      setSuccess('Bounty created successfully!');
      setDescription('');
      setAmount('');
      await loadBounties();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Transaction failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaim = async (id: number) => {
    if (!publicKey) {
      setError('Please connect your Freighter wallet.');
      return;
    }
    setActionLoading(`claim-${id}`);
    setError(null);
    setSuccess(null);
    try {
      await claimBounty(publicKey, id);
      setSuccess('Bounty claimed successfully! Get to work!');
      await loadBounties();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to claim bounty.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitWork = async (id: number) => {
    if (!publicKey) return;
    setActionLoading(`submit-${id}`);
    setError(null);
    setSuccess(null);
    try {
      await submitWork(publicKey, id);
      setSuccess('Work submitted successfully! Awaiting poster review.');
      await loadBounties();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit work.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: number) => {
    if (!publicKey) return;
    setActionLoading(`approve-${id}`);
    setError(null);
    setSuccess(null);
    try {
      await approveBounty(publicKey, id);
      setSuccess('Work approved! Reward funds released to worker.');
      await loadBounties();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to approve completion.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!publicKey) return;
    setActionLoading(`reject-${id}`);
    setError(null);
    setSuccess(null);
    try {
      await rejectWork(publicKey, id);
      setSuccess('Submission rejected. Bounty state reverted to Open.');
      await loadBounties();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reject submission.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (id: number) => {
    if (!publicKey) return;
    setActionLoading(`refund-${id}`);
    setError(null);
    setSuccess(null);
    try {
      await refundBounty(publicKey, id);
      setSuccess('Bounty refunded. Locked XLM returned to your wallet.');
      await loadBounties();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to claim refund.');
    } finally {
      setActionLoading(null);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const formatRemainingTime = (expiry: number) => {
    const diff = expiry - currentTime;
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  // Filter logic
  const filteredBounties = bounties.filter((b) => {
    switch (activeTab) {
      case 'open':
        return b.state === BountyState.Open && b.expiry > currentTime;
      case 'claimed':
        return (
          b.worker?.toLowerCase() === publicKey.toLowerCase() &&
          (b.state === BountyState.InProgress || b.state === BountyState.Submitted)
        );
      case 'posted':
        return (
          b.poster.toLowerCase() === publicKey.toLowerCase() &&
          b.state !== BountyState.Completed &&
          b.state !== BountyState.Refunded
        );
      case 'history':
        return (
          b.state === BountyState.Completed ||
          b.state === BountyState.Refunded ||
          (b.state === BountyState.Open && b.expiry <= currentTime)
        );
      default:
        return true;
    }
  });

  const getStatusBadge = (bounty: Bounty) => {
    const isExpired = bounty.expiry <= currentTime;
    
    if (bounty.state === BountyState.Completed) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Completed
        </span>
      );
    }
    if (bounty.state === BountyState.Refunded) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700/20 text-slate-400 border border-slate-700/30">
          Refunded
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Expired
        </span>
      );
    }
    if (bounty.state === BountyState.Open) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Open
        </span>
      );
    }
    if (bounty.state === BountyState.InProgress) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          In Progress
        </span>
      );
    }
    if (bounty.state === BountyState.Submitted) {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Submitted
        </span>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      {/* Left Column: Create Form */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-200">Post New Bounty</h2>
          </div>

          <form onSubmit={handleCreateBounty} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Task Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task required..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none resize-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Reward Amount (XLM)
              </label>
              <input
                type="number"
                step="0.0000001"
                min="0.0000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Refund Timeout Duration
              </label>
              <select
                value={timeout}
                onChange={(e) => setTimeoutVal(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-200 outline-none transition-all duration-200"
              >
                <option value="120">2 Minutes (Testing)</option>
                <option value="3600">1 Hour</option>
                <option value="86400">1 Day</option>
                <option value="259200">3 Days</option>
                <option value="604800">7 Days</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading === 'create' || !publicKey}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-slate-100 font-bold rounded-xl shadow-md disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
            >
              {actionLoading === 'create' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Bounty...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Post Bounty
                </>
              )}
            </button>
            {!publicKey && (
              <p className="text-[10px] text-center text-rose-400 font-medium">
                * Connect wallet to enable posting
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Right Columns: Bounty list */}
      <div className="lg:col-span-2 space-y-6">
        {/* Navigation Tabs and Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20 p-2 rounded-2xl border border-slate-800/40">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'open'
                  ? 'bg-indigo-600 text-slate-100 shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              Open Bounties
            </button>
            <button
              onClick={() => setActiveTab('claimed')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'claimed'
                  ? 'bg-indigo-600 text-slate-100 shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              My Claims
            </button>
            <button
              onClick={() => setActiveTab('posted')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'posted'
                  ? 'bg-indigo-600 text-slate-100 shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              My Posts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-slate-100 shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              Archive / Ended
            </button>
          </div>

          <button
            onClick={loadBounties}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-slate-700/50 rounded-xl transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </button>
        </div>

        {/* Global Success/Error indicators */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-sm">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Transaction Failed:</span>
              <p className="mt-0.5 text-xs text-rose-300 font-medium break-all">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-400 text-sm">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Success!</span>
              <p className="mt-0.5 text-xs text-emerald-300 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Bounty list or empty state */}
        {loading && bounties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/50 rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm text-slate-400">Loading bounties from Stellar ledger...</p>
          </div>
        ) : filteredBounties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/50 rounded-2xl text-center px-4">
            <Layers className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-base font-bold text-slate-300">No bounties found</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              There are no tasks available under this filter. Post a new bounty on the left to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBounties.map((bounty) => {
              const isPoster = publicKey && bounty.poster.toLowerCase() === publicKey.toLowerCase();
              const isWorker = publicKey && bounty.worker?.toLowerCase() === publicKey.toLowerCase();
              const isExpired = bounty.expiry <= currentTime;

              return (
                <div
                  key={bounty.id}
                  className="p-5 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-850 hover:border-slate-800 rounded-2xl shadow-md transition-all duration-200"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">
                        Bounty #{bounty.id}
                      </span>
                      {getStatusBadge(bounty)}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-base text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-xl border border-emerald-500/10">
                      <span>{bounty.amount}</span>
                      <span className="text-xs text-emerald-500 font-medium">XLM</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm font-semibold text-slate-200 break-words mb-4 leading-relaxed">
                    {bounty.description}
                  </p>

                  {/* Meta Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3.5 bg-slate-950/40 border border-slate-850/50 rounded-xl">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span>Poster:</span>
                        <span className="font-mono text-slate-300 font-medium" title={bounty.poster}>
                          {truncateAddress(bounty.poster)}
                        </span>
                        {isPoster && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>

                      {bounty.worker && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Check className="h-3.5 w-3.5 text-slate-500" />
                          <span>Worker:</span>
                          <span className="font-mono text-slate-300 font-medium" title={bounty.worker}>
                            {truncateAddress(bounty.worker)}
                          </span>
                          {isWorker && (
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>Timeout Expiry:</span>
                      {bounty.state === BountyState.Completed || bounty.state === BountyState.Refunded ? (
                        <span className="text-slate-500">Ended</span>
                      ) : (
                        <span
                          className={`font-semibold ${
                            isExpired ? 'text-rose-400' : 'text-slate-300'
                          }`}
                        >
                          {formatRemainingTime(bounty.expiry)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex justify-end gap-2.5">
                    {/* Claim Bounty Button (Open & Not Expired) */}
                    {bounty.state === BountyState.Open && !isExpired && (
                      <button
                        onClick={() => handleClaim(bounty.id)}
                        disabled={
                          actionLoading !== null || !publicKey || isPoster
                        }
                        className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-slate-100 rounded-xl disabled:opacity-50 transition-all duration-155"
                      >
                        {actionLoading === `claim-${bounty.id}` ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            Claim Bounty
                          </>
                        )}
                      </button>
                    )}

                    {/* Submit Work Button (InProgress & Claimed by current user) */}
                    {bounty.state === BountyState.InProgress && isWorker && (
                      <button
                        onClick={() => handleSubmitWork(bounty.id)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-slate-100 rounded-xl disabled:opacity-50 transition-all duration-155"
                      >
                        {actionLoading === `submit-${bounty.id}` ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Submit Work
                          </>
                        )}
                      </button>
                    )}

                    {/* Poster Approvals / Rejections (Submitted state) */}
                    {bounty.state === BountyState.Submitted && isPoster && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(bounty.id)}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 rounded-xl disabled:opacity-50 transition-all duration-155"
                        >
                          {actionLoading === `reject-${bounty.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                          Reject Work
                        </button>
                        <button
                          onClick={() => handleApprove(bounty.id)}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-slate-100 rounded-xl disabled:opacity-50 transition-all duration-155"
                        >
                          {actionLoading === `approve-${bounty.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Approve Completion
                        </button>
                      </div>
                    )}

                    {/* Poster Refund Action (Expired & Not Completed/Refunded) */}
                    {isExpired &&
                      bounty.state !== BountyState.Completed &&
                      bounty.state !== BountyState.Refunded &&
                      isPoster && (
                        <button
                          onClick={() => handleRefund(bounty.id)}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-slate-100 rounded-xl disabled:opacity-50 transition-all duration-155 shadow-md shadow-rose-600/10"
                        >
                          {actionLoading === `refund-${bounty.id}` ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Refunding...
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5" />
                              Claim Refund
                            </>
                          )}
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
