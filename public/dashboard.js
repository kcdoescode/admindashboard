// ==========================
// Dashboard.js (Per-User LocalStorage Version)
// ==========================

// === Check Login ===
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser) {
  alert("Login first!");
  window.location.href = "index.html";
} else {
  console.log("Logged in as:", loggedInUser.email);
}

// === Show user name in header ===
document.addEventListener("DOMContentLoaded", () => {
  const userBox = document.querySelector(".user");
  if (userBox && loggedInUser) {
    userBox.innerText = (loggedInUser.username || loggedInUser.email) + " ⬇️";
  }
});

let currentData = null; // local state for CRUD
let salesChart = null;  // store chart instance

// === Load Data (per user) ===
function loadData() {
  const key = `dashboardData_${loggedInUser.email}`;
  const savedData = localStorage.getItem(key);

  if (savedData) {
    currentData = JSON.parse(savedData);
    renderDashboard();
  } else {
    // First time for this user: fetch template data.json
    fetch("data.json")
      .then(res => res.json())
      .then(data => {
        currentData = data;
        saveData(); // store under this user's key
        renderDashboard();
      })
      .catch(err => console.error("Error loading data:", err));
  }
}

// === Save Data to LocalStorage (per user) ===
function saveData() {
  const key = `dashboardData_${loggedInUser.email}`;
  localStorage.setItem(key, JSON.stringify(currentData));
}

// === Render Dashboard ===
function renderDashboard() {
  if (!currentData) return;

  // --- Update Cards ---
  document.getElementById("totalSales").innerHTML = `
    <h3>Total Sales</h3>
    <p>$${currentData.stats.totalSales}</p>
  `;

  document.getElementById("activeProducts").innerHTML = `
    <h3>Active Products</h3>
    <p>${currentData.stats.activeProducts}</p>
  `;

  document.getElementById("revenue").innerHTML = `
    <h3>Revenue</h3>
    <p>$${currentData.stats.revenue}</p>
  `;

  // --- Render Chart ---
  const ctx = document.getElementById("salesChart").getContext("2d");
  if (salesChart) salesChart.destroy(); // prevent duplicate charts
  salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: currentData.salesOverview.months,
      datasets: [{
        label: "Sales",
        data: currentData.salesOverview.values,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        fill: true
      }]
    }
  });

  // --- Products Table ---
  const productsTable = document.querySelector("#productsTable tbody");
  productsTable.innerHTML = "";
  currentData.products.forEach((p, i) => {
    productsTable.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>$${p.price}</td>
        <td>${p.stock}</td>
        <td>
          <button onclick="editProduct(${i})">✏️ Edit</button>
          <button onclick="deleteProduct(${i})">🗑️ Delete</button>
        </td>
      </tr>
    `;
  });

  // --- Orders Table ---
  const ordersTable = document.querySelector("#ordersTable tbody");
  ordersTable.innerHTML = "";
  currentData.orders.forEach(o => {
    ordersTable.innerHTML += `
      <tr>
        <td>#${o.id}</td>
        <td>${o.customer}</td>
        <td>${o.date}</td>
        <td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td>
        <td>$${o.total}</td>
      </tr>
    `;
  });
}

// === Edit Product ===
function editProduct(index) {
  const p = currentData.products[index];
  const newPrice = prompt("Enter new price:", p.price);
  const newStock = prompt("Enter new stock:", p.stock);

  if (newPrice && newStock) {
    currentData.products[index].price = newPrice;
    currentData.products[index].stock = newStock;
    saveData();
    alert(`✅ Product ${p.name} updated!`);
    renderDashboard();
  }
}

// === Delete Product ===
function deleteProduct(index) {
  const p = currentData.products[index];
  if (confirm(`Are you sure to delete ${p.name}?`)) {
    currentData.products.splice(index, 1);
    saveData();
    alert(`${p.name} deleted successfully!`);
    renderDashboard();
  }
}

// === Handle New Product Form ===
document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const product = {
    name: document.getElementById("pName").value,
    category: document.getElementById("pCategory").value,
    price: document.getElementById("pPrice").value,
    stock: document.getElementById("pStock").value
  };

  currentData.products.push(product);
  saveData();
  alert(`🎉 Product Added: ${product.name}`);
  renderDashboard();

  e.target.reset();
});

// === Logout ===
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      alert("Logged out successfully!");
      window.location.href = "index.html";
    });
  }
});

// === Start ===
loadData();
// =============================
// Section Navigation Handling
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar ul li a");
  const sections = document.querySelectorAll(".content-section");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // remove active from all links
      links.forEach(l => l.classList.remove("active"));
      // add active to clicked link
      link.classList.add("active");

      // hide all sections
      sections.forEach(sec => sec.classList.remove("active"));

      // show target section
      const target = link.getAttribute("data-target");
      document.getElementById(target).classList.add("active");
    });
  });
});
