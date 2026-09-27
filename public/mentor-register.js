const mentorRegistrationForm = document.getElementById("mentorRegistrationForm");
const mentorRegisterStatus = document.getElementById("mentorRegisterStatus");
const mentorRegisterButton = document.getElementById("mentorRegisterButton");

if (mentorRegistrationForm) {
    mentorRegistrationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        mentorRegisterButton.disabled = true;
        mentorRegisterStatus.textContent = "Creating your account...";
        mentorRegisterStatus.className = "authStatus";

        try {
            const response = await fetch("http://localhost:3000/register/mentor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(mentorRegistrationForm)))
            });

            const message = await response.text();
            mentorRegisterStatus.textContent = message;
            mentorRegisterStatus.classList.add(response.ok ? "authStatusSuccess" : "authStatusError");

            if (response.ok) {
                mentorRegistrationForm.reset();
            }
        } catch (error) {
            mentorRegisterStatus.textContent = "We couldn't connect. Check your connection and try again.";
            mentorRegisterStatus.classList.add("authStatusError");
        } finally {
            mentorRegisterButton.disabled = false;
        }
    });
}