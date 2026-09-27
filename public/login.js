const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const loginButton = document.getElementById("loginButton");

function getRoleFromToken(token) {
    try {
        const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
        return JSON.parse(atob(paddedPayload)).role || "student";
    } catch (error) {
        return "student";
    }
}

function getSignedInPage(token) {
    return getRoleFromToken(token) === "mentor" ? "mentor.html" : "dashboard.html";
}

function redirectIfAlreadySignedIn() {
    const token = localStorage.getItem("token");
    if (token) {
        window.location.replace(getSignedInPage(token));
    }
}

redirectIfAlreadySignedIn();
window.addEventListener("pageshow", redirectIfAlreadySignedIn);

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const loginData = Object.fromEntries(formData);
    const jsonData = JSON.stringify(loginData);

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
    }

    if (loginStatus) {
        loginStatus.textContent = "";
        loginStatus.className = "authStatus";
    }

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: jsonData
        });

        const result = await response.text();

        if (response.ok) {
            localStorage.setItem("token", result);
            window.location.replace(getSignedInPage(result));
            return;
        }

        if (loginStatus) {
            loginStatus.textContent = result || "Login failed. Please try again.";
            loginStatus.classList.add("authStatusError");
        } else {
            alert(result || "Login failed. Please try again.");
        }
    } catch (error) {
        if (loginStatus) {
            loginStatus.textContent = "Something went wrong while logging in. Please try again.";
            loginStatus.classList.add("authStatusError");
        } else {
            alert("Something went wrong while logging in. Please try again.");
        }
    } finally {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    }
});