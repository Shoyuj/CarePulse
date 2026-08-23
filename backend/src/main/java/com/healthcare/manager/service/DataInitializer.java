package com.healthcare.manager.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.manager.entity.*;
import com.healthcare.manager.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public DataInitializer(UserRepository userRepository,
                           DoctorProfileRepository doctorProfileRepository,
                           AppointmentRepository appointmentRepository,
                           PrescriptionRepository prescriptionRepository,
                           PasswordEncoder passwordEncoder,
                           ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialData() {
        if (userRepository.count() > 0) {
            logger.info("Database already initialized with seed data.");
            return;
        }

        logger.info("Initializing Healthcare Manager with Dehradun, Uttarakhand clinic & doctor network...");

        String defaultDocPass = passwordEncoder.encode("doctor123");
        String defaultPatientPass = passwordEncoder.encode("patient123");
        String adminPass = passwordEncoder.encode("admin123");

        // 1. Create Clinic Administrator
        User admin = new User(
                "admin@healthcare.com",
                adminPass,
                "Dehradun Clinic Operations Admin",
                "+91 98970 12345",
                Role.ADMIN
        );
        userRepository.save(admin);

        // 2. Create 24 Specialist Doctors based in Dehradun, Uttarakhand
        List<DoctorSeed> doctorSeeds = List.of(
                new DoctorSeed("dr.rawat@healthcare.com", "Dr. Raghavendra Rawat", "+91 98370 10001",
                        "Cardiology", "MBBS, MD, DM (Cardiology) - AIIMS Rishikesh",
                        LocalTime.of(9, 0), LocalTime.of(16, 0), 30, BigDecimal.valueOf(800),
                        "Senior Interventional Cardiologist with 14+ years experience at Max Super Speciality Hospital, Rajpur Road, Dehradun. Expertise in coronary angioplasty, hypertension, and heart failure management."),

                new DoctorSeed("dr.semwal@healthcare.com", "Dr. Priya Semwal", "+91 98370 10002",
                        "Dermatology", "MBBS, MD (Dermatology & Venereology) - PGI Chandigarh",
                        LocalTime.of(10, 0), LocalTime.of(17, 0), 20, BigDecimal.valueOf(600),
                        "Consultant Dermatologist & Cosmetologist at Dalanwala Skin Clinic, Dehradun. Specializes in acne scar treatments, eczema, psoriasis, laser therapy, and clinical hair restoration."),

                new DoctorSeed("dr.negi@healthcare.com", "Dr. Arvind Negi", "+91 98370 10003",
                        "Orthopedics", "MBBS, MS (Orthopedics), MCh (Joint Replacement) - AIIMS",
                        LocalTime.of(9, 30), LocalTime.of(16, 30), 30, BigDecimal.valueOf(700),
                        "Chief Joint Replacement & Arthroscopy Surgeon at Synergy Hospital, Ballupur Chowk, Dehradun. Specialist in knee/hip replacements, sports ligament repairs, and spinal trauma care."),

                new DoctorSeed("dr.joshi@healthcare.com", "Dr. Ananya Joshi", "+91 98370 10004",
                        "Pediatrics", "MBBS, MD (Pediatrics), DNB (Neonatology) - KGMU",
                        LocalTime.of(9, 0), LocalTime.of(14, 0), 20, BigDecimal.valueOf(500),
                        "Senior Pediatrician & Neonatologist at Himalayan Hospital, Jolly Grant & Welham Children Clinic, Dehradun. Compassionate care for infant nutrition, pediatric asthma, and developmental growth."),

                new DoctorSeed("dr.bisht@healthcare.com", "Dr. Vikram Bisht", "+91 98370 10005",
                        "General Medicine", "MBBS, MD (Internal Medicine) - Doon Medical College",
                        LocalTime.of(8, 30), LocalTime.of(17, 30), 20, BigDecimal.valueOf(400),
                        "Senior Physician & Diabetologist on EC Road, Dehradun. 18+ years of dedicated practice managing viral fever/dengue flares, diabetes, thyroid disorders, and seasonal respiratory illnesses."),

                new DoctorSeed("dr.bhatt@healthcare.com", "Dr. Sunita Bhatt", "+91 98370 10006",
                        "Neurology", "MBBS, MD (Medicine), DM (Neurology) - NIMHANS Bengaluru",
                        LocalTime.of(11, 0), LocalTime.of(17, 0), 30, BigDecimal.valueOf(1000),
                        "Lead Neurologist at Max Super Speciality Hospital, Mussoorie Diversion Road, Dehradun. Expert in stroke rehabilitation, epilepsy management, migraine care, and Parkinson's disease."),

                new DoctorSeed("dr.uniyal@healthcare.com", "Dr. Rajesh Uniyal", "+91 98370 10007",
                        "Ophthalmology", "MBBS, MS (Ophthalmology), Fellow Cornea - Sankara Nethralaya",
                        LocalTime.of(9, 0), LocalTime.of(15, 0), 20, BigDecimal.valueOf(500),
                        "Senior Eye Surgeon & Cornea Specialist at Drishti Eye Institute, Subhash Road, Dehradun. Performing micro-incision cataract surgery, LASIK, and glaucoma management."),

                new DoctorSeed("dr.chauhan@healthcare.com", "Dr. Meenakshi Chauhan", "+91 98370 10008",
                        "Gynecology", "MBBS, MS (Obstetrics & Gynecology), FICOG - Lady Hardinge",
                        LocalTime.of(10, 0), LocalTime.of(16, 0), 30, BigDecimal.valueOf(600),
                        "Senior Gynecologist & High-Risk Pregnancy Specialist at Graphic Era Institute of Medical Sciences (GEIMS), Chakrata Road, Dehradun. Expert in PCOS, laparoscopic surgery, and prenatal care."),

                new DoctorSeed("dr.khanduri@healthcare.com", "Dr. Sanjay Khanduri", "+91 98370 10009",
                        "ENT", "MBBS, MS (ENT / Otorhinolaryngology) - Safdarjung Hospital",
                        LocalTime.of(9, 30), LocalTime.of(15, 30), 20, BigDecimal.valueOf(500),
                        "Senior ENT Head & Neck Surgeon on Rajpur Road, Dehradun. Specialist in endoscopic sinus surgery (FESS), hearing loss assessment, vertigo clinics, and pediatric tonsillitis."),

                new DoctorSeed("dr.nautiyal@healthcare.com", "Dr. Deepika Nautiyal", "+91 98370 10010",
                        "Pulmonology", "MBBS, MD (Pulmonary Medicine), FCCP - Vallabhbhai Patel Chest Institute",
                        LocalTime.of(9, 0), LocalTime.of(16, 0), 30, BigDecimal.valueOf(700),
                        "Consultant Chest Physician at Shri Mahant Indiresh Hospital, Patel Nagar, Dehradun. Leading expert in allergic bronchitis, COPD, sleep apnea, and post-viral pulmonary recovery."),

                new DoctorSeed("dr.dobhal@healthcare.com", "Dr. Amit Dobhal", "+91 98370 10011",
                        "Gastroenterology", "MBBS, MD (Medicine), DM (Gastroenterology) - SGPGI Lucknow",
                        LocalTime.of(10, 0), LocalTime.of(17, 0), 30, BigDecimal.valueOf(900),
                        "Senior Gastroenterologist & Hepatologist at Synergy Hospital, Dehradun. Expert in therapeutic endoscopy, fatty liver disease, acidity, GERD, and inflammatory bowel disease."),

                new DoctorSeed("dr.bahuguna@healthcare.com", "Dr. Kavita Bahuguna", "+91 98370 10012",
                        "Psychiatry", "MBBS, MD (Psychiatry) - CIP Ranchi",
                        LocalTime.of(10, 0), LocalTime.of(18, 0), 45, BigDecimal.valueOf(800),
                        "Consultant Neuropsychiatrist & Mental Wellness Director at Vasant Vihar Clinic, Dehradun. Empathetic counseling for stress disorders, anxiety, depression, insomnia, and adolescent mental health."),

                new DoctorSeed("dr.thapliyal@healthcare.com", "Dr. Alok Thapliyal", "+91 98370 10013",
                        "Endocrinology", "MBBS, MD (Internal Med), DM (Endocrinology) - AIIMS New Delhi",
                        LocalTime.of(9, 0), LocalTime.of(14, 0), 30, BigDecimal.valueOf(750),
                        "Consultant Endocrinologist at Patel Nagar Diabetes & Hormone Care Centre, Dehradun. Specializing in complicated Type 1 & 2 diabetes, thyroid nodules, and metabolic obesity."),

                new DoctorSeed("dr.raturi@healthcare.com", "Dr. Pooja Raturi", "+91 98370 10014",
                        "Nephrology", "MBBS, MD, DM (Nephrology), FISN - PGI Chandigarh",
                        LocalTime.of(11, 0), LocalTime.of(16, 30), 30, BigDecimal.valueOf(900),
                        "Senior Consultant Nephrologist & Renal Transplant Physician at Max Super Speciality Hospital, Dehradun. Management of chronic kidney disease (CKD), proteinuria, and dialysis care."),

                new DoctorSeed("dr.barthwal@healthcare.com", "Dr. Manish Barthwal", "+91 98370 10015",
                        "Dental Surgery", "BDS, MDS (Orthodontics & Dentofacial Orthopedics) - Manipal",
                        LocalTime.of(9, 0), LocalTime.of(18, 0), 30, BigDecimal.valueOf(400),
                        "Chief Dental Surgeon & Orthodontist at Smile Care Studio, Chakrata Road, Ballupur, Dehradun. Specializes in painless root canals, invisible aligners, and dental implantology."),

                new DoctorSeed("dr.gairola@healthcare.com", "Dr. Shweta Gairola", "+91 98370 10016",
                        "Oncology", "MBBS, MS (General Surgery), MCh (Surgical Oncology) - Tata Memorial Hospital",
                        LocalTime.of(10, 0), LocalTime.of(16, 0), 30, BigDecimal.valueOf(1200),
                        "Senior Surgical Oncologist at Synergy Cancer Centre, Ballupur, Dehradun. Comprehensive cancer screenings, breast oncology, head & neck tumors, and robotic surgical oncology."),

                new DoctorSeed("dr.pant@healthcare.com", "Dr. Harish Pant", "+91 98370 10017",
                        "General Surgery", "MBBS, MS (General Surgery), FMAS, FIAGES - Doon Hospital",
                        LocalTime.of(9, 0), LocalTime.of(15, 0), 30, BigDecimal.valueOf(650),
                        "Senior Laparoscopic & General Surgeon at Shri Mahant Indiresh Hospital, Dehradun. Expert in minimal access hernia repairs, gallbladder stones, and acute abdominal emergencies."),

                new DoctorSeed("dr.dimri@healthcare.com", "Dr. Rashmi Dimri", "+91 98370 10018",
                        "Rheumatology", "MBBS, MD, DNB (Rheumatology & Clinical Immunology)",
                        LocalTime.of(10, 0), LocalTime.of(16, 0), 30, BigDecimal.valueOf(800),
                        "Senior Rheumatologist at Dalanwala Medical Enclave, Dehradun. Dedicated management of rheumatoid arthritis, ankylosing spondylitis, lupus (SLE), and chronic joint inflammation."),

                new DoctorSeed("dr.panwar@healthcare.com", "Dr. Vivek Panwar", "+91 98370 10019",
                        "Urology", "MBBS, MS, MCh (Urology & Andrology) - KGMU Lucknow",
                        LocalTime.of(10, 30), LocalTime.of(17, 30), 30, BigDecimal.valueOf(850),
                        "Chief Urologist & Uro-Oncologist at Haridwar Road Specialty Hospital, Dehradun. Laser treatment for kidney stones (RIRS), enlarged prostate (TURP), and male infertility."),

                new DoctorSeed("dr.kothari@healthcare.com", "Dr. Suresh Kothari", "+91 98370 10020",
                        "Ayurveda", "BAMS, MD (Ayurveda Panchakarma) - Uttarakhand Ayurved University",
                        LocalTime.of(8, 30), LocalTime.of(14, 30), 30, BigDecimal.valueOf(400),
                        "Senior Ayurvedic Physician & Panchakarma Specialist, Rajpur Road Holistic Centre, Dehradun. Natural therapeutic healing for chronic digestion issues, arthritis, and lifestyle detox."),

                new DoctorSeed("dr.gusain@healthcare.com", "Dr. Neha Gusain", "+91 98370 10021",
                        "Physiotherapy", "BPT, MPT (Musculoskeletal & Sports Rehab) - Jamia Hamdard",
                        LocalTime.of(9, 0), LocalTime.of(18, 0), 45, BigDecimal.valueOf(450),
                        "Chief Physiotherapist & Sports Rehabilitation Specialist at Ballupur Rehab Clinic, Dehradun. Post-fracture recovery, frozen shoulder, sciatica relief, and cervical spondylosis care."),

                new DoctorSeed("dr.mamgain@healthcare.com", "Dr. Tarun Mamgain", "+91 98370 10022",
                        "General Medicine", "MBBS, DNB (Family Medicine) - St. Stephen's Hospital",
                        LocalTime.of(9, 0), LocalTime.of(17, 0), 20, BigDecimal.valueOf(350),
                        "Family Health Physician at Subhash Nagar Community Clinic, Clement Town, Dehradun. Trusted primary care for all family members, preventative wellness, and immunization."),

                new DoctorSeed("dr.dangwal@healthcare.com", "Dr. Shalini Dangwal", "+91 98370 10023",
                        "Dietetics & Nutrition", "MSc, PhD (Clinical Nutrition & Dietetics) - GB Pant University",
                        LocalTime.of(10, 0), LocalTime.of(16, 0), 30, BigDecimal.valueOf(500),
                        "Clinical Nutritionist & Therapeutic Diet Consultant on Rajpur Road, Dehradun. Customized meal planning for gestational diabetes, PCOD, cardiovascular wellness, and fatty liver."),

                new DoctorSeed("dr.sundriyal@healthcare.com", "Dr. Mohit Sundriyal", "+91 98370 10024",
                        "Pediatrics", "MBBS, DCH, DNB (Pediatrics) - Sir Ganga Ram Hospital",
                        LocalTime.of(9, 0), LocalTime.of(16, 0), 20, BigDecimal.valueOf(550),
                        "Child Specialist & Pediatric Allergy Consultant at GMS Road Pediatric Clinic, Dehradun. Specializing in childhood seasonal allergies, recurring bronchitis, and baby vaccinations.")
        );

        List<DoctorProfile> createdDoctors = new ArrayList<>();
        for (DoctorSeed seed : doctorSeeds) {
            User docUser = new User(seed.email, defaultDocPass, seed.name, seed.phone, Role.DOCTOR);
            userRepository.save(docUser);

            DoctorProfile profile = new DoctorProfile(
                    docUser,
                    seed.specialization,
                    seed.qualifications,
                    seed.start,
                    seed.end,
                    seed.slotDuration,
                    seed.fee,
                    seed.bio
            );
            createdDoctors.add(doctorProfileRepository.save(profile));
        }

        // 3. Create 50 Realistic Indian Patients with Dehradun / Uttarakhand representation
        String[][] patientData = {
                {"Rohan Sharma", "patient.rohan@gmail.com", "+91 98971 10001"},
                {"Priya Negi", "patient.priya@gmail.com", "+91 98971 10002"},
                {"Aarav Rawat", "aarav.rawat@gmail.com", "+91 98971 10003"},
                {"Ananya Verma", "ananya.verma@gmail.com", "+91 98971 10004"},
                {"Aditya Joshi", "aditya.joshi@gmail.com", "+91 98971 10005"},
                {"Sneha Semwal", "sneha.semwal@gmail.com", "+91 98971 10006"},
                {"Deepak Bhatt", "deepak.bhatt@gmail.com", "+91 98971 10007"},
                {"Neha Chauhan", "neha.chauhan@gmail.com", "+91 98971 10008"},
                {"Rahul Uniyal", "rahul.uniyal@gmail.com", "+91 98971 10009"},
                {"Divya Nautiyal", "divya.nautiyal@gmail.com", "+91 98971 10010"},
                {"Saurabh Dobhal", "saurabh.dobhal@gmail.com", "+91 98971 10011"},
                {"Pooja Bahuguna", "pooja.bahuguna@gmail.com", "+91 98971 10012"},
                {"Amit Khanduri", "amit.khanduri@gmail.com", "+91 98971 10013"},
                {"Megha Thapliyal", "megha.thapliyal@gmail.com", "+91 98971 10014"},
                {"Vikas Raturi", "vikas.raturi@gmail.com", "+91 98971 10015"},
                {"Ritu Barthwal", "ritu.barthwal@gmail.com", "+91 98971 10016"},
                {"Manish Gairola", "manish.gairola@gmail.com", "+91 98971 10017"},
                {"Swati Pant", "swati.pant@gmail.com", "+91 98971 10018"},
                {"Abhishek Dimri", "abhishek.dimri@gmail.com", "+91 98971 10019"},
                {"Pallavi Panwar", "pallavi.panwar@gmail.com", "+91 98971 10020"},
                {"Kunal Kothari", "kunal.kothari@gmail.com", "+91 98971 10021"},
                {"Tanvi Gusain", "tanvi.gusain@gmail.com", "+91 98971 10022"},
                {"Varun Mamgain", "varun.mamgain@gmail.com", "+91 98971 10023"},
                {"Shruti Dangwal", "shruti.dangwal@gmail.com", "+91 98971 10024"},
                {"Naveen Sundriyal", "naveen.sundriyal@gmail.com", "+91 98971 10025"},
                {"Kavita Bisht", "kavita.bisht@gmail.com", "+91 98971 10026"},
                {"Harish Rawat", "harish.rawat@gmail.com", "+91 98971 10027"},
                {"Simran Kaur", "simran.kaur@gmail.com", "+91 98971 10028"},
                {"Gurpreet Singh", "gurpreet.singh@gmail.com", "+91 98971 10029"},
                {"Ankit Agarwal", "ankit.agarwal@gmail.com", "+91 98971 10030"},
                {"Shreya Gupta", "shreya.gupta@gmail.com", "+91 98971 10031"},
                {"Rajat Mittal", "rajat.mittal@gmail.com", "+91 98971 10032"},
                {"Preeti Goyal", "preeti.goyal@gmail.com", "+91 98971 10033"},
                {"Mayank Sharma", "mayank.sharma@gmail.com", "+91 98971 10034"},
                {"Geeta Devi", "geeta.devi@gmail.com", "+91 98971 10035"},
                {"Manoj Kumar", "manoj.kumar@gmail.com", "+91 98971 10036"},
                {"Sunita Devi", "sunita.devi@gmail.com", "+91 98971 10037"},
                {"Rajendra Prasad", "rajendra.prasad@gmail.com", "+91 98971 10038"},
                {"Anita Pandey", "anita.pandey@gmail.com", "+91 98971 10039"},
                {"Bhupendra Negi", "bhupendra.negi@gmail.com", "+91 98971 10040"},
                {"Deepa Rawat", "deepa.rawat@gmail.com", "+91 98971 10041"},
                {"Kamal Joshi", "kamal.joshi@gmail.com", "+91 98971 10042"},
                {"Neelam Bhatt", "neelam.bhatt@gmail.com", "+91 98971 10043"},
                {"Gopal Semwal", "gopal.semwal@gmail.com", "+91 98971 10044"},
                {"Usha Uniyal", "usha.uniyal@gmail.com", "+91 98971 10045"},
                {"Lalit Chauhan", "lalit.chauhan@gmail.com", "+91 98971 10046"},
                {"Seema Nautiyal", "seema.nautiyal@gmail.com", "+91 98971 10047"},
                {"Pankaj Dobhal", "pankaj.dobhal@gmail.com", "+91 98971 10048"},
                {"Archana Bahuguna", "archana.bahuguna@gmail.com", "+91 98971 10049"},
                {"Yogesh Khanduri", "yogesh.khanduri@gmail.com", "+91 98971 10050"}
        };

        List<User> createdPatients = new ArrayList<>();
        for (String[] p : patientData) {
            User patient = new User(p[1], defaultPatientPass, p[0], p[2], Role.PATIENT);
            createdPatients.add(userRepository.save(patient));
        }

        // 4. Create Sample Confirmed Appointment with AI Triage (Cardiology Consultation in Dehradun)
        User patient1 = createdPatients.get(0); // Rohan Sharma
        DoctorProfile doc1 = createdDoctors.get(0); // Dr. Raghavendra Rawat (Cardiology)

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        Appointment app1 = new Appointment(patient1, doc1, tomorrow, LocalTime.of(10, 0), LocalTime.of(10, 30));
        app1.setStatus(AppointmentStatus.CONFIRMED);
        app1.setHoldExpiresAt(null);
        app1.setPatientSymptoms("Experiencing occasional sharp chest tightness and shortness of breath when climbing stairs at Rajpur Road for the last 4 days. Feeling easily fatigued in the evenings.");
        app1.setAiUrgencyLevel(UrgencyLevel.HIGH);
        app1.setAiChiefComplaint("Exertional chest tightness and shortness of breath with fatigue");
        try {
            app1.setAiSuggestedQuestions(objectMapper.writeValueAsString(List.of(
                    "Does the chest heaviness radiate to your left shoulder, arm, neck, or jaw?",
                    "Have you experienced any profuse sweating, dizziness, or palpitations during these episodes?",
                    "Is there a personal or family history of high blood pressure, diabetes, or heart disease?"
            )));
        } catch (Exception ignored) {}
        app1.setAiStatus(AiStatus.SUCCESS);
        app1.setGoogleCalendarEventId("gcal_evt_ddn_101");
        appointmentRepository.save(app1);

        // 5. Create Completed Appointment with Post-Visit Summary & Active Prescription (Dermatology Consultation)
        User patient2 = createdPatients.get(1); // Priya Negi
        DoctorProfile doc2 = createdDoctors.get(1); // Dr. Priya Semwal (Dermatology)

        LocalDate yesterday = LocalDate.now().minusDays(1);
        Appointment app2 = new Appointment(patient2, doc2, yesterday, LocalTime.of(11, 0), LocalTime.of(11, 20));
        app2.setStatus(AppointmentStatus.COMPLETED);
        app2.setHoldExpiresAt(null);
        app2.setPatientSymptoms("Red, itchy skin rash and minor swelling across forearms after walking near Sahastradhara trail.");
        app2.setAiUrgencyLevel(UrgencyLevel.LOW);
        app2.setAiChiefComplaint("Acute allergic contact dermatitis on bilateral forearms");
        app2.setDoctorClinicalNotes("Patient presents with erythematous pruritic papules consistent with contact dermatitis. Prescribed topical Hydrocortisone 1% cream, oral Cetirizine 10mg, and soothing calamine lotion. Advised gentle soap-free cleansing.");
        app2.setAiPatientSummary("Your skin rash is an allergic reaction (contact dermatitis) caused by contact with outdoor foliage. Apply the hydrocortisone cream twice daily on clean, dry skin, and take the Cetirizine tablet at night before bed to control itching.");
        app2.setAiStatus(AiStatus.SUCCESS);
        appointmentRepository.save(app2);

        Prescription rx = new Prescription(
                app2, patient2, doc2,
                "Avoid harsh soaps and wash arms with lukewarm water. Protect arms from direct sun exposure.",
                LocalDate.now().plusDays(7)
        );
        rx.addMedication(new MedicationItem(
                "Cetirizine 10mg", "1 Tablet", "ONCE_DAILY", "BEDTIME", 7, "21:00", "Take 1 tablet at night for itching"
        ));
        rx.addMedication(new MedicationItem(
                "Hydrocortisone 1% Cream", "Apply thin layer", "TWICE_DAILY", "AFTER_WASH", 5, "08:00,20:00", "Apply to affected areas twice daily"
        ));
        rx.addMedication(new MedicationItem(
                "Pantoprazole 40mg (Pan-40)", "1 Tablet", "ONCE_DAILY", "BEFORE_BREAKFAST", 5, "07:30", "Take empty stomach in the morning"
        ));
        prescriptionRepository.save(rx);

        logger.info("Successfully seeded 24 Dehradun doctors and 50 Indian patients into database.");
    }

    private static class DoctorSeed {
        String email;
        String name;
        String phone;
        String specialization;
        String qualifications;
        LocalTime start;
        LocalTime end;
        int slotDuration;
        BigDecimal fee;
        String bio;

        DoctorSeed(String email, String name, String phone, String specialization, String qualifications,
                   LocalTime start, LocalTime end, int slotDuration, BigDecimal fee, String bio) {
            this.email = email;
            this.name = name;
            this.phone = phone;
            this.specialization = specialization;
            this.qualifications = qualifications;
            this.start = start;
            this.end = end;
            this.slotDuration = slotDuration;
            this.fee = fee;
            this.bio = bio;
        }
    }
}
