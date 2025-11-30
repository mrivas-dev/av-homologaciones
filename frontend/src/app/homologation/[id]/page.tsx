'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getHomologationById, Homologation, ApiError } from '../../../utils/api';

export default function HomologationTrackingPage() {
  const params = useParams();
  const id = params.id as string;

  const [homologation, setHomologation] = useState<Homologation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomologation() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getHomologationById(id);
        setHomologation(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Error al cargar la homologación');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHomologation();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!homologation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Homologación no encontrada</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p><strong>ID:</strong> {homologation.id}</p>
        <p><strong>Teléfono:</strong> {homologation.ownerPhone}</p>
        <p><strong>DNI:</strong> {homologation.ownerNationalId}</p>
        <p><strong>Estado:</strong> {homologation.status}</p>
      </div>
    </div>
  );
}

