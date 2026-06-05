// ─────────────────────────────
// USER AUTH
// ─────────────────────────────
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}

const nom = (user.nom || "").trim();
const prenom = (user.prenom || "").trim();
const fullName = (nom + " " + prenom).trim() || user.name || user.email || "User";
const initial = (nom[0] || prenom[0] || fullName[0] || "U").toUpperCase();

const userEl = document.getElementById("user");
const avatarEl = document.getElementById("navAvatar");

if (userEl) userEl.innerText = fullName;
if (avatarEl) avatarEl.innerText = initial;

// ─────────────────────────────
// DROPDOWN MENU
// ─────────────────────────────
const userMenu = document.getElementById("userMenu");

if (userMenu) {
    userMenu.addEventListener("click", function (e) {
        if (e.target.closest(".dropdown-item")) {
            userMenu.classList.remove("open");
            return;
        }
        e.stopPropagation();
        userMenu.classList.toggle("open");
    });

    document.addEventListener("click", function () {
        userMenu.classList.remove("open");
    });
}

// ─────────────────────────────
// LOGOUT
// ─────────────────────────────
function logout() {
    fetch("http://127.0.0.1:5000/logout")
        .finally(() => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
}

// ─────────────────────────────
// LIVE SEARCH (AJAX)
// ─────────────────────────────
const API = "http://127.0.0.1:5000";
const searchInput = document.getElementById("searchInput");
const resultsBox = document.getElementById("searchResults");

if (searchInput && resultsBox) {

    let timeout = null;

    searchInput.addEventListener("input", function () {
        const query = this.value.trim();

        clearTimeout(timeout);

        if (!query) {
            resultsBox.style.display = "none";
            resultsBox.innerHTML = "";
            return;
        }

        timeout = setTimeout(() => {
            fetch(`http://127.0.0.1:5000/api/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(renderResults)
                .catch(err => console.error("Search error:", err));
        }, 300);
    });

    function renderResults(data) {
        resultsBox.innerHTML = "";

        if (!data || data.length === 0) {
            resultsBox.innerHTML = `<div class="search-item">No results</div>`;
            resultsBox.style.display = "block";
            return;
        }

        data.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("search-item");

            div.innerHTML = `
                <span>${item.name}</span>
                <span class="search-type">${item.type}</span>
            `;

            div.addEventListener("click", () => {
                // ✅ FIXED ROUTE (NO MORE /profile/type/id BUG)
                window.location.href = `view-profile.html?id=${item.id}`;
            });

            resultsBox.appendChild(div);
        });

        resultsBox.style.display = "block";
    }

    // hide dropdown when clicking outside
    document.addEventListener("click", function (e) {
        const container = document.querySelector(".nav-search");
        if (container && !container.contains(e.target)) {
            resultsBox.style.display = "none";
        }
    });
}