import React from 'react';
import { HeartPulse, ShieldCheck, Clock, Award, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onSelectTab }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Col 1: Brand & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => onSelectTab && onSelectTab('doctors')}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #E59A65 0%, #7AAEC0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <HeartPulse size={20} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>
              <span>Care</span><span style={{ color: 'var(--palette-terracotta)' }}>Pulse</span>
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '360px' }}>
            Next-generation healthcare consultation platform powered by Gemini AI clinical triage, 5-minute concurrency locks, and instant plain-English digital prescriptions.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-confirmed)', fontSize: '0.8rem', fontWeight: 700, background: 'var(--status-confirmed-bg)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', display: 'inline-flex' }}>
            <ShieldCheck size={16} />
            <span>NABH & Telemedicine Guidelines Compliant</span>
          </div>
        </div>

        {/* Col 2: Specialties */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Top Specialties
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><a href="#specialties" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('doctors'); }}>Cardiology (Heart Care)</a></li>
            <li><a href="#specialties" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('doctors'); }}>Dermatology & Skin</a></li>
            <li><a href="#specialties" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('doctors'); }}>Orthopedics & Joint Care</a></li>
            <li><a href="#specialties" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('doctors'); }}>Pediatrics & Child Care</a></li>
            <li><a href="#specialties" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('doctors'); }}>General Medicine / Flu</a></li>
          </ul>
        </div>

        {/* Col 3: Patient Care */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Patient Portal
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><a href="#appointments" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('my-appointments'); }}>My Consultations</a></li>
            <li><a href="#prescriptions" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('my-prescriptions'); }}>Digital Prescriptions (Rx)</a></li>
            <li><a href="#triage" onClick={(e) => { e.preventDefault(); onSelectTab && onSelectTab('doctors'); }}>AI Pre-Visit Triage</a></li>
            <li><a href="#calendar">Google Calendar Sync</a></li>
            <li><a href="#terms">Patient Privacy Policy</a></li>
          </ul>
        </div>

        {/* Col 4: Medical Support */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Dehradun Helpline
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Phone size={15} color="var(--palette-terracotta)" />
              <span>+91 (135) 274-CARE (24/7)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Mail size={15} color="var(--palette-teal-dark)" />
              <span>care@carepulse-dehradun.in</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <MapPin size={15} color="var(--palette-terracotta-dark)" />
              <span>Rajpur Road, Dehradun, UK 248001</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Clock size={15} color="var(--palette-slate-grey)" />
              <span>Mon-Sun: 8:00 AM - 10:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Disclaimer & Copyright */}
      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} CarePulse Dehradun (Uttarakhand). All rights reserved.
        </div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', maxWidth: '600px', textAlign: 'right' }}>
          <strong>Medical Notice:</strong> If you are experiencing a life-threatening medical emergency or severe chest pain, please dial <strong>108 / 112</strong> or visit the nearest emergency trauma center (Max / Doon Hospital / Synergy) immediately.
        </div>
      </div>
    </footer>
  );
}
