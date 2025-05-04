window.addEventListener("DOMContentLoaded", () => {
    const app = document.body;
    const loginForm = `
    <div id="login-wrapper">
        <h1 class="title">IoT Tree Theft & Wildfire Detection Dashboard</h1>
        <div class="login-box">
        <h2>Admin Login</h2>
        <input type="email" id="email" placeholder="Email" />
        <input type="password" id="password" placeholder="Password" />
        <button onclick="login()">Login</button>
        <p id="login-error" style="color: red; margin-top: 10px;"></p>
        </div>
    </div>
    `;
  
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        app.innerHTML = loginForm;
      } else {
        document.getElementById("login-container")?.remove();
        // show rest of dashboard is already rendered
      }
    });
  });
  
  function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((error) => {
        document.getElementById("login-error").textContent = error.message;
      });
  }

    