import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

export function TokenPanel() {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState({ to: '', amount: '' });
  const [transferring, setTransferring] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tokenRes, walletRes] = await Promise.all([
        fetch(`${API_URL}/token/info`),
        fetch(`${API_URL}/wallet`)
      ]);
      
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        setTokenInfo(tokenData);
      }
      
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWalletInfo(walletData);
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.to || !transferData.amount) return;
    
    setTransferring(true);
    setMessage('');
    
    try {
      const res = await fetch(`${API_URL}/token/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Transferencia exitosa! TX: ${data.txHash.slice(0, 20)}...`);
        setTransferData({ to: '', amount: '' });
        fetchData();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando información del token...</div>;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="icon">💰</span>
          <h2>Token TRZ (Criptomoneda)</h2>
        </div>
      </div>

      <div className="token-grid">
        {/* Info del Token */}
        <div className="token-card">
          <div className="token-header">
            <span className="token-symbol">🪙</span>
            <h3>{tokenInfo?.name || 'TrazaToken'}</h3>
          </div>
          <div className="token-details">
            <div className="token-row">
              <span>Símbolo:</span>
              <strong>{tokenInfo?.symbol || 'TRZ'}</strong>
            </div>
            <div className="token-row">
              <span>Decimales:</span>
              <strong>{tokenInfo?.decimals || 18}</strong>
            </div>
            <div className="token-row">
              <span>Supply Total:</span>
              <strong>{parseFloat(tokenInfo?.totalSupply || 0).toLocaleString()} TRZ</strong>
            </div>
            <div className="token-row">
              <span>Contrato:</span>
              <code>{tokenInfo?.address?.slice(0, 12)}...{tokenInfo?.address?.slice(-8)}</code>
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="token-card wallet-card">
          <div className="token-header">
            <span className="token-symbol">👛</span>
            <h3>Mi Wallet</h3>
          </div>
          <div className="token-details">
            <div className="token-row">
              <span>Dirección:</span>
              <code>{walletInfo?.address?.slice(0, 12)}...{walletInfo?.address?.slice(-8)}</code>
            </div>
            <div className="token-row highlight">
              <span>Balance TRZ:</span>
              <strong className="balance">{parseFloat(walletInfo?.tokenBalance || 0).toLocaleString()} TRZ</strong>
            </div>
            <div className="token-row">
              <span>Balance ETH:</span>
              <strong>{parseFloat(walletInfo?.ethBalance || 0).toFixed(4)} ETH</strong>
            </div>
          </div>
        </div>

        {/* Recompensas */}
        <div className="token-card rewards-card">
          <div className="token-header">
            <span className="token-symbol">🎁</span>
            <h3>Sistema de Recompensas</h3>
          </div>
          <div className="rewards-list">
            <div className="reward-item">
              <span className="reward-icon">🏭</span>
              <span>Registrar Proveedor</span>
              <strong>+100 TRZ</strong>
            </div>
            <div className="reward-item">
              <span className="reward-icon">📦</span>
              <span>Registrar Producto</span>
              <strong>+50 TRZ</strong>
            </div>
            <div className="reward-item">
              <span className="reward-icon">🚚</span>
              <span>Registrar Movimiento</span>
              <strong>+10 TRZ</strong>
            </div>
          </div>
        </div>

        {/* Transferir Tokens */}
        <div className="token-card transfer-card">
          <div className="token-header">
            <span className="token-symbol">📤</span>
            <h3>Transferir Tokens</h3>
          </div>
          <form onSubmit={handleTransfer} className="transfer-form">
            <div className="form-group">
              <label>Dirección destino</label>
              <input
                type="text"
                placeholder="0x..."
                value={transferData.to}
                onChange={(e) => setTransferData({ ...transferData, to: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Cantidad (TRZ)</label>
              <input
                type="number"
                step="0.01"
                placeholder="100"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-transfer" disabled={transferring}>
              {transferring ? '⏳ Transfiriendo...' : '📤 Transferir'}
            </button>
          </form>
          {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
        </div>
      </div>

      <style>{`
        .token-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .token-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
        }

        .token-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .token-symbol {
          font-size: 2rem;
        }

        .token-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .token-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .token-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .token-row span {
          color: var(--text-secondary);
        }

        .token-row strong {
          color: var(--text-primary);
        }

        .token-row code {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--accent-cyan);
          background: var(--bg-card);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .token-row.highlight {
          background: var(--bg-card);
          padding: 0.75rem;
          border-radius: 8px;
          margin: 0.5rem 0;
        }

        .balance {
          color: var(--accent-green) !important;
          font-size: 1.25rem;
        }

        .wallet-card {
          border-color: var(--accent-cyan);
        }

        .rewards-card {
          border-color: var(--accent-purple);
        }

        .rewards-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .reward-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-card);
          border-radius: 8px;
        }

        .reward-icon {
          font-size: 1.5rem;
        }

        .reward-item span:nth-child(2) {
          flex: 1;
          color: var(--text-secondary);
        }

        .reward-item strong {
          color: var(--accent-green);
        }

        .transfer-card {
          border-color: var(--accent-yellow);
        }

        .transfer-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transfer-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .transfer-form label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .transfer-form input {
          padding: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .transfer-form input:focus {
          outline: none;
          border-color: var(--accent-cyan);
        }

        .btn-transfer {
          background: linear-gradient(135deg, var(--accent-yellow) 0%, #f59e0b 100%);
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          color: #1a1a1a;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-transfer:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-transfer:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-green);
          color: var(--accent-green);
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--accent-red);
          color: var(--accent-red);
        }
      `}</style>
    </div>
  );
}

