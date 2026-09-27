function getRoleFromToken(token) {
    try {
        const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
        return JSON.parse(atob(paddedPayload)).role || "student";
    } catch (error) {
        return "student";
    }
}

function makeCell(value) {
    const cell = document.createElement("td");
    cell.textContent = String(value);
    return cell;
}

async function loadMentorReport() {
    const token = localStorage.getItem("token");
    const status = document.getElementById("mentorStatus");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    if (getRoleFromToken(token) !== "mentor") {
        window.location.replace("dashboard.html");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/mentor/learners", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const responseMessage = await response.text();

        if (response.status === 401 || (response.status === 403 && responseMessage === "Invalid token!")) {
            localStorage.removeItem("token");
            window.location.replace("login.html");
            return;
        }

        if (!response.ok) {
            throw new Error(response.status === 403
                ? responseMessage || "Mentor access is not enabled for this account. Contact the StaTech administrator."
                : responseMessage || "Learner progress could not be loaded.");
        }

        const report = JSON.parse(responseMessage);
        const rows = document.getElementById("mentorLearnerRows");
        document.getElementById("mentorSchoolName").textContent = report.school;
        document.getElementById("mentorLearnerCount").textContent = `${report.learners.length} learners`;
        rows.replaceChildren();

        if (report.learners.length === 0) {
            const row = document.createElement("tr");
            const cell = makeCell("No learner activity is available yet.");
            cell.colSpan = 4;
            row.append(cell);
            rows.append(row);
        } else {
            report.learners.forEach((learner) => {
                const row = document.createElement("tr");
                row.append(
                    makeCell(learner.name || "Learner"),
                    makeCell(learner.grade ?? "Not set"),
                    makeCell(`${learner.completedLessons}/${report.totalLessons}`),
                    makeCell(learner.completedQuizzes)
                );
                rows.append(row);
            });
        }
    } catch (error) {
        status.textContent = error.message || "We couldn't connect. Try again when you are online.";
    }
}

document.getElementById("mentorLogoutButton").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staTechRecentLesson");
    localStorage.removeItem("staTechCachedStudent");
    window.location.replace("login.html");
});

loadMentorReport();