require("@nomiclabs/hardhat-waffle");
require("dotenv").config()
const privateKeys = process.env.PRIVATE_KEYS || "";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    development: {
      url: 'http://127.0.0.1:7545',
      accounts: privateKeys.split(','),
    },
    rinkeby: {
      chainId: 5,
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: privateKeys.split(','),
    },
    goerli: {
      chainId: 4,
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: privateKeys.split(','),
    },
    mainnet: {
      chainId: 1,
      url: process.env.ALCHEMY_API_KEY,
      accounts: privateKeys.split(','),
    },
  },
};
