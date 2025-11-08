import { ethers, Contract, Wallet } from "ethers";
import JobManagerABI from "../artifacts/contracts/JobManager.sol/JobManager.json";

// 1. Configurações
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL = process.env.SCROLL_SEPOLIA_RPC_URL!;

// 2. Chaves Privadas
const REQUESTER_KEY = process.env.REQUESTER_PRIVATE_KEY!;
const PROVIDER_KEY = process.env.PROVIDER_PRIVATE_KEY!;

// 3. Provedor (Leitura)
// Um provedor JSON-RPC para ler dados da blockchain
const provider = new ethers.JsonRpcProvider(RPC_URL);

// 4. Contrato de Leitura
// Uma instância do contrato apenas para ler dados (não pode assinar transações)
export const readonlyContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  JobManagerABI.abi,
  provider
);

// 5. "Signers" (Carteiras que podem Escrever)
const requesterWallet = new ethers.Wallet(REQUESTER_KEY, provider);
const providerWallet = new ethers.Wallet(PROVIDER_KEY, provider);

// 6. Contratos de Escrita
// Instância do contrato conectada à carteira do REQUISITANTE
export const contractAsRequester = new ethers.Contract(
  CONTRACT_ADDRESS,
  JobManagerABI.abi,
  requesterWallet
);

// Instância do contrato conectada à carteira do PROVEDOR
export const contractAsProvider = new ethers.Contract(
  CONTRACT_ADDRESS,
  JobManagerABI.abi,
  providerWallet
);

// 7. Helpers de Formatação
// Converte os dados brutos do contrato em um JSON legível
export const formatJob = (jobData: any) => {
  return {
    requester: jobData.requester,
    provider: jobData.provider,
    dataUrl: jobData.dataUrl,
    resultUrl: jobData.resultUrl,
    rewardUsd: jobData.rewardUsd.toString(),
    rewardEth: jobData.rewardEth.toString(),
    // Mapeia o enum de Status para texto
    status: [
      "Open",
      "InProgress",
      "PendingApproval",
      "Completed",
      "Cancelled",
    ][Number(jobData.status)],
  };
};