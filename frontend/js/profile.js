const API = "http://127.0.0.1:5000";
let currentRole = null;

/* ================= LOAD PROFILE ================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/profile`, { credentials: "include" });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    currentRole = data.role;

    document.getElementById("userName").textContent = `${data.nom} ${data.prenom}`;
    document.getElementById("userEmail").textContent = data.email;
    document.getElementById("userRole").textContent = data.role;

    const avatar = document.getElementById("profileAvatar");
    const photoPath = data.role === "etudiant" ? data.photo : data.logo;
    avatar.src = photoPath
      ? `${API}/${photoPath.replace(/\\/g, "/")}`
      : `https://ui-avatars.com/api/?name=${data.nom}+${data.prenom}`;

    if (data.role === "etudiant") {
      // Hide enterprise form, show student sections
      document.getElementById("profileForm").style.display = "none";
      document.getElementById("parcoursSection").style.display = "block";
      document.getElementById("cvSection").style.display = "block";

      loadParcoursReadOnly();
      renderCv(data.cv);
    } else {
      // Enterprise: show the settings form, hide student-only sections
      document.getElementById("profileForm").style.display = "block";
      document.getElementById("parcoursSection").style.display = "none";
      document.getElementById("cvSection").style.display = "none";

      renderEnterpriseForm(data);
    }

  } catch (err) {
    console.error(err);
    alert("Failed to load profile");
  }
}

/* ================= PHOTO (click-to-edit) ================= */
function uploadPhoto() {
  const fileInput = document.getElementById("photoInput");
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("photo", file);

  fetch(`${API}/profile`, {
    method: "PUT",
    credentials: "include",
    body: formData
  })
    .then(res => res.json())
    .then(() => loadProfile())
    .catch(err => console.error("Erreur mise à jour photo:", err))
    .finally(() => { fileInput.value = ""; });
}

/* ================= PARCOURS (read-only display) ================= */
function loadParcoursReadOnly() {
  fetch(`${API}/mes-parcours`, { credentials: "include" })
    .then(res => res.json())
    .then(renderParcoursReadOnly)
    .catch(err => console.error("Erreur chargement parcours:", err));
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "short" });
}

function renderParcoursReadOnly(items) {
  const list = document.getElementById("parcoursList");

  if (!items || items.length === 0) {
    list.innerHTML = `<div class="parcours-empty">Aucune formation ajoutée pour l'instant.</div>`;
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
        <div class="timeline-diplome">${escapeHtml(item.etablissement)}</div>
        <div class="timeline-etab">${escapeHtml(item.universite)}${item.specialite ? " · " + escapeHtml(item.specialite) : ""}</div>
        <div class="timeline-years">${years}</div>
      </div>
    `;

    ul.appendChild(li);
  });

  list.innerHTML = "";
  list.appendChild(ul);
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}

/* ================= CV ================= */
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

/* ================= ENTERPRISE FORM (unchanged behavior) ================= */
function renderEnterpriseForm(p) {
  const container = document.getElementById("dynamicFields");
  container.innerHTML = `
    <div class="field-row">
      <label>Nom de l'entreprise</label>
      <input id="company_name" value="${p.company_name || ""}" />
    </div>

    <div class="field-row">
      <label>Secteur</label>
      <input id="sector" value="${p.sector || ""}" />
    </div>

    <div class="field-row">
      <label>Site web</label>
      <input id="website" value="${p.website || ""}" />
    </div>

    <div class="field-row">
      <label>Téléphone</label>
      <input id="phone" value="${p.phone || ""}" />
    </div>

    <div class="field-row">
      <label>Adresse</label>
      <input id="address" value="${p.address || ""}" />
    </div>

    <div class="field-row">
      <label>Description</label>
      <textarea id="description">${p.description || ""}</textarea>
    </div>

    <div class="field-row">
      <label>Logo</label>
      <input type="file" id="logo" />
    </div>
  `;
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (currentRole !== "entreprise") return;

  const formData = new FormData();

  ["company_name", "sector", "website", "phone", "address", "description"].forEach(id => {
    const el = document.getElementById(id);
    if (el) formData.append(id, el.value);
  });

  const logo = document.getElementById("logo")?.files[0];
  if (logo) formData.append("logo", logo);

  try {
    const res = await fetch(`${API}/profile`, {
      method: "PUT",
      credentials: "include",
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert("Profil mis à jour !");
    loadProfile();

  } catch (err) {
    console.error(err);
    alert("Erreur lors de la mise à jour");
  }
});

/* ================= BOOT ================= */
document.addEventListener("DOMContentLoaded", loadProfile);