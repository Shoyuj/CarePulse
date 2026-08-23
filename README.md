# 🏥 CarePulse - Healthcare Appointment & Follow-up Manager

> An enterprise-grade, full-stack healthcare scheduling and clinical follow-up platform built with **Spring Boot 3 (Java 17)**, **React 18 (Vite)**, and **Google Gemini 3.6 Flash AI**.

---

## 🌐 Hosted Live Application

* **Frontend UI (Netlify)**: [https://carepulseify.netlify.app](https://carepulseify.netlify.app) *(or your Netlify URL)*
* **Backend API (Render)**: [https://carepulse-healthcare-backend.onrender.com](https://carepulse-healthcare-backend.onrender.com)
* **API Health Check**: [https://carepulse-healthcare-backend.onrender.com/api/health](https://carepulse-healthcare-backend.onrender.com/api/health)
* **GitHub Repository**: [https://github.com/Shoyuj/CarePulse](https://github.com/Shoyuj/CarePulse) *(Branch: `main`)*

---

## ✨ Core Features & Capabilities

1. **Role-Based Portals**:
   * **Patient Portal**: Instant symptom search, real-time slot selection, 5-minute atomic hold lock, pre-visit Gemini AI triage, ICS calendar download, Google Calendar sync, and active medication adherence tracking.
   * **Doctor Portal**: Daily schedule overview, real-time clinical intake briefing with AI urgency level, consultation note submission, digital prescription generation with plain-English medication schedules.
   * **Admin Portal**: Doctor lifecycle management, specialty classification, working hour configuration, consultation fee setup, and doctor leave scheduling.
2. **Dehradun Regional Healthcare Ecosystem**:
   * Pre-seeded with **24 specialist doctors** across Dehradun (Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology, etc.) and **50 Indian patients** with INR pricing.
3. **Concurrency-Safe 5-Minute Slot Hold**:
   * Prevents double-booking via atomic serialized holds, background expiration reclamation, and time-of-day restrictions against past slots.
4. **Google Gemini 3.6 Flash AI Integration**:
   * **Pre-Visit Clinical Triage**: Classifies urgency (`Low`, `Medium`, `High`), synthesizes chief complaints, and generates targeted doctor discussion points.
   * **Post-Visit Patient Summary**: Translates clinical diagnoses and complex dosage schedules into 5th-grade plain English with warning signs and follow-up milestones.
   * **Graceful Degradation & Quota Shield**: Automated rule-based fallbacks on rate limits or API downtime.
5. **Doctor Leave Conflict Resolution**:
   * Automatically cancels conflicting appointments and dispatches urgent email notifications when a doctor marks leave.
6. **Medication Adherence Engine**:
   * Scheduled cron evaluations send automated medication reminders to patients based on prescription frequencies.

---

## 🛠️ Tech Stack

* **Backend**: Java 17, Spring Boot 3.3.0, Spring Data JPA, Spring Security (Stateless JWT), Hibernate, PostgreSQL / H2 In-Memory DB.
* **Frontend**: React 18, Vite, Vanilla CSS Design System, Lucide React Icons.
* **AI Engine**: Google Gemini 3.6 Flash API (`gemini-3.6-flash`).
* **Deployment**: Docker, Render.com (Backend Web Service), Netlify (Frontend SPA).

---

## 🚀 Local Setup & Installation

### Prerequisites
* **Java 17+ (JDK)** installed
* **Node.js 18+** & `npm` installed
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Shoyuj/CarePulse.git
cd CarePulse
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your free Gemini API key from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
```

### 3. Run Backend (Spring Boot)
```bash
cd backend
./mvnw clean spring-boot:run
```
* Backend starts at `http://localhost:8080`
* H2 Database Console: `http://localhost:8080/h2-console` (`JDBC URL: jdbc:h2:mem:healthcaredb`, `User: sa`, `Password: `)

### 4. Run Frontend (React Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
* Frontend starts at `http://localhost:5173`

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@healthcare.com` | `admin123` | Full clinic & doctor management |
| **Doctor** | `dr.rawat@healthcare.com` | `doctor123` | Cardiologist, Dehradun Heart Institute |
| **Doctor** | `dr.semwal@healthcare.com` | `doctor123` | Dermatologist, Rajpur Road Skin Clinic |
| **Patient** | `rahul.sharma@gmail.com` | `patient123` | Registered Patient |
| **Patient** | `priya.verma@gmail.com` | `patient123` | Active Prescriptions & Reminders |

---

## 📑 Database Schema Design

```
+-----------------------------------------------------------------------------------+
|                                 DATABASE SCHEMA                                   |
+-----------------------------------------------------------------------------------+

 [users]
   id (UUID, PK)
   email (VARCHAR, UNIQUE)
   password (VARCHAR, BCrypt)
   full_name (VARCHAR)
   phone (VARCHAR)
   role (VARCHAR: ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN)
   created_at (TIMESTAMP)
      |
      | 1:1 (If Doctor)
      v
 [doctor_profiles]
   id (UUID, PK)
   user_id (UUID, FK -> users.id)
   specialization (VARCHAR)
   qualification (VARCHAR)
   working_hours_start (TIME)
   working_hours_end (TIME)
   slot_duration_minutes (INT)
   consultation_fee (DECIMAL)
   bio (TEXT)
      |
      | 1:N
      +-----------------------------+
      |                             |
      v                             v
 [doctor_leaves]              [appointments]
   id (UUID, PK)                id (UUID, PK)
   doctor_profile_id (FK)       doctor_id (UUID, FK -> doctor_profiles.id)
   leave_date (DATE)            patient_id (UUID, FK -> users.id)
   reason (VARCHAR)             appointment_date (DATE)
                                start_time (TIME)
                                end_time (TIME)
                                status (VARCHAR: HELD, CONFIRMED, COMPLETED, CANCELLED)
                                hold_expires_at (TIMESTAMP)
                                patient_symptoms (TEXT)
                                ai_urgency_level (VARCHAR: LOW, MEDIUM, HIGH)
                                ai_chief_complaint (TEXT)
                                ai_suggested_questions (TEXT)
                                doctor_clinical_notes (TEXT)
                                google_calendar_event_id (VARCHAR)
                                   |
                                   | 1:1
                                   v
                             [prescriptions]
                                id (UUID, PK)
                                appointment_id (UUID, FK -> appointments.id)
                                doctor_id (UUID, FK)
                                patient_id (UUID, FK)
                                clinical_diagnosis (TEXT)
                                ai_patient_summary (TEXT)
                                ai_medication_schedule (TEXT)
                                ai_warning_signs (TEXT)
                                follow_up_instructions (TEXT)
                                   |
                                   | 1:N
                                   v
                             [medication_items]
                                id (UUID, PK)
                                prescription_id (UUID, FK -> prescriptions.id)
                                medicine_name (VARCHAR)
                                dosage (VARCHAR)
                                frequency (VARCHAR: ONCE_DAILY, TWICE_DAILY, THRICE_DAILY)
                                duration_days (INT)
                                instructions (VARCHAR)
                                reminder_time (TIME)
                                start_date (DATE)
                                is_active (BOOLEAN)

 [notification_logs]
   id (UUID, PK)
   recipient_email (VARCHAR)
   recipient_name (VARCHAR)
   notification_type (VARCHAR: BOOKING_CONFIRMATION, DOCTOR_LEAVE, REMINDER, CANCELLATION)
   subject (VARCHAR)
   content (TEXT)
   status (VARCHAR: SENT, FAILED, RETRY_PENDING)
   sent_at (TIMESTAMP)
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new patient or doctor.
* `POST /api/auth/login` — Authenticate and receive JWT Bearer token.
* `GET /api/auth/me` — Retrieve current authenticated user profile.

### Doctor Directory & Availability (`/api/doctors`)
* `GET /api/doctors` — Search doctors by name, specialty, bio, or symptoms.
* `GET /api/doctors/{id}` — Get single doctor profile.
* `GET /api/doctors/{id}/slots?date=YYYY-MM-DD` — Real-time slot availability (checks working hours, booked slots, active holds, leave days, and past time).

### Appointment Lifecycle (`/api/appointments`)
* `POST /api/appointments/hold` — Atomically hold a slot for 5 minutes.
* `POST /api/appointments/confirm` — Confirm held slot, record symptoms, execute pre-visit Gemini AI triage, and sync calendar.
* `GET /api/appointments/my` — List all appointments for logged-in patient or doctor.
* `DELETE /api/appointments/{id}/cancel` — Cancel appointment, release slot, and notify doctor/patient.
* `GET /api/appointments/ics/{id}` — Download `.ics` iCalendar file.

### Prescriptions & Follow-ups (`/api/prescriptions`)
* `POST /api/prescriptions` — Doctor submits diagnosis, medication items, triggers Gemini post-visit translation.
* `GET /api/prescriptions/my` — Patient retrieves active prescriptions and plain-English medication guidance.

### Admin Management (`/api/admin`)
* `POST /api/admin/doctors` — Provision new doctor account and clinical profile.
* `POST /api/admin/doctors/{id}/leave` — Mark doctor on leave, auto-cancel affected bookings, and send patient notices.

---

## 🤖 Gemini AI Prompts & Graceful Fallbacks

### 1. Pre-Visit Clinical Triage Prompt
```text
You are an expert clinical triage assistant.
Analyze these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor.
Symptoms: <patient_symptoms>

You MUST return ONLY a valid JSON object strictly matching this schema with no markdown backticks:
{
  "urgency": "Low" | "Medium" | "High",
  "chief_complaint": "one clear sentence describing primary complaint",
  "suggested_questions": [
    "Question 1 for doctor",
    "Question 2 for doctor",
    "Question 3 for doctor"
  ]
}
```

### 2. Post-Visit Patient-Friendly Summary Prompt
```text
You are an empathetic healthcare communication specialist.
Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps:
<notes>
Doctor Notes: <clinical_notes>
Medications: <medication_list>
</notes>

You MUST return ONLY a valid JSON object strictly matching this schema with no markdown backticks:
{
  "patient_friendly_summary": "Clear, reassuring explanation in simple 5th-grade language of what was diagnosed and discussed",
  "medication_schedule": "Clear bullet points of what medicine to take, when, and with/after food",
  "warning_signs": [
    "Warning sign 1 requiring immediate medical attention",
    "Warning sign 2"
  ],
  "follow_up_steps": "Actionable next steps (e.g. rest, tests, follow-up appointment in X days)"
}
```

### 3. Graceful Failure & Rate Limit Shield
* If the Gemini API key is missing, network fails, or rate limits are reached, the system executes an intelligent **Rule-Based Clinical Fallback Engine** (`generateFallbackTriage`) using medical keyword dictionaries so appointments and prescriptions never fail.

---

## 📅 Google Calendar Setup Steps

The platform supports two complementary calendar integration methods:

### Method A: Zero-Config Direct ICS & Google Calendar One-Click Links (Active by Default)
1. When an appointment is confirmed, the backend automatically generates a dynamic Google Calendar Web Intent link (`confirmedAppointment.googleCalendarLink`).
2. Patients can click **"Add to Google Calendar"** on the confirmation screen or in their dashboard to add the event with pre-filled doctor details, clinic address, and symptoms.
3. Patients can also click **"Download .ICS File"** to import into Apple Calendar, Outlook, or mobile calendar apps.

### Method B: Google Calendar Service Account API (Optional Direct Sync)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **Google Calendar API**.
3. Create a **Service Account**, generate a JSON key, and download it.
4. Set the following environment variables in `.env`:
   ```env
   GOOGLE_CALENDAR_ENABLED=true
   GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
   GOOGLE_CALENDAR_ID=primary
   ```

---

## 📐 System Design Write-Up (800 Words Max)

### 1. Concurrency Control & Double-Booking Prevention
In high-concurrency medical scheduling, simultaneous booking attempts for the same doctor and time slot create race conditions. CarePulse eliminates double-booking through a **two-phase reservation architecture**:
1. **Serial Execution & Atomic Hold**: When a patient selects a slot, the backend executes `holdSlot` with `@Transactional(isolation = Isolation.SERIALIZABLE)`. It checks for existing `CONFIRMED` bookings and active unexpired `HELD` entries. If clear, it inserts a new `Appointment` record in `HELD` status with an explicit `hold_expires_at` timestamp ($now + 5\text{ mins}$).
2. **Deterministic Database Constraints**: A composite uniqueness constraint on `(doctor_id, appointment_date, start_time)` ensures the database itself rejects duplicate overlapping slots at the storage engine level.
3. **Time-of-Day Validation**: When viewing today's slots, client and server filter out slots where `start_time < LocalTime.now()`, preventing users from booking elapsed morning slots.

### 2. Slot Hold Mechanism & Automatic Reclamation
To avoid locking slots indefinitely when users abandon checkout:
* **Hold Timer**: Upon holding a slot, the frontend initiates a synchronized 300-second countdown (`HoldTimer.jsx`). If the patient fails to confirm within 5 minutes, the slot is locally unlocked.
* **Server-Side Reclaim**: When calculating slot availability (`getDoctorSlotsForDate`), any `HELD` slot whose `hold_expires_at < LocalDateTime.now()` is treated as `AVAILABLE` and re-opened for other patients.
* **Confirm Guard**: During `confirmBooking`, the server validates that `hold_expires_at` has not elapsed. If expired, it flags the status as `CANCELLED` and prompts the user to re-select.

### 3. Doctor Leave Conflict Handling & Patient Protection
When a doctor emergency or planned leave occurs:
1. **Cascade Query**: The admin submits `POST /api/admin/doctors/{id}/leave` for a target date.
2. **Conflict Cancellation**: The system queries all `CONFIRMED` or `HELD` appointments for that doctor on that date, transitions their status to `CANCELLED`, and deletes associated Google Calendar events.
3. **Proactive Patient Notification**: For each affected booking, the system dispatches high-priority urgent email notifications (`DOCTOR_LEAVE`) explaining the cancellation and providing direct links to reschedule with alternative specialists.

### 4. Notification & Email Failure Resilience
Healthcare reminders and confirmations must never block user transactions:
* **Decoupled Asynchronous Dispatch**: Email delivery runs in a separate thread pool (`@Async`). A failure in the email transport layer (e.g. SMTP timeout or rate limit) will not abort the database transaction or fail the appointment booking.
* **Audit Logging & Retry Loop**: Every outgoing notification is persisted in `notification_logs` with statuses: `SENT`, `FAILED`, or `RETRY_PENDING`. A background `SchedulerService` sweeps failed notifications and retries transmission with exponential backoff up to 3 times before dead-letter alerting.

---

## 🧪 Automated Testing

Run the comprehensive test suite verifying the complete workflow, concurrency holds, doctor leave conflict cancellations, and rate limiting:
```bash
cd backend
./mvnw test
```
* **Result**: **9/9 Tests Pass (`BUILD SUCCESS`)**

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
