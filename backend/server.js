import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE LOS 3 NODOS
// ═══════════════════════════════════════════════════════════════════

const NODE_URLS = [
  process.env.NODE1_RPC || 'http://localhost:8545',
  process.env.NODE2_RPC || 'http://localhost:8555',
  process.env.NODE3_RPC || 'http://localhost:8565',
];

// Crear providers para cada nodo
const providers = NODE_URLS.map((url, index) => {
  try {
    return new ethers.JsonRpcProvider(url);
  } catch (error) {
    console.error(`Error creando provider para nodo ${index + 1}:`, error.message);
    return null;
  }
});

// Wallet para firmar transacciones
const PRIVATE_KEY = process.env.PRIVATE_KEY || '463e32b027c7e121290426decda8480ef6e84e65f70daf9ed1f3198eea9a6208';
const wallet = new ethers.Wallet(PRIVATE_KEY, providers[0]);

// ═══════════════════════════════════════════════════════════════════
// CARGAR SMART CONTRACTS
// ═══════════════════════════════════════════════════════════════════

let trazabilidadContract = null;
let tokenContract = null;
let contractsLoaded = false;

// ABIs de los contratos
const TrazaTokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount, string reason)"
];

const TrazabilidadABI = [
  // Proveedores
  "function crearProveedor(string nombre, string direccion, string telefono, string email, string tipo) returns (uint256)",
  "function actualizarProveedor(uint256 id, string nombre, string direccion, string telefono, string email, string tipo)",
  "function eliminarProveedor(uint256 id)",
  "function obtenerProveedor(uint256 id) view returns (tuple(uint256 id, string nombre, string direccion, string telefono, string email, string tipo, bool activo, uint256 fechaCreacion, address registradoPor))",
  "function totalProveedores() view returns (uint256)",
  
  // Productos
  "function crearProducto(string nombre, string descripcion, string categoria, uint256 proveedorId, string origen, uint256 precio, string unidad) returns (uint256)",
  "function actualizarProducto(uint256 id, string nombre, string descripcion, string categoria, string origen, uint256 precio, string unidad)",
  "function eliminarProducto(uint256 id)",
  "function obtenerProducto(uint256 id) view returns (tuple(uint256 id, string nombre, string descripcion, string categoria, uint256 proveedorId, string origen, uint256 precio, string unidad, bool activo, uint256 fechaCreacion, address registradoPor))",
  "function totalProductos() view returns (uint256)",
  "function obtenerProductosDeProveedor(uint256 proveedorId) view returns (uint256[])",
  
  // Movimientos
  "function registrarMovimiento(uint256 productoId, string tipo, string ubicacionOrigen, string ubicacionDestino, uint256 cantidad, string responsable, string observaciones) returns (uint256)",
  "function obtenerMovimiento(uint256 id) view returns (tuple(uint256 id, uint256 productoId, string tipo, string ubicacionOrigen, string ubicacionDestino, uint256 cantidad, string responsable, string observaciones, uint256 fechaMovimiento, address registradoPor))",
  "function obtenerTrazabilidad(uint256 productoId) view returns (uint256[])",
  "function totalMovimientos() view returns (uint256)",
  
  // Estadísticas
  "function obtenerEstadisticas() view returns (uint256, uint256, uint256, uint256)",
  
  // Recompensas
  "function recompensaProveedor() view returns (uint256)",
  "function recompensaProducto() view returns (uint256)",
  "function recompensaMovimiento() view returns (uint256)",
  
  // Eventos
  "event ProveedorCreado(uint256 indexed id, string nombre, string tipo, address registradoPor)",
  "event ProductoCreado(uint256 indexed id, string nombre, uint256 proveedorId, address registradoPor)",
  "event MovimientoRegistrado(uint256 indexed id, uint256 indexed productoId, string tipo, uint256 cantidad, address registradoPor)"
];

