let lessonsData = [];
let progressState = {
    completedLessonIds: [],
    completedQuizLessons: [],
    completedLessons: 0,
    completedQuizzes: 0,
    totalLessons: 0
};
const RECENT_LESSON_KEY = "staTechRecentLesson";
const CACHED_STUDENT_KEY = "staTechCachedStudent";
const CACHED_LESSONS_KEY = "staTechCachedLessons";

function getCachedStudent(token) {
    try {
        const cachedStudent = JSON.parse(localStorage.getItem(CACHED_STUDENT_KEY) || "null");
        return cachedStudent?.token === token ? cachedStudent.student : null;
    } catch (error) {
        return null;
    }
}

function getCachedLessons() {
    try {
        const cachedLessons = JSON.parse(localStorage.getItem(CACHED_LESSONS_KEY) || "null");
        return Array.isArray(cachedLessons) ? cachedLessons : [];
    } catch (error) {
        return [];
    }
}

function showDashboardStatus(message) {
    const dashboardLoadStatus = document.getElementById("dashboardLoadStatus");
    if (dashboardLoadStatus) {
        dashboardLoadStatus.hidden = false;
        dashboardLoadStatus.textContent = message;
    }
}

async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        window.clearTimeout(timeoutId);
    }
}

function handleExpiredSession(response) {
    if (response.status !== 401 && response.status !== 403) {
        return false;
    }

    localStorage.removeItem("token");
    window.location.replace("login.html");
    return true;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function lessonContentMarkup(lesson) {
    const content = escapeHtml(lesson.content || "").replace(/\r?\n/g, "<br>");

    return `
        <div class="lessonContent">
            <h2>${escapeHtml(lesson.title)}</h2>
            <p>Subject: ${escapeHtml(lesson.subject)}</p>
            <p>Grade: ${escapeHtml(lesson.grade)}</p>
            <hr>
            <div class="lessonBody">${content}</div>
        </div>
    `;
}

function quizMarkup(lesson) {
    const quizQuestions = lesson.quizQuestions || [];
    const quizCompleted = progressState.completedQuizLessons.includes(String(lesson._id));

    return `
        <section class="lessonQuiz" aria-labelledby="lessonQuizTitle">
            <h3 id="lessonQuizTitle">Quick quiz</h3>
            <p>Check what you remember from this lesson. Choose one answer for each question.</p>
            <form id="lessonQuizForm">
                ${quizQuestions.map((quiz, questionIndex) => `
                    <fieldset class="quizQuestion">
                        <legend>${questionIndex + 1}. ${escapeHtml(quiz.question)}</legend>
                        ${quiz.options.map((option, optionIndex) => `
                            <label>
                                <input type="radio" name="question-${questionIndex}" value="${escapeHtml(option)}" required>
                                ${escapeHtml(option)}
                            </label>
                        `).join("")}
                    </fieldset>
                `).join("")}
                <button id="submitLessonQuiz" type="submit" ${quizCompleted ? "disabled" : ""}>
                    ${quizCompleted ? "Quiz completed" : "Submit quiz"}
                </button>
                <p id="quizResult" role="status">${quizCompleted ? "You have already completed this quiz." : ""}</p>
            </form>
        </section>
    `;
}

function showLessonInReader(lesson) {
    const reader = document.getElementById("lessonReader");
    const readerTitle = document.getElementById("lessonReaderTitle");
    const readerContent = document.getElementById("lessonReaderContent");

    if (!reader || !readerTitle || !readerContent) {
        return;
    }

    readerTitle.textContent = lesson.title;
    const isComplete = progressState.completedLessonIds.includes(String(lesson._id));

    readerContent.innerHTML = `${lessonContentMarkup(lesson)}
        <div id="lessonEndMarker" aria-hidden="true"></div>
        <button id="completeLessonButton" type="button" ${isComplete ? "disabled" : ""}>
            ${isComplete ? "Lesson completed" : "Mark lesson complete"}
        </button>
        <p id="lessonProgressMessage" role="status"></p>
        ${quizMarkup(lesson)}`;
    reader.classList.add("is-visible");

    const completeLessonButton = document.getElementById("completeLessonButton");

    if (completeLessonButton && !isComplete) {
        completeLessonButton.addEventListener("click", () => markLessonComplete(lesson));
    }

    const lessonQuizForm = document.getElementById("lessonQuizForm");

    if (lessonQuizForm && !progressState.completedQuizLessons.includes(String(lesson._id))) {
        lessonQuizForm.addEventListener("submit", (event) => {
            event.preventDefault();
            submitLessonQuiz(lesson);
        });
    }

    reader.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitLessonQuiz(lesson) {
    const form = document.getElementById("lessonQuizForm");
    const result = document.getElementById("quizResult");
    const submitButton = document.getElementById("submitLessonQuiz");

    if (!form || !result || !submitButton) {
        return;
    }

    const answers = new FormData(form);
    let score = 0;

    lesson.quizQuestions.forEach((quiz, questionIndex) => {
        if (answers.get(`question-${questionIndex}`) === quiz.answer) {
            score += 1;
        }
    });

    if (score < lesson.quizQuestions.length) {
        result.textContent = `You scored ${score}/${lesson.quizQuestions.length}. Review the lesson and try again.`;
        result.className = "quizResultRetry";
        return;
    }

    submitButton.disabled = true;
    result.textContent = "Excellent! Your quiz is complete and your progress is being saved.";

    try {
        const response = await fetch(`http://localhost:3000/progress/quizzes/${lesson._id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (handleExpiredSession(response)) {
            return;
        }

        if (!response.ok) {
            throw new Error("Quiz progress could not be saved.");
        }

        const progress = await response.json();
        progressState = {
            ...progressState,
            ...progress,
            completedQuizLessons: (progress.completedQuizLessons || []).map(String)
        };
        renderProgress();
        submitButton.textContent = "Quiz completed";
    } catch (error) {
        submitButton.disabled = false;
        result.textContent = "The quiz was correct, but progress could not be saved. Please try again.";
    }
}

function syncQuickStats() {
    const nextLessonFocus = document.getElementById("nextLessonFocus");
    const quickLessonsValue = document.getElementById("quickLessonsValue");
    const quickFocusValue = document.getElementById("quickFocusValue");
    const recentLesson = getRecentLesson();
    const percentage = progressState.totalLessons > 0
        ? Math.round((progressState.completedLessons / progressState.totalLessons) * 100)
        : 0;

    if (nextLessonFocus) {
        nextLessonFocus.textContent = recentLesson
            ? `${recentLesson.subject}: ${recentLesson.title}`
            : "Choose a lesson";
    }

    if (quickLessonsValue) {
        quickLessonsValue.textContent = `${progressState.completedLessons}/${progressState.totalLessons}`;
    }

    if (quickFocusValue) {
        quickFocusValue.textContent = percentage >= 50 ? "On track" : percentage >= 20 ? "Building momentum" : "Start strong";
    }
}

function renderProgress() {
    const lessonsCompletedCount = document.getElementById("lessonsCompletedCount");
    const overallProgressCount = document.getElementById("overallProgressCount");
    const percentage = progressState.totalLessons > 0
        ? Math.round((progressState.completedLessons / progressState.totalLessons) * 100)
        : 0;

    if (lessonsCompletedCount) {
        lessonsCompletedCount.textContent = `${progressState.completedLessons}/${progressState.totalLessons}`;
    }

    if (overallProgressCount) {
        overallProgressCount.textContent = `${percentage}%`;
    }

    syncQuickStats();
    renderAchievements();
}

function renderAchievements() {
    const achievementOverview = document.getElementById("achievementOverview");

    if (!achievementOverview) {
        return;
    }

    const achievements = [
        {
            title: "First Lesson",
            description: "Complete your first lesson.",
            unlocked: progressState.completedLessons >= 1
        },
        {
            title: "Quiz Starter",
            description: "Complete your first quiz.",
            unlocked: progressState.completedQuizzes >= 1
        },
        {
            title: "Course Explorer",
            description: "Complete lessons from all four subjects.",
            unlocked: new Set(lessonsData
                .filter((lesson) => progressState.completedLessonIds.includes(String(lesson._id)))
                .map((lesson) => lesson.subject)).size >= 4
        },
        {
            title: "Learning Builder",
            description: "Complete five lessons.",
            unlocked: progressState.completedLessons >= 5
        }
    ];

    achievementOverview.innerHTML = achievements.map((achievement) => `
        <div class="achievementItem ${achievement.unlocked ? "achievementUnlocked" : ""}" role="button" tabindex="0" data-achievement-target="progress">
            <h4>${achievement.unlocked ? "Unlocked: " : ""}${achievement.title}</h4>
            <p>${achievement.description}</p>
            <p>Status: ${achievement.unlocked ? "Complete" : "Locked"}</p>
            <span class="achievementAction">${achievement.unlocked ? "View progress" : "Keep learning"}</span>
        </div>
    `).join("");

    achievementOverview.querySelectorAll(".achievementItem").forEach((achievement) => {
        const openProgress = () => {
            const progressSection = document.getElementById("progress");

            if (progressSection) {
                progressSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        achievement.addEventListener("click", openProgress);
        achievement.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openProgress();
            }
        });
    });
}

async function loadProgress(token) {
    const response = await fetch("http://localhost:3000/progress", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (handleExpiredSession(response)) {
        throw new Error("Session expired.");
    }

    if (!response.ok) {
        throw new Error("Progress could not be loaded.");
    }

    const progress = await response.json();
    progressState = {
        ...progress,
        completedLessonIds: (progress.completedLessonIds || []).map(String),
        completedQuizLessons: (progress.completedQuizLessons || []).map(String)
    };
    renderProgress();
}

async function markLessonComplete(lesson) {
    const token = localStorage.getItem("token");
    const completeLessonButton = document.getElementById("completeLessonButton");
    const lessonProgressMessage = document.getElementById("lessonProgressMessage");

    if (!token || !completeLessonButton) {
        return;
    }

    completeLessonButton.disabled = true;
    completeLessonButton.textContent = "Saving progress...";

    try {
        const response = await fetch(`http://localhost:3000/progress/lessons/${lesson._id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (handleExpiredSession(response)) {
            return;
        }

        if (!response.ok) {
            throw new Error("Progress could not be saved.");
        }

        const progress = await response.json();
        progressState = {
            ...progressState,
            ...progress,
            completedLessonIds: (progress.completedLessonIds || []).map(String),
            completedQuizLessons: (progress.completedQuizLessons || []).map(String)
        };
        renderProgress();
        completeLessonButton.textContent = "Lesson completed";

        if (lessonProgressMessage) {
            lessonProgressMessage.textContent = "Your progress has been saved.";
        }
    } catch (error) {
        completeLessonButton.disabled = false;
        completeLessonButton.textContent = "Mark lesson complete";

        if (lessonProgressMessage) {
            lessonProgressMessage.textContent = "We could not save your progress. Please try again.";
        }
    }
}

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

    syncQuickStats();
}

function renderContinueLearning(showContent = false) {
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

    if (continueLearningContent && showContent) {
        continueLearningContent.innerHTML = lessonContentMarkup(recentLesson);
    } else if (continueLearningContent) {
        continueLearningContent.innerHTML = "";
    }
}

async function loadDashboard() {
    const token = localStorage.getItem("token");

    console.log("Token exists:", !!token);
    console.log("Token parts:", token ? token.split(".").length : 0);
    console.log("Token length:", token ? token.length : 0);

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    let student;
    let isUsingOfflineProfile = false;
    try {
        const response = await fetchWithTimeout("http://localhost:3000/dashboard", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (handleExpiredSession(response)) {
                return;
            }

            student = getCachedStudent(token);
            isUsingOfflineProfile = Boolean(student);
            if (!student) {
                showDashboardStatus("We couldn't load your dashboard. Connect to the internet and refresh; your sign-in is saved.");
                return;
            }
        } else {
            student = await response.json();
            try {
                localStorage.setItem(CACHED_STUDENT_KEY, JSON.stringify({ token, student }));
            } catch (error) {
                console.log("Student profile could not be saved for offline use:", error.message);
            }
        }
    } catch (error) {
        student = getCachedStudent(token);
        isUsingOfflineProfile = Boolean(student);
        if (!student) {
            showDashboardStatus("We couldn't connect. Connect to the internet once to save this account for offline lessons.");
            return;
        }
    }

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

    let lessons;
    let usedCachedLessons = false;
    try {
        const lessonsResponse = await fetchWithTimeout("http://localhost:3000/lessons");
        if (!lessonsResponse.ok) {
            throw new Error("Lessons could not be loaded.");
        }
        lessons = await lessonsResponse.json();
        try {
            localStorage.setItem(CACHED_LESSONS_KEY, JSON.stringify(lessons));
        } catch (error) {
            console.log("Lessons could not be saved for offline use:", error.message);
        }
    } catch (error) {
        lessons = getCachedLessons();
        usedCachedLessons = lessons.length > 0;
    }

    lessonsData = lessons;

    if (isUsingOfflineProfile || usedCachedLessons) {
        showDashboardStatus("Offline mode: saved lessons are available. Lesson and quiz progress can only be saved while online.");
    } else if (lessons.length === 0) {
        showDashboardStatus("No saved lessons are available yet. Connect to the internet and refresh to load courses.");
    }

    syncQuickStats();
    renderAchievements();

    try {
        await loadProgress(token);
    } catch (error) {
        console.log(error.message);
    }

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

            renderContinueLearning(true);
        });
    }

    const studentGrade = Number(student.grade);

    function renderLessonsBySubject(subject, containerId, includeAllGrades = false) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        const subjectLessons = lessonsData.filter((lesson) => lesson.subject === subject);
        const filteredLessons = subjectLessons.filter((lesson) =>
            includeAllGrades || Number(lesson.grade) === studentGrade
        );

        container.innerHTML = `
            <div class="courseGradeNotice" role="status">
                <p>${includeAllGrades
                    ? "Showing lessons from all grade levels."
                    : `Showing lessons for Grade ${escapeHtml(studentGrade)}.`}</p>
                <button class="gradeViewToggle" type="button">
                    ${includeAllGrades ? `Show Grade ${escapeHtml(studentGrade)} lessons` : "Show all grade levels"}
                </button>
            </div>
            ${filteredLessons.length === 0
                ? `<p class="courseGradeEmpty">There are no lessons for Grade ${escapeHtml(studentGrade)} yet. You can explore lessons from other grades.</p>`
                : ""}
        `;

        container.querySelector(".gradeViewToggle").addEventListener("click", () => {
            renderLessonsBySubject(subject, containerId, !includeAllGrades);
        });

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
                showLessonInReader(lesson);
            });
        });
    }

    const roadmapSteps = document.querySelector(".roadmapSteps");
    const activeCourseLessons = document.getElementById("activeCourseLessons");
    const activeCourseTitle = document.getElementById("activeCourseTitle");
    const activeCourseLessonList = document.getElementById("activeCourseLessonList");

    document.querySelectorAll(".roadmapButton").forEach((button) => {
        button.addEventListener("click", () => {
            const subject = button.dataset.roadmapSubject;
            const roadmapStep = button.closest(".roadmapStep");

            if (!roadmapStep || !activeCourseLessons || !activeCourseTitle || !activeCourseLessonList) {
                return;
            }

            const isExpanded = roadmapStep.classList.contains("roadmapStepActive");

            document.querySelectorAll(".roadmapStep").forEach((step) => {
                step.classList.remove("roadmapStepActive");
                const stepButton = step.querySelector(".roadmapButton");

                if (stepButton) {
                    stepButton.setAttribute("aria-expanded", "false");
                }
            });

            if (isExpanded) {
                roadmapSteps?.classList.remove("hasActiveCourse");
                activeCourseLessons.hidden = true;
                activeCourseLessonList.innerHTML = "";
                return;
            }

            roadmapStep.classList.add("roadmapStepActive");
            roadmapSteps?.classList.add("hasActiveCourse");
            button.setAttribute("aria-expanded", "true");
            activeCourseTitle.textContent = `${subject} lessons`;
            activeCourseLessons.hidden = false;
            renderLessonsBySubject(subject, "activeCourseLessonList");
            activeCourseLessons.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });

    const closeLessonReader = document.getElementById("closeLessonReader");

    if (closeLessonReader) {
        closeLessonReader.addEventListener("click", () => {
            const reader = document.getElementById("lessonReader");

            if (reader) {
                reader.classList.remove("is-visible");
            }
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
            window.location.replace("login.html");
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

        if (handleExpiredSession(response)) {
            return;
        }

        if (!response.ok) {
            console.log("Profile update failed:", response.status);
            return;
        }

        const updatedProfile = await response.json();
        try {
            localStorage.setItem(CACHED_STUDENT_KEY, JSON.stringify({ token, student: updatedProfile }));
        } catch (error) {
            console.log("Updated profile could not be saved for offline use:", error.message);
        }

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
    localStorage.removeItem(CACHED_STUDENT_KEY);
    window.location.replace("login.html");
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

            coursesList.innerHTML = lessonContentMarkup(lesson);
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
