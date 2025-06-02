const fs = require("fs");
const path = require("path");

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.deployed();

  console.log("SimpleStorage deployed to:", simpleStorage.address);

  // Simpan ABI dan alamat ke file JSON
  const contractData = {
    address: simpleStorage.address,
    abi: JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json"),
        "utf8"
      )
    ).abi,
  };

  const outputPath = path.resolve(__dirname, "../src/contracts/SimpleStorage.json");

  // Pastikan foldernya ada
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Tulis file JSON
  fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
  console.log("Contract ABI and address saved to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
