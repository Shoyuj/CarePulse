import React, { useState, useEffect } from 'react';
import { adminApi, doctorApi } from '../api/client';
import { useToast } from '../components/Toast';
import { formatTime, formatDate, formatInr } from '../utils/formatters';
import { Shield, Users, Calendar, Mail, Plus, Play, AlertTriangle, RefreshCw, CheckCircle2, Clock, DollarSign, Stethoscope, Sparkles, Zap } from 'lucide-react';

export default function AdminDashboard() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // overview, doctors, leaves, notifications
  const [loading, setLoading] = useState(true);

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiUsage, setAiUsage] = useState(null);

  // Modals / Forms
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'doctor123',
    specialization: 'Cardiology',
    qualifications: '',
    bio: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    slotDurationMinutes: 30,
    consultationFee: 600.0
  });

  // Leave Form
  const [leaveDoctorId, setLeaveDoctorId] = useState('');
  const [leaveDate, setLeaveDate] = useState(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  });
  const [leaveReason, setLeaveReason] = useState('Medical Leave');
  const [applyingLeave, setApplyingLeave] = useState(false);
  const [leaveResult, setLeaveResult] = useState(null);

  // Trigger Scheduler
  const [triggeringScheduler, setTriggeringScheduler] = useState(false);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [apps, docs, notifs, aiData] = await Promise.all([
        adminApi.getAllAppointments().catch(() => []),
        doctorApi.getAll().catch(() => []),
        adminApi.getNotifications().catch(() => []),
        adminApi.getAiUsage().catch(() => null)
      ]);
      setAppointments(apps || []);
      setDoctors(docs || []);
      setNotifications(notifs || []);
      setAiUsage(aiData);
      if (docs?.length && !leaveDoctorId) {
        setLeaveDoctorId(docs[0].id);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createDoctorProfile(newDoctor);
      addToast('Doctor registered successfully!', 'success');
      setShowAddDoctorModal(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to register doctor', 'error');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveDoctorId) return;

    setApplyingLeave(true);
    setLeaveResult(null);
    try {
      const result = await adminApi.applyDoctorLeave({
        doctorId: leaveDoctorId,
        leaveDate,
        reason: leaveReason
      });
      setLeaveResult(result);
      addToast(`Doctor leave applied! ${result.cancelledAppointmentsCount || 0} overlapping consultations were automatically cancelled with notifications.`, 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to apply doctor leave', 'error');
    } finally {
      setApplyingLeave(false);
    }
  };

  const handleTriggerScheduler = async () => {
    setTriggeringScheduler(true);
    try {
      const res = await adminApi.triggerMedicationReminders();
      addToast(`Medication reminder scheduler executed! Dispatched reminders for upcoming doses.`, 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to trigger medication scheduler', 'error');
    } finally {
      setTriggeringScheduler(false);
    }
  };

  const confirmedApps = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedApps = appointments.filter((a) => a.status === 'COMPLETED').length;
  const totalApps = appointments.length;

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#8B5CF6', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.4rem', background: '#F3E8FF', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
            <Shield size={16} />
            <span>Clinic Administrator Console</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>Operations & Clinic Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Oversee medical staff, manage doctor leaves with automatic conflict cascade handling, and inspect system audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleTriggerScheduler}
            disabled={triggeringScheduler}
            className="btn btn-secondary btn-sm"
            style={{ background: 'var(--palette-terracotta-light)', borderColor: 'var(--palette-terracotta)', color: 'var(--palette-terracotta-dark)', fontWeight: 700 }}
          >
            <Play size={14} />
            <span>{triggeringScheduler ? 'Running...' : 'Run Medication Reminders'}</span>
          </button>

          <button
            onClick={loadAllAdminData}
            className="icon-btn"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Staff</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--palette-teal-dark)', marginTop: '0.2rem' }}>{doctors.length} Doctors</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Confirmed Bookings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-confirmed)', marginTop: '0.2rem' }}>{confirmedApps}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Completed Visits</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--palette-terracotta-dark)', marginTop: '0.2rem' }}>{completedApps}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Notifications Dispatched</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6', marginTop: '0.2rem' }}>{notifications.length}</div>
        </div>
      </div>

      {/* Gemini AI Rate Limiting & Quota Telemetry Banner */}
      {aiUsage && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#14532D', fontWeight: 700 }}>Gemini AI Rate Limiter & Quota Shield</h3>
                  <span style={{ fontSize: '0.725rem', background: '#DCFCE7', color: '#15803D', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>ACTIVE</span>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#166534' }}>
                  Limits active to prevent API overuse & avoid 429 quota exhaustion. Automatic zero-downtime fallback enabled.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Daily Quota</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D' }}>
                  {aiUsage.requestsToday} / {aiUsage.dailyQuotaLimit} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803D' }}>({aiUsage.remainingDailyQuota} left)</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Current RPM</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D' }}>
                  {aiUsage.requestsInCurrentMinute} / {aiUsage.requestsPerMinuteLimit} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803D' }}>RPM</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>User Cap</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D' }}>
                  {aiUsage.userHourlyLimit} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803D' }}>calls/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1.5px solid var(--palette-slate-border)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={14} />
          <span>All Appointments ({totalApps})</span>
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`btn btn-sm ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={14} />
          <span>Doctor Management</span>
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`btn btn-sm ${activeTab === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertTriangle size={14} />
          <span>Doctor Leaves & Conflicts</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`btn btn-sm ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Mail size={14} />
          <span>Email & Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: ALL APPOINTMENTS */}
      {activeTab === 'overview' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--palette-slate-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Patient</th>
                <th style={{ padding: '0.75rem 1rem' }}>Doctor</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>AI Triage</th>
                <th style={{ padding: '0.75rem 1rem' }}>Symptoms / Notes</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--palette-slate-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{app.patientName}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--palette-teal-dark)', fontWeight: 600 }}>{app.doctorName}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{formatDate(app.appointmentDate)} ({formatTime(app.startTime)})</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge badge-${app.status?.toLowerCase()}`}>{app.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: app.aiUrgencyLevel === 'HIGH' ? '#EA580C' : 'var(--status-confirmed)' }}>
                      {app.aiUrgencyLevel || 'Standard'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                    {app.aiChiefComplaint || app.patientSymptoms || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DOCTORS MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Clinic Medical Staff</h3>
            <button onClick={() => setShowAddDoctorModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Register New Doctor</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {doctors.map((doc) => {
              const docName = doc.fullName || doc.doctorName || 'Doctor';
              const qual = doc.qualification || doc.qualifications || '';
              const startH = formatTime(doc.workingHoursStart) || '09:00';
              const endH = formatTime(doc.workingHoursEnd) || '17:00';

              return (
                <div key={doc.id} className="glass-panel" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{docName}</h4>
                      <span style={{ color: 'var(--palette-teal-dark)', fontSize: '0.8rem', fontWeight: 700, background: 'var(--palette-teal-light)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>{doc.specialization}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--palette-terracotta-dark)' }}>{formatInr(doc.consultationFee)}/visit</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {qual}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--palette-cream)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--palette-slate-border)' }}>
                    <span>Hours: {startH} - {endH}</span>
                    <span>Slot: {doc.slotDurationMinutes}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR LEAVE & CONFLICT HANDLING */}
      {activeTab === 'leaves' && (
        <div style={{ maxWidth: '680px' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: 'var(--palette-terracotta-dark)' }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Apply Doctor Leave (Cascade Conflict Engine)</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              When a doctor takes leave, our transactional cascade engine marks the schedule, cancels overlapping appointments, releases held slots, and dispatches automated notifications to affected patients.
            </p>

            <form onSubmit={handleApplyLeave}>
              <div className="form-group">
                <label className="form-label">Select Doctor</label>
                <select
                  className="form-select"
                  value={leaveDoctorId}
                  onChange={(e) => setLeaveDoctorId(e.target.value)}
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName || d.doctorName} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Leave Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={leaveDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  className="form-input"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Medical Emergency, Conference"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={applyingLeave}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {applyingLeave ? 'Processing Cascade Cancellation...' : 'Submit Doctor Leave'}
              </button>
            </form>

            {leaveResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--palette-cream)', border: '1px solid var(--palette-terracotta)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-confirmed)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Doctor Leave Successfully Recorded</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Cancelled Consultations: <strong>{leaveResult.cancelledAppointmentsCount || 0}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS & EMAIL AUDIT LOGS */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto', background: '#FFFFFF', border: '1.5px solid var(--palette-slate-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--palette-slate-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Recipient</th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Subject / Message</th>
                <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} style={{ borderBottom: '1px solid var(--palette-slate-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{n.recipientEmail}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: 'var(--palette-slate-light)', borderRadius: 'var(--radius-sm)' }}>
                      {n.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: n.status === 'SENT' ? 'var(--status-confirmed)' : '#EA580C', fontWeight: 700 }}>
                      {n.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                    {n.subject || n.message}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {n.sentAt ? formatDate(n.sentAt) : 'Recently'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowAddDoctorModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Register Medical Doctor Profile</h3>
              <button className="icon-btn" onClick={() => setShowAddDoctorModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateDoctor}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Doctor Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newDoctor.fullName}
                      onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })}
                      placeholder="e.g. Dr. Emily Watson, MD"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                      placeholder="dr.watson@healthcare.com"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                      placeholder="e.g. Cardiology, Pediatrics"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualifications</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newDoctor.qualifications}
                      onChange={(e) => setNewDoctor({ ...newDoctor, qualifications: e.target.value })}
                      placeholder="e.g. MD (Cardiology) - Harvard"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Work Start</label>
                    <input
                      type="time"
                      className="form-input"
                      value={newDoctor.workingHoursStart}
                      onChange={(e) => setNewDoctor({ ...newDoctor, workingHoursStart: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work End</label>
                    <input
                      type="time"
                      className="form-input"
                      value={newDoctor.workingHoursEnd}
                      onChange={(e) => setNewDoctor({ ...newDoctor, workingHoursEnd: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (₹ INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newDoctor.consultationFee}
                      onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor Bio</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={newDoctor.bio}
                    onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                    placeholder="Brief background and expertise..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDoctorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
