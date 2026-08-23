# 🏥 CarePulse - Healthcare Appointment & Follow-up Manager

> A full-stack healthcare scheduling and patient follow-up web app built with **Spring Boot (Java 17)**, **React 18 (Vite)**, and **Google Gemini AI**.

---

## 🌐 Live Project Link

* **Live Frontend**: [https://carepulseify.netlify.app](https://carepulseify.netlify.app)
* **GitHub Repository**: [https://github.com/Shoyuj/CarePulse](https://github.com/Shoyuj/CarePulse)

---

## 💡 About The Project

Most clinic booking systems are just basic forms that don't solve real problems patients and doctors face every day. I built **CarePulse** to handle the entire consultation cycle from start to finish:

1. **Smart Clinical Search & Booking**: Patients can search doctors by symptoms (e.g. fever, dengue, knee pain, acne) or specialization across a network of 24 Dehradun doctors with standard INR fees.
2. **5-Minute Concurrency Slot Hold**: When a patient selects a time slot, the system locks it for 5 minutes with a live countdown so nobody else can take it while they type their symptoms. It also disables past time slots for today.
3. **Pre-Visit AI Triage (Gemini 3.6 Flash)**: Before the consultation happens, Gemini analyzes the patient's symptoms, assigns an urgency level (`Low`, `Medium`, `High`), writes a clear chief complaint summary, and gives the doctor 3 key clinical questions to ask.
4. **Post-Visit Patient Summary & Digital Rx**: Doctors write their clinical notes and prescriptions in the portal. The AI then translates complex medical jargon into a simple, easy-to-understand summary with dosage schedules, warning signs, and follow-up steps.
5. **Doctor Leave & Conflict Management**: If a doctor takes leave on a day with existing bookings, the system automatically cancels conflicting appointments and notifies the affected patients.
6. **Medication Reminders & Calendar Sync**: Generates one-click Google Calendar links, downloadable `.ics` calendar files, and runs background cron tasks for daily medication reminders.

---

## 🛠️ Tech Stack

* **Backend**: Java 17, Spring Boot 3.3, Spring Data JPA, Spring Security with JWT tokens, Hibernate, H2 / PostgreSQL.
* **Frontend**: React 18, Vite, Vanilla CSS design system, Lucide Icons.
* **AI Model**: Google Gemini 3.6 Flash (`gemini-3.6-flash`).
* **Deployment**: Netlify (Frontend SPA) and Render (Backend Docker service).

---

## 🚀 Running Locally

### Prerequisites
* Java 17+ (JDK)
* Node.js 18+ and `npm`
* Git

### 1. Clone the repo
```bash
git clone https://github.com/Shoyuj/CarePulse.git
cd CarePulse
```

### 2. Set up environment variables
Copy the example file to `.env`:
```bash
cp .env.example .env
```
Add your free Gemini API key from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
```

### 3. Start the Backend (Spring Boot)
```bash
cd backend
./mvnw clean spring-boot:run
```
* API server will run on `http://localhost:8080`
* In-memory H2 Console is available at `http://localhost:8080/h2-console` (`JDBC URL: jdbc:h2:mem:healthcaredb`, `User: sa`, `Password: `)

### 4. Start the Frontend (React Vite)
In a separate terminal tab:
```bash
cd frontend
npm install
npm run dev
```
* App will run on `http://localhost:5173`

---

## 🔑 Demo Accounts

The database comes pre-seeded with test accounts for each role:

| Role | Email | Password | What to Test |
|---|---|---|---|
| **Admin** | `admin@healthcare.com` | `admin123` | Add new doctors, mark doctor leaves, view stats |
| **Doctor** | `dr.rawat@healthcare.com` | `doctor123` | View patient queue, see AI triage, write prescriptions |
| **Doctor** | `dr.semwal@healthcare.com` | `doctor123` | Dermatologist consultations |
| **Patient** | `rahul.sharma@gmail.com` | `patient123` | Book new appointments, view calendar invites |
| **Patient** | `priya.verma@gmail.com` | `patient123` | View active prescriptions & medication reminders |

---

## 📑 Database Schema

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

## 📡 API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new patient or doctor account.
* `POST /api/auth/login` — Sign in and get a JWT token.
* `GET /api/auth/me` — Get current logged-in user profile.

### Doctors (`/api/doctors`)
* `GET /api/doctors` — Search doctors by name, specialty, bio, or symptoms.
* `GET /api/doctors/{id}` — Get doctor details.
* `GET /api/doctors/{id}/slots?date=YYYY-MM-DD` — Real-time slot availability (filters booked, held, leave, and past slots).

### Appointments (`/api/appointments`)
* `POST /api/appointments/hold` — Reserve a slot for 5 minutes.
* `POST /api/appointments/confirm` — Confirm booking with symptoms, run AI triage, sync calendar.
* `GET /api/appointments/my` — Get user's appointment history.
* `DELETE /api/appointments/{id}/cancel` — Cancel appointment and free up the slot.
* `GET /api/appointments/ics/{id}` — Download `.ics` file for calendar apps.

### Prescriptions (`/api/prescriptions`)
* `POST /api/prescriptions` — Doctor submits diagnosis and medicines, triggers AI patient translation.
* `GET /api/prescriptions/my` — Patient views their prescription history.

### Admin (`/api/admin`)
* `POST /api/admin/doctors` — Add a new doctor profile.
* `POST /api/admin/doctors/{id}/leave` — Mark doctor leave and auto-notify affected patients.

---

## 🤖 Gemini AI Prompts & Fallback Strategy

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

### 2. Post-Visit Patient Summary Prompt
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

### 3. Graceful Fallbacks & Rate Limit Protection
* If the Gemini API key is missing or quota is exhausted, the app doesn't crash — it switches to a built-in rule-based fallback engine (`generateFallbackTriage`) using medical keyword parsing to ensure zero downtime.

---

## 📅 Google Calendar Setup

The app offers two ways to sync appointments:

1. **One-Click Web Intent & ICS Download (Active by Default)**:
   * When an appointment is confirmed, the backend dynamically builds a direct Google Calendar link (`confirmedAppointment.googleCalendarLink`) pre-filled with clinic address, doctor name, and symptoms.
   * Patients can also click **"Download .ICS File"** to add it to Apple Calendar or Outlook.

2. **Google Service Account Sync (Optional)**:
   * Enable the Google Calendar API in Google Cloud Console, download your service account key, and configure:
     ```env
     GOOGLE_CALENDAR_ENABLED=true
     GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
     GOOGLE_CALENDAR_ID=primary
     ```

---

## 📐 System Design

### 1. Concurrency Control & Double-Booking Prevention
To prevent two patients from booking the same doctor slot at the exact same millisecond, CarePulse uses a **two-phase reservation model**:
* **Serializable Isolation**: The `holdSlot` endpoint runs with `@Transactional(isolation = Isolation.SERIALIZABLE)`. It checks for existing confirmed bookings and active holds before creating a new `HELD` record with a timestamp of $now + 5\text{ mins}$.
* **Database Unique Constraints**: A composite constraint on `(doctor_id, appointment_date, start_time)` prevents duplicates at the storage level.
* **Time Check**: Slots on today's date that have already passed in local time are marked disabled on both frontend and backend.

### 2. Slot Hold Mechanism & Automatic Expiration
To make sure abandoned bookings don't hold slots forever:
* **Frontend Countdown**: When holding a slot, `HoldTimer.jsx` starts a synchronized 5-minute countdown.
* **Lazy Expiration Reclaim**: When slots are queried (`getDoctorSlotsForDate`), any `HELD` slot whose expiration time has passed is treated as `AVAILABLE` so other patients can immediately book it.
* **Confirm Guard**: If a user submits symptoms after 5 minutes, `confirmBooking` rejects the transaction and marks the hold as `CANCELLED`.

### 3. Doctor Leave Conflict Handling
When an admin marks a doctor on leave (`POST /api/admin/doctors/{id}/leave`):
* The backend searches for all `CONFIRMED` and `HELD` appointments for that doctor on that date.
* It automatically cancels them and cleans up associated calendar events.
* It sends an email alert (`DOCTOR_LEAVE`) to each affected patient notifying them of the cancellation with a prompt to reschedule.

### 4. Notification & Email Reliability
* **Async Decoupling**: Emails are dispatched asynchronously (`@Async`) so slow SMTP servers never block booking confirmations.
* **Audit Logging & Retries**: Every notification is saved in `notification_logs` (`SENT`, `FAILED`, `RETRY_PENDING`). A background scheduler checks for failed emails and retries them automatically.

---

## 🧪 Testing

To run the automated tests verifying slot holds, leave conflicts, and rate limiting:
```bash
cd backend
./mvnw test
```
* **Result**: **9/9 Tests Pass (`BUILD SUCCESS`)**

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
