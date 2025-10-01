'use client';
import React from 'react';
import { PricePredictionCard } from './cards/PricePredictionCard';
import { TransferCard } from './cards/TransferCard';
import { SwapCard } from './cards/SwapCard';

export function IntentCard({ message }: { message: { intent:any; result:any } }) {
  const { intent, result } = message;
  switch (intent.type) {
    case 'price_prediction':
      return <PricePredictionCard tokens={intent.tokens} horizon_days={intent.horizon_days ?? 7} />;
    case 'transfer':
      return <TransferCard intent={intent} result={result} />;
    case 'swap':
      return <SwapCard intent={intent} result={result} />;
    default:
      return <div className="card"><pre>{JSON.stringify({ intent, result }, null, 2)}</pre></div>;
  }
}
