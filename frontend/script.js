const API_BASE_URL = "http://localhost:5000/api";

let selectedDoctorData = null;

// Page load
document.addEventListener("DOMContentLoaded", () => {
  loadDoctors();

  const bookingForm = document.getElementById("bookingForm");
  const loginForm = document.getElementById("loginForm");

  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleDoctorLogin);
  }

  const token = localStorage.getItem("doctorToken");
  const doctorName = localStorage.getItem("doctorName");

  if (token && doctorName) {
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("dashboardTitle").innerText =
      `Today's Appointments - ${doctorName}`;
    loadTodayAppointments();
  }
});

// Toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}

// Load doctors
async function loadDoctors() {
  try {
    const searchValue = document.getElementById("searchInput").value.trim();

    let url = `${API_BASE_URL}/doctors`;

    if (searchValue) {
      url += `?search=${encodeURIComponent(searchValue)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    const doctorList = document.getElementById("doctorList");
    doctorList.innerHTML = "";

    if (!data.success || data.doctors.length === 0) {
      doctorList.innerHTML = `
        <div class="doctor-card">
          <h3>No doctors found</h3>
          <p>Try searching another specialization or location.</p>
        </div>
      `;
      return;
    }

    data.doctors.forEach((doctor) => {
      const card = document.createElement("div");
      card.className = "doctor-card";

      card.innerHTML = `
        <div class="doctor-avatar">${doctor.name.charAt(0)}</div>
        <h3>${doctor.name}</h3>
        <p>${doctor.bio || "Experienced healthcare professional."}</p>

        <div class="card-tags">
          <span class="tag">${doctor.specialization}</span>
          <span class="tag">${doctor.location}</span>
          <span class="tag">₹${doctor.consultationFee}</span>
        </div>

        <p><b>Experience:</b> ${doctor.experience || "5+ years"}</p>

        <button class="btn primary full-btn" onclick="viewDoctorProfile('${doctor._id}')">
          View Slots & Book
        </button>
      `;

      doctorList.appendChild(card);
    });
  } catch (error) {
    showToast("Backend server not running. Start npm run dev.", "error");
  }
}

// View doctor profile
async function viewDoctorProfile(doctorId) {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`);
    const data = await response.json();

    if (!data.success) {
      showToast(data.message || "Doctor profile not found", "error");
      return;
    }

    selectedDoctorData = data.doctor;

    document.getElementById("profileSection").classList.remove("hidden");
    document.getElementById("profileDoctorName").innerText = data.doctor.name;
    document.getElementById("profileDoctorInfo").innerText =
      `${data.doctor.specialization} • ${data.doctor.location}`;

    document.getElementById("profileSpecialization").innerText =
      data.doctor.specialization;
    document.getElementById("profileLocation").innerText = data.doctor.location;
    document.getElementById("profileFee").innerText = data.doctor.consultationFee;
    document.getElementById("profileExperience").innerText =
      data.doctor.experience || "5+ years";
    document.getElementById("profileBio").innerText =
      data.doctor.bio || "Experienced doctor providing quality healthcare.";

    renderSlots(data.availableSlots, doctorId);

    document.getElementById("profileSection").scrollIntoView({
      behavior: "smooth"
    });
  } catch (error) {
    showToast("Failed to load doctor profile", "error");
  }
}

// Render available slots
function renderSlots(availableSlots, doctorId) {
  const slotsContainer = document.getElementById("slotsContainer");
  slotsContainer.innerHTML = "";

  availableSlots.forEach((day) => {
    const dayBox = document.createElement("div");
    dayBox.className = "slot-day";

    const formattedDate = formatDate(day.date);

    let slotsHTML = "";

    if (day.slots.length === 0) {
      slotsHTML = `<p class="no-slot">No slots available</p>`;
    } else {
      day.slots.forEach((slot) => {
        slotsHTML += `
          <button class="slot-btn" onclick="selectSlot('${doctorId}', '${day.date}', '${slot}')">
            ${slot}
          </button>
        `;
      });
    }

    dayBox.innerHTML = `
      <h4>${formattedDate}</h4>
      <div class="slot-list">${slotsHTML}</div>
    `;

    slotsContainer.appendChild(dayBox);
  });
}

// Select slot
function selectSlot(doctorId, date, time) {
  document.getElementById("bookingSection").classList.remove("hidden");

  document.getElementById("selectedDoctorId").value = doctorId;
  document.getElementById("selectedSlotDate").value = date;
  document.getElementById("selectedSlotTime").value = time;

  document.getElementById("selectedSlotText").innerText =
    `${formatDate(date)} at ${time}`;

  document.getElementById("bookingSection").scrollIntoView({
    behavior: "smooth"
  });
}

// Booking submit
async function handleBookingSubmit(event) {
  event.preventDefault();

  const bookingData = {
    doctorId: document.getElementById("selectedDoctorId").value,
    slotDate: document.getElementById("selectedSlotDate").value,
    slotTime: document.getElementById("selectedSlotTime").value,
    patientName: document.getElementById("patientName").value.trim(),
    age: document.getElementById("age").value,
    phone: document.getElementById("phone").value.trim(),
    bloodGroup: document.getElementById("bloodGroup").value.trim(),
    medicalConditions: document.getElementById("medicalConditions").value.trim(),
    currentMedications: document.getElementById("currentMedications").value.trim()
  };

  if (
    !bookingData.doctorId ||
    !bookingData.slotDate ||
    !bookingData.slotTime ||
    !bookingData.patientName ||
    !bookingData.age ||
    !bookingData.phone
  ) {
    showToast("Please fill all required booking details", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("successSection").classList.remove("hidden");
      document.getElementById("bookingIdText").innerText =
        data.booking.bookingId;

      document.getElementById("bookingForm").reset();

      showToast("Appointment booked successfully", "success");

      document.getElementById("successSection").scrollIntoView({
        behavior: "smooth"
      });

      viewDoctorProfile(bookingData.doctorId);
      return;
    }

    if (response.status === 409 && data.nextAvailableSlot) {
      const next = data.nextAvailableSlot;

      showToast(
        `Selected slot unavailable. Next slot: ${formatDate(next.date)} at ${next.time}`,
        "warning"
      );

      selectSlot(bookingData.doctorId, next.date, next.time);
      return;
    }

    showToast(data.message || "Booking failed", "error");
  } catch (error) {
    showToast("Booking failed. Check backend server.", "error");
  }
}

