/* ================= STATE ================= */

const state = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  users: JSON.parse(localStorage.getItem("users")) || [],
  services: JSON.parse(localStorage.getItem("services")) || [
    {
      id: 1,
      title: "Rahul Plumbing",
      category: "Plumber",
      price: 500,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
      rating: 4.5,
      reviews: []
    },
    {
      id: 2,
      title: "Amit Electric Works",
      category: "Electrician",
      price: 700,
      image: "https://images.unsplash.com/photo-1581092334441-0f7f7c6e7a59",
      rating: 4.2,
      reviews: []
    }
  ],
  bookings: JSON.parse(localStorage.getItem("bookings")) || []
};

function save() {
  localStorage.setItem("user", JSON.stringify(state.user));
  localStorage.setItem("users", JSON.stringify(state.users));
  localStorage.setItem("services", JSON.stringify(state.services));
  localStorage.setItem("bookings", JSON.stringify(state.bookings));
}

/* ================= ROUTE PROTECTION ================= */

function protectRoute() {
  const page = window.location.pathname;

  if (
    (page.includes("dashboard.html") || page.includes("bookings.html")) &&
    !state.user
  ) {
    window.location.href = "login.html";
  }
}

protectRoute();

/* ================= TOAST ================= */

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ================= AUTH ================= */

function register(name, email, pass, role) {
  if (state.users.find(u => u.email === email)) {
    toast("User already exists");
    return;
  }

  state.users.push({ id: Date.now(), name, email, pass, role });
  save();
  toast("Registered Successfully");
  window.location.href = "login.html";
}

function login(email, pass) {
  const user = state.users.find(u => u.email === email && u.pass === pass);

  if (!user) {
    toast("Invalid Credentials");
    return;
  }

  state.user = user;
  save();
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("user");
  state.user = null;
  window.location.href = "login.html";
}

/* ================= SERVICES ================= */

function renderServices() {
  const container = document.getElementById("services");
  if (!container) return;

  container.innerHTML = state.services.map(s => `
    <div class="card">
      <img src="${s.image}" onerror="this.src='https://via.placeholder.com/300x180'">
      <div class="card-content">
        <h3>${s.title}</h3>
        <p>${s.category}</p>
        <p><strong>₹${s.price}</strong></p>
        <div class="rating">⭐ ${s.rating.toFixed(1)}</div>
        <button class="btn" onclick="openModal(${s.id})">View</button>
      </div>
    </div>
  `).join("");
}

function addService(title, category, price, image) {
  if (!state.user || state.user.role !== "provider") {
    toast("Only providers can add services");
    return;
  }

  state.services.push({
    id: Date.now(),
    title,
    category,
    price,
    image,
    rating: 0,
    reviews: []
  });

  save();
  toast("Service Added");
}

/* ================= BOOKING ================= */

function book(serviceId, date) {
  state.bookings.push({
    id: Date.now(),
    serviceId,
    userId: state.user.id,
    date
  });
  save();
  toast("Booking Confirmed");
}

function renderBookings() {
  const list = document.getElementById("bookingList");
  if (!list) return;

  const userBookings = state.bookings.filter(
    b => b.userId === state.user.id
  );

  if (userBookings.length === 0) {
    list.innerHTML = "<p>No bookings yet.</p>";
  } else {
    list.innerHTML = userBookings.map(b => {
      const service = state.services.find(s => s.id === b.serviceId);
      return `
        <div class="card">
          <div class="card-content">
            <h3>${service.title}</h3>
            <p>Date: ${b.date}</p>
          </div>
        </div>
      `;
    }).join("");
  }
}

/* ================= MODAL ================= */

function openModal(id) {
  const service = state.services.find(s => s.id === id);
  const modal = document.getElementById("modal");

  modal.innerHTML = `
    <div class="modal-content">
      <h2>${service.title}</h2>
      <p>${service.category}</p>
      <p><strong>₹${service.price}</strong></p>

      <input type="date" id="bDate">
      <button class="btn" onclick="confirmBooking(${service.id})">Confirm</button>
      <button class="btn" onclick="closeModal()">Close</button>
    </div>
  `;

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function confirmBooking(id) {
  const date = document.getElementById("bDate").value;
  if (!date) {
    toast("Select a date");
    return;
  }
  book(id, date);
  closeModal();
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  renderBookings();
});