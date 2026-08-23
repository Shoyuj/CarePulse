import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartPulse, Calendar, FileText, Users, Shield, Stethoscope, 
  LogIn, UserPlus, LogOut, Menu, X, User 
} from 'lucide-react';

export default function Navbar({ currentTab, onSelectTab, onOpenAuth }) {
  const { user, isAuthenticated, isAdmin, isDoctor, isPatient, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 500,
          padding: '0.75rem 1rem',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
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
            gap: '0.75rem'
          }}
        >
          {/* Brand Logo */}
          <div
            onClick={() => handleTabClick('doctors')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #E59A65 0%, #7AAEC0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(229, 154, 101, 0.35)',
                color: '#FFFFFF'
              }}
            >
              <HeartPulse size={22} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>Care</span>
                <span style={{ color: 'var(--palette-terracotta)' }}>Pulse</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-3px' }}>
                Dehradun AI Healthcare
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => handleTabClick('doctors')}
              className={`btn btn-sm ${currentTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Users size={15} />
              <span>Find Doctors</span>
            </button>

            {(!isAuthenticated || isPatient) && (
              <>
                <button
                  onClick={() => handleTabClick('my-appointments')}
                  className={`btn btn-sm ${currentTab === 'my-appointments' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Calendar size={15} />
                  <span>My Appointments</span>
                </button>

                <button
                  onClick={() => handleTabClick('my-prescriptions')}
                  className={`btn btn-sm ${currentTab === 'my-prescriptions' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <FileText size={15} />
                  <span>Prescriptions & AI</span>
                </button>
              </>
            )}

            {isDoctor && (
              <button
                onClick={() => handleTabClick('doctor-dashboard')}
                className={`btn btn-sm ${currentTab === 'doctor-dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Stethoscope size={15} />
                <span>Doctor Portal</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin-dashboard')}
                className={`btn btn-sm ${currentTab === 'admin-dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Shield size={15} />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Section: User Profile & Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.65rem',
                    background: 'var(--palette-cream)',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isDoctor ? 'var(--palette-teal)' : isAdmin ? '#8B5CF6' : 'var(--palette-terracotta)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.fullName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="btn btn-secondary btn-sm desktop-nav"
                  title="Sign Out"
                  style={{ gap: '0.35rem', color: 'var(--text-secondary)' }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="desktop-nav" style={{ display: 'flex', gap: '0.4rem' }}>
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

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-nav-toggle"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <button
              onClick={() => handleTabClick('doctors')}
              className={`btn ${currentTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <Users size={16} />
              <span>Find Doctors in Dehradun</span>
            </button>

            {(!isAuthenticated || isPatient) && (
              <>
                <button
                  onClick={() => handleTabClick('my-appointments')}
                  className={`btn ${currentTab === 'my-appointments' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', width: '100%' }}
                >
                  <Calendar size={16} />
                  <span>My Appointments</span>
                </button>

                <button
                  onClick={() => handleTabClick('my-prescriptions')}
                  className={`btn ${currentTab === 'my-prescriptions' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', width: '100%' }}
                >
                  <FileText size={16} />
                  <span>Prescriptions & AI Summary</span>
                </button>
              </>
            )}

            {isDoctor && (
              <button
                onClick={() => handleTabClick('doctor-dashboard')}
                className={`btn ${currentTab === 'doctor-dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <Stethoscope size={16} />
                <span>Doctor Consultation Portal</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin-dashboard')}
                className={`btn ${currentTab === 'admin-dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <Shield size={16} />
                <span>Admin Management Console</span>
              </button>
            )}

            <div style={{ borderTop: '1px solid var(--palette-slate-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-danger"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      onOpenAuth('login');
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-secondary"
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('register');
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-primary"
                  >
                    <UserPlus size={16} />
                    <span>Register</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom App Navigation Bar (Always reachable by thumb) */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button
          onClick={() => onSelectTab('doctors')}
          className={`mobile-tab-btn ${currentTab === 'doctors' ? 'active' : ''}`}
        >
          <Users size={18} className="mobile-tab-icon" />
          <span>Doctors</span>
        </button>

        {(!isAuthenticated || isPatient) && (
          <>
            <button
              onClick={() => onSelectTab('my-appointments')}
              className={`mobile-tab-btn ${currentTab === 'my-appointments' ? 'active' : ''}`}
            >
              <Calendar size={18} className="mobile-tab-icon" />
              <span>Bookings</span>
            </button>

            <button
              onClick={() => onSelectTab('my-prescriptions')}
              className={`mobile-tab-btn ${currentTab === 'my-prescriptions' ? 'active' : ''}`}
            >
              <FileText size={18} className="mobile-tab-icon" />
              <span>Rx & AI</span>
            </button>
          </>
        )}

        {isDoctor && (
          <button
            onClick={() => onSelectTab('doctor-dashboard')}
            className={`mobile-tab-btn ${currentTab === 'doctor-dashboard' ? 'active' : ''}`}
          >
            <Stethoscope size={18} className="mobile-tab-icon" />
            <span>Doctor</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => onSelectTab('admin-dashboard')}
            className={`mobile-tab-btn ${currentTab === 'admin-dashboard' ? 'active' : ''}`}
          >
            <Shield size={18} className="mobile-tab-icon" />
            <span>Admin</span>
          </button>
        )}

        {!isAuthenticated ? (
          <button
            onClick={() => onOpenAuth('login')}
            className="mobile-tab-btn"
          >
            <LogIn size={18} className="mobile-tab-icon" />
            <span>Sign In</span>
          </button>
        ) : (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-tab-btn"
          >
            <User size={18} className="mobile-tab-icon" />
            <span>Profile</span>
          </button>
        )}
      </nav>
    </>
  );
}
