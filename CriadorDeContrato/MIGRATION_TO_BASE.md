# Migração para Base Network

Este projeto foi migrado de **Scroll Sepolia** para **Base Sepolia**.

## Mudanças Principais

### 1. Network Configuration
- **Chain ID**: 534351 (Scroll) → 84532 (Base Sepolia)
- **RPC URL**: `https://sepolia-rpc.scroll.io/` → `https://sepolia.base.org`
- **Explorer**: ScrollScan → BaseScan

### 2. Chainlink Price Feed
- **ETH/USD Price Feed Address**: 
  - Scroll Sepolia: `0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41`
  - Base Sepolia: `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1`

### 3. Variáveis de Ambiente
Atualize seu arquivo `.env` com as seguintes variáveis:

```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_SEPOLIA_PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

## Como Obter API Keys

### Basescan API Key
1. Acesse: https://basescan.org/myapikey
2. Crie uma conta ou faça login
3. Crie uma nova API key
4. Copie a key para o `.env`

### Base Sepolia Testnet
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Chain ID**: 84532
- **Currency**: ETH

## Deploy do Contrato

```bash
# Compile os contratos
npx hardhat compile

# Deploy na Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Verificação no Basescan

O script de deploy automaticamente verifica o contrato no Basescan após 60 segundos.

Você também pode verificar manualmente:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <PRICE_FEED_ADDRESS>
```

## Recursos Úteis

- **Base Docs**: https://docs.base.org/
- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Chainlink Base Price Feeds**: https://docs.chain.link/data-feeds/price-feeds/addresses?network=base&page=1
- **Base Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

## Próximos Passos

1. ✅ Atualizar `.env` com suas credenciais
2. ✅ Obter ETH de teste do faucet
3. ✅ Fazer deploy do contrato
4. ✅ Atualizar o frontend com o novo endereço do contrato
5. ✅ Atualizar a configuração do wagmi/viem no frontend

## Diferenças entre Base e Scroll

| Feature | Scroll | Base |
|---------|--------|------|
| Layer 2 Type | zkEVM | Optimistic Rollup |
| Parent Chain | Ethereum | Ethereum |
| Built By | Scroll Foundation | Coinbase |
| Gas Costs | Lower | Very Low |
| Finality | ~10 min | ~10 min |

## Troubleshooting

### Erro: "insufficient funds"
- Verifique se tem ETH suficiente no faucet da Base Sepolia

### Erro de verificação
- Certifique-se de ter uma API key válida do Basescan
- Aguarde alguns minutos após o deploy antes de verificar

### Erro: "network does not match"
- Verifique se está na rede correta no MetaMask (Base Sepolia)
- Chain ID deve ser 84532
