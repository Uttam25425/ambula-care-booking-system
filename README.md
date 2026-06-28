# Ambula Care - Doctor Appointment Booking System

Ambula Care is a full-stack healthcare web platform built for the **Build for Ambula '26 Hackathon**.

The platform helps patients search doctors, check available slots, book appointments, and share a basic health summary. Doctors can securely log in, view today's appointments, add consultation notes, write prescriptions, and block unavailable slots.

## Live Project

* **Frontend:** [Ambula Care Live Website](https://ambula-care-booking-system.netlify.app)
* **Backend API:** [Ambula Care Backend](https://ambula-care-backend.onrender.com)
* **GitHub Repository:** [ambula-care-booking-system](https://github.com/uttam25425/ambula-care-booking-system)

## Problem Statement

Patients often depend on phone calls, WhatsApp messages, or manual registers for doctor appointments. This creates confusion, double booking, and delays.

Ambula Care solves this by providing a simple digital appointment booking system for patients and a consultation dashboard for doctors.

## Key Features

### Patient Side

* Search doctors by name, specialization, or location
* View doctor profile with specialization, location, experience, and consultation fee
* View available appointment slots for the next 7 days
* Book an appointment by entering patient details
* Add personal health summary including:

  * Blood group
  * Known medical conditions
  * Current medications
* Receive a unique Booking ID after successful booking

### Doctor Side

* Secure doctor login
* View today's appointments
* See patient details and health summary before consultation
* Add diagnosis notes after consultation
* Add prescription details
* Block specific dates or time slots for leave, holidays, or emergencies

### Backend Safety

* Double-booking prevention is handled at the backend/database level
* The same doctor, same date, and same time slot cannot be booked twice
* Backend uses a unique slot constraint to prevent duplicate bookings
* If a slot is already booked, the system prevents another booking for the same slot

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### Deployment

* Frontend deployed on Netlify
* Backend deployed on Render
* Database hosted on MongoDB Atlas

## Test Doctor Login

Use these credentials to test the doctor dashboard:

```text
Email: priya@ambula.com
Password: 123456
```

Other test doctor accounts:

```text
Email: amit@ambula.com
Password: 123456
```

```text
Email: sneha@ambula.com
Password: 123456
```

## Project Folder Structure

```text
ambula-care-booking-system/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
└── README.md
```

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/uttam25425/ambula-care-booking-system.git
cd ambula-care-booking-system
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend server:

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

### 3. Setup Frontend

Open this file in your browser:

```text
frontend/index.html
```

For local backend testing, use this API URL in `frontend/script.js`:

```js
const API_BASE_URL = "http://localhost:5000/api";
```

For live deployment, use this API URL:

```js
const API_BASE_URL = "https://ambula-care-backend.onrender.com/api";
```

## Important API Endpoints

### Doctor APIs

```text
GET    /api/doctors
GET    /api/doctors/:id
POST   /api/doctors/login
GET    /api/doctors/dashboard/today
PUT    /api/doctors/appointments/:bookingId/consultation
POST   /api/doctors/block-slot
```

### Booking APIs

```text
POST   /api/bookings
GET    /api/bookings/:bookingId
```

## Data Models

### Doctor

Stores doctor details such as name, email, password, specialization, location, consultation fee, experience, and available slots.

### Booking

Stores appointment details such as patient name, age, phone number, health summary, doctor reference, slot date, slot time, booking ID, diagnosis notes, and prescription.

### BlockedSlot

Stores blocked dates or specific blocked time slots for doctors.

## Double-Booking Prevention

Double-booking prevention is one of the most important parts of this project.

The backend prevents duplicate appointments using a unique constraint on:

```text
Doctor + Slot Date + Slot Time
```

This ensures that one doctor cannot receive two bookings for the same time slot.

## Mobile Responsive Design

The frontend is designed to work on both desktop and mobile screens. The layout adjusts for smaller screens so patients can search doctors, view slots, and book appointments easily on mobile devices.

## Future Improvements

With more time, I would add:

* Patient login system
* Online payment integration
* SMS and email reminders
* Admin panel
* Video consultation
* Complete patient medical history
* Doctor rating and review system

## Intentionally Left Out Feature

I intentionally left out online payment integration because the main focus of this hackathon is doctor search, appointment booking, doctor dashboard, consultation notes, prescription, slot management, and backend double-booking prevention.

## Author

**Uttam Sahu**
GitHub: [uttam25425](https://github.com/uttam25425)
