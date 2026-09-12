let lessonsData = [];
const RECENT_LESSON_KEY = "staTechRecentLesson";

function getRecentLesson() {
    try {
        const savedLesson = localStorage.getItem(RECENT_LESSON_KEY);
        return savedLesson ? JSON.parse(savedLesson) : null;
    } catch (error) {
        console.log("Failed to read recent lesson:", error);
        return null;
    }
}

function setRecentLesson(lesson) {
    if (!lesson) {
        return;
    }

    localStorage.setItem(
        RECENT_LESSON_KEY,
        JSON.stringify({
            _id: lesson._id,
            title: lesson.title,
            subject: lesson.subject,
            grade: lesson.grade,
            content: lesson.content
        })
    );
}

function renderContinueLearning() {
    const continueLearningTitle = document.getElementById("continueLearningTitle");
    const continueLearningSubtitle = document.getElementById("continueLearningSubtitle");
    const continueLearningContent = document.getElementById("continueLearningContent");
    const continueLessonButton = document.getElementById("continueLessonButton");

    if (!continueLearningTitle || !continueLearningSubtitle) {
        return;
    }

    const recentLesson = getRecentLesson();

    if (!recentLesson) {
        continueLearningTitle.textContent = "No recent lesson yet";
        continueLearningSubtitle.textContent = "Choose a lesson from Courses to resume your learning.";

        if (continueLearningContent) {
            continueLearningContent.innerHTML = "";
        }

        if (continueLessonButton) {
            continueLessonButton.disabled = true;
        }

        return;
    }

    continueLearningTitle.textContent = recentLesson.subject;
    continueLearningSubtitle.textContent = `Last lesson: ${recentLesson.title}`;

    if (continueLessonButton) {
        continueLessonButton.disabled = false;
    }

    if (continueLearningContent) {
        continueLearningContent.innerHTML = `
            <div class="lessonContent">
                <h2>${recentLesson.title}</h2>
                <p>Subject: ${recentLesson.subject}</p>
                <p>Grade: ${recentLesson.grade}</p>
                <hr>
                <p>${recentLesson.content}</p>
            </div>
        `;
    }
}

async function loadDashboard() {
    const token = localStorage.getItem("token");

    console.log("Token exists:", !!token);
    console.log("Token parts:", token ? token.split(".").length : 0);
    console.log("Token length:", token ? token.length : 0);

    if (!token) {
        window.location.href = "/";
        return;
    }

    const response = await fetch("http://localhost:3000/dashboard", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.log("Dashboard authentication failed:", response.status);

        localStorage.removeItem("token");
        window.location.href = "/";
        return;
    }

    const student = await response.json();

    console.log(student);

    document.getElementById("welcomeMessage").textContent =
        `Welcome back, ${student.name}!`;

    document.getElementById("studentSchool").textContent =
        `School: ${student.school}`;

    document.getElementById("studentGrade").textContent =
        `Grade: ${student.grade}`;

    document.getElementById("studentAge").textContent =
        `Age: ${student.age}`;

    document.getElementById("studentGender").textContent =
        `Gender: ${student.gender}`;

    document.getElementById("profileName").textContent =
        `Name: ${student.name}`;

    document.getElementById("profileSchool").textContent =
        `School: ${student.school}`;

    document.getElementById("profileGrade").textContent =
        `Grade: ${student.grade}`;

    document.getElementById("profileAge").textContent =
        `Age: ${student.age}`;

    document.getElementById("profileGender").textContent =
        `Gender: ${student.gender}`;

    document.getElementById("profileNameInput").value = student.name || "";
    document.getElementById("profileSchoolInput").value = student.school || "";
    document.getElementById("profileGradeInput").value = student.grade || "";
    document.getElementById("profileAgeInput").value = student.age || "";
    document.getElementById("profileGenderInput").value = student.gender || "";

    const lessonsResponse = await fetch("http://localhost:3000/lessons");

    const lessons = await lessonsResponse.json();
    lessonsData = lessons;

    console.log("Lessons:", lessons);

    console.log("First lesson:", lessons[0]);

    lessons.forEach((lesson) => {
    console.log("Lesson:", lesson.title);
});

    console.log("First lesson title:", lessons[0].title);

    const continueLessonButton = document.getElementById("continueLessonButton");
    const continueLearningContent = document.getElementById("continueLearningContent");

    renderContinueLearning();

    if (continueLessonButton && continueLearningContent) {
        continueLessonButton.addEventListener("click", () => {
            const recentLesson = getRecentLesson();

            if (!recentLesson) {
                continueLearningContent.innerHTML = "<p>No recent lesson yet.</p>";
                return;
            }

            continueLearningContent.innerHTML = `
                <div class="lessonContent">
                    <h2>${recentLesson.title}</h2>
                    <p>Subject: ${recentLesson.subject}</p>
                    <p>Grade: ${recentLesson.grade}</p>
                    <hr>
                    <p>${recentLesson.content}</p>
                </div>
            `;
        });
    }

    const programmingButton = document.getElementById("programmingButton");
    const webDevelopmentButton = document.getElementById("webDevelopmentButton");
    const computerScienceButton = document.getElementById("computerScienceButton");

    function renderLessonsBySubject(subject, containerId) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        const filteredLessons = lessonsData.filter((lesson) =>
            lesson.subject === subject
        );

        container.innerHTML = "";

        filteredLessons.forEach((lesson) => {
            container.innerHTML += `
                <div class="lessonCard">
                    <h4>${lesson.title}</h4>
                    <p>${lesson.subject} • Grade ${lesson.grade}</p>
                    <button class="startLessonButton" data-lesson-id="${lesson._id}">Start Lesson</button>
                </div>
            `;
        });

        const startLessonButtons = container.querySelectorAll(".startLessonButton");

        startLessonButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const lessonId = button.dataset.lessonId;
                const lesson = lessonsData.find((item) => item._id === lessonId);

                if (!lesson) {
                    return;
                }

                setRecentLesson(lesson);
                renderContinueLearning();

                container.innerHTML = `
                    <div class="lessonContent">
                        <h2>${lesson.title}</h2>
                        <p>Subject: ${lesson.subject}</p>
                        <p>Grade: ${lesson.grade}</p>
                        <hr>
                        <p>${lesson.content}</p>
                    </div>
                `;
            });
        });
    }

    if (programmingButton) {
        programmingButton.addEventListener("click", () => {
            renderLessonsBySubject("Programming", "programmingLessons");
        });
    }

    if (webDevelopmentButton) {
        webDevelopmentButton.addEventListener("click", () => {
            renderLessonsBySubject("Web Development", "webDevelopmentLessons");
        });
    }

    if (computerScienceButton) {
        computerScienceButton.addEventListener("click", () => {
            renderLessonsBySubject("Computer Science", "computerScienceLessons");
        });
    }

    console.log("Dashboard response:", response.status);
}

