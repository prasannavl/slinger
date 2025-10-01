import { PriceData } from "../lib/types.ts";

interface PriceSummaryCardProps {
  data: PriceData[];
}

export default function PriceSummaryCard({ data }: PriceSummaryCardProps) {
  return (
    <div class="card price-summary-card">
      <h3>Price Summary</h3>
      <div class="price-table">
        <div class="table-header">
          <span>Coin</span>
          <span>Price</span>
          <span>24h Vol</span>
          <span>1h</span>
          <span>3h</span>
          <span>6h</span>
          <span>12h</span>
          <span>24h</span>
          <span>48h</span>
        </div>
        {data.map((coin) => (
          <div key={coin.coin} class="table-row">
            <span class="coin-name">{coin.coin}</span>
            <span>${coin.price.toLocaleString()}</span>
            <span>${(coin.volume24h / 1e9).toFixed(2)}B</span>
            <span class={getPredictionClass(coin.prediction1h, coin.price)}>
              {formatPrediction(coin.prediction1h)}
            </span>
            <span class={getPredictionClass(coin.prediction3h, coin.price)}>
              {formatPrediction(coin.prediction3h)}
            </span>
            <span class={getPredictionClass(coin.prediction6h, coin.price)}>
              {formatPrediction(coin.prediction6h)}
            </span>
            <span class={getPredictionClass(coin.prediction12h, coin.price)}>
              {formatPrediction(coin.prediction12h)}
            </span>
            <span class={getPredictionClass(coin.prediction24h, coin.price)}>
              {formatPrediction(coin.prediction24h)}
            </span>
            <span class={getPredictionClass(coin.prediction48h, coin.price)}>
              {formatPrediction(coin.prediction48h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPrediction(value?: number): string {
  if (!value) return "—";
  return `$${value.toLocaleString()}`;
}

function getPredictionClass(prediction?: number, currentPrice?: number): string {
  if (!prediction || !currentPrice) return "";
  const change = ((prediction - currentPrice) / currentPrice) * 100;
  if (change > 2) return "bullish";
  if (change < -2) return "bearish";
  return "neutral";
}
