import { SwapTransaction } from "../lib/intents.ts";

interface SwapCardProps {
  data: SwapTransaction;
}

export default function SwapCard({ data }: SwapCardProps) {
  const handleApprove = () => {
    // This would integrate with WalletConnect
    alert("WalletConnect integration would be triggered here");
  };

  return (
    <div class="card swap-card">
      <h3>Swap Transaction</h3>
      
      <div class="swap-details">
        <div class="swap-row">
          <label>From</label>
          <span class="value">
            {data.amount} {data.from}
          </span>
        </div>
        <div class="swap-arrow">↓</div>
        <div class="swap-row">
          <label>To (estimated)</label>
          <span class="value">
            {data.estimatedOutput.toFixed(4)} {data.to}
          </span>
        </div>
        <div class="swap-row">
          <label>Slippage Tolerance</label>
          <span class="value">{data.slippage}%</span>
        </div>
      </div>

      <div class="swap-actions">
        <button type="button" class="approve-btn" onClick={handleApprove}>
          Approve & Sign Transaction
        </button>
        <p class="swap-note">
          This will open your wallet to sign the transaction on Celo DEX
        </p>
      </div>
    </div>
  );
}
