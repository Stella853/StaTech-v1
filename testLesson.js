const lesson = {
    title: "Introduction to Computers",
    subject: "Computer Science",
    grade: 5,
    content: "A computer is an electronic device that receives, processes, stores and produces information.",
    order: 1
};

fetch("http://localhost:3000/lessons", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(lesson)
})
    .then(response => response.json())
    .then(data => {
        console.log("Lesson created:", data);
    })
    .catch(error => {
        console.log("Error:", error);
    });