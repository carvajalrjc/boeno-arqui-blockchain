import React from 'react';

export function NodeStatus({ nodes }) {
  return (
    <div className="node-status">
      <h2>
        <span className="icon">🖥️</span>
        Nodos Validadores
      </h2>
      <div className="nodes-grid">
        {nodes.map((node) => (
          <div
            key={node.node}
            className={`node-card ${node.status === 'online' ? 'online' : 'offline'}`}
          >
            <div className="node-header">
              <span className="status-indicator">
                {node.status === 'online' ? '🟢' : '🔴'}
              </span>
              <span className="node-name">Nodo {node.node}</span>
            </div>
            
            <div className="node-details">
              {node.status === 'online' ? (
                <>
                  <div className="detail">
                    <span className="label">Puerto:</span>
                    <span className="value">{8544 + node.node}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Bloque:</span>
                    <span className="value mono">#{node.blockNumber}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Peers:</span>
                    <span className="value">{node.peers}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Chain ID:</span>
                    <span className="value mono">{node.chainId}</span>
                  </div>
                </>
              ) : (
                <div className="error-message">
                  {node.error || 'Nodo desconectado'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .node-status h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .node-status h2 .icon {
          font-size: 1.5rem;
        }
        
        .nodes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .nodes-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .node-card {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 1.25rem;
          border: 2px solid var(--border-color);
          transition: all 0.3s ease;
          animation: fadeIn 0.4s ease-out;
        }
        
        .node-card.online {
          border-color: var(--accent-green);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
        }
        
        .node-card.offline {
          border-color: var(--accent-red);
          opacity: 0.7;
        }
        
        .node-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card);
        }
        
        .node-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .status-indicator {
          font-size: 0.75rem;
        }
        
        .node-name {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .node-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        
        .detail .label {
          color: var(--text-secondary);
        }
        
        .detail .value {
          color: var(--accent-cyan);
          font-weight: 500;
        }
        
        .detail .value.mono {
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }
        
        .error-message {
          color: var(--accent-red);
          font-size: 0.85rem;
          text-align: center;
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
}

