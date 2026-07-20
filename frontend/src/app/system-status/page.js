"use client";

import React, { useEffect, useState } from 'react';
import versionInfo from '@/version';

export default function SystemStatusPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchStatus = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/system-status`);
      if (!res.ok && res.status !== 503) {
        throw new Error(`HTTP Error ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Actualización cada 10 seg
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0d14',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Encabezado */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #1e293b',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            🖥️ {versionInfo.APP_NAME} — System Status
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Panel de Monitoreo Operativo en Tiempo Real (v{versionInfo.VERSION} — Build {versionInfo.BUILD_DATE})
          </p>
        </div>
        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
          <button
            onClick={fetchStatus}
            style={{
              backgroundColor: '#cc0000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            🔄 Actualizar Ahora
          </button>
          {lastRefreshed && (
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Última actualización: {lastRefreshed}
            </div>
          )}
        </div>
      </header>

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Obteniendo métricas del sistema...
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#450a0a',
          border: '1px solid #991b1b',
          color: '#fca5a5',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          ⚠️ Error al comunicarse con el servidor Backend: {error}
        </div>
      )}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* Card: Estado General */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🟢 Estado General del Sistema</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: data.status === 'ok' ? '#22c55e' : '#eab308' }}>
              {data.status === 'ok' ? 'OPERATIVO 🟢' : 'DEGRADADO ⚠️'}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <div><strong>Ambiente:</strong> {data.environment}</div>
              <div><strong>Uptime Backend:</strong> {data.uptimeSeconds} seg</div>
              <div><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {/* Card: Base de Datos */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🗄️ Base de Datos (Prisma / SQL)</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: data.database.status === 'connected' ? '#22c55e' : '#ef4444' }}>
              {data.database.status === 'connected' ? 'CONECTADA' : 'DESCONECTADA'}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <div><strong>Latencia Consulta:</strong> {data.database.latencyMs} ms</div>
              <div><strong>Proveedor:</strong> {data.database.provider}</div>
            </div>
          </div>

          {/* Card: APIs & Servicios */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🌐 API REST & Microservicios</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: '#22c55e' }}>
              OPERATIVO
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <div><strong>Versión API:</strong> {data.apiVersion}</div>
              <div><strong>Health Check:</strong> <a href="/api/health" style={{ color: '#38bdf8' }}>/api/health</a></div>
              <div><strong>Frontend URL:</strong> {data.frontend.url}</div>
            </div>
          </div>

          {/* Card: Memoria RAM */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🧠 Uso de Memoria RAM</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: '#38bdf8' }}>
              {data.metrics.memory.heapUsedMB} MB / {data.metrics.memory.heapTotalMB} MB
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <div><strong>RSS Procesos:</strong> {data.metrics.memory.rssMB} MB</div>
              <div><strong>Memoria Libre Sistema:</strong> {data.metrics.memory.systemFreeMemMB} MB</div>
              <div><strong>Memoria Total Sistema:</strong> {data.metrics.memory.systemTotalMemMB} MB</div>
            </div>
          </div>

          {/* Card: CPU y Servidor */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>⚡ Uso de CPU & Servidor</h3>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem', color: '#f8fafc' }}>
              {data.metrics.cpu.model}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <div><strong>Núcleos CPU:</strong> {data.metrics.cpu.cores}</div>
              <div><strong>Carga Promedio (1m, 5m, 15m):</strong> {data.metrics.cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}</div>
              <div><strong>Plataforma:</strong> {data.backend.platform} ({data.backend.arch})</div>
            </div>
          </div>

          {/* Card: Almacenamiento */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>💾 Espacio de Almacenamiento</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: '#a855f7' }}>
              {data.metrics.storage.freeGB} GB libres / {data.metrics.storage.totalGB} GB
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <div><strong>Node Runtime:</strong> {data.backend.nodeVersion}</div>
            </div>
          </div>

        </div>
      )}

      {/* Footer de Versión */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #1e293b',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.875rem'
      }}>
        {versionInfo.APP_NAME} v{versionInfo.VERSION} — Producción Certificada 🟢 — Fecha de Compilación: {versionInfo.BUILD_DATE}
      </footer>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#111827',
  border: '1px solid #1f2937',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
};

const cardTitleStyle = {
  fontSize: '1rem',
  fontWeight: 600,
  color: '#94a3b8',
  margin: 0,
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #1f2937'
};
