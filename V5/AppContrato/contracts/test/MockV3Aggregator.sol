// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Um Mock do Price Feed da Chainlink para testes
contract MockV3Aggregator {
    int256 private s_latestPrice;
    uint8 private s_decimals;

    // Começa com 8 decimais, como o feed ETH/USD real
    constructor(int256 initialPrice) {
        s_latestPrice = initialPrice;
        s_decimals = 8;
    }

    // Função que nosso contrato principal chama
    function latestRoundData()
        public
        view
        returns (
            uint80, // roundId (não usamos)
            int256, // answer (o preço)
            uint256, // startedAt (não usamos)
            uint256, // updatedAt (não usamos)
            uint80 // answeredInRound (não usamos)
        )
    {
        return (0, s_latestPrice, 0, 0, 0);
    }

    // Função para nossos testes atualizarem o preço
    function updateAnswer(int256 newPrice) public {
        s_latestPrice = newPrice;
    }

    function decimals() public view returns (uint8) {
        return s_decimals;
    }
}