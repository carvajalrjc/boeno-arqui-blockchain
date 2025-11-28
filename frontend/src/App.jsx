import { useState, useEffect, useCallback } from 'react';
import { useBlockchain } from './hooks/useBlockchain';
import { useStats } from './hooks/useApi';
import { 
  NodeStatus, 
  ConsensusStatus, 
  ValidatorList, 
  BlockExplorer,
  ProveedoresPanel,
  ProductosPanel,
  MovimientosPanel,
  TokenPanel
} from './components';

function App() {
  const { 
    nodes, 
    consensus, 
    validators, 
    latestBlock, 
    blocks, 
    wallet,
    loading, 
    error
  } = useBlockchain();

  const { stats, fetchStats } = useStats();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-icon">🔗</div>
          <div className="loading-text">Conectando a la red blockchain...</div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <style>{`
          .loading-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--bg-primary);
          }
          .loading-content { text-align: center; }
          .loading-icon { font-size: 4rem; margin-bottom: 1.5rem; animation: pulse 2s ease-in-out infinite; }
          .loading-text { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 1.5rem; }
          .loading-dots { display: flex; justify-content: center; gap: 0.5rem; }
          .loading-dots span { width: 12px; height: 12px; background: var(--accent-cyan); border-radius: 50%; animation: bounce 1.4s ease-in-out infinite; }
          .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
          .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'proveedores', label: '🏭 Proveedores', icon: '🏭' },
    { id: 'productos', label: '📦 Productos', icon: '📦' },
    { id: 'movimientos', label: '🚚 Movimientos', icon: '🚚' },
    { id: 'token', label: '💰 Token TRZ', icon: '💰' },
    { id: 'blockchain', label: '⛓️ Blockchain', icon: '⛓️' },
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🔗</span>
            <div className="logo-text">
              <h1>Sistema de Trazabilidad</h1>
              <span className="subtitle">Blockchain IBFT 2.0 - 3 Nodos</span>
            </div>
          </div>
          <div className="network-badge">
            <span className={`status-dot ${error ? 'error' : 'active'}`}></span>
            <span>{error ? 'Desconectado' : 'Red Activa'}</span>
            <span className="chain-id">Chain ID: 1337</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <div className="nav-content">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <span className="error-hint">Verifica que los nodos Docker estén corriendo</span>
        </div>
      )}

      {/* Main Content */}
      <main className="main">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card proveedores">
                <div className="stat-icon">🏭</div>
                <div className="stat-info">
                  <div className="stat-value">{stats?.proveedores?.activos || 0}</div>
                  <div className="stat-label">Proveedores Activos</div>
                </div>
              </div>
              <div className="stat-card productos">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <div className="stat-value">{stats?.productos?.disponibles || 0}</div>
                  <div className="stat-label">Productos</div>
                </div>
              </div>
              <div className="stat-card movimientos">
                <div className="stat-icon">🚚</div>
                <div className="stat-info">
                  <div className="stat-value">{stats?.movimientos?.total || 0}</div>
                  <div className="stat-label">Movimientos</div>
                </div>
              </div>
              <div className="stat-card blockchain">
                <div className="stat-icon">⛓️</div>
                <div className="stat-info">
                  <div className="stat-value">#{latestBlock?.number || 0}</div>
                  <div className="stat-label">Último Bloque</div>
                </div>
              </div>
              <div className="stat-card token">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-value">{stats?.token?.totalSupply ? parseFloat(stats.token.totalSupply).toLocaleString() : '0'}</div>
                  <div className="stat-label">TRZ Total Supply</div>
                </div>
              </div>
            </div>

            {/* Consensus & Nodes */}
            <div className="dashboard-grid">
              <section className="card">
                <ConsensusStatus consensus={consensus} />
              </section>
              <section className="card">
                <NodeStatus nodes={nodes} />
              </section>
            </div>

            {/* Quick Actions */}
            <section className="card quick-actions">
              <h2>⚡ Acciones Rápidas</h2>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => setActiveTab('proveedores')}>
                  <span className="action-icon">🏭</span>
                  <span className="action-text">Nuevo Proveedor</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('productos')}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Nuevo Producto</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('movimientos')}>
                  <span className="action-icon">🚚</span>
                  <span className="action-text">Registrar Movimiento</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('token')}>
                  <span className="action-icon">💰</span>
                  <span className="action-text">Ver Tokens TRZ</span>
                </button>
              </div>
            </section>
          </>
        )}

        {/* Proveedores Tab */}
        {activeTab === 'proveedores' && <ProveedoresPanel />}

        {/* Productos Tab */}
        {activeTab === 'productos' && <ProductosPanel />}

        {/* Movimientos Tab */}
        {activeTab === 'movimientos' && <MovimientosPanel />}

        {/* Token Tab */}
        {activeTab === 'token' && <TokenPanel />}

        {/* Blockchain Tab */}
        {activeTab === 'blockchain' && (
          <>
            <section className="card">
              <ConsensusStatus consensus={consensus} />
            </section>
            <section className="card">
              <NodeStatus nodes={nodes} />
            </section>
            <section className="card">
              <ValidatorList validators={validators} />
            </section>
            <section className="card">
              <BlockExplorer blocks={blocks} latestBlock={latestBlock} />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <span>🔗 Hyperledger Besu + IBFT 2.0 Consensus</span>
          <span className="separator">•</span>
          <span>3 Nodos Validadores</span>
          <span className="separator">•</span>
          <span>Trazabilidad de Productos</span>
        </div>
      </footer>

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }
        
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .logo-icon { font-size: 2.5rem; }
        
        .logo-text h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .logo-text .subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        
        .network-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-card);
          border-radius: 30px;
          border: 1px solid var(--border-color);
          font-size: 0.9rem;
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .status-dot.active {
          background: var(--accent-green);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .status-dot.error { background: var(--accent-red); }
        
        .chain-id {
          padding: 0.25rem 0.75rem;
          background: var(--bg-secondary);
          border-radius: 15px;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        /* Navigation Tabs */
        .nav-tabs {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 72px;
          z-index: 99;
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.95rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .nav-tab:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .nav-tab.active {
          color: var(--accent-cyan);
          border-bottom-color: var(--accent-cyan);
        }

        .tab-icon { font-size: 1.25rem; }
        
        .error-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border-bottom: 1px solid var(--accent-red);
          color: var(--accent-red);
        }
        
        .error-icon { font-size: 1.25rem; }
        .error-hint { font-size: 0.85rem; opacity: 0.8; }
        
        .main {
          flex: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          width: 100%;
        }
        
        .card {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-card);
          animation: fadeIn 0.5s ease-out;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card);
        }

        .stat-card.proveedores { border-left: 4px solid #10b981; }
        .stat-card.productos { border-left: 4px solid #8b5cf6; }
        .stat-card.movimientos { border-left: 4px solid #f59e0b; }
        .stat-card.blockchain { border-left: 4px solid #06b6d4; }
        .stat-card.token { border-left: 4px solid #fbbf24; }

        .stat-icon { font-size: 2.5rem; }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .dashboard-grid .card {
          margin-bottom: 0;
        }

        /* Quick Actions */
        .quick-actions h2 {
          margin: 0 0 1.25rem 0;
          font-size: 1.25rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: var(--bg-hover);
          border-color: var(--accent-cyan);
          transform: translateY(-2px);
        }

        .action-icon { font-size: 2rem; }

        .action-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 1.5rem;
          margin-top: auto;
        }
        
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        
        .separator { opacity: 0.3; }
        
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }
          
          .network-badge {
            width: 100%;
            justify-content: center;
          }
          
          .main { padding: 1rem; }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
          
          .separator { display: none; }

          .nav-tab .tab-label {
            display: none;
          }

          .nav-tab {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
