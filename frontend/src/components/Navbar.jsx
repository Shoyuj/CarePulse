import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Calendar, FileText, Users, Shield, Stethoscope, LogIn, UserPlus, LogOut } from 'lucide-react';

export default function Navbar({ currentTab, onSelectTab, onOpenAuth }) {
  const { user, isAuthenticated, isAdmin, isDoctor, isPatient, logout } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        padding: '0.85rem 1.5rem',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1.5px solid var(--palette-slate-border)',
        boxShadow: '0 2px 12px rgba(71, 85, 105, 0.05)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Brand Logo (DocGenie Style) */}
        <div
          onClick={() => onSelectTab('doctors')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #E59A65 0%, #7AAEC0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(229, 154, 101, 0.35)',
              color: '#FFFFFF'
            }}
          >
            <HeartPulse size={24} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)' }}>Care</span>
              <span style={{ color: 'var(--palette-terracotta)' }}>Pulse</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-3px' }}>
              Online Consultations & AI Triage
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => onSelectTab('doctors')}
            className={`btn btn-sm ${currentTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={15} />
            <span>Find Doctors</span>
          </button>

          {(!isAuthenticated || isPatient) && (
            <>
              <button
                onClick={() => onSelectTab('my-appointments')}
                className={`btn btn-sm ${currentTab === 'my-appointments' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Calendar size={15} />
                <span>My Appointments</span>
              </button>

              <button
                onClick={() => onSelectTab('my-prescriptions')}
                className={`btn btn-sm ${currentTab === 'my-prescriptions' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText size={15} />
                <span>Prescriptions & AI</span>
              </button>
            </>
          )}

          {isDoctor && (
            <button
              onClick={() => onSelectTab('doctor-dashboard')}
              className={`btn btn-sm ${currentTab === 'doctor-dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Stethoscope size={15} />
              <span>Doctor Portal</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin-dashboard')}
              className={`btn btn-sm ${currentTab === 'admin-dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Shield size={15} />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Right Section: User Profile & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.85rem',
                  background: 'var(--palette-cream)',
                  border: '1px solid var(--bg-card-border)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isDoctor ? 'var(--palette-teal)' : isAdmin ? '#8B5CF6' : 'var(--palette-terracotta)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)' }}>
                    {user.fullName}
                  </span>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 600 }}>
                    {user.role?.toLowerCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Sign Out"
                style={{ gap: '0.35rem', color: 'var(--text-secondary)' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn btn-secondary btn-sm"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary btn-sm"
              >
                <UserPlus size={14} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
