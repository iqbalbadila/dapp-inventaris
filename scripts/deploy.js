import fs from "fs";
import hre from "hardhat";

async function main() {
const SystemContract = await ethers.getContractFactory("SystemContracts");
const systemContract = await SystemContract.deploy();
await systemContract.waitForDeployment(); // ✅ this replaces .deployed()
console.log("Deployed to:", await systemContract.getAddress()); // ✅ use getAddress()

const address = await systemContract.getAddress();


  // Simpan ABI dan alamat ke file JSON
  const contractData = {
    address: address,
    abi: (await hre.artifacts.readArtifact("SystemContracts")).abi,

  };

  fs.writeFileSync('./src/artifacts/deployment.json', JSON.stringify(contractData, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
