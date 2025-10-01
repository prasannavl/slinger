# Slinger - AI-Powered Crypto Trading Platform

A web interface for trading cryptocurrencies with AI-based signals and natural language processing. 

## Features

- **Natural Language Interface**: ChatGPT-like interface for crypto trading
- **Price Signals**: Real-time price data and AI-powered predictions for BTC, SOL, ETH, CELO, and DOT
- **Social Trend Analysis**: Sentiment analysis from Twitter and CoinMarketCap
- **DEX Integration**: Swap tokens on Celo DEX with pre-packaged transactions

## Supported Intents

1. **Price Summary**: View prices and predictions for all supported coins
2. **Price Signal**: Detailed price prediction for a specific coin with social sentiment
3. **Swap**: Prepare swap transactions with customizable slippage

## Supported Coins

- BTC (Bitcoin)
- SOL (Solana)
- ETH (Ethereum)
- CELO (Celo)
- DOT (Polkadot)

## Setup

### Prerequisites

- [Deno](https://deno.land/) 1.37 or higher

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# LLM Provider (at least one required - will use first available)
OPENAI_API_KEY=your_openai_api_key        # Priority 1
GEMINI_API_KEY=your_gemini_api_key        # Priority 2
CLAUDE_API_KEY=your_claude_api_key        # Priority 3

# Crypto Data APIs
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Optional APIs
COINGECKO_API_KEY=your_coingecko_api_key  # Optional for free tier
TWITTER_BEARER_TOKEN=your_twitter_bearer_token  # Optional
```

### API Keys

**LLM Providers (at least one required):**
1. **OpenAI API**: Get your API key from [OpenAI Platform](https://platform.openai.com/)
   - Model: GPT-4
2. **Google Gemini API**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Model: Gemini 2.0 Flash (experimental)
3. **Anthropic Claude API**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
   - Model: Claude Opus 4

The app automatically selects the first available LLM provider in this order: OpenAI → Gemini → Claude

**Crypto Data APIs:**
1. **CoinMarketCap API**: Get your free API key from [CoinMarketCap](https://coinmarketcap.com/api/)
2. **CoinGecko API**: Optional for free tier, get from [CoinGecko](https://www.coingecko.com/en/api)
3. **Twitter API**: Optional, get from [Twitter Developer Portal](https://developer.twitter.com/)

### Installation

```bash
# Clone the repository
cd slinger

# Run the development server
deno task start
```

The application will be available at `http://localhost:8000`

## Usage

### Example Queries

- "Show me the current prices"
- "What's the price prediction for Bitcoin?"
- "Swap 100 CELO for ETH with 0.5% slippage"

### Project Structure

```
slinger/
├── components/          # React components (MessageCard, PriceSummaryCard, etc.)
├── islands/            # Interactive islands (ChatInterface)
├── lib/                # Core logic (API clients, AI, intents)
├── routes/             # Fresh routes (_app.tsx, index.tsx)
├── static/             # Static assets (styles.css)
├── deno.json           # Deno configuration
├── fresh.config.ts     # Fresh framework config
└── main.ts             # Application entry point
```

## Architecture

### Client-Side

- **Fresh Framework**: Deno's web framework with islands architecture
- **React/Preact**: Component-based UI

### Modules

- **AI Module** (`lib/ai.ts`): LLM-agnostic AI integration supporting OpenAI, Gemini, and Claude for intent classification and predictions
- **API Module** (`lib/api.ts`): CoinMarketCap, CoinGecko, and Twitter API clients
- **Intents Module** (`lib/intents.ts`): Intent handlers for price signals and swaps

### Key Features

- **Intent Classification**: AI automatically determines user intent from natural language
- **LLM Provider Flexibility**: Automatically uses available LLM (OpenAI/Gemini/Claude)
- **Price Predictions**: AI-powered price predictions based on historical data and social sentiment
- **Social Trend Analysis**: Combines Twitter sentiment and CoinMarketCap data
- **Transaction Preparation**: Pre-packaged DEX transactions for user approval

## Development

### Building for Production

```bash
deno task build
```

### Running in Production

```bash
deno task preview
```


## Future Enhancements

- WalletConnect integration for on-chain transaction signing
- Additional DEX support beyond Celo
- More sophisticated price prediction models
- Extended social media sentiment sources
