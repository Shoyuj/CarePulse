const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Token management
 */
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

/**
 * Generic Fetch wrapper with JSON parsing and Authorization header
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // Handle ICS/Text downloads
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/calendar')) {
    if (!response.ok) throw new Error('Failed to download calendar event');
    return response.text();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// -------------------------------------------------------------
// Auth API
// -------------------------------------------------------------
export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me', { method: 'GET' })
};

// -------------------------------------------------------------
// Doctor Directory & Slots API
// -------------------------------------------------------------
export const doctorApi = {
  getAll: (search = '') => request(`/doctors${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id) => request(`/doctors/${id}`),
  getLeaves: (id) => request(`/doctors/${id}/leaves`),
  getSlots: (id, date) => request(`/doctors/${id}/slots?date=${date}`)
};

// -------------------------------------------------------------
// Appointment & Booking API
// -------------------------------------------------------------
export const appointmentApi = {
  holdSlot: (holdRequest) => request('/appointments/hold', { method: 'POST', body: holdRequest }),
  confirmBooking: (confirmRequest) => request('/appointments/confirm', { method: 'POST', body: confirmRequest }),
  getMyAppointments: () => request('/appointments/my-appointments'),
  getDoctorAppointments: () => request('/appointments/doctor-appointments'),
  getById: (id) => request(`/appointments/${id}`),
  cancel: (id, reason) => request(`/appointments/${id}/cancel`, { method: 'POST', body: { reason } }),
  downloadIcs: async (id) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/appointments/ics/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch ICS file');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-${id}.ics`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// -------------------------------------------------------------
// Prescription & Clinical Notes API
// -------------------------------------------------------------
export const prescriptionApi = {
  submitClinicalNotes: (appointmentId, notesData) =>
    request(`/prescriptions/${appointmentId}`, { method: 'POST', body: notesData }),
  getMyPrescriptions: () => request('/prescriptions/my-prescriptions'),
  getByAppointmentId: (appointmentId) => request(`/prescriptions/by-appointment/${appointmentId}`)
};

// -------------------------------------------------------------
// Admin API
// -------------------------------------------------------------
export const adminApi = {
  createDoctor: (doctorData) => request('/admin/doctors', { method: 'POST', body: doctorData }),
  updateDoctor: (id, doctorData) => request(`/admin/doctors/${id}`, { method: 'PUT', body: doctorData }),
  applyDoctorLeave: (id, leaveData) => request(`/admin/doctors/${id}/leaves`, { method: 'POST', body: leaveData }),
  getAllAppointments: () => request('/admin/appointments'),
  getNotificationLogs: () => request('/admin/notifications'),
  triggerMedicationReminders: () => request('/admin/scheduler/trigger-reminders', { method: 'POST' }),
  getAiUsage: () => request('/admin/ai-usage')
};
