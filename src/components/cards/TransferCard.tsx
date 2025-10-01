'use client';
import React from 'react';
import { motion } from 'framer-motion';

export function TransferCard({ intent, result }:{ intent:any; result:any }){
  return (
    <motion.div className="card" initial={{ opacity:0, translateY:4, scale:.995 }} animate={{ opacity:1, translateY:0, scale:1 }} transition={{ duration:.22 }}>
      <h3>Transfer</h3>
      <p>{intent.chain.family==='evm' ? `EVM(${intent.chain.chain_id})` : 'Solana'} — {intent.amount} {intent.token} → {intent.to}</p>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <small className="muted">Unsigned. Review/sign in your wallet.</small>
    </motion.div>
  );
}
