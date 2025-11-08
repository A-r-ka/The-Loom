# The Loom - Smart Contracts (Base Network)

Smart contracts do projeto The Loom, deployados na **Base Sepolia Testnet**.

## 🚀 Quick Start

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Preencha as variáveis:
- `BASE_SEPOLIA_PRIVATE_KEY`: Sua private key
- `BASESCAN_API_KEY`: API key do Basescan (obtenha em https://basescan.org/myapikey)

### 3. Compilar Contratos
```bash
npx hardhat compile
```

### 4. Deploy na Base Sepolia
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## 🧪 Testes

```bash
npx hardhat test
REPORT_GAS=true npx hardhat test
```

## 🔗 Recursos

- **Network**: Base Sepolia (Testnet)
- **Chain ID**: 84532
- **Explorer**: https://sepolia.basescan.org/
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Docs**: https://docs.base.org/

## 📝 Migração

Este projeto foi migrado de Scroll para Base. Veja `MIGRATION_TO_BASE.md` para detalhes.

## 📚 Comandos Úteis

```shell
npx hardhat help
npx hardhat test
npx hardhat run scripts/deploy.ts --network baseSepolia
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```
