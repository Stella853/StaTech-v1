const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

     const formData = new FormData(registerForm);

     const studentData = Object.fromEntries(formData);

     const jsonData = JSON.stringify(studentData);

    fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: jsonData
});
     console.log(formData);

    console.log("Registration form submitted!");
});