// Cargar direcciones de contratos desde deployment.json
function loadContracts() {
  try {
    // Buscar en varias ubicaciones posibles
    const possiblePaths = [
      path.join(__dirname, '..', 'deployment.json'),  // Local (desarrollo)
      '/app/deployment.json',                          // Docker
      path.join(__dirname, 'deployment.json'),         // Mismo directorio
    ];
    
    let deploymentPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        deploymentPath = p;
        console.log(`📍 deployment.json encontrado en: ${p}`);
        break;
      }
    }
    
    if (deploymentPath) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      
      tokenContract = new ethers.Contract(
        deployment.contracts.TrazaToken.address,
        TrazaTokenABI,
        wallet
      );
      
      trazabilidadContract = new ethers.Contract(
        deployment.contracts.Trazabilidad.address,
        TrazabilidadABI,
        wallet
      );
      
      contractsLoaded = true;
      console.log('✅ Smart Contracts cargados:');
      console.log(`   📜 TrazaToken: ${deployment.contracts.TrazaToken.address}`);
      console.log(`   📜 Trazabilidad: ${deployment.contracts.Trazabilidad.address}`);
      return true;
    }
  } catch (error) {
    console.error('⚠️  Error cargando contratos:', error.message);
  }
  return false;
}

// Intentar cargar contratos
loadContracts();

// ═══════════════════════════════════════════════════════════════════
// BASE DE DATOS EN MEMORIA (caché para consultas rápidas)
// Los datos principales están en los Smart Contracts
// ═══════════════════════════════════════════════════════════════════

const cache = {
  proveedores: new Map(),
  productos: new Map(),
  movimientos: new Map(),
};

console.log('═══════════════════════════════════════════════════════════════════');
console.log('  🔗 BLOCKCHAIN BACKEND - Sistema de Trazabilidad con Smart Contracts');
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`  📍 Wallet Address: ${wallet.address}`);
console.log(`  🖥️  Nodo 1: ${NODE_URLS[0]}`);
console.log(`  🖥️  Nodo 2: ${NODE_URLS[1]}`);
console.log(`  🖥️  Nodo 3: ${NODE_URLS[2]}`);
console.log('═══════════════════════════════════════════════════════════════════');

// ═══════════════════════════════════════════════════════════════════
// ENDPOINTS DE SALUD Y ESTADO
// ═══════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'blockchain-trazabilidad',
    smartContracts: contractsLoaded
  });
});

