import React from 'react';

export function BlockExplorer({ blocks, latestBlock }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="block-explorer">
      <h2>
        <span className="icon">⛓️</span>
        Explorador de Bloques
      </h2>

      {latestBlock && (
        <div className="latest-block">
          <div className="latest-header">
            <span className="pulse-dot"></span>
            Último Bloque
          </div>
          <div className="latest-content">
            <div className="block-number-large mono">#{latestBlock.number}</div>
            <div className="block-meta">
              <div className="meta-item">
                <span className="label">Hash</span>
                <span className="value mono">{latestBlock.hash?.slice(0, 20)}...</span>
              </div>
              <div className="meta-item">
                <span className="label">Transacciones</span>
                <span className="value">{latestBlock.transactions}</span>
              </div>
              <div className="meta-item">
                <span className="label">Gas Usado</span>
                <span className="value mono">{parseInt(latestBlock.gasUsed).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="blocks-list">
        <div className="list-header">
          <span>Bloque</span>
          <span>Hash</span>
          <span>Hora</span>
          <span>TXs</span>
        </div>
        {blocks.map((block, index) => (
          <div 
            key={block.number} 
            className="block-row"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="block-num mono">#{block.number}</span>
            <span className="block-hash mono">{block.hash}</span>
            <span className="block-time">{formatTime(block.timestamp)}</span>
            <span className="block-txs">
              <span className="tx-badge">{block.transactions}</span>
            </span>
          </div>
        ))}
      </div>

      <style>{`
        .block-explorer h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .block-explorer h2 .icon {
          font-size: 1.5rem;
        }
        
        .latest-block {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
          border-radius: 12px;
          border: 1px solid var(--accent-cyan);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.1);
        }
        
        .latest-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }
        
        .pulse-dot {
          width: 10px;
          height: 10px;
          background: var(--accent-green);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .latest-content {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .block-number-large {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }
        
        .block-meta {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .meta-item {
          display: flex;
          flex-direction: column;
        }
        
        .meta-item .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }
        
        .meta-item .value {
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        
        .blocks-list {
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        
        .list-header {
          display: grid;
          grid-template-columns: 100px 1fr 100px 60px;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }
        
        .block-row {
          display: grid;
          grid-template-columns: 100px 1fr 100px 60px;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
          transition: background 0.2s ease;
          animation: fadeIn 0.3s ease-out both;
        }
        
        .block-row:last-child {
          border-bottom: none;
        }
        
        .block-row:hover {
          background: var(--bg-hover);
        }
        
        .block-num {
          color: var(--accent-cyan);
          font-weight: 600;
        }
        
        .block-hash {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        
        .block-time {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        
        .tx-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 0.5rem;
          background: var(--accent-purple);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .latest-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .block-meta {
            width: 100%;
            grid-template-columns: 1fr;
          }
          
          .list-header,
          .block-row {
            grid-template-columns: 80px 1fr 60px;
          }
          
          .block-row .block-hash {
            display: none;
          }
          
          .list-header span:nth-child(2) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

