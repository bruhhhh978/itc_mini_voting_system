import { getFullnodeUrl } from '@mysten/sui/client';

export function getSuiNetworks() {
  return {
    mainnet: { url: getFullnodeUrl('mainnet') },
    testnet: { url: getFullnodeUrl('testnet') },
    devnet: { url: getFullnodeUrl('devnet') },
    localnet: { url: 'http://127.0.0.1:9000' },
  } as const;
}

