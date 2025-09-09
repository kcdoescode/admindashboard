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

let currentData = null; 
let salesChart = null;
let priceChart = null;
let stockChart = null;

// === Load Data (per user) ===
function loadData() {
  const key = `dashboardData_${loggedInUser.email}`;
  const savedData = localStorage.getItem(key);

  if (savedData) {
    currentData = JSON.parse(savedData);
    renderDashboard();
  } else {
    fetch("data.json")
      .then(res => res.json())
      .then(data => {
        currentData = data;
        saveData();
        renderDashboard();
      })
      .catch(err => console.error("Error loading data:", err));
  }
}

// === Save Data ===
function saveData() {
  const key = `dashboardData_${loggedInUser.email}`;
  localStorage.setItem(key, JSON.stringify(currentData));
}

// === Render Dashboard ===
function renderDashboard() {
  if (!currentData) return;

  // --- Update Cards ---
  document.getElementById("totalSales").innerHTML = `
    
    <p>$${currentData.stats.totalSales}</p>
  `;

  document.getElementById("activeProducts").innerHTML = `
    
    <p>${currentData.stats.activeProducts}</p>
  `;

  document.getElementById("revenue").innerHTML = `
    
    <p>$${currentData.stats.revenue}</p>
  `;

  // --- Sales Chart ---
  const ctx = document.getElementById("salesChart").getContext("2d");
  if (salesChart) salesChart.destroy();
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

  // --- Price & Stock Charts ---
  renderProductCharts();

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
    ordersTable.innerHTML = `
      <tr>
        <td>#${o.id}</td>
        <td>${o.customer}</td>
        <td>${o.date}</td>
        <td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td>
        <td>$${o.total}</td>
      </tr>
    ` + ordersTable.innerHTML;
  });
}

// === Render Product Charts (Price & Stock) ===
function renderProductCharts() {
  const categories = {};
  currentData.products.forEach(p => {
    if (!categories[p.category]) {
      categories[p.category] = { totalPrice: 0, count: 0, totalStock: 0 };
    }
    categories[p.category].totalPrice += parseFloat(p.price);
    categories[p.category].count++;
    categories[p.category].totalStock += parseInt(p.stock);
  });

  const labels = Object.keys(categories);
  const avgPrices = labels.map(cat => (categories[cat].totalPrice / categories[cat].count).toFixed(2));
  const stocks = labels.map(cat => categories[cat].totalStock);

  // Price Chart
  const ctxPrice = document.getElementById("priceChart").getContext("2d");
  if (priceChart) priceChart.destroy();
  priceChart = new Chart(ctxPrice, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Average Price ($)",
        data: avgPrices,
        backgroundColor: "rgba(34,197,94,0.6)"
      }]
    }
  });

  // Stock Chart
  const ctxStock = document.getElementById("stockChart").getContext("2d");
  if (stockChart) stockChart.destroy();
  stockChart = new Chart(ctxStock, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        label: "Stock Count",
        data: stocks,
        backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"]
      }]
    }
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
    renderDashboard(); // 🔥 Charts auto-refresh
  }
}

// === Delete Product ===
function deleteProduct(index) {
  const p = currentData.products[index];
  if (confirm(`Are you sure to delete ${p.name}?`)) {
    currentData.products.splice(index, 1);
    saveData();
    alert(`${p.name} deleted successfully!`);
    renderDashboard(); // 🔥 Charts auto-refresh
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
  renderDashboard(); // 🔥 Charts auto-refresh

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

      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(sec => sec.classList.remove("active"));

      const target = link.getAttribute("data-target");
      document.getElementById(target).classList.add("active");
    });
  });
});
