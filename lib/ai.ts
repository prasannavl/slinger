import { IntentResponse, SupportedCoin } from "./types.ts";

// API Keys for different LLM providers
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY") || "";

export type LLMProvider = "openai" | "gemini" | "claude";

export interface AICallParams {
  context?: string;
  input: string;
  systemPrompt?: string;
  intents?: string[];
}

// Detect which LLM provider is available
function getAvailableProvider(): LLMProvider | null {
  if (OPENAI_API_KEY) return "openai";
  if (GEMINI_API_KEY) return "gemini";
  if (CLAUDE_API_KEY) return "claude";
  return null;
}

function checkAnyLLMKey(): void {
  const provider = getAvailableProvider();
  if (!provider){
    throw new Error(
      "An LLM API key is required for Slinger to function. Please set one of: OPENAI_API_KEY, GEMINI_API_KEY, or CLAUDE_API_KEY in your .env file.",
    );
  }
}

// Provider-specific implementations
async function callOpenAIAPI(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok){
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGeminiAPI(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  // Gemini uses a different message format
  const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
  const userMessages = messages.filter((m) => m.role === "user");
  
  const contents = userMessages.map((m) => ({
    parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${m.content}` : m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    },
  );

  if (!response.ok){
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callClaudeAPI(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  // Extract system prompt and user messages
  const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
  const conversationMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationMessages,
      temperature: 0.7,
    }),
  });

  if (!response.ok){
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Main LLM call function - routes to appropriate provider
export async function callLLM(params: AICallParams): Promise<string> {
  checkAnyLLMKey();
  
  const { context, input, systemPrompt, intents } = params;

  const defaultSystemPrompt = `You are a crypto trading assistant. Analyze user input and respond with structured JSON.`;

  const messages = [
    {
      role: "system",
      content: systemPrompt || defaultSystemPrompt,
    },
  ];

  if (context) {
    messages.push({
      role: "system",
      content: `Context: ${context}`,
    });
  }

  if (intents) {
    messages.push({
      role: "system",
      content: `Available intents: ${intents.join(", ")}`,
    });
  }

  messages.push({
    role: "user",
    content: input,
  });

  // Call the appropriate LLM provider
  const provider = getAvailableProvider();
  
  if (!provider){
    throw new Error("No LLM provider available");
  }

  console.log(`Using LLM provider: ${provider}`);

  switch (provider) {
    case "openai":
      return await callOpenAIAPI(messages);
    case "gemini":
      return await callGeminiAPI(messages);
    case "claude":
      return await callClaudeAPI(messages);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function classifyIntent(input: string): Promise<IntentResponse> {
  try {
    checkAnyLLMKey();
  } catch (error) {
    // Return error as unknown type with the error message
    return {
      type: "unknown",
      data: error instanceof Error ? error.message : "LLM API key is missing",
    };
  }

  const systemPrompt = `You are an intent classifier for a crypto trading platform. 
  Classify the user's intent into one of: price_summary, price_signal, swap, or unknown.
  
  - price_summary: User wants to see prices for multiple coins
  - price_signal: User wants detailed price prediction for a specific coin
  - swap: User wants to swap one coin for another
  
  Respond with JSON: {"type": "intent_type", "params": {...}}
  
  For price_signal, extract coin name.
  For swap, extract fromCoin, toCoin, amount, and slippage (default 0.5%).`;

  const response = await callLLM({
    input,
    systemPrompt,
    intents: ["price_summary", "price_signal", "swap"],
  });

  try {
    const parsed = JSON.parse(response);
    return parsed;
  } catch {
    return { type: "unknown" };
  }
}

export async function predictPrices(
  coin: SupportedCoin,
  historicalData: Array<[number, number]>,
  socialTrend: number,
): Promise<Record<string, number | null>> {
  const context = `Historical price data for ${coin}: ${
    JSON.stringify(historicalData.slice(-30))
  }`;
  const systemPrompt = `You are a crypto price prediction model. Based on historical data and social sentiment, predict future prices.
  Social trend score: ${socialTrend} (-1 is bearish, 1 is bullish)
  
  Respond with JSON containing predictions: {"1h": number, "3h": number, "6h": number, "12h": number, "24h": number, "48h": number}`;

  const input = `Predict the price for ${coin} for the next 1h, 3h, 6h, 12h, 24h, and 48h.`;

  const response = await callLLM({
    context,
    input,
    systemPrompt,
  });

  try {
    return JSON.parse(response);
  } catch {
    return {
      "1h": null,
      "3h": null,
      "6h": null,
      "12h": null,
      "24h": null,
      "48h": null,
    };
  }
}

export async function analyzeSocialTrend(
  coin: SupportedCoin,
  socialData: Record<string, unknown>,
): Promise<number> {
  const systemPrompt = `You are a social sentiment analyzer for cryptocurrency. 
  Analyze the provided social media data and news to generate a sentiment score between -1 (very bearish) and 1 (very bullish).
  
  Respond with only a number between -1 and 1.`;

  const input = `Analyze sentiment for ${coin}: ${JSON.stringify(socialData)}`;

  const response = await callLLM({
    input,
    systemPrompt,
  });

  try {
    const score = parseFloat(response.trim());
    return Math.max(-1, Math.min(1, score));
  } catch {
    return 0;
  }
}
