// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title JobManager
 * @dev Gerencia um mercado de jobs de GPU (modelo FCFS).
 * Pagamentos são postados em USD e pagos em ETH.
 */
contract JobManager is ReentrancyGuard {
    // Interface do Price Feed da Chainlink
    AggregatorV3Interface public immutable i_priceFeed;

    enum JobStatus {
        Open, // 0: Aberto, aguardando um provedor
        InProgress, // 1: Provedor aceitou, trabalho em execução
        PendingApproval, // 2: Trabalho concluído, aguardando aprovação
        Completed, // 3: Aprovado e pago
        Cancelled // 4: Cancelado pelo requisitante
    }

    struct Job {
        address payable requester; // Quem pediu o job
        address payable provider; // Quem foi selecionado para fazer
        string dataUrl; // Link (IPFS) para os dados do job
        string scriptUrl; // Link (IPFS) para os script do job
        string resultUrl; // Link (IPFS) para o resultado
        uint256 rewardUsd; // Recompensa em USD (ex: 10 * 1e8)
        uint256 rewardEth; // Recompensa em ETH (calculada no depósito)
        JobStatus status;
    }

    // Mapeamento de ID do job para a struct do Job
    mapping(uint256 => Job) public s_jobs;
    uint256 public s_jobCounter;

    event JobPosted(uint256 indexed jobId, address indexed requester, uint256 rewardUsd, uint256 rewardEth, string dataUrl, string scriptUrl);    event JobAccepted(uint256 indexed jobId, address indexed provider);
    event JobResultSubmitted(uint256 indexed jobId, address indexed provider, string resultUrl);
    event JobApproved(uint256 indexed jobId, address indexed requester, address indexed provider, uint256 rewardEth);

    /**
     * @param priceFeedAddress Endereço do Price Feed ETH/USD na Scroll Sepolia
     */
    constructor(address priceFeedAddress) {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @dev Retorna o último preço do ETH em USD.
     * Ex: $3000.12345678 -> retorna 300012345678
     */
    function getLatestPrice() public view returns (int256) {
        // (roundId, answer, startedAt, updatedAt, answeredInRound)
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        // O preço vem com 8 decimais (ex: 3000.12345678 USD)
        return price;
    }

    /**
     * @dev Converte um valor em USD para ETH
     * @param usdAmount Valor em USD (com 8 decimais, ex: $10 = 10 * 1e8)
     */
    function convertUsdToEth(uint256 usdAmount) public view returns (uint256) {
        int256 ethPrice = getLatestPrice(); // ex: 300012345678
        // Precisamos converter os decimais
        // (usdAmount * 1e18) / price (que já tem 8 decimais)
        // (10 * 1e8) * 1e18 / (3000 * 1e8) = (10 * 1e18) / 3000
        // Para evitar perda de precisão, multiplicamos primeiro
        // (usdAmount * 1e18) / ethPrice (com 8 decimais)
        // (10 * 1e8 * 1e18) / (3000 * 1e8) = (10 * 1e18) / 3000 
        uint256 ethAmount = (usdAmount * 1e18) / uint256(ethPrice);
        return ethAmount;
    }

    /**
     * @dev Requisitante posta um novo job e deposita a recompensa
     * @param dataUrl Link (IPFS) para os dados do job
     * @param rewardUsd Recompensa em USD (com 8 decimais, ex: $10 = 1000000000)
     */
    function postJob(string memory dataUrl, string memory scriptUrl, uint256 rewardUsd) external payable nonReentrant {
        require(rewardUsd > 0, "Reward must be greater than zero");

        uint256 requiredEth = convertUsdToEth(rewardUsd);
        require(msg.value >= requiredEth, "Insufficient ETH sent for this USD value");

        uint256 jobId = s_jobCounter;
        s_jobs[jobId] = Job({
            requester: payable(msg.sender),
            provider: payable(address(0)),
            dataUrl: dataUrl,
            scriptUrl: scriptUrl,
            resultUrl: "",
            rewardUsd: rewardUsd,
            rewardEth: msg.value, // Armazena o valor exato depositado
            status: JobStatus.Open
        });
        
        s_jobCounter++;
        emit JobPosted(jobId, msg.sender, rewardUsd, msg.value, dataUrl, scriptUrl);

        // Devolve qualquer ETH enviado em excesso
        if (msg.value > requiredEth) {
            (bool success, ) = msg.sender.call{value: msg.value - requiredEth}("");
            require(success, "Failed to send back excess ETH");
        }
    }

    /**
     * @dev Um provedor (dono de GPU) aceita um job (FCFS)
     */
    function acceptJob(uint256 jobId) external {
        Job storage job = s_jobs[jobId];
        require(job.status == JobStatus.Open, "Job is not open");
        
        job.provider = payable(msg.sender);
        job.status = JobStatus.InProgress;
        
        emit JobAccepted(jobId, msg.sender);
    }

    /**
     * @dev O provedor selecionado submete o resultado
     */
    function submitResult(uint256 jobId, string memory resultUrl) external {
        Job storage job = s_jobs[jobId];
        require(job.status == JobStatus.InProgress, "Job not in progress");
        require(msg.sender == job.provider, "Only assigned provider can submit");

        job.resultUrl = resultUrl;
        job.status = JobStatus.PendingApproval;
        emit JobResultSubmitted(jobId, msg.sender, resultUrl);
    }

    /**
     * @dev O requisitante aprova o resultado e libera o pagamento
     */
    function approveAndPay(uint256 jobId) external nonReentrant {
        Job storage job = s_jobs[jobId];
        require(job.status == JobStatus.PendingApproval, "Job not pending approval");
        require(msg.sender == job.requester, "Only requester can approve");

        job.status = JobStatus.Completed;
        uint256 reward = job.rewardEth;

        // Transfere o pagamento para o provedor
        
        (bool success, ) = job.provider.call{value: reward}("");
        require(success, "Payment failed");

        emit JobApproved(jobId, job.requester, job.provider, reward);
    }
}