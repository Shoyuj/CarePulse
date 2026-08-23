import React, { useState } from 'react';
import { prescriptionApi } from '../api/client';
import { useToast } from './Toast';
import { parseSuggestedQuestions } from '../utils/formatters';
import AiTriageBadge from './AiTriageBadge';
import { X, Plus, Trash2, Sparkles, Check, Stethoscope, Pill, FileText } from 'lucide-react';

export default function DoctorConsultationModal({ appointment, isOpen, onClose, onSuccess }) {
  const { addToast } = useToast();

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });

  const [medications, setMedications] = useState([
    {
      medicineName: '',
      dosage: '1 Tablet',
      frequency: 'TWICE_DAILY',
      timing: 'AFTER_MEAL',
      durationDays: 5,
      reminderTimes: '08:00,20:00',
      instructions: 'Take after meals with water'
    }
  ]);

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleAddMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        medicineName: '',
        dosage: '1 Tablet',
        frequency: 'ONCE_DAILY',
        timing: 'AFTER_MEAL',
        durationDays: 7,
        reminderTimes: '08:00',
        instructions: ''
      }
    ]);
  };

  const handleRemoveMedication = (index) => {
    setMedications((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index, field, value) => {
    setMedications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) {
      addToast('Please enter your clinical diagnosis and notes.', 'error');
      return;
    }

    const validMeds = medications.filter((m) => m.medicineName.trim());

    setSubmitting(true);
    try {
      const payload = {
        clinicalNotes,
        followUpInstructions,
        followUpDate: followUpDate || null,
        medications: validMeds
      };

      const result = await prescriptionApi.submitClinicalNotes(appointment.id, payload);
      addToast('Consultation saved & AI patient summary generated!', 'success');
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to submit consultation notes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--palette-teal-light)',
                color: 'var(--palette-teal-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--palette-teal)'
              }}
            >
              <Stethoscope size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Doctor Consultation & Digital Prescription</h3>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Patient: <strong style={{ color: 'var(--text-primary)' }}>{appointment.patientName}</strong> • {appointment.appointmentDate}
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Pre-Visit AI Triage Insights */}
            <div className="ai-summary-card" style={{ marginTop: 0, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div className="ai-pill-header">
                  <Sparkles size={14} />
                  <span>Pre-Visit AI Triage Briefing</span>
                </div>
                <AiTriageBadge urgency={appointment.aiUrgencyLevel} />
              </div>

              <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Patient Symptoms:</strong>{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{appointment.patientSymptoms || 'No symptoms reported.'}</span>
              </div>

              {appointment.aiSuggestedQuestions && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    AI Recommended Diagnostic Inquiry:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {parseSuggestedQuestions(appointment.aiSuggestedQuestions).map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Doctor Clinical Notes */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} color="var(--palette-terracotta)" />
                <span>Doctor's Clinical Notes & Diagnosis</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter objective clinical findings, diagnosis, and treatment advice..."
                required
              />
            </div>

            {/* Medications Builder */}
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <Pill size={18} color="var(--palette-teal-dark)" />
                  <span>Prescribed Medications & Schedules</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.3rem' }}
                >
                  <Plus size={14} />
                  <span>Add Medicine</span>
                </button>
              </div>

              {medications.map((med, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--palette-cream-light)',
                    border: '1.5px solid var(--palette-slate-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: '0.6rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                      value={med.medicineName}
                      onChange={(e) => handleMedChange(idx, 'medicineName', e.target.value)}
                      style={{ padding: '0.55rem 0.75rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dosage (e.g. 1 Tab)"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                      style={{ padding: '0.55rem 0.75rem' }}
                    />
                    <select
                      className="form-select"
                      value={med.frequency}
                      onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                      style={{ padding: '0.55rem 0.75rem' }}
                    >
                      <option value="ONCE_DAILY">Once Daily</option>
                      <option value="TWICE_DAILY">Twice Daily</option>
                      <option value="THREE_TIMES_DAILY">3 Times Daily</option>
                      <option value="FOUR_TIMES_DAILY">4 Times Daily</option>
                      <option value="AS_NEEDED">As Needed (SOS)</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      placeholder="Days"
                      value={med.durationDays}
                      onChange={(e) => handleMedChange(idx, 'durationDays', parseInt(e.target.value) || 1)}
                      style={{ padding: '0.55rem 0.75rem' }}
                    />
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="icon-btn"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.6rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Reminder Hours (e.g. 08:00, 20:00)"
                      value={med.reminderTimes}
                      onChange={(e) => handleMedChange(idx, 'reminderTimes', e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Special instructions (e.g. Take with food)"
                      value={med.instructions}
                      onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Follow-up Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={followUpDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Blood pressure monitoring, return if rash spreads"
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !clinicalNotes.trim()}>
              {submitting ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Generating AI Post-Visit Summary...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Complete Consultation & Prescribe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
