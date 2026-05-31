export enum BountyState {
  Open = 0,
  InProgress = 1,
  Submitted = 2,
  Completed = 3,
  Refunded = 4,
}

export interface Bounty {
  id: number;
  poster: string;
  worker?: string;
  amount: string; // Human-readable XLM amount (e.g. "50.0")
  description: string;
  state: BountyState;
  expiry: number; // Unix timestamp in seconds
}
