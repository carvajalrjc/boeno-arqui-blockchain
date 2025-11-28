import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

export function useBlockchain() {
  const [nodes, setNodes] = useState([]);
  const [consensus, setConsensus] = useState(null);
  const [validators, setValidators] = useState([]);
  const [latestBlock, setLatestBlock] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener estado de los nodos
  const fetchNodesStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/nodes/status`);
      if (!res.ok) throw new Error('Error fetching nodes');
      const data = await res.json();
      setNodes(data.nodes || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching nodes:', err);
      setError('No se puede conectar al backend');
    }
  }, []);

  // Verificar consenso
  const fetchConsensus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/consensus`);
      if (!res.ok) throw new Error('Error fetching consensus');
      const data = await res.json();
      setConsensus(data);
    } catch (err) {
      console.error('Error fetching consensus:', err);
    }
  }, []);

  // Obtener validadores
  const fetchValidators = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/validators`);
      if (!res.ok) throw new Error('Error fetching validators');
      const data = await res.json();
      setValidators(data.validators || []);
    } catch (err) {
      console.error('Error fetching validators:', err);
    }
  }, []);

  // Obtener último bloque
  const fetchLatestBlock = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/blocks/latest`);
      if (!res.ok) throw new Error('Error fetching block');
      const data = await res.json();
      setLatestBlock(data);
    } catch (err) {
      console.error('Error fetching latest block:', err);
    }
  }, []);

  // Obtener últimos bloques
  const fetchBlocks = useCallback(async (limit = 10) => {
    try {
      const res = await fetch(`${API_URL}/blocks?limit=${limit}`);
      if (!res.ok) throw new Error('Error fetching blocks');
      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch (err) {
      console.error('Error fetching blocks:', err);
    }
  }, []);

  // Obtener info de wallet
  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/wallet`);
      if (!res.ok) throw new Error('Error fetching wallet');
      const data = await res.json();
      setWallet(data);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  }, []);

  // Guardar datos en blockchain
  const saveData = useCallback(async (key, value) => {
    try {
      const res = await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error saving data');
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error saving data:', err);
      throw err;
    }
  }, []);

  // Enviar transacción
  const sendTransaction = useCallback(async (to, value) => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, value })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error sending transaction');
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error sending transaction:', err);
      throw err;
    }
  }, []);

  // Leer datos de transacción
  const readData = useCallback(async (txHash) => {
    try {
      const res = await fetch(`${API_URL}/data/${txHash}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error reading data');
      }
      
      return await res.json();
    } catch (err) {
      console.error('Error reading data:', err);
      throw err;
    }
  }, []);

  // Polling para actualización en tiempo real
  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchNodesStatus(),
        fetchConsensus(),
        fetchValidators(),
        fetchLatestBlock(),
        fetchBlocks(10),
        fetchWallet()
      ]);
      setLoading(false);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, [fetchNodesStatus, fetchConsensus, fetchValidators, fetchLatestBlock, fetchBlocks, fetchWallet]);

  return {
    nodes,
    consensus,
    validators,
    latestBlock,
    blocks,
    wallet,
    loading,
    error,
    saveData,
    sendTransaction,
    readData,
    refresh: () => {
      fetchNodesStatus();
      fetchConsensus();
      fetchLatestBlock();
      fetchBlocks();
    }
  };
}

