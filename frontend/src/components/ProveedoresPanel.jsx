import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export function ProveedoresPanel() {
  const { data: proveedores, loading, error, fetchAll, create, update, remove } = useApi('proveedores');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    tipo: 'Productor'
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      if (editingId) {
        const result = await update(editingId, formData);
        setSuccessMsg(`Proveedor actualizado. TX: ${result.txHash.slice(0, 20)}...`);
      } else {
        const result = await create(formData);
        setSuccessMsg(`Proveedor creado: ${result.id}. TX: ${result.txHash.slice(0, 20)}...`);
      }
      resetForm();
    } catch (err) {
      // Error ya manejado por el hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      tipo: proveedor.tipo || 'Productor'
    });
    setEditingId(proveedor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        await remove(id);
        setSuccessMsg('Proveedor eliminado correctamente');
      } catch (err) {
        // Error manejado por el hook
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', direccion: '', telefono: '', email: '', tipo: 'Productor' });
    setEditingId(null);
    setShowForm(false);
  };

  const tiposProveedor = ['Productor', 'Distribuidor', 'Transportista', 'Almacén', 'Minorista'];

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="icon">🏭</span>
          <h2>Proveedores</h2>
          <span className="badge">{proveedores.length}</span>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cerrar' : '+ Nuevo Proveedor'}
        </button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      {successMsg && <div className="success-message">✅ {successMsg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <h3>{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre del proveedor"
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                {tiposProveedor.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Dirección *</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección completa"
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+57 300 123 4567"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '⏳ Guardando en Blockchain...' : (editingId ? 'Actualizar' : 'Crear Proveedor')}
            </button>
          </div>
        </form>
      )}

      {loading && <div className="loading">Cargando proveedores...</div>}

      <div className="entity-list">
        {proveedores.filter(p => p.activo !== false).map((proveedor) => (
          <div key={proveedor.id} className="entity-card">
            <div className="entity-header">
              <span className="entity-id">{proveedor.id}</span>
              <span className={`entity-badge ${proveedor.tipo?.toLowerCase()}`}>{proveedor.tipo}</span>
            </div>
            
            <h4 className="entity-name">{proveedor.nombre}</h4>
            
            <div className="entity-details">
              <div className="detail-row">
                <span className="label">📍 Dirección:</span>
                <span className="value">{proveedor.direccion}</span>
              </div>
              {proveedor.telefono && (
                <div className="detail-row">
                  <span className="label">📞 Teléfono:</span>
                  <span className="value">{proveedor.telefono}</span>
                </div>
              )}
              {proveedor.email && (
                <div className="detail-row">
                  <span className="label">✉️ Email:</span>
                  <span className="value">{proveedor.email}</span>
                </div>
              )}
            </div>

            <div className="entity-blockchain">
              <span className="tx-hash" title={proveedor.txHash}>
                🔗 TX: {proveedor.txHash?.slice(0, 16)}...
              </span>
              <span className="block-num">Bloque #{proveedor.blockNumber}</span>
            </div>

            <div className="entity-actions">
              <button className="btn-icon" onClick={() => handleEdit(proveedor)} title="Editar">
                ✏️
              </button>
              <button className="btn-icon danger" onClick={() => handleDelete(proveedor.id)} title="Eliminar">
                🗑️
              </button>
            </div>
          </div>
        ))}

        {proveedores.length === 0 && !loading && (
          <div className="empty-state">
            <span className="empty-icon">🏭</span>
            <p>No hay proveedores registrados</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Crear primer proveedor
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

        .entity-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .entity-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .entity-card:hover {
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
        }

        .entity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
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

        .entity-badge.productor { background: #065f46; color: #6ee7b7; }
        .entity-badge.distribuidor { background: #1e3a8a; color: #93c5fd; }
        .entity-badge.transportista { background: #713f12; color: #fcd34d; }
        .entity-badge.almacén { background: #581c87; color: #d8b4fe; }
        .entity-badge.minorista { background: #831843; color: #f9a8d4; }

        .entity-name {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .entity-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .detail-row .label {
          color: var(--text-muted);
          white-space: nowrap;
        }

        .detail-row .value {
          color: var(--text-secondary);
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

