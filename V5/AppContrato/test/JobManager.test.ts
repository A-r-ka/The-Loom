import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { JobManager, MockV3Aggregator } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Define um preço constante para o ETH em USD para os testes
// $3000 com 8 decimais
const ETH_PRICE_USD = 3000 * 10 ** 8; // 300000000000

describe("JobManager", function () {
  // Define o "fixture" - uma função que configura o estado inicial para cada teste
  async function deployJobManagerFixture() {
    // 1. Obter contas de teste
    const [owner, requester, provider1, provider2] = await ethers.getSigners();

    // 2. Deployar o Mock
    const MockAggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
    const mockAggregator: MockV3Aggregator = await MockAggregatorFactory.deploy(ETH_PRICE_USD);
    await mockAggregator.waitForDeployment();
    const mockAddress = await mockAggregator.getAddress();

    // 3. Deployar o JobManager, passando o endereço do Mock
    const JobManagerFactory = await ethers.getContractFactory("JobManager");
    const jobManager: JobManager = await JobManagerFactory.deploy(mockAddress);
    await jobManager.waitForDeployment();

    // 4. Definir valores úteis
    // $10 em USD (com 8 decimais)
    const tenDollarsUsd = 10 * 10 ** 8; // 1000000000
    // $10 em ETH, baseado no nosso preço mockado de $3000
    const tenDollarsEth = ethers.parseEther("10") / BigInt(3000); // Aprox: 0.00333 ETH

    return { jobManager, mockAggregator, owner, requester, provider1, provider2, tenDollarsUsd, tenDollarsEth };
  }

  // Bloco de testes principal
  describe("Deployment", function () {
    it("Should set the correct price feed address", async function () {
      const { jobManager, mockAggregator } = await loadFixture(deployJobManagerFixture);
      // Lembre-se que 'i_priceFeed' precisa ser 'public' no seu .sol
      const feedAddress = await jobManager.i_priceFeed(); 
      expect(feedAddress).to.equal(await mockAggregator.getAddress());
    });
  });

  describe("Job Posting", function () {
    it("Should allow a requester to post a job with correct ETH value", async function () {
      const { jobManager, requester, tenDollarsUsd, tenDollarsEth } = await loadFixture(deployJobManagerFixture);
      const dataUrl = "ipfs://QmWTE_data";
      const scriptUrl = "ipfs://QmWTE_script"; // <-- ADICIONADO

      // Requester posta o job, enviando o valor exato em ETH
      // --- CORREÇÃO AQUI ---
      await jobManager.connect(requester).postJob(dataUrl, scriptUrl, tenDollarsUsd, {
        value: tenDollarsEth,
      });

      // Verifica se o job foi criado
      const job = await jobManager.s_jobs(0);
      expect(job.requester).to.equal(requester.address);
      expect(job.scriptUrl).to.equal(scriptUrl); // <-- ADICIONADO TESTE
      expect(job.rewardUsd).to.equal(tenDollarsUsd);
      expect(job.status).to.equal(0); // 0 = Open
    });

    it("Should refund excess ETH if sent more than required", async function () {
      const { jobManager, requester, tenDollarsUsd, tenDollarsEth } = await loadFixture(deployJobManagerFixture);
      const dataUrl = "ipfs://QmWTE_data";
      const scriptUrl = "ipfs://QmWTE_script"; // <-- ADICIONADO
      const sentAmount = tenDollarsEth + ethers.parseEther("1"); // Envia 1 ETH a mais

      // --- CORREÇÃO AQUI ---
      await expect(
        jobManager.connect(requester).postJob(dataUrl, scriptUrl, tenDollarsUsd, {
          value: sentAmount,
        })
      ).to.changeEtherBalance(requester, -tenDollarsEth); 
    });

    it("Should REVERT if insufficient ETH is sent", async function () {
      const { jobManager, requester, tenDollarsUsd, tenDollarsEth } = await loadFixture(deployJobManagerFixture);
      const insufficientAmount = tenDollarsEth - BigInt(1000);

      // --- CORREÇÃO AQUI ---
      await expect(
        jobManager.connect(requester).postJob("ipfs://...", "ipfs://script", tenDollarsUsd, {
          value: insufficientAmount,
        })
      ).to.be.revertedWith("Insufficient ETH sent for this USD value");
    });
  });

  describe("Job Lifecycle", function () {
    let fixture: any;
    beforeEach(async () => {
      // Configura o cenário: um job já foi postado
      fixture = await loadFixture(deployJobManagerFixture);
      const { jobManager, requester, tenDollarsUsd, tenDollarsEth } = fixture;
      // --- CORREÇÃO AQUI ---
      await jobManager.connect(requester).postJob("ipfs://data", "ipfs://script", tenDollarsUsd, {
        value: tenDollarsEth,
      });
    });

    it("Should allow a provider to accept an open job (FCFS)", async function () {
      // ... (Este teste não muda, pois não chama postJob) ...
      const { jobManager, provider1, provider2 } = fixture;
      await jobManager.connect(provider1).acceptJob(0);
      // ...
    });

    it("Should allow the correct provider to submit results", async function () {
      // ... (Este teste não muda) ...
      const { jobManager, provider1, provider2 } = fixture;
      await jobManager.connect(provider1).acceptJob(0);
      // ...
    });

    it("Should allow requester to approve and pay the provider", async function () {
      // ... (Este teste não muda) ...
      const { jobManager, requester, provider1, tenDollarsEth } = fixture;
      await jobManager.connect(provider1).acceptJob(0);
      // ...
    });

    it("Should REVERT if a non-requester tries to approve", async function () {
        // ... (Este teste não muda) ...
        const { jobManager, provider1, provider2 } = fixture;
        await jobManager.connect(provider1).acceptJob(0);
        // ...
      });
  });
});