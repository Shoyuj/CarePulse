import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { UserCheck, Sparkles, Shield, Stethoscope, User, ChevronDown } from 'lucide-react';

export default function DemoSwitcher({ onSwitch }) {
  const { user, quickLogin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(null);

  const handleSelect = async (account) => {
    try {
      setLoadingEmail(account.email);
      await quickLogin(account);
      setIsOpen(false);
      if (onSwitch) onSwitch(account);
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setLoadingEmail(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={16} color="#8B5CF6" />;
      case 'DOCTOR':
        return <Stethoscope size={16} color="var(--palette-teal-dark)" />;
      default:
        return <User size={16} color="var(--palette-terracotta)" />;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary btn-sm"
        style={{
          background: 'var(--palette-terracotta-light)',
          borderColor: 'var(--palette-terracotta)',
          color: 'var(--palette-terracotta-dark)',
          gap: '0.4rem',
          fontWeight: 700
        }}
      >
        <Sparkles size={14} color="var(--palette-terracotta)" />
        <span>Demo Switcher</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '290px',
            zIndex: 100,
            padding: '0.75rem',
            background: '#FFFFFF',
            boxShadow: '0 15px 35px rgba(30, 41, 59, 0.18)',
            border: '1.5px solid var(--palette-slate-border)'
          }}
        >
          <div style={{ padding: '0.2rem 0.4rem 0.6rem', borderBottom: '1px solid var(--palette-slate-border)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Switch Active Persona
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const isCurrent = user?.email === acc.email;
              const isLoading = loadingEmail === acc.email;

              return (
                <button
                  key={acc.email}
                  onClick={() => handleSelect(acc)}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--palette-cream)' : 'transparent',
                    border: isCurrent ? '1.5px solid var(--palette-terracotta)' : '1.5px solid transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'var(--palette-slate-light)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {getRoleIcon(acc.role)}
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{acc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.subtitle}</div>
                    </div>
                  </div>
                  {isCurrent && <UserCheck size={16} color="var(--palette-terracotta)" />}
                  {isLoading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>...</span>}
                </button>
              );
            })}
          </div>

          {user && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid var(--palette-slate-border)' }}>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="btn btn-danger btn-sm"
                style={{ width: '100%' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
