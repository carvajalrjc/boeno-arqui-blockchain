import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export function MovimientosPanel() {
  const { data: movimientos, loading, error, fetchAll, create } = useApi('movimientos');
  const { data: productos, fetchAll: fetchProductos } = useApi('productos');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productoId: '',
    tipo: 'entrada',
    ubicacionOrigen: '',
    ubicacionDestino: '',
    cantidad: 1,
    responsable: '',
    observaciones: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterProducto, setFilterProducto] = useState('');

  useEffect(() => {
    fetchAll();
    fetchProductos();
  }, [fetchAll, fetchProductos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const result = await create({
        ...formData,
        cantidad: parseInt(formData.cantidad) || 1
      });
      setSuccessMsg(`Movimiento registrado: ${result.id}. TX: ${result.txHash.slice(0, 20)}...`);
      resetForm();
    } catch (err) {
      // Error manejado por hook
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productoId: '',
      tipo: 'entrada',
      ubicacionOrigen: '',
      ubicacionDestino: '',
      cantidad: 1,
      responsable: '',
      observaciones: ''
    });
    setShowForm(false);
  };

  const tiposMovimiento = [
    { value: 'entrada', label: '📥 Entrada', desc: 'Ingreso de producto al sistema' },
    { value: 'salida', label: '📤 Salida', desc: 'Egreso de producto del sistema' },
    { value: 'transferencia', label: '🔄 Transferencia', desc: 'Movimiento entre ubicaciones' },
    { value: 'inspeccion', label: '🔍 Inspección', desc: 'Control de calidad' }
  ];

  const productosDisponibles = productos.filter(p => p.estado !== 'Eliminado');
  
  const movimientosFiltrados = filterProducto 
    ? movimientos.filter(m => m.productoId === filterProducto)
    : movimientos;

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="icon">🚚</span>
          <h2>Movimientos</h2>
          <span className="badge">{movimientos.length}</span>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cerrar' : '+ Nuevo Movimiento'}
        </button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      {successMsg && <div className="success-message">✅ {successMsg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <h3>Registrar Movimiento</h3>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Producto *</label>
              <select
                value={formData.productoId}
                onChange={(e) => setFormData({ ...formData, productoId: e.target.value })}
                required
              >
                <option value="">Seleccionar producto...</option>
                {productosDisponibles.map(prod => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nombre} ({prod.id}) - {prod.proveedorNombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Movimiento *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
              >
                {tiposMovimiento.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                {tiposMovimiento.find(t => t.value === formData.tipo)?.desc}
              </span>
            </div>

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Ubicación Origen</label>
              <input
                type="text"
                value={formData.ubicacionOrigen}
                onChange={(e) => setFormData({ ...formData, ubicacionOrigen: e.target.value })}
                placeholder="Ej: Bodega Central"
              />
            </div>

            <div className="form-group">
              <label>Ubicación Destino</label>
              <input
                type="text"
                value={formData.ubicacionDestino}
                onChange={(e) => setFormData({ ...formData, ubicacionDestino: e.target.value })}
                placeholder="Ej: Sucursal Norte"
              />
            </div>

            <div className="form-group full-width">
              <label>Responsable</label>
              <input
                type="text"
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                placeholder="Nombre del responsable"
              />
            </div>

            <div className="form-group full-width">
              <label>Observaciones</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || productosDisponibles.length === 0}>
              {submitting ? '⏳ Registrando en Blockchain...' : 'Registrar Movimiento'}
            </button>
          </div>

          {productosDisponibles.length === 0 && (
            <div className="warning-message">⚠️ Debe crear al menos un producto primero</div>
          )}
        </form>
      )}

      {/* Filtro por producto */}
      <div className="filter-bar">
        <label>Filtrar por producto:</label>
        <select
          value={filterProducto}
          onChange={(e) => setFilterProducto(e.target.value)}
        >
          <option value="">Todos los productos</option>
          {productosDisponibles.map(prod => (
            <option key={prod.id} value={prod.id}>
              {prod.nombre} ({prod.id})
            </option>
          ))}
        </select>
        {filterProducto && (
          <button className="btn-clear" onClick={() => setFilterProducto('')}>
            ✕ Limpiar filtro
          </button>
        )}
      </div>

      {loading && <div className="loading">Cargando movimientos...</div>}

      <div className="entity-list">
        {movimientosFiltrados.map((mov) => (
          <div key={mov.id} className={`entity-card tipo-${mov.tipo}`}>
            <div className="entity-header">
              <span className="entity-id">{mov.id}</span>
              <span className={`entity-badge ${mov.tipo}`}>
                {tiposMovimiento.find(t => t.value === mov.tipo)?.label || mov.tipo}
              </span>
            </div>

            <h4 className="entity-name">{mov.productoNombre}</h4>
            <div className="entity-subtitle">📦 {mov.productoId}</div>

            <div className="entity-details">
              {mov.ubicacionOrigen && (
                <div className="detail-row">
                  <span className="label">📤 Origen:</span>
                  <span className="value">{mov.ubicacionOrigen}</span>
                </div>
              )}
              
              {mov.ubicacionDestino && (
                <div className="detail-row">
                  <span className="label">📥 Destino:</span>
                  <span className="value">{mov.ubicacionDestino}</span>
                </div>
              )}

              <div className="detail-row">
                <span className="label">📦 Cantidad:</span>
                <span className="value">{mov.cantidad}</span>
              </div>

              <div className="detail-row">
                <span className="label">👤 Responsable:</span>
                <span className="value">{mov.responsable || 'Sistema'}</span>
              </div>

              <div className="detail-row">
                <span className="label">📅 Fecha:</span>
                <span className="value">{formatFecha(mov.fechaMovimiento)}</span>
              </div>

              {mov.observaciones && (
                <div className="detail-row full-width">
                  <span className="label">💬 Observaciones:</span>
                  <span className="value observaciones">{mov.observaciones}</span>
                </div>
              )}
            </div>

            <div className="entity-blockchain">
              <span className="tx-hash" title={mov.txHash}>
                🔗 TX: {mov.txHash?.slice(0, 16)}...
              </span>
              <span className="block-num">Bloque #{mov.blockNumber}</span>
            </div>
          </div>
        ))}

        {movimientosFiltrados.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">🚚</span>
            <p>{filterProducto ? 'No hay movimientos para este producto' : 'No hay movimientos registrados'}</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Registrar primer movimiento
            </button>
          </div>
        )}
      </div>

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

        .field-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .filter-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .filter-bar label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .filter-bar select {
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          min-width: 250px;
        }

        .btn-clear {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
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
          transform: translateY(-2px);
          box-shadow: var(--shadow-card);
        }

        .entity-card.tipo-entrada { border-left: 4px solid var(--accent-green); }
        .entity-card.tipo-salida { border-left: 4px solid var(--accent-red); }
        .entity-card.tipo-transferencia { border-left: 4px solid var(--accent-blue); }
        .entity-card.tipo-inspeccion { border-left: 4px solid var(--accent-yellow); }

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
        }

        .entity-badge.entrada { background: #065f46; color: #6ee7b7; }
        .entity-badge.salida { background: #7f1d1d; color: #fca5a5; }
        .entity-badge.transferencia { background: #1e3a8a; color: #93c5fd; }
        .entity-badge.inspeccion { background: #713f12; color: #fcd34d; }

        .entity-name {
          font-weight: 600;
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
        }

        .entity-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          font-family: var(--font-mono);
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

        .detail-row.full-width {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }

        .detail-row .label {
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .detail-row .value {
          color: var(--accent-cyan);
          font-weight: 500;
          text-align: right;
        }

        .detail-row.full-width .value {
          text-align: left;
        }

        .observaciones {
          font-style: italic;
          color: var(--text-secondary) !important;
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
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-bar select {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

