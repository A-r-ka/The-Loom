// Importa os tipos e plugins necessários
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Carrega as variáveis do .env
dotenv.config();

// Define as variáveis de ambiente com checagem de tipo (opcional, mas bom)
const SCROLL_SEPOLIA_RPC_URL: string = process.env.SCROLL_SEPOLIA_RPC_URL || "https://sepolia-rpc.scroll.io/";
const PRIVATE_KEY: string = process.env.SCROLL_SEPOLIA_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY || "";

// Define a configuração do Hardhat
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    scrollSepolia: {
      url: SCROLL_SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 534351,
    },
  },
  etherscan: {
    apiKey: {
      scrollSepolia: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          // API V2 do Etherscan COM o chainid como parâmetro de query
          apiURL: "https://api.etherscan.io/v2/api?chainid=534351",
          browserURL: "https://sepolia.scrollscan.com/",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};

// Exporta a configuração
export default config;