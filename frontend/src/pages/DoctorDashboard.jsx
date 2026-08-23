import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import AiTriageBadge from '../components/AiTriageBadge';
import DoctorConsultationModal from '../components/DoctorConsultationModal';
import { formatTime, formatDate } from '../utils/formatters';
import { Calendar, Clock, Sparkles, Stethoscope, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsultationApp, setActiveConsultationApp] = useState(null);

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentApi.getDoctorAppointments();
      setAppointments(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch doctor appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF3E8 60%, #F0F7F9 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          border: '1.5px solid var(--palette-slate-border)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--palette-teal-dark)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.4rem', background: 'var(--palette-teal-light)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
            <Stethoscope size={16} />
            <span>Doctor Clinical Console</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>Welcome, {user?.fullName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review AI Pre-Visit Triage briefs, conduct patient visits, and issue AI-summarized prescriptions.
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ padding: '0.85rem 1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--palette-slate-border)', textAlign: 'center', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--palette-terracotta-dark)' }}>{confirmedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Consultations</div>
          </div>
          <div style={{ padding: '0.85rem 1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--palette-slate-border)', textAlign: 'center', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-confirmed)' }}>{completedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Visits</div>
          </div>
        </div>
      </div>

      {/* Appointment Queue */}
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Consultation Schedule & Patient Queue</h2>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading assigned consultations...
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#FFFFFF' }}>
          <Calendar size={48} color="var(--palette-slate-grey)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>No Scheduled Appointments</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            There are currently no patients booked in your schedule.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {appointments.map((app) => (
            <div
              key={app.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                background: '#FFFFFF',
                border: '1.5px solid var(--palette-slate-border)',
                borderLeft: app.status === 'CONFIRMED' ? '5px solid var(--palette-terracotta)' : app.status === 'COMPLETED' ? '5px solid var(--status-confirmed)' : '5px solid var(--palette-slate-grey)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'var(--palette-cream)',
                      color: 'var(--palette-terracotta-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      border: '1px solid var(--palette-terracotta)'
                    }}
                  >
                    {app.patientName ? app.patientName[0].toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{app.patientName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} color="var(--palette-terracotta)" /> {formatDate(app.appointmentDate)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} color="var(--palette-teal-dark)" /> {formatTime(app.startTime)} - {formatTime(app.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                  {app.aiUrgencyLevel && <AiTriageBadge urgency={app.aiUrgencyLevel} />}
                </div>
              </div>

              {/* Pre-Visit AI Briefing Box */}
              <div className="ai-summary-card" style={{ marginTop: 0, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div className="ai-pill-header">
                    <Sparkles size={14} />
                    <span>Gemini Pre-Visit Patient Intake</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Patient Symptoms:</strong> {app.patientSymptoms || 'No symptoms provided.'}
                </div>
                {app.aiChiefComplaint && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--palette-teal-dark)', fontWeight: 600 }}>
                    <strong>AI Triage Summary:</strong> {app.aiChiefComplaint}
                  </div>
                )}
              </div>

              {/* Clinical Notes & Completed Summary if completed */}
              {app.doctorClinicalNotes && (
                <div style={{ padding: '0.75rem 1rem', background: 'var(--palette-cream)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid var(--palette-slate-border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Doctor Diagnosis / Notes:</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{app.doctorClinicalNotes}</div>
                </div>
              )}

              {/* Action Button */}
              {app.status === 'CONFIRMED' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--palette-slate-border)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setActiveConsultationApp(app)}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem' }}
                  >
                    <Stethoscope size={16} />
                    <span>Start Consultation & Prescribe</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Doctor Consultation Modal */}
      {activeConsultationApp && (
        <DoctorConsultationModal
          appointment={activeConsultationApp}
          isOpen={!!activeConsultationApp}
          onClose={() => setActiveConsultationApp(null)}
          onSuccess={() => {
            setActiveConsultationApp(null);
            fetchDoctorAppointments();
          }}
        />
      )}
    </div>
  );
}
