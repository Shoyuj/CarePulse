import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import AiTriageBadge from '../components/AiTriageBadge';
import { formatTime, formatDate, parseSuggestedQuestions } from '../utils/formatters';
import { 
  Calendar, Clock, Stethoscope, Download, CalendarPlus, XCircle, 
  Sparkles, FileText, Plus, ShieldCheck, HeartPulse, User, Activity 
} from 'lucide-react';

export default function PatientDashboard({ onBrowseDoctors, onViewPrescriptions }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Cancel Modal
  const [cancelModalApp, setCancelModalApp] = useState(null);
  const [cancelReason, setCancelReason] = useState('Schedule conflict');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentApi.getMyAppointments();
      setAppointments(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalApp) return;

    setCancelling(true);
    try {
      await appointmentApi.cancel(cancelModalApp.id, cancelReason);
      addToast('Appointment cancelled successfully.', 'info');
      setCancelModalApp(null);
      fetchAppointments();
    } catch (err) {
      addToast(err.message || 'Failed to cancel appointment', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-confirmed">Confirmed</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">Cancelled</span>;
      case 'CANCELLED_LEAVE':
        return <span className="badge badge-cancelled">Cancelled (Doctor Leave)</span>;
      case 'HELD':
        return <span className="badge badge-held">Slot Held</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filtered = appointments.filter((app) => {
    if (filter === 'ALL') return true;
    if (filter === 'UPCOMING') return app.status === 'CONFIRMED' || app.status === 'HELD';
    if (filter === 'COMPLETED') return app.status === 'COMPLETED';
    if (filter === 'CANCELLED') return app.status === 'CANCELLED' || app.status === 'CANCELLED_LEAVE';
    return true;
  });

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
          gap: '1.25rem',
          border: '1.5px solid var(--palette-slate-border)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--palette-terracotta-dark)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.4rem', background: 'var(--palette-terracotta-light)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
            <Activity size={16} />
            <span>Patient Consultation Portal</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>My Medical Consultations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage your appointments, pre-visit AI triage reports, and export events to your Google Calendar.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={onViewPrescriptions} className="btn btn-secondary btn-sm">
            <FileText size={16} />
            <span>Prescriptions & AI Advice</span>
          </button>
          <button onClick={onBrowseDoctors} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Book New Consultation</span>
          </button>
        </div>
      </div>

      {/* 2-Column Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Left Column: Appointments List */}
        <div>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
              >
                {tab.toLowerCase()}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your medical consultations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#FFFFFF' }}>
              <Calendar size={48} color="var(--palette-slate-grey)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Consultations Found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                You do not have any {filter !== 'ALL' ? filter.toLowerCase() : ''} appointments scheduled right now.
              </p>
              <button onClick={onBrowseDoctors} className="btn btn-primary">
                Find a Specialist & Book Slot
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filtered.map((app) => (
                <div
                  key={app.id}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: '#FFFFFF',
                    border: '1.5px solid var(--palette-slate-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--palette-teal-light)',
                          color: 'var(--palette-teal-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid #D5E7EE'
                        }}
                      >
                        <Stethoscope size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.15rem', color: 'var(--text-primary)' }}>{app.doctorName}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {app.doctorSpecialization}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {getStatusBadge(app.status)}
                      {app.aiUrgencyLevel && <AiTriageBadge urgency={app.aiUrgencyLevel} />}
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'var(--palette-cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--palette-slate-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                      <Calendar size={16} color="var(--palette-terracotta)" />
                      <span><strong>Date:</strong> {formatDate(app.appointmentDate)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                      <Clock size={16} color="var(--palette-teal-dark)" />
                      <span><strong>Time:</strong> {formatTime(app.startTime)} - {formatTime(app.endTime)}</span>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {app.patientSymptoms && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Reported Symptoms: </strong>
                      {app.patientSymptoms}
                    </div>
                  )}

                  {/* Pre-Visit Gemini AI Clinical Triage */}
                  {(app.aiChiefComplaint || app.aiSuggestedQuestions) && (
                    <div className="ai-summary-card" style={{ marginTop: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div className="ai-pill-header">
                          <Sparkles size={14} />
                          <span>Gemini Pre-Visit Clinical Assessment</span>
                        </div>
                        {app.aiUrgencyLevel && <AiTriageBadge urgency={app.aiUrgencyLevel} />}
                      </div>

                      {app.aiChiefComplaint && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>AI Chief Complaint Analysis</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.15rem', fontWeight: 600 }}>
                            {app.aiChiefComplaint}
                          </div>
                        </div>
                      )}

                      {app.aiSuggestedQuestions && parseSuggestedQuestions(app.aiSuggestedQuestions).length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                            Recommended Discussion Points with Doctor
                          </div>
                          <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {parseSuggestedQuestions(app.aiSuggestedQuestions).map((q, i) => (
                              <li key={i} style={{ marginBottom: '0.2rem' }}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Post-Visit Patient Summary */}
                  {app.aiPatientSummary && (
                    <div className="ai-summary-card" style={{ marginTop: 0, background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                      <div className="ai-pill-header" style={{ background: '#DCFCE7', color: '#166534' }}>
                        <Sparkles size={14} />
                        <span>Doctor Consultation & Digital Rx Summary</span>
                      </div>
                      <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                        {app.aiPatientSummary}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--palette-slate-border)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {app.googleCalendarLink && app.status === 'CONFIRMED' && (
                        <a
                          href={app.googleCalendarLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ background: 'var(--palette-cream)', borderColor: 'var(--palette-terracotta)', color: 'var(--palette-terracotta-dark)', fontWeight: 600 }}
                        >
                          <CalendarPlus size={14} />
                          <span>Add to Google Calendar</span>
                        </a>
                      )}
                      {app.status === 'CONFIRMED' && (
                        <button
                          onClick={() => appointmentApi.downloadIcs(app.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Download size={14} />
                          <span>Download .ICS</span>
                        </button>
                      )}
                    </div>

                    {app.status === 'CONFIRMED' && (
                      <button
                        onClick={() => setCancelModalApp(app)}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={14} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Health Profile & Quick Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Patient Overview Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--palette-terracotta-light)',
                  color: 'var(--palette-terracotta-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: '1px solid var(--palette-terracotta)'
                }}
              >
                {user?.fullName ? user.fullName[0].toUpperCase() : 'P'}
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{user?.fullName || 'Patient'}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--palette-cream)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--palette-slate-border)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--palette-terracotta-dark)' }}>{confirmedCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upcoming</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--palette-teal-light)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid #D5E7EE' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--palette-teal-dark)' }}>{completedCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
              </div>
            </div>

            <button
              onClick={onBrowseDoctors}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem' }}
            >
              <Plus size={16} />
              <span>Book Another Doctor</span>
            </button>
          </div>

          {/* Quick Care Guidelines */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--palette-cream)', border: '1px solid var(--palette-slate-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--status-confirmed)" />
              <span>Patient Care Checklist</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>• Join your consultation link 5 minutes prior to time.</li>
              <li>• Keep previous medical reports handy.</li>
              <li>• AI summaries and prescriptions update automatically upon completion.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalApp && (
        <div className="modal-overlay" onClick={() => setCancelModalApp(null)}>
          <div className="modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Cancel Consultation</h3>
              <button className="icon-btn" onClick={() => setCancelModalApp(null)}>
                <XCircle size={18} />
              </button>
            </div>
            <form onSubmit={handleCancelSubmit}>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Are you sure you want to cancel your consultation with{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{cancelModalApp.doctorName}</strong> on {formatDate(cancelModalApp.appointmentDate)} at {formatTime(cancelModalApp.startTime)}?
                </p>
                <div className="form-group">
                  <label className="form-label">Cancellation Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Work conflict, feeling better"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCancelModalApp(null)}
                  disabled={cancelling}
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