// Doctor login
async function handleDoctorLogin(event) {
  event.preventDefault();

  const email = document.getElementById("doctorEmail").value.trim();
  const password = document.getElementById("doctorPassword").value.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/doctors/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!data.success) {
      showToast(data.message || "Login failed", "error");
      return;
    }

    localStorage.setItem("doctorToken", data.token);
    localStorage.setItem("doctorName", data.doctor.name);

    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("dashboardTitle").innerText =
      `Today's Appointments - ${data.doctor.name}`;

    showToast("Doctor login successful", "success");

    loadTodayAppointments();

    document.getElementById("dashboard").scrollIntoView({
      behavior: "smooth"
    });
  } catch (error) {
    showToast("Login failed. Check backend server.", "error");
  }
}

// Load today's appointments
async function loadTodayAppointments() {
  const token = localStorage.getItem("doctorToken");

  if (!token) {
    showToast("Please login first", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/doctors/dashboard/today`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success) {
      showToast(data.message || "Failed to load appointments", "error");
      return;
    }

    const appointmentList = document.getElementById("appointmentList");
    appointmentList.innerHTML = "";

    if (data.appointments.length === 0) {
      appointmentList.innerHTML = `
        <div class="appointment-card">
          <h3>No appointments today</h3>
          <p>Once a patient books today's slot, it will appear here.</p>
        </div>
      `;
      return;
    }

    data.appointments.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "appointment-card";

      card.innerHTML = `
        <div class="appointment-top">
          <div>
            <h3>${booking.patientName}</h3>
            <p>Age: ${booking.age} | Phone: ${booking.phone}</p>
            <p>Slot: ${formatDate(booking.slotDate)} at ${booking.slotTime}</p>
            <p>Status: <b>${booking.status}</b></p>
          </div>
          <div>
            <span class="tag">${booking.bookingId}</span>
          </div>
        </div>

        <div class="health-summary">
          <div class="health-box">
            <span>Blood Group</span>
            <strong>${booking.bloodGroup || "Not provided"}</strong>
          </div>

          <div class="health-box">
            <span>Medical Conditions</span>
            <strong>${booking.medicalConditions || "None mentioned"}</strong>
          </div>

          <div class="health-box">
            <span>Current Medications</span>
            <strong>${booking.currentMedications || "None mentioned"}</strong>
          </div>
        </div>

        <div class="consultation-form">
          <textarea id="diagnosis-${booking._id}" placeholder="Enter diagnosis notes">${booking.diagnosisNotes || ""}</textarea>
          <textarea id="prescription-${booking._id}" placeholder="Enter prescription">${booking.prescription || ""}</textarea>

          <button class="btn primary" onclick="updateConsultation('${booking._id}')">
            Save Consultation
          </button>
        </div>
      `;

      appointmentList.appendChild(card);
    });
  } catch (error) {
    showToast("Failed to load appointments", "error");
  }
}

// Update consultation notes
async function updateConsultation(bookingId) {
  const token = localStorage.getItem("doctorToken");

  const diagnosisNotes = document.getElementById(`diagnosis-${bookingId}`).value;
  const prescription = document.getElementById(`prescription-${bookingId}`).value;

  try {
    const response = await fetch(
      `${API_BASE_URL}/doctors/appointments/${bookingId}/consultation`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          diagnosisNotes,
          prescription
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      showToast(data.message || "Failed to update consultation", "error");
      return;
    }

    showToast("Consultation saved successfully", "success");
    loadTodayAppointments();
  } catch (error) {
    showToast("Failed to update consultation", "error");
  }
}

// Block slot
async function blockSlot() {
  const token = localStorage.getItem("doctorToken");

  if (!token) {
    showToast("Please login first", "warning");
    return;
  }

  const slotDate = document.getElementById("blockDate").value;
  const slotTime = document.getElementById("blockTime").value;
  const reason = document.getElementById("blockReason").value.trim();

  if (!slotDate) {
    showToast("Please select a date to block", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/doctors/block-slot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        slotDate,
        slotTime,
        reason
      })
    });

    const data = await response.json();

    if (!data.success) {
      showToast(data.message || "Failed to block slot", "error");
      return;
    }

    showToast("Slot blocked successfully", "success");

    document.getElementById("blockDate").value = "";
    document.getElementById("blockTime").value = "";
    document.getElementById("blockReason").value = "";

    loadTodayAppointments();

    if (selectedDoctorData) {
      viewDoctorProfile(selectedDoctorData._id);
    }
  } catch (error) {
    showToast("Failed to block slot", "error");
  }
}

// Logout
function logoutDoctor() {
  localStorage.removeItem("doctorToken");
  localStorage.removeItem("doctorName");

  document.getElementById("dashboard").classList.add("hidden");

  showToast("Doctor logged out", "success");
}

// Home reset
function goHome() {
  document.getElementById("successSection").classList.add("hidden");
  document.getElementById("bookingSection").classList.add("hidden");

  document.getElementById("patient").scrollIntoView({
    behavior: "smooth"
  });

  loadDoctors();
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}