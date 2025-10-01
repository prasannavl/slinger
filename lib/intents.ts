import { PriceData, SupportedCoin } from "./types.ts";
import {
  fetchCoinGeckoHistory,
  fetchCoinGeckoPrice,
  fetchTwitterSentiment,
  scrapeCoinMarketCapSocial,
} from "./api.ts";
import { analyzeSocialTrend, predictPrices } from "./ai.ts";

const SUPPORTED_COINS: SupportedCoin[] = ["BTC", "SOL", "ETH", "CELO", "DOT"];

export async function getPriceSummary(): Promise<PriceData[]> {
  const results: PriceData[] = [];

  for (const coin of SUPPORTED_COINS) {
    try {
      const priceData = await getPriceSignal(coin);
      results.push(priceData);
    } catch (error) {
      console.error(`Error fetching data for ${coin}:`, error);
    }
  }

  return results;
}

export async function getPriceSignal(coin: SupportedCoin): Promise<PriceData> {
  // Fetch current price and volume
  const cgData = await fetchCoinGeckoPrice(coin);
  
  if (!cgData) {
    // Return minimal data if CoinGecko is unavailable
    console.warn(`CoinGecko data unavailable for ${coin}. Returning minimal data.`);
    return {
      coin,
      price: 0,
      volume24h: 0,
      socialTrend: 0,
    };
  }

  const coinData = cgData[getCoinGeckoId(coin)];

  // Fetch historical data
  const history = await fetchCoinGeckoHistory(coin, 30);

  // Get social trend
  const socialTrend = await getSocialTrend(coin);

  // Predict prices only if we have historical data
  let predictions: Record<string, number | null> = {
    "1h": null,
    "3h": null,
    "6h": null,
    "12h": null,
    "24h": null,
    "48h": null,
  };

  if (history && history.prices) {
    predictions = await predictPrices(coin, history.prices, socialTrend);
  } else {
    console.warn(`Historical data unavailable for ${coin}. Predictions disabled.`);
  }

  return {
    coin,
    price: coinData.usd,
    volume24h: coinData.usd_24h_vol,
    prediction1h: predictions["1h"] ?? undefined,
    prediction3h: predictions["3h"] ?? undefined,
    prediction6h: predictions["6h"] ?? undefined,
    prediction12h: predictions["12h"] ?? undefined,
    prediction24h: predictions["24h"] ?? undefined,
    prediction48h: predictions["48h"] ?? undefined,
    socialTrend,
  };
}

export async function getSocialTrend(coin: SupportedCoin): Promise<number> {
  try {
    // Fetch social data from multiple sources
    const [twitterData, cmcSocial] = await Promise.all([
      fetchTwitterSentiment(
        ["VitalikButerin", "elonmusk", "cz_binance"],
        coin,
      ),
      scrapeCoinMarketCapSocial(coin),
    ]);

    // Check if we have any useful data
    const hasTwitterData = twitterData && !twitterData.disabled && 
                          twitterData.tweets && twitterData.tweets.length > 0;
    const hasCMCData = cmcSocial && (cmcSocial.socialLinks > 0 || 
                                     cmcSocial.newsCount > 0 || 
                                     cmcSocial.rawData);

    if (!hasTwitterData && !hasCMCData) {
      console.warn(`No social data available for ${coin}. Returning neutral sentiment.`);
      return 0;
    }

    // Combine all social data
    const socialData = {
      twitter: twitterData,
      cmc: cmcSocial,
    };

    // Use AI to analyze sentiment
    const trend = await analyzeSocialTrend(coin, socialData);
    return trend;
  } catch (error) {
    console.error(`Error getting social trend for ${coin}:`, error);
    return 0;
  }
}

function getCoinGeckoId(coin: SupportedCoin): string {
  const map: Record<SupportedCoin, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    CELO: "celo",
    DOT: "polkadot",
  };
  return map[coin];
}

export interface SwapTransaction {
  from: SupportedCoin;
  to: SupportedCoin;
  amount: number;
  slippage: number;
  estimatedOutput: number;
  transactionData: string;
}

export function prepareSwap(
  from: SupportedCoin,
  to: SupportedCoin,
  amount: number,
  slippage: number = 0.5,
): SwapTransaction {
  // This would integrate with Celo DEX
  // For now, returning a mock structure
  const estimatedOutput = amount * 0.99; // Mock calculation

  return {
    from,
    to,
    amount,
    slippage,
    estimatedOutput,
    transactionData: "0x...", // Would contain actual transaction data
  };
}
