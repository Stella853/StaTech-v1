const PUBLIC_CONTACT_CACHE_KEY = "staTechPublicContactEmail";
const publicContactEmail = document.getElementById("publicContactEmail");
const contactEmailUnavailable = document.getElementById("contactEmailUnavailable");
const publicEmailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

async function loadPublicContactEmail() {
    if (!publicContactEmail || !contactEmailUnavailable) {
        return;
    }

    let email = "";
    try {
        const response = await fetch("/public-config");
        if (!response.ok) {
            throw new Error("Public contact settings could not be loaded.");
        }

        const settings = await response.json();
        email = String(settings.contactEmail || "").trim();
        if (email && publicEmailPattern.test(email)) {
            try {
                localStorage.setItem(PUBLIC_CONTACT_CACHE_KEY, email);
            } catch (error) {
                console.log("Public contact could not be cached offline.");
            }
        }
    } catch (error) {
        try {
            email = localStorage.getItem(PUBLIC_CONTACT_CACHE_KEY) || "";
        } catch (storageError) {
            email = "";
        }
    }

    if (!publicEmailPattern.test(email)) {
        return;
    }

    publicContactEmail.href = `mailto:${email}`;
    publicContactEmail.textContent = email;
    publicContactEmail.hidden = false;
    contactEmailUnavailable.hidden = true;
}

loadPublicContactEmail();