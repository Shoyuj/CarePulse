import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { doctorApi, appointmentApi } from '../api/client';
import { formatTime, toApiTimeString, parseSuggestedQuestions, formatInr } from '../utils/formatters';
import HoldTimer from './HoldTimer';
import AiTriageBadge from './AiTriageBadge';
import { X, Calendar as CalIcon, Clock, Sparkles, Check, Download, CalendarPlus, ArrowRight, Stethoscope } from 'lucide-react';

export default function BookingModal({ doctor, isOpen, onClose, onBookingSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Pick Slot, 2: Symptoms & Hold, 3: Success & AI Summary
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Hold State
  const [heldAppointment, setHeldAppointment] = useState(null);
  const [holdingSlot, setHoldingSlot] = useState(false);

  // Symptoms & Confirmation
  const [symptoms, setSymptoms] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const docName = doctor?.fullName || doctor?.doctorName || 'Doctor';

  // Fetch slots whenever date or doctor changes
  useEffect(() => {
    if (!isOpen || !doctor) return;

    let isMounted = true;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const slotData = await doctorApi.getSlots(doctor.id, selectedDate);
        if (isMounted) {
          setSlots(slotData || []);
        }
      } catch (err) {
        if (isMounted) {
          addToast(err.message || 'Failed to load time slots for selected date', 'error');
          setSlots([]);
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => { isMounted = false; };
  }, [isOpen, doctor, selectedDate, addToast]);

  if (!isOpen || !doctor) return null;

  // Step 1: Hold Slot Action
  const handleHoldSlot = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in or register to book an appointment.', 'error');
      return;
    }

    // Self-booking prohibition (matched by user ID and email)
    if (user && doctor && (
      (user.id && doctor.userId && user.id === doctor.userId) ||
      (user.email && doctor.email && user.email.toLowerCase() === doctor.email.toLowerCase())
    )) {
      addToast('Doctors cannot book a consultation appointment with themselves. Please select another specialist doctor.', 'error');
      return;
    }

    if (!selectedSlot) {
      addToast('Please select a time slot first.', 'error');
      return;
    }

    setHoldingSlot(true);
    try {
      const resp = await appointmentApi.holdSlot({
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        startTime: toApiTimeString(selectedSlot.startTime),
        endTime: toApiTimeString(selectedSlot.endTime)
      });
      setHeldAppointment(resp);
      setStep(2);
      addToast('Slot held for 5 minutes! Please describe your symptoms.', 'info');
    } catch (err) {
      addToast(err.message || 'Unable to hold this slot. It may have just been booked.', 'error');
      const updated = await doctorApi.getSlots(doctor.id, selectedDate).catch(() => []);
      setSlots(updated);
    } finally {
      setHoldingSlot(false);
    }
  };

  // Step 2: Confirm Booking & Run AI Triage
  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      addToast('Please describe your symptoms to help the doctor prepare.', 'error');
      return;
    }

    setConfirming(true);
    try {
      const confirmed = await appointmentApi.confirmBooking({
        appointmentId: heldAppointment.appointmentId,
        patientSymptoms: symptoms
      });
      setConfirmedAppointment(confirmed);
      setStep(3);
      addToast('Appointment confirmed with AI pre-visit triage!', 'success');
      if (onBookingSuccess) onBookingSuccess(confirmed);
    } catch (err) {
      addToast(err.message || 'Confirmation failed. Your hold may have expired.', 'error');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--palette-terracotta-light)',
                color: 'var(--palette-terracotta-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--palette-terracotta)'
              }}
            >
              <Stethoscope size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                {step === 1 && `Consult with ${docName}`}
                {step === 2 && 'Pre-Visit AI Symptom Intake'}
                {step === 3 && 'Consultation Confirmed!'}
              </h3>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {doctor.specialization} • <strong style={{ color: 'var(--palette-terracotta-dark)' }}>{formatInr(doctor.consultationFee)}</strong> consultation fee
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* STEP 1: Date & Time Slot Selection */}
          {step === 1 && (
            <div>
              <div className="form-group">
                <label className="form-label">1. Choose Consultation Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>2. Select an Available Time Slot</label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Slot duration: {doctor.slotDurationMinutes || 30} mins
                  </span>
                </div>

                {loadingSlots ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Checking real-time slot availability...
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--palette-cream)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '1px solid var(--palette-slate-border)' }}>
                    No consultation slots available on this date. Doctor may be off-duty or on approved leave.
                  </div>
                ) : (
                  <div className="slot-grid">
                    {slots.map((slot, idx) => {
                      const startStr = formatTime(slot.startTime);
                      const isSelected = formatTime(selectedSlot?.startTime) === startStr;

                      // Check if slot time is in the past for today's date
                      const todayIso = new Date().toISOString().split('T')[0];
                      const isToday = selectedDate === todayIso;
                      let isPastSlot = false;

                      if (isToday && slot.startTime) {
                        let slotHours = 0;
                        let slotMinutes = 0;
                        if (typeof slot.startTime === 'string') {
                          const parts = slot.startTime.split(':');
                          slotHours = parseInt(parts[0], 10);
                          slotMinutes = parseInt(parts[1], 10);
                        } else if (Array.isArray(slot.startTime)) {
                          slotHours = slot.startTime[0];
                          slotMinutes = slot.startTime[1];
                        }
                        const now = new Date();
                        if (slotHours < now.getHours() || (slotHours === now.getHours() && slotMinutes <= now.getMinutes())) {
                          isPastSlot = true;
                        }
                      }

                      const isAvailable = (slot.available === true || slot.status === 'AVAILABLE') && !isPastSlot;
                      const isHeldByMe = slot.heldByCurrentUser === true || slot.status === 'HELD_BY_CURRENT_USER';
                      const isDisabled = (!isAvailable && !isHeldByMe) || isPastSlot;

                      let pillClass = 'slot-pill';
                      let statusText = isPastSlot ? 'Passed' : isHeldByMe ? 'Your Hold' : slot.booked ? 'Booked' : slot.held ? 'Held' : 'Available';

                      if (isSelected) pillClass += ' selected';
                      else if (isHeldByMe) pillClass += ' held-by-me';
                      else if (isAvailable) pillClass += ' available';
                      else pillClass += ' disabled';

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setSelectedSlot(slot)}
                          className={pillClass}
                          title={isPastSlot ? 'This time slot has already passed today' : undefined}
                        >
                          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{startStr}</div>
                          <div style={{ fontSize: '0.675rem', opacity: 0.85, textTransform: 'capitalize' }}>
                            {statusText}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--palette-teal-light)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #D5E7EE',
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'center'
                }}
              >
                <Clock size={22} color="var(--palette-teal-dark)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Selecting a slot activates a <strong>5-minute concurrency hold</strong> while you enter your pre-visit symptoms.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Symptoms & Live 5-Min Hold */}
          {step === 2 && (
            <div>
              {heldAppointment && (
                <HoldTimer
                  expiresAt={heldAppointment.holdExpiresAt || heldAppointment.expiresAt}
                  durationSeconds={heldAppointment.holdDurationSeconds || 300}
                  onExpired={() => {
                    addToast('Slot hold duration expired. Please select a time slot again.', 'error');
                    setStep(1);
                  }}
                />
              )}

              <form onSubmit={handleConfirm}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={16} color="var(--palette-terracotta)" />
                      <span>Pre-Visit Symptom Questionnaire</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--palette-terracotta-dark)', fontWeight: 700, background: 'var(--palette-terracotta-light)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                      Powered by Gemini AI
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    Describe your symptoms, duration, and any discomfort. Our clinical AI will assess the urgency level and prepare a diagnostic briefing for {docName}.
                  </p>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Mild chest tightness when climbing stairs for 3 days, easily fatigued, no prior cardiac issues..."
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStep(1)}
                    disabled={confirming}
                  >
                    Back to Slots
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={confirming || !symptoms.trim()}
                  >
                    {confirming ? (
                      <>
                        <Sparkles size={16} className="animate-spin" />
                        <span>Analyzing & Confirming...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Confirm & Analyze AI Triage</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Success Confirmation Screen */}
          {step === 3 && confirmedAppointment && (
            <div>
              <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--status-confirmed-bg)',
                    color: 'var(--status-confirmed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    border: '2px solid #A7F3D0'
                  }}
                >
                  <Check size={36} />
                </div>
                <h4 style={{ fontSize: '1.45rem', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                  Appointment Successfully Confirmed!
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Your consultation with <strong>{confirmedAppointment.doctorName || docName}</strong> is scheduled for{' '}
                  <span style={{ color: 'var(--palette-terracotta-dark)', fontWeight: 700 }}>{confirmedAppointment.appointmentDate}</span> at{' '}
                  <span style={{ color: 'var(--palette-terracotta-dark)', fontWeight: 700 }}>{formatTime(confirmedAppointment.startTime)}</span>.
                </p>
              </div>

              {/* Gemini AI Pre-visit Triage Results */}
              <div className="ai-summary-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="ai-pill-header">
                    <Sparkles size={14} />
                    <span>Gemini Pre-Visit Clinical Triage</span>
                  </div>
                  <AiTriageBadge urgency={confirmedAppointment.aiUrgencyLevel} />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Chief Complaint Summary</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem', fontWeight: 600 }}>
                    {confirmedAppointment.aiChiefComplaint || confirmedAppointment.patientSymptoms}
                  </div>
                </div>

                {confirmedAppointment.aiSuggestedQuestions && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Suggested Clinical Assessment Points
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {parseSuggestedQuestions(confirmedAppointment.aiSuggestedQuestions).map((q, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Calendar Sync Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
                {confirmedAppointment.googleCalendarLink && (
                  <a
                    href={confirmedAppointment.googleCalendarLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ background: 'var(--palette-cream)', borderColor: 'var(--palette-terracotta)', color: 'var(--palette-terracotta-dark)', fontWeight: 600 }}
                  >
                    <CalendarPlus size={16} />
                    <span>Add to Google Calendar</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => appointmentApi.downloadIcs(confirmedAppointment.id)}
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={16} />
                  <span>Download .ICS File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {step === 1 && (
            <>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleHoldSlot}
                disabled={!selectedSlot || holdingSlot}
              >
                {holdingSlot ? 'Locking Slot...' : 'Lock Slot & Continue (5 Mins)'}
                <ArrowRight size={16} />
              </button>
            </>
          )}

          {step === 3 && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={onClose}
            >
              Done & Return to Consultations
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
