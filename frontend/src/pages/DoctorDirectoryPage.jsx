import React, { useState, useEffect } from 'react';
import { doctorApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { formatTime, formatInr } from '../utils/formatters';
import { 
  Search, Stethoscope, Clock, Calendar, Award, ChevronRight, 
  Sparkles, CheckCircle2, ShieldCheck, Zap, HeartPulse, X, Activity, 
  Heart, User, MapPin, Building2
} from 'lucide-react';

const SPECIALTIES = [
  { id: 'ALL', name: 'All Doctors', icon: HeartPulse, count: '24 Specialists' },
  { id: 'Cardiology', name: 'Cardiology', icon: Heart, count: 'Heart & BP' },
  { id: 'Dermatology', name: 'Dermatology', icon: Sparkles, count: 'Skin & Hair' },
  { id: 'Orthopedics', name: 'Orthopedics', icon: Activity, count: 'Joints & Bones' },
  { id: 'Pediatrics', name: 'Pediatrics', icon: Stethoscope, count: 'Child Health' },
  { id: 'General Medicine', name: 'General Physician', icon: ShieldCheck, count: 'Fever & Flu' },
  { id: 'Neurology', name: 'Neurology', icon: Zap, count: 'Brain & Spine' },
  { id: 'Gynecology', name: 'Gynecology', icon: HeartPulse, count: "Women's Health" },
  { id: 'ENT', name: 'ENT Specialist', icon: Stethoscope, count: 'Ear, Nose, Throat' },
  { id: 'Pulmonology', name: 'Pulmonology', icon: Activity, count: 'Lungs & Asthma' },
  { id: 'Gastroenterology', name: 'Gastroenterology', icon: ShieldCheck, count: 'Stomach & Liver' },
  { id: 'Psychiatry', name: 'Psychiatry', icon: Sparkles, count: 'Mental Wellness' },
  { id: 'Oncology', name: 'Oncology', icon: Award, count: 'Cancer Care' },
  { id: 'Dental Surgery', name: 'Dental Surgery', icon: Stethoscope, count: 'Teeth & Aligners' },
  { id: 'Ayurveda', name: 'Ayurveda', icon: HeartPulse, count: 'Natural Care' },
  { id: 'Physiotherapy', name: 'Physiotherapy', icon: Activity, count: 'Rehab & Recovery' }
];

const POPULAR_SEARCH_TAGS = [
  { label: 'Rajpur Road', specialty: 'ALL' },
  { label: 'Dalanwala', specialty: 'ALL' },
  { label: 'Ballupur', specialty: 'ALL' },
  { label: 'Max Hospital', specialty: 'ALL' },
  { label: 'Synergy Hospital', specialty: 'ALL' },
  { label: 'Cardiology', specialty: 'Cardiology' },
  { label: 'Dermatology', specialty: 'Dermatology' },
  { label: 'Orthopedics', specialty: 'Orthopedics' },
  { label: 'Child Specialist', specialty: 'Pediatrics' },
  { label: 'Fever & Dengue', specialty: 'General Medicine' }
];

export default function DoctorDirectoryPage({ onBookDoctor }) {
  const { user, isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchDoctors = async (query = '') => {
    setLoading(true);
    try {
      const data = await doctorApi.getAll(query);
      setDoctors(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch doctors list', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search for instant symptom/doctor lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  const handleSpecialtyClick = (specialtyId) => {
    setSelectedSpecialty(specialtyId);
    if (specialtyId === 'ALL') {
      setSearch('');
    } else {
      setSearch(specialtyId);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSelectedSpecialty('ALL');
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedSpecialty !== 'ALL' && doc.specialization !== selectedSpecialty) {
      return false;
    }
    return true;
  });

  const featuredDoc = doctors[0];

  return (
    <div>
      {/* 2-Column Split Hero Layout - Dehradun Edition */}
      <div className="docgenie-hero">
        <div className="docgenie-hero-grid">
          {/* Left Column: Headline, Dehradun Region Badge & Search */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.9rem',
                background: '#FFFFFF',
                border: '1px solid var(--palette-terracotta)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--palette-terracotta-dark)',
                fontSize: '0.825rem',
                fontWeight: 700,
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(229, 154, 101, 0.12)'
              }}
            >
              <MapPin size={15} color="var(--palette-terracotta)" />
              <span>Dehradun & Uttarakhand's Trusted Healthcare Network</span>
            </div>

            <h1
              style={{
                fontSize: '2.8rem',
                lineHeight: 1.15,
                marginBottom: '0.85rem',
                color: 'var(--text-primary)',
                fontWeight: 800
              }}
            >
              Consult Top Doctors In <br />
              <span style={{ color: 'var(--palette-terracotta)' }}>Dehradun</span> Online & In-Clinic.
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.25rem', lineHeight: 1.55 }}>
              Connect with leading specialists across Max Hospital, Synergy, Jolly Grant & Dehradun clinics. Real-time <strong>5-minute slot lock</strong> with <strong>Gemini AI pre-visit clinical triage</strong>.
            </p>

            {/* Trust Bullet Checks */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={17} color="var(--status-confirmed)" />
                <span>Verified MD / MS Specialists</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={17} color="var(--status-confirmed)" />
                <span>Zero Double Booking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={17} color="var(--status-confirmed)" />
                <span>Digital Rx & Indian Medication Advice</span>
              </div>
            </div>

            {/* Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                gap: '0.5rem',
                background: '#FFFFFF',
                padding: '0.35rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 6px 20px rgba(71, 85, 105, 0.08)',
                border: '1.5px solid var(--palette-slate-border)',
                marginBottom: '1rem'
              }}
            >
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search
                  size={20}
                  style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{
                    paddingLeft: '2.75rem',
                    paddingRight: search ? '2.5rem' : '1rem',
                    height: '46px',
                    border: 'none',
                    boxShadow: 'none',
                    fontSize: '0.975rem'
                  }}
                  placeholder="Search doctor, specialty, area (Rajpur Rd, Dalanwala, fever, knee pain)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (selectedSpecialty !== 'ALL' && e.target.value.toLowerCase() !== selectedSpecialty.toLowerCase()) {
                      setSelectedSpecialty('ALL');
                    }
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    style={{ position: 'absolute', right: '0.8rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '46px', padding: '0 1.5rem', fontSize: '0.95rem' }}
              >
                Search
              </button>
            </form>

            {/* Popular Search Tags */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
                Popular in Dehradun:
              </span>
              {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearch(tag.label);
                    setSelectedSpecialty(tag.specialty);
                    fetchDoctors(tag.label);
                  }}
                  className="tag-pill"
                  style={{ fontSize: '0.775rem', padding: '0.3rem 0.75rem' }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Spotlight Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {featuredDoc ? (
              <div
                className="glass-panel"
                style={{
                  background: '#FFFFFF',
                  padding: '1.75rem',
                  border: '1.5px solid var(--palette-slate-border)',
                  boxShadow: '0 15px 35px rgba(71, 85, 105, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-confirmed)', fontSize: '0.8rem', fontWeight: 700 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-confirmed)', animation: 'pulse 1.5s infinite' }} />
                    <span>Doctor Available Today</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dehradun Spotlight</span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #E59A65 0%, #7AAEC0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0
                    }}
                  >
                    <Stethoscope size={30} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>{featuredDoc.fullName || featuredDoc.doctorName}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--palette-teal-dark)', fontWeight: 700 }}>
                      {featuredDoc.specialization}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'var(--palette-cream)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fee: <strong style={{ color: 'var(--palette-terracotta-dark)' }}>{formatInr(featuredDoc.consultationFee)}</strong></span>
                  <span>Hours: <strong>{formatTime(featuredDoc.workingHoursStart)} - {formatTime(featuredDoc.workingHoursEnd)}</strong></span>
                </div>

                <button
                  onClick={() => onBookDoctor(featuredDoc)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  <Calendar size={16} />
                  <span>Book Immediate Consultation</span>
                </button>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: '#FFFFFF' }}>
                <Stethoscope size={36} color="var(--palette-teal)" style={{ margin: '0 auto 0.5rem' }} />
                <h4>Dehradun Medical Network</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top specialists ready to consult.</p>
              </div>
            )}

            {/* AI Triage Mini Highlight */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: 'var(--palette-teal-light)',
                border: '1px solid #D5E7EE',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <Sparkles size={22} color="var(--palette-teal-dark)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <strong>Automated AI Intake:</strong> Gemini summarizes your symptoms into a structured clinical briefing before your call.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consult by Specialty Grid */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Consult Doctors by Speciality in Dehradun
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select a medical department to find verified local practitioners.
          </p>
        </div>

        <div className="specialty-grid">
          {SPECIALTIES.map((spec) => {
            const IconComp = spec.icon;
            const isSelected = selectedSpecialty === spec.id;

            return (
              <div
                key={spec.id}
                onClick={() => handleSpecialtyClick(spec.id)}
                className={`specialty-card ${isSelected ? 'active' : ''}`}
                style={{ padding: '1rem 0.5rem' }}
              >
                <div className="specialty-icon-circle">
                  <IconComp size={22} />
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {spec.name}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {spec.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works: 3-Step Journey */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--palette-terracotta-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Simple 3-Step Process
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            How CarePulse Dehradun Works
          </h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--palette-cream)', color: 'var(--palette-terracotta-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Calendar size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Choose Doctor & Slot</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Pick your preferred specialist in Dehradun, select a date, and lock your slot for 5 minutes with zero double-booking.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--palette-teal-light)', color: 'var(--palette-teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Gemini AI Triage</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Describe your symptoms. Clinical AI analyzes urgency and prepares diagnostic questions for your consultation.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--palette-cream-dark)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Consult & Instant Rx</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Receive verified digital prescriptions, plain-English patient advice, automated medication reminders, and calendar links.
            </p>
          </div>
        </div>
      </div>

      {/* Main Doctor Roster Section Header */}
      <div id="doctors-list" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.7rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {selectedSpecialty === 'ALL' ? 'All Dehradun Medical Specialists' : `${selectedSpecialty} Specialists in Dehradun`}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Book your consultation slot with transparent INR fees and verified qualifications.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {selectedSpecialty !== 'ALL' && (
            <button
              onClick={() => handleSpecialtyClick('ALL')}
              className="btn btn-secondary btn-sm"
            >
              Clear Filter ({selectedSpecialty})
            </button>
          )}
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--palette-teal-dark)', background: 'var(--palette-teal-light)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
            {filteredDoctors.length} Doctors Available
          </span>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Dehradun healthcare specialists...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: '#FFFFFF' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            No doctors found matching "{search}".
          </p>
          <button onClick={clearSearch} className="btn btn-secondary">
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="doctors-grid">
          {filteredDoctors.map((doc) => {
            const docName = doc.fullName || doc.doctorName || 'Doctor';
            const qualifications = doc.qualification || doc.qualifications || 'Certified Medical Practitioner';
            const startHour = formatTime(doc.workingHoursStart) || '09:00';
            const endHour = formatTime(doc.workingHoursEnd) || '17:00';

            const isSelfDoctor = isAuthenticated && user && (
              (user.id && doc.userId && user.id === doc.userId) ||
              (user.email && doc.email && user.email.toLowerCase() === doc.email.toLowerCase())
            );

            return (
              <div
                key={doc.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                  border: '1.5px solid var(--palette-slate-border)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #E59A65 0%, #7AAEC0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(229, 154, 101, 0.25)',
                        flexShrink: 0
                      }}
                    >
                      <Stethoscope size={28} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{docName}</h3>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.65rem',
                          background: 'var(--palette-teal-light)',
                          color: 'var(--palette-teal-dark)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.775rem',
                          fontWeight: 700
                        }}
                      >
                        {doc.specialization}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={16} color="var(--palette-terracotta)" />
                    <span>{qualifications}</span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                    {doc.bio || 'Experienced specialist committed to delivering evidence-based patient healthcare in Dehradun.'}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.6rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--palette-cream)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--palette-slate-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <Clock size={15} color="var(--palette-teal-dark)" />
                      <span>{startHour} - {endHour}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--palette-terracotta-dark)', fontSize: '0.95rem' }}>{formatInr(doc.consultationFee)}</span>
                      <span>fee</span>
                    </div>
                  </div>
                </div>

                {isSelfDoctor ? (
                  <button
                    disabled
                    className="btn btn-secondary"
                    style={{ width: '100%', gap: '0.5rem', padding: '0.75rem 1rem', opacity: 0.65, cursor: 'not-allowed' }}
                    title="You are logged in as this doctor. You cannot book an appointment with yourself."
                  >
                    <User size={16} />
                    <span>Your Doctor Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="btn btn-primary"
                    style={{ width: '100%', gap: '0.5rem', padding: '0.75rem 1rem' }}
                  >
                    <Calendar size={16} />
                    <span>Book Consultation</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
