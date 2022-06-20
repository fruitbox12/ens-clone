const main = async () => {
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  const domainContract = await domainContractFactory.deploy("dev");
  await domainContract.deployed();

  console.log("Contract deployed to:", domainContract.address);

  // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
  // let txn = await domainContract.register("brunoscholz",  {value: hre.ethers.utils.parseEther('0.1')});
  // await txn.wait();
  // console.log("Minted domain brunoscholz.dev");

  // txn = await domainContract.setRecord(
  //   "brunoscholz",
  //   "",
  //   "ipfs://bafybeiekkhqcg2q3fc7zhwrnqyawwkmiht4xvybdggttg7vorne3mbapda/eu_128_transparent.png",
  //   "my portfolio",
  //   // twitter, github, linkedin, email
  //   ["brunoskolz", "brunoscholz", "brunoscholz", "brunoscholz@yahoo.de"],
  //   // btc, eth, matic
  //   ["", "0xaBC03898A52167131236dB74158cB26Cfb2989b9", "0xaBC03898A52167131236dB74158cB26Cfb2989b9"]
  // );
  // await txn.wait();
  // console.log("Set record for brunoscholz.dev");

  // const address = await domainContract.getAddress("brunoscholz");
  // console.log("Owner of domain brunoscholz.dev:", address);

  // const balance = await hre.ethers.provider.getBalance(domainContract.address);
  // console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();