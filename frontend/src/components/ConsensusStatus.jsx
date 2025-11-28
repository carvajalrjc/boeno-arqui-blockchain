import React from 'react';

export function ConsensusStatus({ consensus }) {
  if (!consensus) return null;

  return (
    <div className="consensus-status">
      <h2>
        <span className="icon">🤝</span>
        Estado del Consenso
      </h2>
      
      <div className={`consensus-box ${consensus.synced ? 'synced' : 'syncing'}`}>
        <div className="status-icon">
          {consensus.synced ? '✅' : '⏳'}
        </div>
        <div className="status-info">
          <div className="status-text">{consensus.consensusStatus}</div>
          <div className="status-details">
            {consensus.syncedNodes} de {consensus.totalNodes} nodos sincronizados
          </div>
        </div>
        <div className="block-info">
          <span className="label">Bloque actual</span>
          <span className="block-number mono">#{consensus.latestBlock?.blockNumber || 0}</span>
        </div>
      </div>

      {/* Visualización del consenso */}
      <div className="consensus-visual">
        <div className="consensus-title">Proceso de Consenso IBFT 2.0</div>
        <div className="consensus-steps">
          <div className="step active">
            <div className="step-icon">📝</div>
            <div className="step-label">Propuesta</div>
          </div>
          <div className="arrow">→</div>
          <div className="step active">
            <div className="step-icon">📤</div>
            <div className="step-label">Pre-Prepare</div>
          </div>
          <div className="arrow">→</div>
          <div className="step active">
            <div className="step-icon">✍️</div>
            <div className="step-label">Prepare</div>
          </div>
          <div className="arrow">→</div>
          <div className={`step ${consensus.synced ? 'active complete' : ''}`}>
            <div className="step-icon">✅</div>
            <div className="step-label">Commit</div>
          </div>
        </div>
      </div>

      <style>{`
        .consensus-status h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .consensus-status h2 .icon {
          font-size: 1.5rem;
        }
        
        .consensus-box {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem 1.5rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }
        
        .consensus-box.synced {
          border-color: var(--accent-green);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);
        }
        
        .consensus-box.syncing {
          border-color: var(--accent-yellow);
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%);
        }
        
        .status-icon {
          font-size: 2.5rem;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .status-info {
          flex: 1;
        }
        
        .status-text {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .status-details {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .block-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 0.75rem 1.25rem;
          background: var(--bg-card);
          border-radius: 8px;
        }
        
        .block-info .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .block-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }
        
        .consensus-visual {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid var(--border-color);
        }
        
        .consensus-title {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .consensus-steps {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border-radius: 8px;
          opacity: 0.4;
          transition: all 0.3s ease;
        }
        
        .step.active {
          opacity: 1;
          background: var(--bg-hover);
        }
        
        .step.complete {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, transparent 100%);
          border: 1px solid var(--accent-green);
        }
        
        .step-icon {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        
        .step-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .arrow {
          color: var(--text-muted);
          font-size: 1.25rem;
        }
        
        @media (max-width: 768px) {
          .consensus-box {
            flex-direction: column;
            text-align: center;
          }
          
          .block-info {
            align-items: center;
            width: 100%;
          }
          
          .consensus-steps {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

