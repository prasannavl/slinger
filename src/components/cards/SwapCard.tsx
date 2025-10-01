'use client';
import React from 'react';
import { motion } from 'framer-motion';

export function SwapCard({ intent, result }:{ intent:any; result:any }){
  return (
    <motion.div className="card" initial={{ opacity:0, translateY:4, scale:.995 }} animate={{ opacity:1, translateY:0, scale:1 }} transition={{ duration:.22 }}>
      <h3>Swap</h3>
      <p>{intent.amount} {intent.sell_token} → {intent.buy_token}</p>
      {result?.quote ? <p>Quote out: {result.quote.amountOut} (min {result.quote.minOut})</p> : null}
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <small className="muted">Unsigned; push via WalletConnect or injected wallet.</small>
    </motion.div>
  );
}
