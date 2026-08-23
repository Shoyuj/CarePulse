import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../api/client';
import { useToast } from '../components/Toast';
import { formatDate } from '../utils/formatters';
import { Pill, Sparkles, FileText, Calendar, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

export default function PrescriptionsPage() {
  const { addToast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await prescriptionApi.getMyPrescriptions();
      setPrescriptions(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch digital prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF3E8 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1.5px solid var(--palette-slate-border)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--palette-terracotta-dark)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.4rem', background: 'var(--palette-terracotta-light)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
            <FileText size={16} />
            <span>Digital Pharmacy & Medical Records</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>Prescriptions & AI Advice</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Access verified digital prescriptions, medication schedules, and Gemini AI plain-English treatment advice.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your prescriptions...
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#FFFFFF' }}>
          <Pill size={48} color="var(--palette-slate-grey)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Prescriptions Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
            When a doctor completes a consultation and issues medication orders, your digital prescription and AI advice will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="glass-panel"
              style={{
                padding: '1.75rem',
                background: '#FFFFFF',
                border: '1.5px solid var(--palette-slate-border)'
              }}
            >
              {/* Rx Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--palette-slate-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--palette-terracotta-light)',
                      color: 'var(--palette-terracotta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid var(--palette-terracotta)'
                    }}
                  >
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Rx #{rx.id?.substring(0, 8).toUpperCase()}</h3>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Prescribed by <strong style={{ color: 'var(--text-primary)' }}>{rx.doctorName}</strong> on {formatDate(rx.createdAt)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-confirmed)', fontSize: '0.85rem', fontWeight: 700, background: 'var(--status-confirmed-bg)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
                  <ShieldCheck size={16} />
                  <span>Verified Medical Rx</span>
                </div>
              </div>

              {/* Gemini AI Plain English Summary */}
              {rx.aiPatientSummary && (
                <div className="ai-summary-card" style={{ marginTop: 0, marginBottom: '1.25rem' }}>
                  <div className="ai-pill-header">
                    <Sparkles size={15} />
                    <span>Gemini AI Plain-English Care Summary & Advice</span>
                  </div>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {rx.aiPatientSummary}
                  </p>
                </div>
              )}

              {/* Doctor Clinical Notes */}
              {rx.clinicalNotes && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Doctor's Diagnosis & Notes
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--palette-cream)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--palette-slate-border)' }}>
                    {rx.clinicalNotes}
                  </div>
                </div>
              )}

              {/* Prescribed Medications Table */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Prescribed Medications ({rx.medications?.length || 0})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {rx.medications?.map((med, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--palette-slate-light)',
                        border: '1px solid var(--palette-slate-border)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {med.medicineName}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--palette-teal-dark)', background: 'var(--palette-teal-light)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          {med.dosage}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Frequency: <strong>{med.frequency?.replace('_', ' ')}</strong> • Timing: <strong>{med.timing?.replace('_', ' ')}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} color="var(--palette-terracotta)" /> {med.reminderTimes || 'Standard'}
                        </span>
                        <span>Duration: {med.durationDays} days</span>
                      </div>

                      {med.instructions && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--palette-terracotta-dark)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                          Note: {med.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow up instructions */}
              {(rx.followUpInstructions || rx.followUpDate) && (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--palette-cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--palette-slate-border)', fontSize: '0.85rem' }}>
                  <Calendar size={18} color="var(--palette-terracotta)" />
                  <div>
                    <strong>Follow-up Scheduled:</strong> {formatDate(rx.followUpDate)} — {rx.followUpInstructions || 'Routine review'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
