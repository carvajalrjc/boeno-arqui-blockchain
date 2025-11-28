require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Red local Besu (3 nodos)
    besu: {
      url: "http://localhost:8545",
      chainId: 1337,
      accounts: [
        // Clave privada de la cuenta con fondos
        "463e32b027c7e121290426decda8480ef6e84e65f70daf9ed1f3198eea9a6208"
      ],
      gas: 6000000,
      gasPrice: 0
    },
    // Nodos adicionales para pruebas
    besu2: {
      url: "http://localhost:8555",
      chainId: 1337,
      accounts: [
        "463e32b027c7e121290426decda8480ef6e84e65f70daf9ed1f3198eea9a6208"
      ]
    },
    besu3: {
      url: "http://localhost:8565",
      chainId: 1337,
      accounts: [
        "463e32b027c7e121290426decda8480ef6e84e65f70daf9ed1f3198eea9a6208"
      ]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

