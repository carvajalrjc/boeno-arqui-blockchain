import React, { useState, useEffect } from 'react';
import { useApi, useTrazabilidad } from '../hooks/useApi';

export function ProductosPanel() {
  const { data: productos, loading, error, fetchAll, create, update, remove } = useApi('productos');
  const { data: proveedores, fetchAll: fetchProveedores } = useApi('proveedores');
  const { trazabilidad, loading: loadingTraz, fetchTrazabilidad } = useTrazabilidad();
  
  const [showForm, setShowForm] = useState(false);
  const [showTrazabilidad, setShowTrazabilidad] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Alimentos',
    proveedorId: '',
    origen: 'Nacional',
    precio: '',
    unidad: 'kg'
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAll();
    fetchProveedores();
  }, [fetchAll, fetchProveedores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const dataToSend = {
        ...formData,
        precio: parseFloat(formData.precio) || 0
      };

      if (editingId) {
        const result = await update(editingId, dataToSend);
        setSuccessMsg(`Producto actualizado. TX: ${result.txHash.slice(0, 20)}...`);
      } else {
        const result = await create(dataToSend);
        setSuccessMsg(`Producto creado: ${result.id}. TX: ${result.txHash.slice(0, 20)}...`);
      }
      resetForm();
    } catch (err) {
      // Error manejado por hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria || 'Alimentos',
      proveedorId: producto.proveedorId,
      origen: producto.origen || 'Nacional',
      precio: producto.precio?.toString() || '',
      unidad: producto.unidad || 'kg'
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await remove(id);
        setSuccessMsg('Producto eliminado correctamente');
      } catch (err) {}
    }
  };

  const handleVerTrazabilidad = async (producto) => {
    setSelectedProducto(producto);
    await fetchTrazabilidad(producto.id);
    setShowTrazabilidad(true);
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', categoria: 'Alimentos', proveedorId: '', origen: 'Nacional', precio: '', unidad: 'kg' });
    setEditingId(null);
    setShowForm(false);
  };

  const categorias = ['Alimentos', 'Bebidas', 'Lácteos', 'Carnes', 'Frutas', 'Verduras', 'Granos', 'Procesados', 'Otros'];
  const origenes = ['Nacional', 'Importado', 'Local', 'Regional'];
  const unidades = ['kg', 'g', 'lb', 'unidad', 'litro', 'ml', 'caja', 'paquete'];

  const proveedoresActivos = proveedores.filter(p => p.activo !== false);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="icon">📦</span>
          <h2>Productos</h2>
          <span className="badge">{productos.filter(p => p.estado !== 'Eliminado').length}</span>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cerrar' : '+ Nuevo Producto'}
        </button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      {successMsg && <div className="success-message">✅ {successMsg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre del producto"
                required
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Proveedor *</label>
              <select
                value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                required
              >
                <option value="">Seleccionar proveedor...</option>
                {proveedoresActivos.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} ({prov.tipo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del producto..."
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Origen</label>
              <select
                value={formData.origen}
                onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
              >
                {origenes.map(orig => (
                  <option key={orig} value={orig}>{orig}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Precio</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Unidad</label>
              <select
                value={formData.unidad}
                onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
              >
                {unidades.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || proveedoresActivos.length === 0}>
              {submitting ? '⏳ Guardando en Blockchain...' : (editingId ? 'Actualizar' : 'Crear Producto')}
            </button>
          </div>

          {proveedoresActivos.length === 0 && (
            <div className="warning-message">⚠️ Debe crear al menos un proveedor primero</div>
          )}
        </form>
      )}

      {loading && <div className="loading">Cargando productos...</div>}

      <div className="entity-list">
        {productos.filter(p => p.estado !== 'Eliminado').map((producto) => (
          <div key={producto.id} className="entity-card">
            <div className="entity-header">
              <span className="entity-id">{producto.id}</span>
              <span className={`entity-badge cat-${producto.categoria?.toLowerCase()}`}>
                {producto.categoria}
              </span>
            </div>
            
            <h4 className="entity-name">{producto.nombre}</h4>
            
            {producto.descripcion && (
              <p className="producto-desc">{producto.descripcion}</p>
            )}

            <div className="entity-details">
              <div className="detail-row">
                <span className="label">🏭 Proveedor:</span>
                <span className="value">{producto.proveedorNombre}</span>
              </div>
              <div className="detail-row">
                <span className="label">🌍 Origen:</span>
                <span className="value">{producto.origen}</span>
              </div>
              {producto.precio > 0 && (
                <div className="detail-row">
                  <span className="label">💰 Precio:</span>
                  <span className="value precio">${producto.precio.toLocaleString()} / {producto.unidad}</span>
                </div>
              )}
            </div>

            <div className="entity-blockchain">
              <span className="tx-hash" title={producto.txHash}>
                🔗 TX: {producto.txHash?.slice(0, 16)}...
              </span>
              <span className="block-num">Bloque #{producto.blockNumber}</span>
            </div>

            <div className="entity-actions">
              <button 
                className="btn-trazabilidad" 
                onClick={() => handleVerTrazabilidad(producto)}
                title="Ver trazabilidad"
              >
                📍 Trazabilidad
              </button>
              <button className="btn-icon" onClick={() => handleEdit(producto)} title="Editar">
                ✏️
              </button>
              <button className="btn-icon danger" onClick={() => handleDelete(producto.id)} title="Eliminar">
                🗑️
              </button>
            </div>
          </div>
        ))}

        {productos.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>No hay productos registrados</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Crear primer producto
            </button>
          </div>
        )}
      </div>

      {/* Modal de Trazabilidad */}
      {showTrazabilidad && selectedProducto && (
        <div className="modal-overlay" onClick={() => setShowTrazabilidad(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📍 Trazabilidad: {selectedProducto.nombre}</h3>
              <button className="btn-close" onClick={() => setShowTrazabilidad(false)}>✕</button>
            </div>

            {loadingTraz ? (
              <div className="loading">Cargando trazabilidad...</div>
            ) : trazabilidad ? (
              <div className="trazabilidad-content">
                <div className="traz-section">
                  <h4>📦 Producto</h4>
                  <div className="traz-info">
                    <p><strong>ID:</strong> {trazabilidad.producto.id}</p>
                    <p><strong>Categoría:</strong> {trazabilidad.producto.categoria}</p>
                    <p><strong>Origen:</strong> {trazabilidad.producto.origen}</p>
                    <p><strong>Creado:</strong> {new Date(trazabilidad.producto.fechaCreacion).toLocaleString()}</p>
                  </div>
                </div>

                {trazabilidad.proveedor && (
                  <div className="traz-section">
                    <h4>🏭 Proveedor</h4>
                    <div className="traz-info">
                      <p><strong>Nombre:</strong> {trazabilidad.proveedor.nombre}</p>
                      <p><strong>Tipo:</strong> {trazabilidad.proveedor.tipo}</p>
                      <p><strong>Ubicación:</strong> {trazabilidad.proveedor.direccion}</p>
                    </div>
                  </div>
                )}

                <div className="traz-section">
                  <h4>🚚 Historial de Movimientos ({trazabilidad.totalMovimientos})</h4>
                  {trazabilidad.movimientos.length > 0 ? (
                    <div className="timeline">
                      {trazabilidad.movimientos.map((mov, index) => (
                        <div key={mov.id} className="timeline-item">
                          <div className="timeline-marker">
                            {index === trazabilidad.movimientos.length - 1 ? '📍' : '⚪'}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className={`mov-tipo ${mov.tipo}`}>{mov.tipo}</span>
                              <span className="mov-fecha">
                                {new Date(mov.fechaMovimiento).toLocaleString()}
                              </span>
                            </div>
                            {mov.ubicacionOrigen && (
                              <p>📤 Desde: {mov.ubicacionOrigen}</p>
                            )}
                            {mov.ubicacionDestino && (
                              <p>📥 Hacia: {mov.ubicacionDestino}</p>
                            )}
                            <p>👤 Responsable: {mov.responsable}</p>
                            {mov.observaciones && (
                              <p className="mov-obs">💬 {mov.observaciones}</p>
                            )}
                            <span className="mov-tx">TX: {mov.txHash?.slice(0, 20)}...</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-movimientos">No hay movimientos registrados</p>
                  )}
                </div>
              </div>
            ) : (
              <p>No se pudo cargar la trazabilidad</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        .panel {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .panel-title .icon {
          font-size: 1.5rem;
        }

        .panel-title h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .panel-title .badge {
          background: var(--accent-purple);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%);
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .entity-form {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
        }

        .entity-form h3 {
          margin: 0 0 1.25rem 0;
          font-size: 1.1rem;
          color: var(--accent-cyan);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--accent-cyan);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .entity-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .entity-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.25rem;
          border: 2px solid var(--border-color);
          transition: all 0.3s ease;
          animation: fadeIn 0.4s ease-out;
        }

        .entity-card:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
          box-shadow: var(--shadow-card);
        }

        .entity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .entity-id {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .entity-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .entity-name {
          font-weight: 600;
          font-size: 1.1rem;
          margin: 0 0 1rem 0;
        }

        .producto-desc {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .entity-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .detail-row .label {
          color: var(--text-secondary);
        }

        .detail-row .value {
          color: var(--accent-cyan);
          font-weight: 500;
        }

        .precio {
          color: var(--accent-green) !important;
          font-weight: 600;
        }

        .entity-blockchain {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: var(--bg-card);
          border-radius: 8px;
          font-size: 0.75rem;
          margin-bottom: 1rem;
        }

        .tx-hash {
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }

        .block-num {
          color: var(--text-muted);
        }

        .entity-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-trazabilidad {
          background: linear-gradient(135deg, var(--accent-purple) 0%, #6366f1 100%);
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          color: white;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-trazabilidad:hover {
          transform: translateY(-1px);
        }

        .btn-icon {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          background: var(--bg-hover);
        }

        .btn-icon.danger:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: var(--accent-red);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--accent-red);
          color: var(--accent-red);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-green);
          color: var(--accent-green);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .warning-message {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid var(--accent-yellow);
          color: var(--accent-yellow);
          padding: 0.75rem;
          border-radius: 8px;
          margin-top: 1rem;
          text-align: center;
        }

        .cat-alimentos { background: #065f46; color: #6ee7b7; }
        .cat-bebidas { background: #1e3a8a; color: #93c5fd; }
        .cat-lácteos { background: #f3f4f6; color: #374151; }
        .cat-carnes { background: #7f1d1d; color: #fca5a5; }
        .cat-frutas { background: #713f12; color: #fcd34d; }
        .cat-verduras { background: #14532d; color: #86efac; }
        .cat-granos { background: #78350f; color: #fde68a; }
        .cat-procesados { background: #581c87; color: #d8b4fe; }
        .cat-otros { background: #374151; color: #d1d5db; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: var(--bg-card);
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid var(--border-color);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--bg-card);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .btn-close {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .trazabilidad-content {
          padding: 1.5rem;
        }

        .traz-section {
          margin-bottom: 1.5rem;
        }

        .traz-section h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          color: var(--accent-cyan);
        }

        .traz-info {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 8px;
        }

        .traz-info p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }

        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border-color);
        }

        .timeline-item {
          position: relative;
          padding-bottom: 1.5rem;
        }

        .timeline-marker {
          position: absolute;
          left: -2rem;
          width: 20px;
          text-align: center;
        }

        .timeline-content {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .mov-tipo {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .mov-tipo.entrada { background: #065f46; color: #6ee7b7; }
        .mov-tipo.salida { background: #7f1d1d; color: #fca5a5; }
        .mov-tipo.transferencia { background: #1e3a8a; color: #93c5fd; }
        .mov-tipo.inspeccion { background: #713f12; color: #fcd34d; }

        .mov-fecha {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timeline-content p {
          margin: 0.25rem 0;
        }

        .mov-obs {
          font-style: italic;
          color: var(--text-secondary);
        }

        .mov-tx {
          font-size: 0.7rem;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }

        .no-movimientos {
          color: var(--text-muted);
          text-align: center;
          padding: 1rem;
        }

        .form-group textarea {
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-family: inherit;
          resize: vertical;
        }

        .cat-alimentos { background: #065f46; color: #6ee7b7; }
        .cat-bebidas { background: #1e3a8a; color: #93c5fd; }
        .cat-lácteos { background: #f3f4f6; color: #374151; }
        .cat-carnes { background: #7f1d1d; color: #fca5a5; }
        .cat-frutas { background: #713f12; color: #fcd34d; }
        .cat-verduras { background: #14532d; color: #86efac; }
        .cat-granos { background: #78350f; color: #fde68a; }
        .cat-procesados { background: #581c87; color: #d8b4fe; }
        .cat-otros { background: #374151; color: #d1d5db; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: var(--bg-card);
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid var(--border-color);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--bg-card);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .btn-close {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .trazabilidad-content {
          padding: 1.5rem;
        }

        .traz-section {
          margin-bottom: 1.5rem;
        }

        .traz-section h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          color: var(--accent-cyan);
        }

        .traz-info {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 8px;
        }

        .traz-info p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }

        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border-color);
        }

        .timeline-item {
          position: relative;
          padding-bottom: 1.5rem;
        }

        .timeline-marker {
          position: absolute;
          left: -2rem;
          width: 20px;
          text-align: center;
        }

        .timeline-content {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .mov-tipo {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .mov-tipo.entrada { background: #065f46; color: #6ee7b7; }
        .mov-tipo.salida { background: #7f1d1d; color: #fca5a5; }
        .mov-tipo.transferencia { background: #1e3a8a; color: #93c5fd; }
        .mov-tipo.inspeccion { background: #713f12; color: #fcd34d; }

        .mov-fecha {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timeline-content p {
          margin: 0.25rem 0;
        }

        .mov-obs {
          font-style: italic;
          color: var(--text-secondary);
        }

        .mov-tx {
          font-size: 0.7rem;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }

        .no-movimientos {
          color: var(--text-muted);
          text-align: center;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
          .entity-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

