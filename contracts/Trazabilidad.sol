// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TrazaToken.sol";

/**
 * @title Sistema de Trazabilidad
 * @dev Smart contract para gestionar proveedores, productos y movimientos
 * Implementa las 3 entidades del sistema con trazabilidad completa
 */
contract Trazabilidad {
    
    // ═══════════════════════════════════════════════════════════════════
    // ESTRUCTURAS DE DATOS
    // ═══════════════════════════════════════════════════════════════════
    
    struct Proveedor {
        uint256 id;
        string nombre;
        string direccion;
        string telefono;
        string email;
        string tipo;           // Productor, Distribuidor, Transportista, Almacen, Minorista
        bool activo;
        uint256 fechaCreacion;
        address registradoPor;
    }
    
    struct Producto {
        uint256 id;
        string nombre;
        string descripcion;
        string categoria;      // Alimentos, Bebidas, Lacteos, Carnes, Frutas, Verduras, etc.
        uint256 proveedorId;
        string origen;
        uint256 precio;
        string unidad;
        bool activo;
        uint256 fechaCreacion;
        address registradoPor;
    }
    
    struct Movimiento {
        uint256 id;
        uint256 productoId;
        string tipo;           // entrada, salida, transferencia, inspeccion
        string ubicacionOrigen;
        string ubicacionDestino;
        uint256 cantidad;
        string responsable;
        string observaciones;
        uint256 fechaMovimiento;
        address registradoPor;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // VARIABLES DE ESTADO
    // ═══════════════════════════════════════════════════════════════════
    
    address public owner;
    TrazaToken public token;
    
    // Contadores
    uint256 public totalProveedores;
    uint256 public totalProductos;
    uint256 public totalMovimientos;
    
    // Mappings
    mapping(uint256 => Proveedor) public proveedores;
    mapping(uint256 => Producto) public productos;
    mapping(uint256 => Movimiento) public movimientos;
    
    // Movimientos por producto (para trazabilidad)
    mapping(uint256 => uint256[]) public movimientosPorProducto;
    
    // Productos por proveedor
    mapping(uint256 => uint256[]) public productosPorProveedor;
    
    // Recompensas en tokens
    uint256 public recompensaProveedor = 100 * 10**18;   // 100 TRZ
    uint256 public recompensaProducto = 50 * 10**18;     // 50 TRZ
    uint256 public recompensaMovimiento = 10 * 10**18;   // 10 TRZ
    
    // ═══════════════════════════════════════════════════════════════════
    // EVENTOS
    // ═══════════════════════════════════════════════════════════════════
    
    event ProveedorCreado(uint256 indexed id, string nombre, string tipo, address registradoPor);
    event ProveedorActualizado(uint256 indexed id, string nombre, address actualizadoPor);
    event ProveedorEliminado(uint256 indexed id, address eliminadoPor);
    
    event ProductoCreado(uint256 indexed id, string nombre, uint256 proveedorId, address registradoPor);
    event ProductoActualizado(uint256 indexed id, string nombre, address actualizadoPor);
    event ProductoEliminado(uint256 indexed id, address eliminadoPor);
    
    event MovimientoRegistrado(
        uint256 indexed id, 
        uint256 indexed productoId, 
        string tipo, 
        uint256 cantidad,
        address registradoPor
    );
    
    // ═══════════════════════════════════════════════════════════════════
    // MODIFICADORES
    // ═══════════════════════════════════════════════════════════════════
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario");
        _;
    }
    
    modifier proveedorExiste(uint256 _id) {
        require(_id > 0 && _id <= totalProveedores, "Proveedor no existe");
        require(proveedores[_id].activo, "Proveedor no activo");
        _;
    }
    
    modifier productoExiste(uint256 _id) {
        require(_id > 0 && _id <= totalProductos, "Producto no existe");
        require(productos[_id].activo, "Producto no activo");
        _;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════
    
    constructor(address _tokenAddress) {
        owner = msg.sender;
        token = TrazaToken(_tokenAddress);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES DE PROVEEDORES
    // ═══════════════════════════════════════════════════════════════════
    
    function crearProveedor(
        string memory _nombre,
        string memory _direccion,
        string memory _telefono,
        string memory _email,
        string memory _tipo
    ) external returns (uint256) {
        require(bytes(_nombre).length > 0, "Nombre requerido");
        
        totalProveedores++;
        uint256 id = totalProveedores;
        
        proveedores[id] = Proveedor({
            id: id,
            nombre: _nombre,
            direccion: _direccion,
            telefono: _telefono,
            email: _email,
            tipo: _tipo,
            activo: true,
            fechaCreacion: block.timestamp,
            registradoPor: msg.sender
        });
        
        // Recompensa en tokens
        token.mint(msg.sender, recompensaProveedor, "Registro de proveedor");
        
        emit ProveedorCreado(id, _nombre, _tipo, msg.sender);
        return id;
    }
    
    function actualizarProveedor(
        uint256 _id,
        string memory _nombre,
        string memory _direccion,
        string memory _telefono,
        string memory _email,
        string memory _tipo
    ) external proveedorExiste(_id) {
        Proveedor storage p = proveedores[_id];
        
        if (bytes(_nombre).length > 0) p.nombre = _nombre;
        if (bytes(_direccion).length > 0) p.direccion = _direccion;
        if (bytes(_telefono).length > 0) p.telefono = _telefono;
        if (bytes(_email).length > 0) p.email = _email;
        if (bytes(_tipo).length > 0) p.tipo = _tipo;
        
        emit ProveedorActualizado(_id, p.nombre, msg.sender);
    }
    
    function eliminarProveedor(uint256 _id) external proveedorExiste(_id) {
        proveedores[_id].activo = false;
        emit ProveedorEliminado(_id, msg.sender);
    }
    
    function obtenerProveedor(uint256 _id) external view returns (Proveedor memory) {
        return proveedores[_id];
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES DE PRODUCTOS
    // ═══════════════════════════════════════════════════════════════════
    
    function crearProducto(
        string memory _nombre,
        string memory _descripcion,
        string memory _categoria,
        uint256 _proveedorId,
        string memory _origen,
        uint256 _precio,
        string memory _unidad
    ) external proveedorExiste(_proveedorId) returns (uint256) {
        require(bytes(_nombre).length > 0, "Nombre requerido");
        
        totalProductos++;
        uint256 id = totalProductos;
        
        productos[id] = Producto({
            id: id,
            nombre: _nombre,
            descripcion: _descripcion,
            categoria: _categoria,
            proveedorId: _proveedorId,
            origen: _origen,
            precio: _precio,
            unidad: _unidad,
            activo: true,
            fechaCreacion: block.timestamp,
            registradoPor: msg.sender
        });
        
        productosPorProveedor[_proveedorId].push(id);
        
        // Recompensa en tokens
        token.mint(msg.sender, recompensaProducto, "Registro de producto");
        
        emit ProductoCreado(id, _nombre, _proveedorId, msg.sender);
        return id;
    }
    
    function actualizarProducto(
        uint256 _id,
        string memory _nombre,
        string memory _descripcion,
        string memory _categoria,
        string memory _origen,
        uint256 _precio,
        string memory _unidad
    ) external productoExiste(_id) {
        Producto storage p = productos[_id];
        
        if (bytes(_nombre).length > 0) p.nombre = _nombre;
        if (bytes(_descripcion).length > 0) p.descripcion = _descripcion;
        if (bytes(_categoria).length > 0) p.categoria = _categoria;
        if (bytes(_origen).length > 0) p.origen = _origen;
        if (_precio > 0) p.precio = _precio;
        if (bytes(_unidad).length > 0) p.unidad = _unidad;
        
        emit ProductoActualizado(_id, p.nombre, msg.sender);
    }
    
    function eliminarProducto(uint256 _id) external productoExiste(_id) {
        productos[_id].activo = false;
        emit ProductoEliminado(_id, msg.sender);
    }
    
    function obtenerProducto(uint256 _id) external view returns (Producto memory) {
        return productos[_id];
    }
    
    function obtenerProductosDeProveedor(uint256 _proveedorId) external view returns (uint256[] memory) {
        return productosPorProveedor[_proveedorId];
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES DE MOVIMIENTOS (TRAZABILIDAD)
    // ═══════════════════════════════════════════════════════════════════
    
    function registrarMovimiento(
        uint256 _productoId,
        string memory _tipo,
        string memory _ubicacionOrigen,
        string memory _ubicacionDestino,
        uint256 _cantidad,
        string memory _responsable,
        string memory _observaciones
    ) external productoExiste(_productoId) returns (uint256) {
        require(bytes(_tipo).length > 0, "Tipo requerido");
        require(_cantidad > 0, "Cantidad debe ser mayor a 0");
        
        totalMovimientos++;
        uint256 id = totalMovimientos;
        
        movimientos[id] = Movimiento({
            id: id,
            productoId: _productoId,
            tipo: _tipo,
            ubicacionOrigen: _ubicacionOrigen,
            ubicacionDestino: _ubicacionDestino,
            cantidad: _cantidad,
            responsable: _responsable,
            observaciones: _observaciones,
            fechaMovimiento: block.timestamp,
            registradoPor: msg.sender
        });
        
        movimientosPorProducto[_productoId].push(id);
        
        // Recompensa en tokens
        token.mint(msg.sender, recompensaMovimiento, "Registro de movimiento");
        
        emit MovimientoRegistrado(id, _productoId, _tipo, _cantidad, msg.sender);
        return id;
    }
    
    function obtenerMovimiento(uint256 _id) external view returns (Movimiento memory) {
        return movimientos[_id];
    }
    
    function obtenerTrazabilidad(uint256 _productoId) external view returns (uint256[] memory) {
        return movimientosPorProducto[_productoId];
    }
    
    function obtenerTrazabilidadCompleta(uint256 _productoId) external view 
        returns (Producto memory producto, Proveedor memory proveedor, Movimiento[] memory movs) 
    {
        producto = productos[_productoId];
        proveedor = proveedores[producto.proveedorId];
        
        uint256[] memory ids = movimientosPorProducto[_productoId];
        movs = new Movimiento[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            movs[i] = movimientos[ids[i]];
        }
        
        return (producto, proveedor, movs);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES DE ESTADÍSTICAS
    // ═══════════════════════════════════════════════════════════════════
    
    function obtenerEstadisticas() external view returns (
        uint256 _totalProveedores,
        uint256 _totalProductos,
        uint256 _totalMovimientos,
        uint256 _totalTokensDistribuidos
    ) {
        return (
            totalProveedores,
            totalProductos,
            totalMovimientos,
            token.totalSupply()
        );
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES DE ADMINISTRACIÓN
    // ═══════════════════════════════════════════════════════════════════
    
    function actualizarRecompensas(
        uint256 _recompensaProveedor,
        uint256 _recompensaProducto,
        uint256 _recompensaMovimiento
    ) external onlyOwner {
        recompensaProveedor = _recompensaProveedor;
        recompensaProducto = _recompensaProducto;
        recompensaMovimiento = _recompensaMovimiento;
    }
}

