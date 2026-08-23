import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, Info } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phoneNumber.trim() || '+91 98765 00000',
          role
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials or register a new account.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Sign In to CarePulse Dehradun' : 'Create an Account'}
          </h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.4rem' }}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rohan Sharma"
                      required
                    />
                    <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: '2.4rem' }}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <Phone size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="PATIENT">Patient (Book Appointments & AI Triage)</option>
                    <option value="DOCTOR">Doctor (View Consultations & Prescribe)</option>
                    <option value="ADMIN">Administrator (Clinic Operations)</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Quick Test Login Hint Box */}
            {mode === 'login' && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                background: 'var(--palette-cream)',
                border: '1px solid var(--palette-slate-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  <Info size={14} color="var(--palette-terracotta)" />
                  <span>Quick Test Accounts:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('patient.rohan@gmail.com', 'patient123')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Patient (Rohan)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('dr.rawat@healthcare.com', 'doctor123')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Doctor (Dr. Rawat)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('admin@healthcare.com', 'admin123')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--palette-terracotta-dark)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Register New Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--palette-terracotta-dark)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