// Estado de los 3 nodos
app.get('/api/nodes/status', async (req, res) => {
  try {
    const statuses = await Promise.all(
      providers.map(async (provider, index) => {
        if (!provider) {
          return { node: index + 1, url: NODE_URLS[index], status: 'offline' };
        }
        try {
          const [blockNumber, network] = await Promise.all([
            provider.getBlockNumber(),
            provider.getNetwork()
          ]);
          let peerCount = 0;
          try {
            const peers = await provider.send('net_peerCount', []);
            peerCount = parseInt(peers, 16);
          } catch (e) {}
          return {
            node: index + 1,
            url: NODE_URLS[index],
            status: 'online',
            blockNumber,
            chainId: Number(network.chainId),
            peers: peerCount
          };
        } catch (error) {
          return { node: index + 1, url: NODE_URLS[index], status: 'offline', error: error.message };
        }
      })
    );
    const onlineNodes = statuses.filter(s => s.status === 'online').length;
    res.json({ totalNodes: 3, onlineNodes, nodes: statuses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar consenso
app.get('/api/consensus', async (req, res) => {
  try {
    const blocks = await Promise.all(
      providers.map(async (provider, index) => {
        if (!provider) return null;
        try {
          const block = await provider.getBlock('latest');
          return { node: index + 1, blockNumber: block.number, hash: block.hash, timestamp: block.timestamp, miner: block.miner };
        } catch (error) {
          return { node: index + 1, error: error.message };
        }
      })
    );
    const validBlocks = blocks.filter(b => b && !b.error);
    let synced = false;
    let consensusStatus = 'Sin datos suficientes';
    if (validBlocks.length >= 2) {
      synced = validBlocks.every(b => b.hash === validBlocks[0].hash);
      consensusStatus = synced ? '✅ Consenso alcanzado - Todos los nodos sincronizados' : '⏳ Sincronizando...';
    }
    res.json({ synced, consensusStatus, totalNodes: 3, syncedNodes: validBlocks.length, latestBlock: validBlocks[0] || null, blocks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validadores
app.get('/api/validators', async (req, res) => {
  try {
    const validators = await providers[0].send('ibft_getValidatorsByBlockNumber', ['latest']);
    res.json({ count: validators.length, validators, minimumForConsensus: Math.floor(validators.length * 2 / 3) + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ENDPOINTS DE TOKEN (CRIPTOMONEDA)
// ═══════════════════════════════════════════════════════════════════

// Información del token
app.get('/api/token/info', async (req, res) => {
  try {
    if (!tokenContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);
    
    res.json({
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      address: await tokenContract.getAddress()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Balance de tokens de una dirección
app.get('/api/token/balance/:address', async (req, res) => {
  try {
    if (!tokenContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const balance = await tokenContract.balanceOf(req.params.address);
    const decimals = await tokenContract.decimals();
    
    res.json({
      address: req.params.address,
      balance: ethers.formatUnits(balance, decimals),
      balanceWei: balance.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Balance del wallet actual
app.get('/api/wallet', async (req, res) => {
  try {
    const ethBalance = await providers[0].getBalance(wallet.address);
    const nonce = await providers[0].getTransactionCount(wallet.address);
    
    let tokenBalance = '0';
    if (tokenContract) {
      const balance = await tokenContract.balanceOf(wallet.address);
      tokenBalance = ethers.formatUnits(balance, 18);
    }
    
    res.json({
      address: wallet.address,
      ethBalance: ethers.formatEther(ethBalance),
      tokenBalance: tokenBalance,
      tokenSymbol: 'TRZ',
      nonce
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transferir tokens
app.post('/api/token/transfer', async (req, res) => {
  try {
    if (!tokenContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const { to, amount } = req.body;
    if (!to || !amount) {
      return res.status(400).json({ error: 'Dirección y cantidad requeridas' });
    }
    
    const amountWei = ethers.parseUnits(amount.toString(), 18);
    const tx = await tokenContract.transfer(to, amountWei);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: wallet.address,
      to,
      amount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// CRUD - PROVEEDORES (Smart Contract)
// ═══════════════════════════════════════════════════════════════════

// Crear proveedor
app.post('/api/proveedores', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const { nombre, direccion, telefono, email, tipo } = req.body;
    if (!nombre || !direccion) {
      return res.status(400).json({ error: 'Nombre y dirección son requeridos' });
    }

    console.log('📝 Creando proveedor en Smart Contract...');
    
    const tx = await trazabilidadContract.crearProveedor(
      nombre,
      direccion || '',
      telefono || '',
      email || '',
      tipo || 'General'
    );
    
    const receipt = await tx.wait();
    
    // Obtener el ID del evento
    const event = receipt.logs.find(log => {
      try {
        return trazabilidadContract.interface.parseLog(log)?.name === 'ProveedorCreado';
      } catch { return false; }
    });
    
    let id = 0;
    if (event) {
      const parsed = trazabilidadContract.interface.parseLog(event);
      id = Number(parsed.args[0]);
    } else {
      id = Number(await trazabilidadContract.totalProveedores());
    }

    const proveedorData = {
      id,
      nombre,
      direccion,
      telefono: telefono || '',
      email: email || '',
      tipo: tipo || 'General',
      activo: true,
      fechaCreacion: new Date().toISOString(),
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };

    cache.proveedores.set(id, proveedorData);
    
    console.log(`✅ Proveedor creado: ID=${id} - TX: ${receipt.hash}`);

    res.status(201).json({
      success: true,
      id,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokensGanados: '100 TRZ',
      data: proveedorData
    });
  } catch (error) {
    console.error('Error creando proveedor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los proveedores
app.get('/api/proveedores', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const total = Number(await trazabilidadContract.totalProveedores());
    const proveedores = [];
    
    for (let i = 1; i <= total; i++) {
      try {
        const p = await trazabilidadContract.obtenerProveedor(i);
        if (p.activo) {
          proveedores.push({
            id: Number(p.id),
            nombre: p.nombre,
            direccion: p.direccion,
            telefono: p.telefono,
            email: p.email,
            tipo: p.tipo,
            activo: p.activo,
            fechaCreacion: new Date(Number(p.fechaCreacion) * 1000).toISOString(),
            registradoPor: p.registradoPor
          });
        }
      } catch (e) {
        console.error(`Error obteniendo proveedor ${i}:`, e.message);
      }
    }
    
    res.json({ count: proveedores.length, proveedores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener proveedor por ID
app.get('/api/proveedores/:id', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const p = await trazabilidadContract.obtenerProveedor(req.params.id);
    
    if (!p.activo && Number(p.id) === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    
    res.json({
      id: Number(p.id),
      nombre: p.nombre,
      direccion: p.direccion,
      telefono: p.telefono,
      email: p.email,
      tipo: p.tipo,
      activo: p.activo,
      fechaCreacion: new Date(Number(p.fechaCreacion) * 1000).toISOString(),
      registradoPor: p.registradoPor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar proveedor
app.put('/api/proveedores/:id', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const { nombre, direccion, telefono, email, tipo } = req.body;
    
    const tx = await trazabilidadContract.actualizarProveedor(
      req.params.id,
      nombre || '',
      direccion || '',
      telefono || '',
      email || '',
      tipo || ''
    );
    
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      message: 'Proveedor actualizado en blockchain'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar proveedor
app.delete('/api/proveedores/:id', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const tx = await trazabilidadContract.eliminarProveedor(req.params.id);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      message: 'Proveedor eliminado'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// CRUD - PRODUCTOS (Smart Contract)
// ═══════════════════════════════════════════════════════════════════

// Crear producto
app.post('/api/productos', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const { nombre, descripcion, categoria, proveedorId, origen, precio, unidad } = req.body;
    
    if (!nombre || !proveedorId) {
      return res.status(400).json({ error: 'Nombre y proveedorId son requeridos' });
    }

    console.log('📝 Creando producto en Smart Contract...');
    
    const tx = await trazabilidadContract.crearProducto(
      nombre,
      descripcion || '',
      categoria || 'General',
      proveedorId,
      origen || 'Nacional',
      Math.floor((precio || 0) * 100), // Guardar precio como entero (centavos)
      unidad || 'unidad'
    );
    
    const receipt = await tx.wait();
    
    // Obtener el ID del evento
    const event = receipt.logs.find(log => {
      try {
        return trazabilidadContract.interface.parseLog(log)?.name === 'ProductoCreado';
      } catch { return false; }
    });
    
    let id = 0;
    if (event) {
      const parsed = trazabilidadContract.interface.parseLog(event);
      id = Number(parsed.args[0]);
    } else {
      id = Number(await trazabilidadContract.totalProductos());
    }

    // Obtener nombre del proveedor
    const proveedor = await trazabilidadContract.obtenerProveedor(proveedorId);

    const productoData = {
      id,
      nombre,
      descripcion: descripcion || '',
      categoria: categoria || 'General',
      proveedorId: Number(proveedorId),
      proveedorNombre: proveedor.nombre,
      origen: origen || 'Nacional',
      precio: precio || 0,
      unidad: unidad || 'unidad',
      estado: 'Disponible',
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };

    cache.productos.set(id, productoData);
    
    console.log(`✅ Producto creado: ID=${id} - TX: ${receipt.hash}`);

    res.status(201).json({
      success: true,
      id,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokensGanados: '50 TRZ',
      data: productoData
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const total = Number(await trazabilidadContract.totalProductos());
    const productos = [];
    
    for (let i = 1; i <= total; i++) {
      try {
        const p = await trazabilidadContract.obtenerProducto(i);
        if (p.activo) {
          const proveedor = await trazabilidadContract.obtenerProveedor(p.proveedorId);
          productos.push({
            id: Number(p.id),
            nombre: p.nombre,
            descripcion: p.descripcion,
            categoria: p.categoria,
            proveedorId: Number(p.proveedorId),
            proveedorNombre: proveedor.nombre,
            origen: p.origen,
            precio: Number(p.precio) / 100,
            unidad: p.unidad,
            activo: p.activo,
            estado: 'Disponible',
            fechaCreacion: new Date(Number(p.fechaCreacion) * 1000).toISOString()
          });
        }
      } catch (e) {
        console.error(`Error obteniendo producto ${i}:`, e.message);
      }
    }
    
    res.json({ count: productos.length, productos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener producto por ID
app.get('/api/productos/:id', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const p = await trazabilidadContract.obtenerProducto(req.params.id);
    
    if (!p.activo && Number(p.id) === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const proveedor = await trazabilidadContract.obtenerProveedor(p.proveedorId);
    
    res.json({
      id: Number(p.id),
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      proveedorId: Number(p.proveedorId),
      proveedorNombre: proveedor.nombre,
      origen: p.origen,
      precio: Number(p.precio) / 100,
      unidad: p.unidad,
      activo: p.activo,
      fechaCreacion: new Date(Number(p.fechaCreacion) * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const { nombre, descripcion, categoria, origen, precio, unidad } = req.body;
    
    const tx = await trazabilidadContract.actualizarProducto(
      req.params.id,
      nombre || '',
      descripcion || '',
      categoria || '',
      origen || '',
      precio ? Math.floor(precio * 100) : 0,
      unidad || ''
    );
    
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      message: 'Producto actualizado en blockchain'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const tx = await trazabilidadContract.eliminarProducto(req.params.id);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      message: 'Producto eliminado'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// CRUD - MOVIMIENTOS (Smart Contract - Trazabilidad)
// ═══════════════════════════════════════════════════════════════════

// Crear movimiento
app.post('/api/movimientos', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const { productoId, tipo, ubicacionOrigen, ubicacionDestino, cantidad, responsable, observaciones } = req.body;
    
    if (!productoId || !tipo) {
      return res.status(400).json({ error: 'productoId y tipo son requeridos' });
    }

    console.log('📝 Registrando movimiento en Smart Contract...');
    
    const tx = await trazabilidadContract.registrarMovimiento(
      productoId,
      tipo,
      ubicacionOrigen || '',
      ubicacionDestino || '',
      cantidad || 1,
      responsable || 'Sistema',
      observaciones || ''
    );
    
    const receipt = await tx.wait();
    
    // Obtener el ID del evento
    const event = receipt.logs.find(log => {
      try {
        return trazabilidadContract.interface.parseLog(log)?.name === 'MovimientoRegistrado';
      } catch { return false; }
    });
    
    let id = 0;
    if (event) {
      const parsed = trazabilidadContract.interface.parseLog(event);
      id = Number(parsed.args[0]);
    } else {
      id = Number(await trazabilidadContract.totalMovimientos());
    }

    // Obtener nombre del producto
    const producto = await trazabilidadContract.obtenerProducto(productoId);

    const movimientoData = {
      id,
      productoId: Number(productoId),
      productoNombre: producto.nombre,
      tipo,
      ubicacionOrigen: ubicacionOrigen || '',
      ubicacionDestino: ubicacionDestino || '',
      cantidad: cantidad || 1,
      responsable: responsable || 'Sistema',
      observaciones: observaciones || '',
      fechaMovimiento: new Date().toISOString(),
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };

    cache.movimientos.set(id, movimientoData);
    
    console.log(`✅ Movimiento registrado: ID=${id} - TX: ${receipt.hash}`);

    res.status(201).json({
      success: true,
      id,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokensGanados: '10 TRZ',
      data: movimientoData
    });
  } catch (error) {
    console.error('Error creando movimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los movimientos
app.get('/api/movimientos', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const { productoId } = req.query;
    const total = Number(await trazabilidadContract.totalMovimientos());
    const movimientos = [];
    
    for (let i = 1; i <= total; i++) {
      try {
        const m = await trazabilidadContract.obtenerMovimiento(i);
        if (!productoId || Number(m.productoId) === Number(productoId)) {
          const producto = await trazabilidadContract.obtenerProducto(m.productoId);
          movimientos.push({
            id: Number(m.id),
            productoId: Number(m.productoId),
            productoNombre: producto.nombre,
            tipo: m.tipo,
            ubicacionOrigen: m.ubicacionOrigen,
            ubicacionDestino: m.ubicacionDestino,
            cantidad: Number(m.cantidad),
            responsable: m.responsable,
            observaciones: m.observaciones,
            fechaMovimiento: new Date(Number(m.fechaMovimiento) * 1000).toISOString()
          });
        }
      } catch (e) {
        console.error(`Error obteniendo movimiento ${i}:`, e.message);
      }
    }
    
    // Ordenar por fecha descendente
    movimientos.sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));
    
    res.json({ count: movimientos.length, movimientos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener movimiento por ID
app.get('/api/movimientos/:id', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const m = await trazabilidadContract.obtenerMovimiento(req.params.id);
    const producto = await trazabilidadContract.obtenerProducto(m.productoId);
    
    res.json({
      id: Number(m.id),
      productoId: Number(m.productoId),
      productoNombre: producto.nombre,
      tipo: m.tipo,
      ubicacionOrigen: m.ubicacionOrigen,
      ubicacionDestino: m.ubicacionDestino,
      cantidad: Number(m.cantidad),
      responsable: m.responsable,
      observaciones: m.observaciones,
      fechaMovimiento: new Date(Number(m.fechaMovimiento) * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trazabilidad completa de un producto
app.get('/api/productos/:id/trazabilidad', async (req, res) => {
  try {
    if (!trazabilidadContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const producto = await trazabilidadContract.obtenerProducto(req.params.id);
    const proveedor = await trazabilidadContract.obtenerProveedor(producto.proveedorId);
    const movimientosIds = await trazabilidadContract.obtenerTrazabilidad(req.params.id);
    
    const movimientos = [];
    for (const id of movimientosIds) {
      const m = await trazabilidadContract.obtenerMovimiento(id);
      movimientos.push({
        id: Number(m.id),
        tipo: m.tipo,
        ubicacionOrigen: m.ubicacionOrigen,
        ubicacionDestino: m.ubicacionDestino,
        cantidad: Number(m.cantidad),
        responsable: m.responsable,
        observaciones: m.observaciones,
        fechaMovimiento: new Date(Number(m.fechaMovimiento) * 1000).toISOString()
      });
    }
    
    res.json({
      producto: {
        id: Number(producto.id),
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        precio: Number(producto.precio) / 100,
        unidad: producto.unidad
      },
      proveedor: {
        id: Number(proveedor.id),
        nombre: proveedor.nombre,
        tipo: proveedor.tipo
      },
      movimientos,
      totalMovimientos: movimientos.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ESTADÍSTICAS (desde Smart Contract)
// ═══════════════════════════════════════════════════════════════════

app.get('/api/stats', async (req, res) => {
  try {
    if (!trazabilidadContract || !tokenContract) {
      return res.status(503).json({ error: 'Smart contracts no cargados' });
    }
    
    const [totalProveedores, totalProductos, totalMovimientos, totalTokens] = 
      await trazabilidadContract.obtenerEstadisticas();
    
    const [recompProveedor, recompProducto, recompMovimiento] = await Promise.all([
      trazabilidadContract.recompensaProveedor(),
      trazabilidadContract.recompensaProducto(),
      trazabilidadContract.recompensaMovimiento()
    ]);
    
    res.json({
      proveedores: {
        total: Number(totalProveedores),
        activos: Number(totalProveedores)
      },
      productos: {
        total: Number(totalProductos),
        disponibles: Number(totalProductos)
      },
      movimientos: {
        total: Number(totalMovimientos),
        porTipo: {}
      },
      token: {
        symbol: 'TRZ',
        totalSupply: ethers.formatUnits(totalTokens, 18),
        recompensas: {
          proveedor: ethers.formatUnits(recompProveedor, 18) + ' TRZ',
          producto: ethers.formatUnits(recompProducto, 18) + ' TRZ',
          movimiento: ethers.formatUnits(recompMovimiento, 18) + ' TRZ'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// INFORMACIÓN DE CONTRATOS
// ═══════════════════════════════════════════════════════════════════

app.get('/api/contracts', async (req, res) => {
  try {
    const deploymentPath = path.join(__dirname, '..', 'deployment.json');
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      res.json({
        loaded: contractsLoaded,
        deployment
      });
    } else {
      res.json({ loaded: false, error: 'deployment.json no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bloques
app.get('/api/blocks/latest', async (req, res) => {
  try {
    const block = await providers[0].getBlock('latest');
    res.json({
      number: block.number,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      miner: block.miner,
      gasLimit: block.gasLimit.toString(),
      gasUsed: block.gasUsed.toString(),
      transactions: block.transactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blocks', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const latestBlock = await providers[0].getBlockNumber();
    const blocks = await Promise.all(
      Array.from({ length: limit }, (_, i) => latestBlock - i)
        .filter(n => n >= 0)
        .map(async (blockNumber) => {
          const block = await providers[0].getBlock(blockNumber);
          return { number: block.number, hash: block.hash.slice(0, 18) + '...', timestamp: block.timestamp, transactions: block.transactions.length };
        })
    );
    res.json({ blocks, latestBlock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log('');
  console.log('📚 Endpoints disponibles:');
  console.log('');
  console.log('   💰 TOKEN (TRZ):');
  console.log('   GET    /api/token/info           - Info del token');
  console.log('   GET    /api/token/balance/:addr  - Balance de tokens');
  console.log('   POST   /api/token/transfer       - Transferir tokens');
  console.log('   GET    /api/wallet               - Balance del wallet');
  console.log('');
  console.log('   🏭 PROVEEDORES:');
  console.log('   POST   /api/proveedores          - Crear (+100 TRZ)');
  console.log('   GET    /api/proveedores          - Listar');
  console.log('   GET    /api/proveedores/:id      - Obtener');
  console.log('   PUT    /api/proveedores/:id      - Actualizar');
  console.log('   DELETE /api/proveedores/:id      - Eliminar');
  console.log('');
  console.log('   📦 PRODUCTOS:');
  console.log('   POST   /api/productos            - Crear (+50 TRZ)');
  console.log('   GET    /api/productos            - Listar');
  console.log('   GET    /api/productos/:id        - Obtener');
  console.log('   PUT    /api/productos/:id        - Actualizar');
  console.log('   DELETE /api/productos/:id        - Eliminar');
  console.log('');
  console.log('   🚚 MOVIMIENTOS:');
  console.log('   POST   /api/movimientos          - Registrar (+10 TRZ)');
  console.log('   GET    /api/movimientos          - Listar');
  console.log('   GET    /api/movimientos/:id      - Obtener');
  console.log('');
  console.log('   📊 OTROS:');
  console.log('   GET    /api/productos/:id/trazabilidad - Historial completo');
  console.log('   GET    /api/stats                       - Estadísticas');
  console.log('   GET    /api/contracts                   - Info de contratos');
  console.log('');
});
