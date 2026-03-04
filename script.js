let isLogin = true;

/* ================= AUTH ================= */

function toggleAuth() {
  isLogin = !isLogin;

  document.getElementById("authTitle").innerText =
    isLogin ? "Login" : "Register";

  document.getElementById("authBtn").innerText =
    isLogin ? "Login" : "Register";

  document.getElementById("name").classList.toggle("hidden");
  document.getElementById("phone").classList.toggle("hidden");
  document.getElementById("role").classList.toggle("hidden");
}

function handleAuth() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (isLogin) {
    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      alert("Invalid login");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    loadDashboard();
  } else {
    if (users.find(u => u.email === email)) {
      alert("User already exists");
      return;
    }

    users.push({ name, phone, email, password, role });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registered successfully");
    toggleAuth();
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

/* ================= ROUTER ================= */

function loadDashboard() {
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.remove("hidden");

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (user.role === "provider") {
    providerPanel();
  } else {
    userPanel();
  }
}

/* ================= USER PANEL ================= */

function userPanel() {
  const dashboard = document.getElementById("dashboard");

  dashboard.innerHTML = `
    <h3>Available Services</h3>
    <div id="serviceList" class="grid"></div>

    <h3>My Bookings</h3>
    <div id="bookingList" class="grid"></div>
  `;

  renderServices();
  renderUserBookings();
}

function renderServices() {
  const list = document.getElementById("serviceList");
  const services = JSON.parse(localStorage.getItem("services")) || [];
  list.innerHTML = "";

  services.forEach(s => {
    list.innerHTML += `
      <div class="card">
        <img src="${s.image}">
        <h4>${s.title}</h4>
        <p>₹${s.price}</p>
        <button class="btn primary" onclick="bookService(${s.id})">
          Book Service
        </button>
      </div>
    `;
  });
}

function bookService(serviceId) {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const user = JSON.parse(localStorage.getItem("currentUser"));

  bookings.push({
    id: Date.now(),
    serviceId,
    userEmail: user.email,
    status: "Pending"
  });

  localStorage.setItem("bookings", JSON.stringify(bookings));
  renderUserBookings();
}

function renderUserBookings() {
  const list = document.getElementById("bookingList");
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const services = JSON.parse(localStorage.getItem("services")) || [];
  list.innerHTML = "";

  bookings.forEach(b => {
    const service = services.find(s => s.id === b.serviceId);

    if (service) {
      list.innerHTML += `
        <div class="card">
          <h4>${service.title}</h4>
          <span class="status ${b.status.toLowerCase()}">${b.status}</span>

          ${
            b.status === "Approved"
              ? `
                <p><strong>Provider Email:</strong> ${service.providerEmail}</p>
                <p><strong>Provider Phone:</strong> ${getProviderPhone(service.providerEmail)}</p>
              `
              : ""
          }
        </div>
      `;
    }
  });
}

/* ================= PROVIDER PANEL ================= */

function providerPanel() {
  const dashboard = document.getElementById("dashboard");

  dashboard.innerHTML = `
    <div class="form-box">
      <h3>Add Service</h3>
      <input id="title" placeholder="Service Title">
      <input id="price" placeholder="Price">
      <input type="file" id="image">
      <button class="btn primary" onclick="addService()">Add Service</button>
    </div>

    <h3>My Services</h3>
    <div id="serviceList" class="grid"></div>

    <h3>Bookings</h3>
    <div id="bookingList" class="grid"></div>
  `;

  renderProviderServices();
  renderProviderBookings();
}

function addService() {
  const title = document.getElementById("title").value;
  const price = document.getElementById("price").value;
  const imageInput = document.getElementById("image");

  if (!imageInput.files[0]) {
    alert("Select image");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    let services = JSON.parse(localStorage.getItem("services")) || [];
    const user = JSON.parse(localStorage.getItem("currentUser"));

    services.push({
      id: Date.now(),
      title,
      price,
      image: reader.result,
      providerEmail: user.email
    });

    localStorage.setItem("services", JSON.stringify(services));
    renderProviderServices();
  };

  reader.readAsDataURL(imageInput.files[0]);
}

function renderProviderServices() {
  const list = document.getElementById("serviceList");
  const services = JSON.parse(localStorage.getItem("services")) || [];
  const user = JSON.parse(localStorage.getItem("currentUser"));
  list.innerHTML = "";

  services
    .filter(s => s.providerEmail === user.email)
    .forEach(s => {
      list.innerHTML += `
        <div class="card">
          <img src="${s.image}">
          <h4>${s.title}</h4>
          <button class="btn danger" onclick="deleteService(${s.id})">
            Delete
          </button>
        </div>
      `;
    });
}

function deleteService(id) {
  let services = JSON.parse(localStorage.getItem("services")) || [];
  services = services.filter(s => s.id !== id);
  localStorage.setItem("services", JSON.stringify(services));
  renderProviderServices();
}

function renderProviderBookings() {
  const list = document.getElementById("bookingList");
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const services = JSON.parse(localStorage.getItem("services")) || [];
  const user = JSON.parse(localStorage.getItem("currentUser"));
  list.innerHTML = "";

  bookings.forEach(b => {
    const service = services.find(
      s => s.id === b.serviceId && s.providerEmail === user.email
    );

    if (service) {
      list.innerHTML += `
        <div class="card">
          <h4>${service.title}</h4>
          <p>User Email: ${b.userEmail}</p>
          <p>User Phone: ${getUserPhone(b.userEmail)}</p>

          <span class="status ${b.status.toLowerCase()}">${b.status}</span>

          ${
            b.status === "Pending"
              ? `
                <button class="btn success" onclick="updateStatus(${b.id},'Approved')">Accept</button>
                <button class="btn warning" onclick="updateStatus(${b.id},'Rejected')">Reject</button>
              `
              : ""
          }
        </div>
      `;
    }
  });
}

function updateStatus(id, status) {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  bookings.forEach(b => {
    if (b.id === id) {
      b.status = status;
    }
  });

  localStorage.setItem("bookings", JSON.stringify(bookings));
  renderProviderBookings();
}

/* ================= HELPERS ================= */

function getProviderPhone(email) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const provider = users.find(u => u.email === email);
  return provider ? provider.phone : "N/A";
}

function getUserPhone(email) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email);
  return user ? user.phone : "N/A";
}

/* ================= AUTO LOGIN ================= */

window.onload = function () {
  if (localStorage.getItem("currentUser")) {
    loadDashboard();
  }
};