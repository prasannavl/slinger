import { useState } from "preact/hooks";
import { Message, IntentResponse, PriceData, SwapTransaction } from "../lib/types.ts";
import MessageCard from "../components/MessageCard.tsx";
import PriceSummaryCard from "../components/PriceSummaryCard.tsx";
import PriceSignalCard from "../components/PriceSignalCard.tsx";
import SwapCard from "../components/SwapCard.tsx";

// Client-side API calls to server endpoints
async function classifyIntent(input: string): Promise<IntentResponse> {
  const response = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to classify intent");
  }
  
  return await response.json();
}

async function fetchIntentData(type: string, params?: unknown) {
  const response = await fetch("/api/intents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, params }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch intent data");
  }
  
  const result = await response.json();
  return result.data;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Welcome to Slinger! I can help you with crypto prices and trading. Try asking about prices or swap requests.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Classify intent
      const intent = await classifyIntent(input);
      
      let responseData = null;

      // Handle different intents
      if (intent.type === "price_summary") {
        responseData = await fetchIntentData("price_summary");
      } else if (intent.type === "price_signal" && intent.params?.coin) {
        responseData = await fetchIntentData("price_signal", { coin: intent.params.coin });
      } else if (
        intent.type === "swap" &&
        intent.params?.fromCoin &&
        intent.params?.toCoin &&
        intent.params?.amount
      ) {
        responseData = await fetchIntentData("swap", {
          fromCoin: intent.params.fromCoin,
          toCoin: intent.params.toCoin,
          amount: intent.params.amount,
          slippage: intent.params.slippage || 0.5,
        });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: getResponseText(intent),
        intent: { ...intent, data: responseData },
        timestamp: new Date(),
      };

      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getResponseText = (intent: IntentResponse): string => {
    switch (intent.type) {
      case "price_summary":
        return "Here's the current price summary for all supported coins:";
      case "price_signal":
        return `Here's the detailed price signal for ${intent.params?.coin}:`;
      case "swap":
        return "I've prepared your swap transaction:";
      default:
        return "I'm not sure what you're asking. Try asking about prices or swapping coins.";
    }
  };

  const renderCard = (message: Message) => {
    if (!message.intent || !message.intent.data) return null;

    switch (message.intent.type) {
      case "price_summary":
        return <PriceSummaryCard data={message.intent.data as PriceData[]} />;
      case "price_signal":
        return <PriceSignalCard data={message.intent.data as PriceData} />;
      case "swap":
        return <SwapCard data={message.intent.data as SwapTransaction} />;
      default:
        return null;
    }
  };

  return (
    <div class="chat-container">
      <div class="chat-header">
        <h1>Slinger</h1>
        <p>AI-Powered Crypto Trading Assistant</p>
      </div>

      <div class="messages-container">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            class={`message ${message.type}`}
          >
            <MessageCard message={message} />
            {renderCard(message)}
          </div>
        ))}
        {loading && (
          <div class="message assistant loading">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <form class="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          placeholder="Ask about prices or request a swap..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
