document.addEventListener("DOMContentLoaded", () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js").catch((error) => {
            console.log("Offline support could not be enabled:", error.message);
        });
    }

    const navigationTarget = document.getElementById("sharedNavigation");
    const dashboardNavigationTarget = document.getElementById("dashboardNavigation");

    if (dashboardNavigationTarget) {
        dashboardNavigationTarget.innerHTML = `
            <nav class="dashboardNav" aria-label="Dashboard navigation">
                <a class="brand" href="dashboard.html" aria-label="StaTech dashboard">
                    <img src="statech-logo.svg" alt="">
                    <span>StaTech</span>
                </a>
                <div class="dashboardNavLinks">
                    <a href="#" data-dashboard-section="dashboard">Dashboard</a>
                    <a href="#" data-dashboard-section="courses">Courses</a>
                    <a href="#" data-dashboard-section="achievements">Achievements</a>
                    <a href="#" data-dashboard-section="profile">Profile</a>
                    <a href="#" id="dashboardNavLogout">Logout</a>
                </div>
            </nav>
        `;

        dashboardNavigationTarget.querySelectorAll("[data-dashboard-section]").forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                window.showSection(link.dataset.dashboardSection);
            });
        });

        dashboardNavigationTarget.querySelector("#dashboardNavLogout").addEventListener("click", (event) => {
            event.preventDefault();
            window.logout();
        });

        return;
    }

    if (!navigationTarget) {
        return;
    }

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const isHomePage = currentPage === "index.html";
    const links = [
        { href: "index.html", label: "Home", className: isHomePage ? "active" : "" },
        { href: "index.html#about", label: "About" },
        { href: "index.html#how-it-works", label: "How it works" },
        { href: "index.html#courses", label: "Courses" },
        { href: "index.html#contact", label: "Contact" }
    ];

    navigationTarget.innerHTML = `
        <nav class="sharedNav ${isHomePage ? "homeNav" : ""}" aria-label="Main navigation">
            <a class="brand" href="index.html" aria-label="StaTech home">
                <img src="statech-logo.svg" alt="">
                <span>StaTech</span>
            </a>
            ${isHomePage ? '<span class="navAudience">Learning space for ages 12-17</span>' : ""}
            <button class="navMenuButton" type="button" aria-expanded="false" aria-controls="sharedNavLinks">
                Menu
            </button>
            <div id="sharedNavLinks" class="sharedNavLinks">
                <ul>
                    ${links.map((link) => `<li><a class="${link.className}" href="${link.href}">${link.label}</a></li>`).join("")}
                </ul>
                <div class="navAccountLinks">
                    <a href="login.html">Login</a>
                    <a class="navRegisterLink" href="register.html">Start learning</a>
                </div>
            </div>
        </nav>
    `;

    const menuButton = navigationTarget.querySelector(".navMenuButton");
    const navLinks = navigationTarget.querySelector(".sharedNavLinks");

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isOpen));
        navLinks.classList.toggle("is-open", !isOpen);
    });
});
