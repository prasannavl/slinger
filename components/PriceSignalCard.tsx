import { PriceData } from "../lib/types.ts";

interface PriceSignalCardProps {
  data: PriceData;
}

export default function PriceSignalCard({ data }: PriceSignalCardProps) {
  const getSocialTrendLabel = (trend?: number): string => {
    if (!trend) return "Neutral";
    if (trend > 0.5) return "Very Bullish";
    if (trend > 0.2) return "Bullish";
    if (trend < -0.5) return "Very Bearish";
    if (trend < -0.2) return "Bearish";
    return "Neutral";
  };

  const getSocialTrendColor = (trend?: number): string => {
    if (!trend) return "neutral";
    if (trend > 0.2) return "bullish";
    if (trend < -0.2) return "bearish";
    return "neutral";
  };

  return (
    <div class="card price-signal-card">
      <h3>{data.coin} Price Signal</h3>
      
      <div class="current-stats">
        <div class="stat">
          <label>Current Price</label>
          <span class="value">${data.price.toLocaleString()}</span>
        </div>
        <div class="stat">
          <label>24h Volume</label>
          <span class="value">${(data.volume24h / 1e9).toFixed(2)}B</span>
        </div>
        <div class="stat">
          <label>Social Trend</label>
          <span class={`value ${getSocialTrendColor(data.socialTrend)}`}>
            {getSocialTrendLabel(data.socialTrend)} ({data.socialTrend?.toFixed(2)})
          </span>
        </div>
      </div>

      <div class="predictions">
        <h4>Price Predictions</h4>
        <div class="prediction-grid">
          <div class="prediction-item">
            <label>1 Hour</label>
            <span>${data.prediction1h?.toLocaleString() || "—"}</span>
          </div>
          <div class="prediction-item">
            <label>3 Hours</label>
            <span>${data.prediction3h?.toLocaleString() || "—"}</span>
          </div>
          <div class="prediction-item">
            <label>6 Hours</label>
            <span>${data.prediction6h?.toLocaleString() || "—"}</span>
          </div>
          <div class="prediction-item">
            <label>12 Hours</label>
            <span>${data.prediction12h?.toLocaleString() || "—"}</span>
          </div>
          <div class="prediction-item">
            <label>24 Hours</label>
            <span>${data.prediction24h?.toLocaleString() || "—"}</span>
          </div>
          <div class="prediction-item">
            <label>48 Hours</label>
            <span>${data.prediction48h?.toLocaleString() || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
