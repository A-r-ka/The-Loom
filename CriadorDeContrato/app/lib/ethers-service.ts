// app/lib/ethers-service.ts
import { ethers, Contract, Wallet } from "ethers";

// -------------------------------------------------------------------
// IMPORTANTE: Este caminho sobe dois níveis (de /app/lib/) para 
// encontrar a pasta /artifacts/ do seu projeto Hardhat.
// -------------------------------------------------------------------
import JobManagerABI from "../../artifacts/contracts/JobManager.sol/JobManager.json";

// 1. Configurações
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL!;

// 2. Chaves Privadas
const REQUESTER_KEY = process.env.REQUESTER_PRIVATE_KEY!;
const PROVIDER_KEY = process.env.PROVIDER_PRIVATE_KEY!;

// 3. Provedor (Leitura)
const provider = new ethers.JsonRpcProvider(RPC_URL);

// 4. Contrato de Leitura
export const readonlyContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  JobManagerABI.abi,
  provider
);

// 5. "Signers" (Carteiras que podem Escrever)
const requesterWallet = new ethers.Wallet(REQUESTER_KEY, provider);
const providerWallet = new ethers.Wallet(PROVIDER_KEY, provider);

// 6. Contratos de Escrita
export const contractAsRequester = new ethers.Contract(
  CONTRACT_ADDRESS,
  JobManagerABI.abi,
  requesterWallet
);
export const contractAsProvider = new ethers.Contract(
  CONTRACT_ADDRESS,
  JobManagerABI.abi,
  providerWallet
);

// 7. Helpers de Formatação
export const formatJob = (jobData: any) => {
  return {
    requester: jobData.requester,
    provider: jobData.provider,
    dataUrl: jobData.dataUrl,
    resultUrl: jobData.resultUrl,
    rewardUsd: jobData.rewardUsd.toString(),
    rewardEth: jobData.rewardEth.toString(),
    status: [
      "Open",
      "InProgress",
      "PendingApproval",
      "Completed",
      "Cancelled",
    ][Number(jobData.status)],
  };
};