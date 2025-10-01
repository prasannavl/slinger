// Type definitions
export type SupportedCoin = "BTC" | "SOL" | "ETH" | "CELO" | "DOT";

export interface PriceData {
  coin: SupportedCoin;
  price: number;
  volume24h: number;
  prediction1h?: number;
  prediction3h?: number;
  prediction6h?: number;
  prediction12h?: number;
  prediction24h?: number;
  prediction48h?: number;
  socialTrend?: number;
}

export interface SwapTransaction {
  from: SupportedCoin;
  to: SupportedCoin;
  amount: number;
  slippage: number;
  estimatedOutput: number;
  transactionData: string;
}

export interface IntentResponse {
  type: "price_summary" | "price_signal" | "swap" | "unknown";
  data?: unknown | PriceData[] | PriceData | SwapTransaction | string;
  params?: {
    coin?: SupportedCoin;
    fromCoin?: SupportedCoin;
    toCoin?: SupportedCoin;
    amount?: number;
    slippage?: number;
  };
}

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  intent?: IntentResponse;
  timestamp: Date;
}

export interface SwapParams {
  fromCoin: SupportedCoin;
  toCoin: SupportedCoin;
  amount: number;
  slippage: number;
}