loadDashboard();

function validateProfileForm() {
    const name = document.getElementById("profileNameInput").value.trim();
    const school = document.getElementById("profileSchoolInput").value.trim();
    const grade = Number(document.getElementById("profileGradeInput").value);
    const age = Number(document.getElementById("profileAgeInput").value);
    const gender = document.getElementById("profileGenderInput").value.trim();

    if (!name || !school || !gender) {
        alert("Please fill in your name, school, and gender.");
        return false;
    }

    if (!Number.isInteger(grade) || grade < 1 || grade > 12) {
        alert("Grade must be a whole number between 1 and 12.");
        return false;
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
        alert("Age must be a whole number between 1 and 120.");
        return false;
    }

    return true;
}

const profileForm = document.getElementById("profileForm");

if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateProfileForm()) {
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/";
            return;
        }

        const updatedStudent = {
            name: document.getElementById("profileNameInput").value.trim(),
            school: document.getElementById("profileSchoolInput").value.trim(),
            grade: Number(document.getElementById("profileGradeInput").value),
            age: Number(document.getElementById("profileAgeInput").value),
            gender: document.getElementById("profileGenderInput").value.trim()
        };

        const response = await fetch("http://localhost:3000/dashboard", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedStudent)
        });

        if (!response.ok) {
            console.log("Profile update failed:", response.status);
            return;
        }

        const updatedProfile = await response.json();

        document.getElementById("profileName").textContent =
            `Name: ${updatedProfile.name}`;

        document.getElementById("profileSchool").textContent =
            `School: ${updatedProfile.school}`;

        document.getElementById("profileGrade").textContent =
            `Grade: ${updatedProfile.grade}`;

        document.getElementById("profileAge").textContent =
            `Age: ${updatedProfile.age}`;

        document.getElementById("profileGender").textContent =
            `Gender: ${updatedProfile.gender}`;

        alert("Profile updated successfully!");
    });
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem(RECENT_LESSON_KEY);
    window.location.assign("http://localhost:3000/");
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
    });
}

const sidebarLogoutButton = document.getElementById("sidebarLogoutButton");

if (sidebarLogoutButton) {
    sidebarLogoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
    });
}

function renderCourses() {
    const coursesList = document.getElementById("coursesList");

    if (!coursesList) {
        return;
    }

    if (!lessonsData || lessonsData.length === 0) {
        coursesList.innerHTML = "<p>No courses available right now.</p>";
        return;
    }

    coursesList.innerHTML = lessonsData.map((lesson) => `
        <div class="lessonCard">
            <h4>${lesson.title}</h4>
            <p>Subject: ${lesson.subject}</p>
            <p>Grade: ${lesson.grade}</p>
            <button class="startCourseLessonButton" data-lesson-id="${lesson._id}">Start Lesson</button>
        </div>
    `).join("");

    const startCourseButtons = coursesList.querySelectorAll(".startCourseLessonButton");

    startCourseButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const lessonId = button.dataset.lessonId;
            const lesson = lessonsData.find((item) => item._id === lessonId);

            if (!lesson) {
                return;
            }

            setRecentLesson(lesson);
            renderContinueLearning();

            coursesList.innerHTML = `
                <div class="lessonContent">
                    <h2>${lesson.title}</h2>
                    <p>Subject: ${lesson.subject}</p>
                    <p>Grade: ${lesson.grade}</p>
                    <hr>
                    <p>${lesson.content}</p>
                </div>
            `;
        });
    });
}

function showSection(sectionId) {
    const dashboardSections = [
        "studentInfo",
        "continueLearning",
        "lessons",
        "progress",
        "quizzes",
        "achievements"
    ];

    const dashboardTitle = document.getElementById("dashboardTitle");

    dashboardSections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = "none";
        }
    });

    ["courses", "profile"].forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = "none";
        }
    });

    if (dashboardTitle) {
        dashboardTitle.style.display = "none";
    }

    if (sectionId === "dashboard") {
        dashboardSections.forEach((section) => {
            const element = document.getElementById(section);
            if (element) {
                element.style.display = "block";
            }
        });

        if (dashboardTitle) {
            dashboardTitle.style.display = "block";
        }

        return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = "block";
    }

    if (sectionId === "courses") {
        renderCourses();
    }
}
