// Lista de moedas fiduciárias (Fiat)
const FIAT_CURRENCIES = {
    "USD": "Dólar Americano",
    "EUR": "Euro",
    "BRL": "Real Brasileiro",
    "GBP": "Libra Esterlina",
    "JPY": "Iene Japonês"
};

// Lista das 10 criptomoedas mais populares
const CRYPTO_CURRENCIES = {
    "bitcoin": "Bitcoin (BTC)",
    "ethereum": "Ethereum (ETH)",
    "binancecoin": "Binance Coin (BNB)",
    "tether": "Tether (USDT)",
    "solana": "Solana (SOL)",
    "usd-coin": "USD Coin (USDC)",
    "ripple": "XRP (XRP)",
    "dogecoin": "Dogecoin (DOGE)",
    "cardano": "Cardano (ADA)",
    "polkadot": "Polkadot (DOT)"
};

// URLs das APIs
const API_KEY = "bcef6f012d79a65d6c36087c"; // Insira sua chave da ExchangeRate-API
const FIAT_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
const CRYPTO_API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.keys(CRYPTO_CURRENCIES).join(",")}&vs_currencies=usd`;

// Carregar moedas no dropdown
async function loadCurrencies() {
    try {
        const fromSelect = document.getElementById("fromCurrency");
        const toSelect = document.getElementById("toCurrency");

        // Adicionar moedas fiduciárias
        Object.keys(FIAT_CURRENCIES).forEach(currency => {
            let option1 = document.createElement("option");
            let option2 = document.createElement("option");

            option1.value = currency;
            option1.textContent = `${currency} - ${FIAT_CURRENCIES[currency]}`;
            option2.value = currency;
            option2.textContent = `${currency} - ${FIAT_CURRENCIES[currency]}`;

            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        });

        // Adicionar criptomoedas
        Object.keys(CRYPTO_CURRENCIES).forEach(crypto => {
            let option1 = document.createElement("option");
            let option2 = document.createElement("option");

            option1.value = crypto;
            option1.textContent = CRYPTO_CURRENCIES[crypto];
            option2.value = crypto;
            option2.textContent = CRYPTO_CURRENCIES[crypto];

            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        });

        // Define padrões (USD e Bitcoin)
        fromSelect.value = "USD";
        toSelect.value = "bitcoin";
    } catch (error) {
        alert("Erro ao carregar moedas. Tente novamente.");
    }
}

// Função para inverter moedas
function invertCurrencies() {
    const fromSelect = document.getElementById("fromCurrency");
    const toSelect = document.getElementById("toCurrency");

    // Troca os valores das moedas
    const tempValue = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tempValue;
}

// Função para converter moedas
async function convertCurrency() {
    const amount = document.getElementById("amount").value;
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;

    if (amount === "" || amount <= 0) {
        alert("Digite um valor válido!");
        return;
    }

    let conversionRate = 1;

    try {
        // Se ambas as moedas forem fiduciárias (USD, BRL, EUR, etc.)
        if (FIAT_CURRENCIES[fromCurrency] && FIAT_CURRENCIES[toCurrency]) {
            const response = await fetch(FIAT_API_URL);
            const data = await response.json();
            conversionRate = data.conversion_rates[toCurrency] / data.conversion_rates[fromCurrency];

        // Se for Criptomoeda para USD
        } else if (CRYPTO_CURRENCIES[fromCurrency] && toCurrency === "USD") {
            const response = await fetch(CRYPTO_API_URL);
            const data = await response.json();
            conversionRate = data[fromCurrency].usd;

        // Se for USD para Criptomoeda
        } else if (fromCurrency === "USD" && CRYPTO_CURRENCIES[toCurrency]) {
            const response = await fetch(CRYPTO_API_URL);
            const data = await response.json();
            conversionRate = 1 / data[toCurrency].usd;

        // Se for moeda fiduciária para criptomoeda (ex: BRL → BTC)
        } else if (FIAT_CURRENCIES[fromCurrency] && CRYPTO_CURRENCIES[toCurrency]) {
            const responseFiat = await fetch(FIAT_API_URL);
            const responseCrypto = await fetch(CRYPTO_API_URL);
            const dataFiat = await responseFiat.json();
            const dataCrypto = await responseCrypto.json();

            // Converte moeda fiduciária para USD, depois para criptomoeda
            const toUSD = amount / dataFiat.conversion_rates[fromCurrency];
            conversionRate = toUSD / dataCrypto[toCurrency].usd;

        // Se for criptomoeda para moeda fiduciária (ex: BTC → BRL)
        } else if (CRYPTO_CURRENCIES[fromCurrency] && FIAT_CURRENCIES[toCurrency]) {
            const responseFiat = await fetch(FIAT_API_URL);
            const responseCrypto = await fetch(CRYPTO_API_URL);
            const dataFiat = await responseFiat.json();
            const dataCrypto = await responseCrypto.json();

            // Converte criptomoeda para USD, depois para moeda fiduciária
            const fromCryptoToUSD = amount * dataCrypto[fromCurrency].usd;
            conversionRate = fromCryptoToUSD * dataFiat.conversion_rates[toCurrency];

        // Se for conversão entre criptomoedas (ex: BTC → ETH)
        } else if (CRYPTO_CURRENCIES[fromCurrency] && CRYPTO_CURRENCIES[toCurrency]) {
            const response = await fetch(CRYPTO_API_URL);
            const data = await response.json();

            const fromCryptoToUSD = data[fromCurrency].usd;
            const toCryptoToUSD = data[toCurrency].usd;

            // Conversão entre criptomoedas usando USD como intermediário
            conversionRate = fromCryptoToUSD / toCryptoToUSD;
        } else {
            alert("Erro na conversão. Moeda não reconhecida.");
            return;
        }

        // Calcula e exibe o resultado
        const convertedAmount = (amount * conversionRate).toFixed(6);
        document.getElementById("result").textContent = `Resultado: ${amount} ${fromCurrency.toUpperCase()} = ${convertedAmount} ${toCurrency.toUpperCase()}`;
    } catch (error) {
        alert("Erro na conversão. Tente novamente.");
        console.error("Erro na API:", error);
    }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    loadCurrencies();
    document.getElementById("convertBtn").addEventListener("click", convertCurrency);
    document.getElementById("invertBtn").addEventListener("click", invertCurrencies);
});
