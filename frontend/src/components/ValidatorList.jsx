import React from 'react';

export function ValidatorList({ validators }) {
  if (!validators || validators.length === 0) return null;

  return (
    <div className="validator-list">
      <h2>
        <span className="icon">🔐</span>
        Validadores Activos
        <span className="count">{validators.length}</span>
      </h2>
      
      <div className="validators-container">
        {validators.map((address, index) => (
          <div key={address} className="validator-item" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="validator-index">
              <span className="badge">V{index + 1}</span>
            </div>
            <div className="validator-address mono">
              {address}
            </div>
            <div className="validator-status">
              <span className="dot"></span>
              Activo
            </div>
          </div>
        ))}
      </div>

      <div className="consensus-info">
        <div className="info-item">
          <span className="label">Total validadores:</span>
          <span className="value">{validators.length}</span>
        </div>
        <div className="info-item">
          <span className="label">Mínimo para consenso:</span>
          <span className="value">{Math.floor(validators.length * 2 / 3) + 1}</span>
        </div>
        <div className="info-item">
          <span className="label">Tolerancia a fallas:</span>
          <span className="value">{Math.floor((validators.length - 1) / 3)}</span>
        </div>
      </div>

      <style>{`
        .validator-list h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .validator-list h2 .icon {
          font-size: 1.5rem;
        }
        
        .validator-list h2 .count {
          margin-left: auto;
          background: var(--accent-purple);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }
        
        .validators-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        
        .validator-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--bg-secondary);
          border-radius: 10px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
          animation: slideIn 0.4s ease-out both;
        }
        
        .validator-item:hover {
          border-color: var(--accent-purple);
          transform: translateX(4px);
        }
        
        .validator-index .badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
        }
        
        .validator-address {
          flex: 1;
          font-size: 0.85rem;
          color: var(--accent-cyan);
          word-break: break-all;
        }
        
        .validator-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--accent-green);
        }
        
        .validator-status .dot {
          width: 8px;
          height: 8px;
          background: var(--accent-green);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .consensus-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 10px;
          border: 1px solid var(--border-color);
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .info-item .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }
        
        .info-item .value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
        }
        
        @media (max-width: 768px) {
          .validator-item {
            flex-direction: column;
            text-align: center;
          }
          
          .validator-address {
            font-size: 0.75rem;
          }
          
          .consensus-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

