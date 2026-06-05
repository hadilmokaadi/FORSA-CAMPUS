const API = "http://127.0.0.1:5000";

const userId = new URLSearchParams(window.location.search).get("id");
const box = document.getElementById("profileBox");

if (!userId) {
  box.innerHTML = "<p>No user selected</p>";
  throw new Error("Missing user id");
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

async function loadProfile() {
  try {
    const res = await fetch(`${API}/profile/${userId}`);
    const data = await res.json();

    if (!res.ok) {
      box.innerHTML = "<p>User not found</p>";
      return;
    }

    const photo = data.photo
      ? `${API}/${data.photo}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nom || "User")}`;

    const logo = data.logo
      ? `${API}/${data.logo}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.company_name || "Company")}`;

    if (data.role === "etudiant") {
      box.innerHTML = `
        <div class="profile-header">
          <img class="profile-img" src="${photo}" />
          <div>
            <h2>${escapeHtml(data.nom || "")} ${escapeHtml(data.prenom || "")}</h2>
            <p>${escapeHtml(data.email || "")}</p>
            <span class="tag student">Student</span>
          </div>
        </div>

        <div class="profile-body">
          <div class="info-block"><b>University:</b> ${escapeHtml(data.university || "-")}</div>
          <div class="info-block"><b>Degree:</b> ${escapeHtml(data.degree || "-")}</div>
          <div class="info-block"><b>Field:</b> ${escapeHtml(data.field_of_study || "-")}</div>
          <div class="info-block"><b>Bio:</b> ${escapeHtml(data.bio || "-")}</div>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div class="profile-header">
          <img class="profile-img" src="${logo}" />
          <div>
            <h2>${escapeHtml(data.company_name || "")}</h2>
            <p>${escapeHtml(data.email || "")}</p>
            <span class="tag company">Company</span>
          </div>
        </div>

        <div class="profile-body">
          <div class="info-block"><b>Sector:</b> ${escapeHtml(data.sector || "-")}</div>
          <div class="info-block"><b>Website:</b> ${escapeHtml(data.website || "-")}</div>
          <div class="info-block"><b>Description:</b> ${escapeHtml(data.description || "-")}</div>
        </div>
      `;
    }

  } catch (err) {
    console.error(err);
    box.innerHTML = "<p>Error loading profile</p>";
  }
}

loadProfile();