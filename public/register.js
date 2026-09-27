const registerForm = document.getElementById("registerForm");
const registerStatus = document.getElementById("registerStatus");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const studentData = Object.fromEntries(formData);
        const jsonData = JSON.stringify(studentData);
        const submitButton = registerForm.querySelector("button[type='submit']");

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating account...";
        }

        if (registerStatus) {
            registerStatus.textContent = "";
            registerStatus.className = "authStatus";
        }

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: jsonData
            });

            const responseText = await response.text();
            let payload = {};

            try {
                payload = responseText ? JSON.parse(responseText) : {};
            } catch (error) {
                payload = { message: responseText || "Registration failed." };
            }

            const message = payload.message || responseText || "Registration failed.";

            if (!response.ok) {
                if (registerStatus) {
                    registerStatus.textContent = message;
                    registerStatus.classList.add("authStatusError");
                } else {
                    alert(message);
                }
                return;
            }

            if (registerStatus) {
                registerStatus.textContent = message;
                registerStatus.classList.add("authStatusSuccess");
            } else {
                alert(message);
            }

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } catch (error) {
            console.error("Registration error:", error);
            if (registerStatus) {
                registerStatus.textContent = "Registration failed. Please try again.";
                registerStatus.classList.add("authStatusError");
            } else {
                alert("Registration failed. Please try again.");
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Register";
            }
        }
    });
}
