import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

// Hook genérico para operaciones CRUD
export function useApi(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${endpoint}`);
      if (!res.ok) throw new Error('Error al obtener datos');
      const json = await res.json();
      setData(json[endpoint] || []);
      return json;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const create = useCallback(async (item) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al crear');
      }
      const result = await res.json();
      await fetchAll();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchAll]);

  const update = useCallback(async (id, item) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar');
      }
      const result = await res.json();
      await fetchAll();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchAll]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar');
      }
      const result = await res.json();
      await fetchAll();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchAll]);

  const getById = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`);
      if (!res.ok) throw new Error('No encontrado');
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [endpoint]);

  return {
    data,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    getById,
    setError
  };
}

// Hook para estadísticas
export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, fetchStats };
}

// Hook para trazabilidad
export function useTrazabilidad() {
  const [trazabilidad, setTrazabilidad] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrazabilidad = useCallback(async (productoId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos/${productoId}/trazabilidad`);
      if (res.ok) {
        const data = await res.json();
        setTrazabilidad(data);
        return data;
      }
    } catch (err) {
      console.error('Error fetching trazabilidad:', err);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  return { trazabilidad, loading, fetchTrazabilidad };
}

// Hook para verificar en blockchain
export function useVerify() {
  const verify = useCallback(async (txHash) => {
    try {
      const res = await fetch(`${API_URL}/verify/${txHash}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error('Error verifying:', err);
      return null;
    }
  }, []);

  return { verify };
}

