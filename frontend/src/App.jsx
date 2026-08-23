import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import BookingModal from './components/BookingModal';
import DoctorDirectoryPage from './pages/DoctorDirectoryPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PrescriptionsPage from './pages/PrescriptionsPage';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function AppContent() {
  const { user, isDoctor, isAdmin } = useAuth();

  const [currentTab, setCurrentTab] = useState('doctors');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  // Dynamically set default landing tab when role changes
  useEffect(() => {
    if (isDoctor) {
      setCurrentTab('doctor-dashboard');
    } else if (isAdmin) {
      setCurrentTab('admin-dashboard');
    } else {
      if (currentTab === 'doctor-dashboard' || currentTab === 'admin-dashboard') {
        setCurrentTab('doctors');
      }
    }
  }, [user?.role]);

  const handleBookDoctor = (doctor) => {
    setSelectedDoctorForBooking(doctor);
  };

  const handleBookingSuccess = () => {
    setSelectedDoctorForBooking(null);
    setCurrentTab('my-appointments');
  };

  return (
    <div className="app-container">
      {/* Top Glassmorphic Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {currentTab === 'doctors' && (
          <DoctorDirectoryPage onBookDoctor={handleBookDoctor} />
        )}

        {currentTab === 'my-appointments' && (
          <PatientDashboard
            onBrowseDoctors={() => setCurrentTab('doctors')}
            onViewPrescriptions={() => setCurrentTab('my-prescriptions')}
          />
        )}

        {currentTab === 'doctor-dashboard' && (
          <DoctorDashboard />
        )}

        {currentTab === 'my-prescriptions' && (
          <PrescriptionsPage />
        )}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboard />
        )}
      </main>

      {/* Site Footer */}
      <Footer onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Interactive Booking Modal with 5-min Hold & AI Triage */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
