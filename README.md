# 🔗 Sistema de Trazabilidad Blockchain

Sistema completo de trazabilidad de productos basado en blockchain privada con Hyperledger Besu, Smart Contracts en Solidity y Token ERC-20.

![Blockchain](https://img.shields.io/badge/Blockchain-Hyperledger%20Besu-blue)
![Consensus](https://img.shields.io/badge/Consensus-IBFT%202.0-green)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-purple)
![React](https://img.shields.io/badge/Frontend-React%2018-61dafb)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

---

## 📋 Descripción

Este proyecto implementa un sistema de trazabilidad de productos utilizando una red blockchain privada de 3 nodos con consenso IBFT 2.0 (Byzantine Fault Tolerant). Incluye Smart Contracts para la gestión de entidades y un token ERC-20 como sistema de recompensas.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA                             │
└─────────────────────────────────────────────────────────────────┘

                              👤 Usuario
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite) :5173                                   │
│  Dashboard │ Proveedores │ Productos │ Movimientos │ Token      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express) :3001                               │
│  API REST │ Ethers.js │ Validaciones                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ JSON-RPC
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  SMART CONTRACTS (Solidity)                                      │
│  TrazaToken.sol (ERC-20) ◄── Trazabilidad.sol (Lógica)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Consenso IBFT 2.0
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  BLOCKCHAIN (Hyperledger Besu - 3 Nodos)                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                      │
│  │ NODO 1  │◄──►│ NODO 2  │◄──►│ NODO 3  │                      │
│  │  :8545  │    │  :8555  │    │  :8565  │                      │
│  └─────────┘    └─────────┘    └─────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Características

### Blockchain
- ✅ Red privada de 3 nodos Hyperledger Besu
- ✅ Consenso IBFT 2.0 (tolerante a fallas bizantinas)
- ✅ Generación de bloques cada 2 segundos
- ✅ Almacenamiento inmutable de datos

### Smart Contracts
- ✅ **TrazaToken (TRZ)**: Token ERC-20 para recompensas
- ✅ **Trazabilidad**: Gestión de Proveedores, Productos y Movimientos

### Sistema de Recompensas
| Acción | Recompensa |
|--------|------------|
| Registrar Proveedor | +100 TRZ |
| Registrar Producto | +50 TRZ |
| Registrar Movimiento | +10 TRZ |

### Entidades
- **Proveedores**: Productores, distribuidores, transportistas
- **Productos**: Con categoría, origen, precio y estado
- **Movimientos**: Entradas, salidas, transferencias, inspecciones

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)

### Opción 1: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/carvajalrjc/boeno-arqui-blockchain.git
cd boeno-arqui-blockchain

# Instalar dependencias y desplegar contratos
npm install
npm run deploy

# Iniciar todos los servicios
docker-compose up -d --build
```

### Opción 2: Desarrollo Local

```bash
# Terminal 1 - Iniciar nodos blockchain
docker-compose up node1 node2 node3 -d

# Terminal 2 - Desplegar contratos
npm install
npm run deploy

# Terminal 3 - Backend
cd backend
npm install
npm run dev

# Terminal 4 - Frontend
cd frontend
npm install
npm run dev
```

---

## 🌐 URLs de Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Nodo 1 (RPC) | http://localhost:8545 |
| Nodo 2 (RPC) | http://localhost:8555 |
| Nodo 3 (RPC) | http://localhost:8565 |

---

## 📡 API Endpoints

### Proveedores
```
GET    /api/proveedores          # Listar todos
POST   /api/proveedores          # Crear nuevo
GET    /api/proveedores/:id      # Obtener por ID
PUT    /api/proveedores/:id      # Actualizar
DELETE /api/proveedores/:id      # Eliminar (marcar inactivo)
```

### Productos
```
GET    /api/productos            # Listar todos
POST   /api/productos            # Crear nuevo
GET    /api/productos/:id        # Obtener por ID
PUT    /api/productos/:id        # Actualizar
DELETE /api/productos/:id        # Eliminar
GET    /api/productos/:id/trazabilidad  # Ver trazabilidad
```

### Movimientos
```
GET    /api/movimientos          # Listar todos
POST   /api/movimientos          # Registrar nuevo
GET    /api/movimientos/:id      # Obtener por ID
```

### Token
```
GET    /api/token/info           # Info del token
GET    /api/token/balance/:addr  # Balance de dirección
POST   /api/token/transfer       # Transferir tokens
```

### Sistema
```
GET    /api/health               # Estado del servicio
GET    /api/stats                # Estadísticas generales
GET    /api/nodes/status         # Estado de los nodos
GET    /api/consensus            # Estado del consenso
```

---

## 📁 Estructura del Proyecto

```
├── contracts/                # Smart Contracts
│   ├── TrazaToken.sol       # Token ERC-20
│   └── Trazabilidad.sol     # Lógica de negocio
│
├── backend/                  # API REST
│   ├── server.js            # Servidor Express
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/      # Componentes UI
│   │   └── hooks/           # Hooks personalizados
│   ├── Dockerfile
│   └── package.json
│
├── scripts/                  # Scripts de utilidad
│   ├── deploy/deploy.js     # Despliegue de contratos
│   └── seed-data.js         # Datos de ejemplo
│
├── nodes/                    # Claves de los nodos
│   ├── node1/key
│   ├── node2/key
│   └── node3/key
│
├── docker-compose.yml        # Orquestación Docker
├── genesis.json              # Configuración blockchain
├── hardhat.config.js         # Configuración Hardhat
└── package.json
```

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| Blockchain | Hyperledger Besu |
| Consenso | IBFT 2.0 |
| Smart Contracts | Solidity 0.8.19 |
| Desarrollo SC | Hardhat |
| Token | OpenZeppelin ERC-20 |
| Backend | Node.js + Express |
| Web3 | Ethers.js |
| Frontend | React 18 + Vite |
| Contenedores | Docker + Docker Compose |

---

## 📊 Cargar Datos de Ejemplo

```bash
# Con los servicios corriendo
npm run seed
```

Esto creará:
- 5 Proveedores
- 8 Productos
- 13 Movimientos

---

## 🔐 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
PRIVATE_KEY=8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63
```

---

## 📜 Licencia

MIT License

---

## 👤 Autor

**Juan Camilo Carvajal Rodriguez**

- GitHub: [@carvajalrjc](https://github.com/carvajalrjc)

