const state = {
  currentUser: JSON.parse(localStorage.getItem("currentUser")) || null,
  users: JSON.parse(localStorage.getItem("users")) || [],
  services: JSON.parse(localStorage.getItem("services")) || [],
  bookings: JSON.parse(localStorage.getItem("bookings")) || []
};

function saveState() {
  localStorage.setItem("users", JSON.stringify(state.users));
  localStorage.setItem("services", JSON.stringify(state.services));
  localStorage.setItem("bookings", JSON.stringify(state.bookings));
  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
}

/* AUTH */

function registerUser(name, email, password, role) {
  if (state.users.find(u => u.email === email)) {
    alert("User already exists");
    return;
  }

  state.users.push({ id: Date.now(), name, email, password, role });
  saveState();
  alert("Registered!");
  window.location.href = "login.html";
}

function loginUser(email, password) {
  const user = state.users.find(u => u.email === email && u.password === password);
  if (!user) {
    alert("Invalid credentials");
    return;
  }

  state.currentUser = user;
  saveState();
  window.location.href = "index.html";
}

function logout() {
  state.currentUser = null;
  saveState();
  window.location.href = "login.html";
}

/* SERVICES */

function addService(title, category, location, price, image) {
  if (!state.currentUser || state.currentUser.role !== "provider") return;

  state.services.push({
    id: Date.now(),
    title,
    category,
    location,
    price,
    rating: 0,
    reviews: [],
    providerId: state.currentUser.id,
    image
  });

  saveState();
  renderServices();
}

function renderServices() {
  const container = document.getElementById("servicesContainer");
  if (!container) return;

  container.innerHTML = state.services.map(service => `
    <div class="card">
      <img src="${service.image}">
      <h3>${service.title}</h3>
      <p>${service.category} • ${service.location}</p>
      <p>₹${service.price}</p>
      <p>⭐ ${service.rating.toFixed(1)}</p>
      <button onclick="openModal(${service.id})">View</button>
    </div>
  `).join("");
}

/* BOOKING */

function createBooking(serviceId, date, time) {
  if (!state.currentUser) {
    alert("Login required");
    return;
  }

  state.bookings.push({
    id: Date.now(),
    serviceId,
    userId: state.currentUser.id,
    date,
    time
  });

  saveState();
  alert("Booking Confirmed!");
}

/* REVIEW */

function addReview(serviceId, rating, comment) {
  const service = state.services.find(s => s.id === serviceId);

  service.reviews.push({ rating, comment });

  service.rating =
    service.reviews.reduce((sum, r) => sum + r.rating, 0) /
    service.reviews.length;

  saveState();
  renderServices();
}

/* MODAL */

function openModal(id) {
  const service = state.services.find(s => s.id === id);
  const modal = document.getElementById("modal");

  modal.innerHTML = `
    <div class="modal-content">
      <h2>${service.title}</h2>
      <p>${service.category}</p>
      <p>₹${service.price}</p>

      <h4>Book</h4>
      <input type="date" id="bDate">
      <input type="time" id="bTime">
      <button onclick="confirmBooking(${service.id})">Confirm</button>

      <h4>Review</h4>
      <input type="number" id="rRating" min="1" max="5">
      <input type="text" id="rComment" placeholder="Comment">
      <button onclick="submitReview(${service.id})">Submit</button>

      <button onclick="closeModal()">Close</button>
    </div>
  `;

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function confirmBooking(id) {
  const date = document.getElementById("bDate").value;
  const time = document.getElementById("bTime").value;
  createBooking(id, date, time);
  closeModal();
}

function submitReview(id) {
  const rating = parseFloat(document.getElementById("rRating").value);
  const comment = document.getElementById("rComment").value;
  addReview(id, rating, comment);
  closeModal();
}

document.addEventListener("DOMContentLoaded", () => {
  renderServices();
});