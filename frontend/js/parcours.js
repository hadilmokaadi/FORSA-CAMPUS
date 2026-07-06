const API = "http://127.0.0.1:5000";

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

document.getElementById("user").innerText = fullName;
document.getElementById("navAvatar").innerText = initial;
document.getElementById("sideAvatar").innerText = initial;
document.getElementById("sidebarName").innerText = fullName;

// Load profile photo (if any) to replace the initial circle
fetch(`${API}/profile`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
        const photoPath = data.photo || data.logo;
        if (!photoPath) return;
        const photoUrl = `${API}/${photoPath.replace(/\\/g, "/")}`;

        const img = new Image();
        img.onload = () => {
            const navAvatar = document.getElementById("navAvatar");
            navAvatar.innerHTML = "";
            navAvatar.style.backgroundImage = `url('${photoUrl}')`;
            navAvatar.style.backgroundSize = "cover";
            navAvatar.style.backgroundPosition = "center";

            const sideAvatar = document.getElementById("sideAvatar");
            if (sideAvatar) {
                sideAvatar.innerHTML = "";
                sideAvatar.style.backgroundImage = `url('${photoUrl}')`;
                sideAvatar.style.backgroundSize = "cover";
                sideAvatar.style.backgroundPosition = "center";
            }
        };
        img.onerror = () => console.warn("Photo de profil introuvable:", photoUrl);
        img.src = photoUrl;
    })
    .catch(err => console.error("Erreur chargement photo profil:", err));

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
    fetch(`${API}/logout`, { credentials: "include" })
        .finally(() => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
}

// ─────────────────────────────
// PARCOURS UNIVERSITAIRE — CRUD
// ─────────────────────────────
const listEl = document.getElementById("parcoursList");
const overlay = document.getElementById("modalOverlay");
const formError = document.getElementById("formError");

function loadParcours() {
    fetch(`${API}/mes-parcours`, { credentials: "include" })
        .then(res => res.json())
        .then(renderParcours)
        .catch(err => console.error("Erreur chargement parcours:", err));
}

function formatDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "short" });
}

function renderParcours(items) {
    if (!items || items.length === 0) {
        listEl.innerHTML = `
            <div class="parcours-empty">
                <div style="font-size:32px; margin-bottom:8px;">🎓</div>
                <p>Aucune formation ajoutée pour l'instant.<br>Cliquez sur « + Ajouter » pour commencer.</p>
            </div>`;
        return;
    }

    const ul = document.createElement("ul");
    ul.className = "timeline";

    items.forEach(item => {
        const li = document.createElement("li");
        li.className = "timeline-item";

        const entree = formatDate(item.date_entree);
        const sortie = formatDate(item.date_sortie);
        const years = (entree || sortie) ? `${entree || "—"} – ${sortie || "présent"}` : "";

        li.innerHTML = `
            <div class="timeline-card">
                <div class="timeline-top">
                    <div>
                        <div class="timeline-diplome">${escapeHtml(item.etablissement)}</div>
                        <div class="timeline-etab">${escapeHtml(item.universite)}${item.specialite ? " · " + escapeHtml(item.specialite) : ""}</div>
                        <div class="timeline-years">${years}</div>
                    </div>
                    <div class="timeline-actions">
                        <button class="icon-btn" title="Modifier" onclick='openParcoursForm(${JSON.stringify(item)})'>✎</button>
                        <button class="icon-btn danger" title="Supprimer" onclick="deleteParcours(${item.id})">🗑</button>
                    </div>
                </div>
            </div>
        `;

        ul.appendChild(li);
    });

    listEl.innerHTML = "";
    listEl.appendChild(ul);
}

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
}

function openParcoursForm(item) {
    formError.style.display = "none";
    document.getElementById("parcoursForm").reset();

    if (item) {
        document.getElementById("modalTitle").innerText = "Modifier la formation";
        document.getElementById("parcoursId").value = item.id;
        document.getElementById("universite").value = item.universite || "";
        document.getElementById("etablissement").value = item.etablissement || "";
        document.getElementById("specialite").value = item.specialite || "";
        document.getElementById("dateEntree").value = item.date_entree ? item.date_entree.split("T")[0] : "";
        document.getElementById("dateSortie").value = item.date_sortie ? item.date_sortie.split("T")[0] : "";
    } else {
        document.getElementById("modalTitle").innerText = "Ajouter une formation";
        document.getElementById("parcoursId").value = "";
    }

    overlay.classList.add("open");
}

function closeParcoursForm() {
    overlay.classList.remove("open");
}

function submitParcours(e) {
    e.preventDefault();

    const id = document.getElementById("parcoursId").value;
    const payload = {
        universite: document.getElementById("universite").value.trim(),
        etablissement: document.getElementById("etablissement").value.trim(),
        specialite: document.getElementById("specialite").value.trim(),
        date_entree: document.getElementById("dateEntree").value || null,
        date_sortie: document.getElementById("dateSortie").value || null
    };

    if (!payload.universite || !payload.etablissement) {
        formError.style.display = "block";
        return;
    }

    const url = id ? `${API}/parcours/${id}` : `${API}/parcours`;
    const method = id ? "PUT" : "POST";

    fetch(url, {
        method: method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(() => {
            closeParcoursForm();
            loadParcours();
        })
        .catch(err => console.error("Erreur enregistrement parcours:", err));
}

function deleteParcours(id) {
    if (!confirm("Supprimer cette formation ?")) return;

    fetch(`${API}/parcours/${id}`, {
        method: "DELETE",
        credentials: "include"
    })
        .then(res => res.json())
        .then(() => loadParcours())
        .catch(err => console.error("Erreur suppression parcours:", err));
}

overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeParcoursForm();
});

// ─────────────────────────────
// CV UPLOAD
// ─────────────────────────────
function loadCv() {
    fetch(`${API}/profile`, { credentials: "include" })
        .then(res => res.json())
        .then(data => renderCv(data.cv))
        .catch(err => console.error("Erreur chargement CV:", err));
}

function renderCv(cvFilename) {
    const info = document.getElementById("cvInfo");
    const link = document.getElementById("cvViewLink");

    if (cvFilename) {
        info.innerHTML = `CV actuel<span>${escapeHtml(cvFilename)}</span>`;
        link.href = `${API}/uploads/${cvFilename}`;
        link.style.display = "inline-block";
    } else {
        info.textContent = "Aucun CV ajouté pour l'instant.";
        link.style.display = "none";
    }
}

function uploadCv() {
    const fileInput = document.getElementById("cvInput");
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cv", file);

    fetch(`${API}/profile/cv`, {
        method: "POST",
        credentials: "include",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.cv) {
                renderCv(data.cv);
            } else {
                alert(data.message || "Erreur lors de l'envoi du CV");
            }
        })
        .catch(err => console.error("Erreur upload CV:", err))
        .finally(() => { fileInput.value = ""; });
}

// ─────────────────────────────
// INIT
// ─────────────────────────────
loadParcours();
loadCv();