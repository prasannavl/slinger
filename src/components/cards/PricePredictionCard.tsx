'use client';
import React from 'react';
import { motion } from 'framer-motion';

function simple(symbol:string, horizon:number){
  const base = 112935.19;
  const pct = Number((((Math.sin(symbol.length + horizon) + 1) * 0.5 - 0.5) * 4).toFixed(2));
  const target = Number((base*(1+pct/100)).toFixed(2));
  return { pct, target };
}

export function PricePredictionCard({ tokens, horizon_days }:{ tokens:string[]; horizon_days:number }){
  return (
    <motion.div className="card" initial={{ opacity:0, translateY:4, scale:.995 }} animate={{ opacity:1, translateY:0, scale:1 }} transition={{ duration:.22 }}>
      <h3>Predictions ({horizon_days}d)</h3>
      <table style={{ width:'100%', borderSpacing:0 }}>
        <thead><tr><th style={{textAlign:'left'}}>Token</th><th>Δ%</th><th>Target</th></tr></thead>
        <tbody>
          {tokens.map(t=>{
            const m = simple(t, horizon_days);
            return <tr key={t}><td>{t}</td><td style={{color:m.pct>=0?'#27c782':'#e74c3c'}}>{m.pct}%</td><td>${m.target}</td></tr>;
          })}
        </tbody>
      </table>
      <small className="muted">Toy model; not financial advice.</small>
    </motion.div>
  );
}
