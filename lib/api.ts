import { SupportedCoin } from "./types.ts";

const COINMARKETCAP_API_KEY = Deno.env.get("COINMARKETCAP_API_KEY") || "";
const COINGECKO_API_KEY = Deno.env.get("COINGECKO_API_KEY") || "";
const TWITTER_BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN") || "";

const COIN_IDS: Record<SupportedCoin, { cmc: string; cg: string }> = {
  BTC: { cmc: "1", cg: "bitcoin" },
  ETH: { cmc: "1027", cg: "ethereum" },
  SOL: { cmc: "5426", cg: "solana" },
  CELO: { cmc: "7236", cg: "celo" },
  DOT: { cmc: "6636", cg: "polkadot" },
};

export async function fetchCoinMarketCapData(coins: SupportedCoin[]) {
  if (!COINMARKETCAP_API_KEY) {
    console.warn("CoinMarketCap API key not provided. Skipping CoinMarketCap data.");
    return null;
  }

  try {
    const ids = coins.map((coin) => COIN_IDS[coin].cmc).join(",");

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${ids}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
        },
      },
    );

    if (!response.ok) {
      console.warn(`CoinMarketCap API error: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching CoinMarketCap data:", error);
    return null;
  }
}

export async function fetchCoinGeckoPrice(coin: SupportedCoin) {
  try {
    const id = COIN_IDS[coin].cg;
    const headers: Record<string, string> = {};

    if (COINGECKO_API_KEY) {
      headers["x-cg-pro-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`,
      { headers },
    );

    if (!response.ok) {
      console.warn(`CoinGecko API error for ${coin}: ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching CoinGecko price for ${coin}:`, error);
    return null;
  }
}

export async function fetchCoinGeckoHistory(
  coin: SupportedCoin,
  days: number = 30,
) {
  try {
    const id = COIN_IDS[coin].cg;
    const headers: Record<string, string> = {};

    if (COINGECKO_API_KEY) {
      headers["x-cg-pro-api-key"] = COINGECKO_API_KEY;
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      { headers },
    );

    if (!response.ok) {
      console.warn(`CoinGecko history API error for ${coin}: ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching CoinGecko history for ${coin}:`, error);
    return null;
  }
}

export async function scrapeCoinMarketCapSocial(coin: SupportedCoin) {
  try {
    const response = await fetch(
      `https://coinmarketcap.com/currencies/${COIN_IDS[coin].cg}/`,
    );
    const html = await response.text();

    // Simple parsing for social links and news
    const socialLinks = html.match(/href="https:\/\/(twitter|reddit|telegram)/gi) ||
      [];
    const newsMatches = html.match(/<article[^>]*>[\s\S]*?<\/article>/gi) || [];

    return {
      socialLinks: socialLinks.length,
      newsCount: newsMatches.length,
      rawData: html.slice(0, 5000), // Sample for LLM
    };
  } catch (error) {
    console.error("Error scraping CoinMarketCap:", error);
    return { socialLinks: 0, newsCount: 0, rawData: "" };
  }
}

export async function fetchTwitterSentiment(
  usernames: string[],
  coin: SupportedCoin,
) {
  if (!TWITTER_BEARER_TOKEN) {
    return { tweets: [], error: "No Twitter API token" };
  }

  const query = `(${usernames.map((u) => `from:${u}`).join(" OR ")}) ${coin}`;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString();

  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${
        encodeURIComponent(query)
      }&start_time=${sevenDaysAgo}&max_results=100`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Twitter data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { tweets: [], error: errorMessage };
  }
}
