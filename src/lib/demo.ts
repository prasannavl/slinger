export const demoRegistry = {
  evm: {
    'CELO': { symbol:'CELO', address: '0x471EcE3750Da237f93B8E339c536989b8978a438', decimals:18 },
    'cUSD': { symbol:'cUSD', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals:18 }
  },
  solana: {
    'SOL': { symbol:'SOL', mint: '', decimals:9 },
    'USDC': { symbol:'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals:6 }
  }
};

export const demoAddressBook = {
  brother: '0x1234567890abcdef1234567890abcdef12345678',
  me_solana: '7sKXh9eLQ3jM8fpL3CyQzq5H4gJ3fQp6i9qV2c9oV1mP'
};

export const defaultConfig = {
  evm: {
    router: process.env.NEXT_PUBLIC_EVM_ROUTER || process.env.EVM_UNISWAP_V2_ROUTER || '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    rpcUrl: process.env.NEXT_PUBLIC_EVM_RPC || process.env.EVM_RPC_URL || 'https://forno.celo.org',
    path: null,
    to: process.env.NEXT_PUBLIC_DEFAULT_EVM_ADDRESS || process.env.DEFAULT_EVM_ADDRESS || '0xFEED00000000000000000000000000000000FEED'
  }
};
