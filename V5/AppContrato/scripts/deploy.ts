import { ethers, run, network } from "hardhat";

async function main() {
  // 1. Defina o endereço do Price Feed (ETH/USD na Scroll Sepolia)
  const priceFeedAddress: string = "0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41";

  const constructorArgs = [
    priceFeedAddress,
  ];

  console.log("Fazendo deploy do contrato JobManager...");
  console.log(`Usando Price Feed: ${priceFeedAddress}`);

  // 2. Fazer o deploy do contrato
  const jobManager = await ethers.deployContract("JobManager", constructorArgs);
  await jobManager.waitForDeployment();
  
  const contractAddress = await jobManager.getAddress();
  console.log(`JobManager deployado em: ${contractAddress}`);

  // 3. Verificação no Etherscan (Scroll)
  if (network.config.chainId === 534351 && process.env.ETHERSCAN_API_KEY) {
    console.log("Aguardando 1 minuto (60s) para o Etherscan indexar...");
    
    // Await de 60 segundos
    await new Promise(resolve => setTimeout(resolve, 60000));

    console.log("Iniciando verificação...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: constructorArgs,
      });
      console.log("Contrato verificado no Etherscan (Scroll)!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contrato já verificado.");
      } else {
        console.error("Falha na verificação:", error);
      }
    }
  }
}

// Padrão de execução do script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});