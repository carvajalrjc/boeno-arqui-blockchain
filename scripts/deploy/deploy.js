const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("        🚀 DESPLEGANDO SMART CONTRACTS");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Desplegando contratos con la cuenta:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", hre.ethers.formatEther(balance), "ETH");
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // 1. Desplegar TrazaToken
  // ═══════════════════════════════════════════════════════════════════
  console.log("1️⃣  Desplegando TrazaToken (TRZ)...");
  
  const TrazaToken = await hre.ethers.getContractFactory("TrazaToken");
  const initialSupply = 1000000; // 1 millón de tokens iniciales
  const trazaToken = await TrazaToken.deploy(initialSupply);
  await trazaToken.waitForDeployment();
  
  const tokenAddress = await trazaToken.getAddress();
  console.log("   ✅ TrazaToken desplegado en:", tokenAddress);
  console.log("   📊 Supply inicial:", initialSupply.toLocaleString(), "TRZ");
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // 2. Desplegar Trazabilidad
  // ═══════════════════════════════════════════════════════════════════
  console.log("2️⃣  Desplegando contrato de Trazabilidad...");
  
  const Trazabilidad = await hre.ethers.getContractFactory("Trazabilidad");
  const trazabilidad = await Trazabilidad.deploy(tokenAddress);
  await trazabilidad.waitForDeployment();
  
  const trazabilidadAddress = await trazabilidad.getAddress();
  console.log("   ✅ Trazabilidad desplegado en:", trazabilidadAddress);
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // 3. Configurar permisos del token
  // ═══════════════════════════════════════════════════════════════════
  console.log("3️⃣  Configurando permisos del token...");
  
  const tx = await trazaToken.setTrazabilidadContract(trazabilidadAddress);
  await tx.wait();
  console.log("   ✅ Contrato de Trazabilidad autorizado para mintear tokens");
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // 4. Guardar direcciones de contratos
  // ═══════════════════════════════════════════════════════════════════
  const deploymentInfo = {
    network: hre.network.name,
    chainId: 1337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      TrazaToken: {
        address: tokenAddress,
        symbol: "TRZ",
        decimals: 18,
        initialSupply: initialSupply
      },
      Trazabilidad: {
        address: trazabilidadAddress
      }
    },
    recompensas: {
      proveedor: "100 TRZ",
      producto: "50 TRZ",
      movimiento: "10 TRZ"
    }
  };

  const deploymentPath = path.join(__dirname, "../../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("4️⃣  Información guardada en deployment.json");
  console.log("");

  // ═══════════════════════════════════════════════════════════════════
  // Resumen
  // ═══════════════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("        ✅ DESPLIEGUE COMPLETADO");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("");
  console.log("📋 CONTRATOS DESPLEGADOS:");
  console.log("   • TrazaToken (TRZ):", tokenAddress);
  console.log("   • Trazabilidad:", trazabilidadAddress);
  console.log("");
  console.log("💰 SISTEMA DE RECOMPENSAS:");
  console.log("   • Registrar Proveedor: +100 TRZ");
  console.log("   • Registrar Producto:  +50 TRZ");
  console.log("   • Registrar Movimiento: +10 TRZ");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el despliegue:", error);
    process.exit(1);
  });

