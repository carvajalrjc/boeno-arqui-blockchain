/**
 * Script para cargar datos de ejemplo en el sistema de trazabilidad
 * Ejecutar: node scripts/seed-data.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

// ═══════════════════════════════════════════════════════════════════
// DATOS DE EJEMPLO
// ═══════════════════════════════════════════════════════════════════

const proveedores = [
  {
    nombre: "Finca La Esperanza",
    direccion: "Vereda El Carmen, Fresno, Tolima",
    telefono: "3101234567",
    email: "contacto@fincalaesperanza.com",
    tipo: "Productor"
  },
  {
    nombre: "Hacienda San Miguel",
    direccion: "Km 5 Vía Armenia, Quindío",
    telefono: "3209876543",
    email: "ventas@haciendasanmiguel.co",
    tipo: "Productor"
  },
  {
    nombre: "Distribuidora del Valle",
    direccion: "Calle 45 #23-67, Cali, Valle",
    telefono: "3156789012",
    email: "info@distrivalle.com",
    tipo: "Distribuidor"
  },
  {
    nombre: "Transportes Andinos S.A.S",
    direccion: "Carrera 10 #15-30, Bogotá",
    telefono: "3187654321",
    email: "logistica@transportesandinos.com",
    tipo: "Transportista"
  },
  {
    nombre: "Almacenes El Bodegón",
    direccion: "Zona Industrial, Medellín",
    telefono: "3143456789",
    email: "almacen@elbodegon.co",
    tipo: "Almacen"
  }
];

const productos = [
  {
    nombre: "Café Especial de Origen",
    descripcion: "Café 100% arábica cultivado a 1800 msnm, notas de chocolate y frutos rojos",
    categoria: "Alimentos",
    proveedorIndex: 0,
    origen: "Nacional",
    precio: 45000,
    unidad: "kg"
  },
  {
    nombre: "Carne de Res Premium",
    descripcion: "Corte de lomo fino, madurado 21 días, certificado de origen",
    categoria: "Carnes",
    proveedorIndex: 1,
    origen: "Nacional",
    precio: 38000,
    unidad: "kg"
  },
  {
    nombre: "Leche Entera Pasteurizada",
    descripcion: "Leche fresca de ganado Holstein, procesada el mismo día",
    categoria: "Lácteos",
    proveedorIndex: 1,
    origen: "Nacional",
    precio: 4500,
    unidad: "litro"
  },
  {
    nombre: "Mango Tommy",
    descripcion: "Mango de exportación, cultivado en el Tolima",
    categoria: "Frutas",
    proveedorIndex: 0,
    origen: "Nacional",
    precio: 6000,
    unidad: "kg"
  },
  {
    nombre: "Aguacate Hass",
    descripcion: "Aguacate premium para exportación, calibre 16-18",
    categoria: "Frutas",
    proveedorIndex: 0,
    origen: "Nacional",
    precio: 12000,
    unidad: "kg"
  },
  {
    nombre: "Tomate Chonto Orgánico",
    descripcion: "Tomate cultivado sin pesticidas, certificación orgánica",
    categoria: "Verduras",
    proveedorIndex: 2,
    origen: "Local",
    precio: 4000,
    unidad: "kg"
  },
  {
    nombre: "Arroz Diana Premium",
    descripcion: "Arroz de grano largo, seleccionado",
    categoria: "Granos",
    proveedorIndex: 2,
    origen: "Nacional",
    precio: 5500,
    unidad: "kg"
  },
  {
    nombre: "Queso Campesino Artesanal",
    descripcion: "Queso fresco elaborado de forma tradicional",
    categoria: "Lácteos",
    proveedorIndex: 1,
    origen: "Regional",
    precio: 18000,
    unidad: "kg"
  }
];

const movimientos = [
  { productoIndex: 0, tipo: "entrada", ubicacionOrigen: "Finca La Esperanza", ubicacionDestino: "Centro de Acopio Tolima", cantidad: 500, responsable: "Juan Pérez", observaciones: "Cosecha de temporada alta" },
  { productoIndex: 0, tipo: "inspeccion", ubicacionOrigen: "Centro de Acopio Tolima", ubicacionDestino: "", cantidad: 500, responsable: "María García", observaciones: "Calidad verificada - Grado A" },
  { productoIndex: 0, tipo: "transferencia", ubicacionOrigen: "Centro de Acopio Tolima", ubicacionDestino: "Bodega Cali", cantidad: 300, responsable: "Carlos López", observaciones: "Transporte refrigerado" },
  { productoIndex: 1, tipo: "entrada", ubicacionOrigen: "Hacienda San Miguel", ubicacionDestino: "Frigorífico Armenia", cantidad: 200, responsable: "Pedro Martínez", observaciones: "Lote certificado" },
  { productoIndex: 1, tipo: "inspeccion", ubicacionOrigen: "Frigorífico Armenia", ubicacionDestino: "", cantidad: 200, responsable: "Ana Rodríguez", observaciones: "Inspección sanitaria aprobada" },
  { productoIndex: 2, tipo: "entrada", ubicacionOrigen: "Hacienda San Miguel", ubicacionDestino: "Planta de Procesamiento", cantidad: 1000, responsable: "Luis Hernández", observaciones: "Ordeño de la mañana" },
  { productoIndex: 2, tipo: "transferencia", ubicacionOrigen: "Planta de Procesamiento", ubicacionDestino: "Centro de Distribución", cantidad: 800, responsable: "Sandra Gómez", observaciones: "Pasteurizado y envasado" },
  { productoIndex: 3, tipo: "entrada", ubicacionOrigen: "Finca La Esperanza", ubicacionDestino: "Centro de Acopio Fresno", cantidad: 1500, responsable: "Miguel Ángel", observaciones: "Maduración óptima" },
  { productoIndex: 3, tipo: "salida", ubicacionOrigen: "Centro de Acopio Fresno", ubicacionDestino: "Puerto de Buenaventura", cantidad: 1000, responsable: "Roberto Sánchez", observaciones: "Exportación a USA" },
  { productoIndex: 4, tipo: "entrada", ubicacionOrigen: "Finca La Esperanza", ubicacionDestino: "Empacadora", cantidad: 800, responsable: "Diana Torres", observaciones: "Selección primera" },
  { productoIndex: 5, tipo: "entrada", ubicacionOrigen: "Cultivo Orgánico Palmira", ubicacionDestino: "Almacén Principal", cantidad: 300, responsable: "Felipe Moreno", observaciones: "Certificado orgánico #12345" },
  { productoIndex: 6, tipo: "entrada", ubicacionOrigen: "Molino del Norte", ubicacionDestino: "Bodega Central", cantidad: 5000, responsable: "Andrés Vargas", observaciones: "Lote nuevo" },
  { productoIndex: 7, tipo: "entrada", ubicacionOrigen: "Hacienda San Miguel", ubicacionDestino: "Cuarto Frío", cantidad: 100, responsable: "Carolina Ruiz", observaciones: "Producción artesanal" },
];

// ═══════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

async function seedData() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('        🌱 CARGANDO DATOS DE EJEMPLO');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Verificar conexión
  try {
    const health = await apiCall('/health');
    if (health.status !== 'ok') {
      throw new Error('Backend no disponible');
    }
    console.log('✅ Conexión al backend establecida');
    console.log(`   Smart Contracts: ${health.smartContracts ? '✅ Cargados' : '❌ No cargados'}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error: No se puede conectar al backend');
    console.error('   Asegúrate de que el backend esté corriendo en', API_URL);
    process.exit(1);
  }

  const createdProveedores = [];
  const createdProductos = [];

  // ─────────────────────────────────────────────────────────────────
  // 1. CREAR PROVEEDORES
  // ─────────────────────────────────────────────────────────────────
  console.log('1️⃣  CREANDO PROVEEDORES...');
  console.log('─────────────────────────────────────────────────────────────────');
  
  for (const proveedor of proveedores) {
    try {
      const result = await apiCall('/proveedores', 'POST', proveedor);
      if (result.success || result.id) {
        createdProveedores.push(result.id || result.data?.id);
        console.log(`   ✅ ${proveedor.nombre} (ID: ${result.id}) - TX: ${result.txHash?.slice(0, 20)}...`);
      } else {
        console.log(`   ⚠️ ${proveedor.nombre}: ${result.error || 'Error desconocido'}`);
      }
      await delay(2000); // Esperar confirmación del bloque
    } catch (error) {
      console.log(`   ❌ ${proveedor.nombre}: ${error.message}`);
    }
  }
  console.log(`   📊 Total: ${createdProveedores.length} proveedores creados`);
  console.log('');

  // ─────────────────────────────────────────────────────────────────
  // 2. CREAR PRODUCTOS
  // ─────────────────────────────────────────────────────────────────
  console.log('2️⃣  CREANDO PRODUCTOS...');
  console.log('─────────────────────────────────────────────────────────────────');
  
  for (const producto of productos) {
    try {
      const proveedorId = createdProveedores[producto.proveedorIndex];
      if (!proveedorId) {
        console.log(`   ⚠️ ${producto.nombre}: Proveedor no encontrado`);
        continue;
      }
      
      const result = await apiCall('/productos', 'POST', {
        ...producto,
        proveedorId
      });
      
      if (result.success || result.id) {
        createdProductos.push(result.id || result.data?.id);
        console.log(`   ✅ ${producto.nombre} (ID: ${result.id}) - TX: ${result.txHash?.slice(0, 20)}...`);
      } else {
        console.log(`   ⚠️ ${producto.nombre}: ${result.error || 'Error desconocido'}`);
      }
      await delay(2000);
    } catch (error) {
      console.log(`   ❌ ${producto.nombre}: ${error.message}`);
    }
  }
  console.log(`   📊 Total: ${createdProductos.length} productos creados`);
  console.log('');

  // ─────────────────────────────────────────────────────────────────
  // 3. CREAR MOVIMIENTOS
  // ─────────────────────────────────────────────────────────────────
  console.log('3️⃣  REGISTRANDO MOVIMIENTOS...');
  console.log('─────────────────────────────────────────────────────────────────');
  
  let movimientosCreados = 0;
  for (const movimiento of movimientos) {
    try {
      const productoId = createdProductos[movimiento.productoIndex];
      if (!productoId) {
        console.log(`   ⚠️ Movimiento: Producto no encontrado (índice ${movimiento.productoIndex})`);
        continue;
      }
      
      const result = await apiCall('/movimientos', 'POST', {
        ...movimiento,
        productoId
      });
      
      if (result.success || result.id) {
        movimientosCreados++;
        console.log(`   ✅ ${movimiento.tipo.toUpperCase()} - Producto ${productoId} - TX: ${result.txHash?.slice(0, 20)}...`);
      } else {
        console.log(`   ⚠️ Movimiento: ${result.error || 'Error desconocido'}`);
      }
      await delay(2000);
    } catch (error) {
      console.log(`   ❌ Movimiento: ${error.message}`);
    }
  }
  console.log(`   📊 Total: ${movimientosCreados} movimientos registrados`);
  console.log('');

  // ─────────────────────────────────────────────────────────────────
  // RESUMEN FINAL
  // ─────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('        ✅ CARGA DE DATOS COMPLETADA');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Obtener estadísticas finales
  try {
    const stats = await apiCall('/stats');
    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log(`   • Proveedores: ${stats.proveedores?.total || 0}`);
    console.log(`   • Productos: ${stats.productos?.total || 0}`);
    console.log(`   • Movimientos: ${stats.movimientos?.total || 0}`);
    console.log(`   • Token Supply: ${parseFloat(stats.token?.totalSupply || 0).toLocaleString()} TRZ`);
  } catch (e) {
    console.log('   (No se pudieron obtener estadísticas)');
  }
  
  // Obtener balance del wallet
  try {
    const wallet = await apiCall('/wallet');
    console.log('');
    console.log('💰 BALANCE DEL WALLET:');
    console.log(`   • Dirección: ${wallet.address}`);
    console.log(`   • Balance TRZ: ${parseFloat(wallet.tokenBalance || 0).toLocaleString()} TRZ`);
  } catch (e) {}
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   🎉 ¡Datos cargados exitosamente!');
  console.log('   📍 Abre http://localhost:5173 para ver los datos');
  console.log('═══════════════════════════════════════════════════════════════════');
}

// Ejecutar
seedData().catch(console.error);

