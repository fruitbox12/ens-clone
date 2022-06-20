const main = async () => {
  const [owner, superCoder] = await hre.ethers.getSigners();
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  const domainContract = await domainContractFactory.deploy("dev");
  await domainContract.deployed();

  console.log("Contract deployed to:", domainContract.address);

  // // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
  let txn = await domainContract.register("brunoscholz",  {value: hre.ethers.utils.parseEther('0.1')});
  await txn.wait();
  console.log("Minted domain brunoscholz.dev");

  txn = await domainContract.setRecord(
    "brunoscholz",
    "",
    "ipfs://bafybeiekkhqcg2q3fc7zhwrnqyawwkmiht4xvybdggttg7vorne3mbapda/eu_128_transparent.png",
    "my portfolio",
    // twitter, github, linkedin, email
    "{'twitter':'brunoskolz',github:'brunoscholz','linkedin':'brunoscholz','email':'brunoscholz@yahoo.de'}",
    // btc, eth, matic
    "{btc:'',eth:'0xaBC03898A52167131236dB74158cB26Cfb2989b9',polygon:'0xaBC03898A52167131236dB74158cB26Cfb2989b9'}"
  );
  await txn.wait();
  console.log("Set record for brunoscholz.dev");

  const address = await domainContract.getAddress("brunoscholz");
  console.log("Owner of domain brunoscholz.dev:", address);

  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

  const mintRecord = await domainContract.records('brunoscholz')
  console.log("All Names:", mintRecord);

  // // Quick! Grab the funds from the contract! (as superCoder)
  // try {
  //   txn = await domainContract.connect(superCoder).withdraw();
  //   await txn.wait();
  // } catch(error){
  //   console.log("Could not rob contract: ", error);
  // }

  // // Let's look in their wallet so we can compare later
  // let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  // console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));

  // // Oops, looks like the owner is saving their money!
  // txn = await domainContract.connect(owner).withdraw();
  // await txn.wait();

  // // Fetch balance of contract & owner
  // const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
  // ownerBalance = await hre.ethers.provider.getBalance(owner.address);

  // console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
  // console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));

  // // mint same name
  // console.log("Trying to mint brunoscholz.dev again...");
  // txn = await domainContract.register("brunoscholz",  {value: hre.ethers.utils.parseEther('0.1')});
  // await txn.wait();
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