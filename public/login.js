const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);

    const loginData = Object.fromEntries(formData);

    const jsonData = JSON.stringify(loginData);

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
        window.location.href = "dashboard.html";
    } else {
        alert(result);
    }
});