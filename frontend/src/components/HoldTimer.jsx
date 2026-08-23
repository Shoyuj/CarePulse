import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';

export default function HoldTimer({ expiresAt, durationSeconds = 300, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    return Number(durationSeconds) > 0 ? Number(durationSeconds) : 300;
  });

  useEffect(() => {
    let targetTimeMs = 0;

    if (expiresAt) {
      if (typeof expiresAt === 'string') {
        const parsed = new Date(expiresAt).getTime();
        if (!isNaN(parsed)) targetTimeMs = parsed;
      } else if (Array.isArray(expiresAt)) {
        const d = new Date(
          expiresAt[0] || 2026,
          (expiresAt[1] || 1) - 1,
          expiresAt[2] || 1,
          expiresAt[3] || 0,
          expiresAt[4] || 0,
          expiresAt[5] || 0
        );
        targetTimeMs = d.getTime();
      }
    }

    // Fallback: If expiresAt is missing or invalid or in the past, use durationSeconds from now
    const now = Date.now();
    if (!targetTimeMs || targetTimeMs <= now) {
      const durationMs = (Number(durationSeconds) > 0 ? Number(durationSeconds) : 300) * 1000;
      targetTimeMs = now + durationMs;
    }

    const updateTimer = () => {
      const current = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((targetTimeMs - current) / 1000));
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        if (onExpired) onExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, durationSeconds, onExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (timeLeft <= 0) {
    return (
      <div className="hold-timer-banner" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}>
          <AlertCircle size={20} />
          <span>Slot reservation expired. Please reselect your preferred time slot.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hold-timer-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Timer size={22} color="var(--palette-terracotta)" />
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Slot Reserved For You (5-Min Lock)
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Complete your symptoms to confirm this consultation
          </div>
        </div>
      </div>
      <div className="timer-countdown">{formattedTime}</div>
    </div>
  );
}
