/* ============================
   script.js - Frontend Logic
   ============================ */

// Local "dummy DB" stored in localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Handle Login Form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const msg = document.getElementById("loginMessage");

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Save login session
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      msg.textContent = "✅ Login successful!";
      setTimeout(() => window.location.href = "dashboard.html", 800);
    } else {
      msg.textContent = "❌ Invalid email or password!";
    }
  });
}

// Handle Signup Form
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const msg = document.getElementById("signupMessage");

    let users = getUsers();

    if (users.find(u => u.email === email)) {
      msg.textContent = "⚠️ Email already exists!";
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    saveUsers(users);

    // Save login session immediately
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));

    msg.textContent = "🎉 Signup successful!";
    setTimeout(() => window.location.href = "dashboard.html", 800);
  });
}

// ====== Utility: Logout ======
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}
