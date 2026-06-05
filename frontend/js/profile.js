const API = "http://127.0.0.1:5000";
let currentRole = null;

/* ================= LOAD PROFILE ================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/profile`, { credentials: "include" });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    currentRole = data.role;

    document.getElementById("userName").textContent =
      data.nom + " " + data.prenom;

    document.getElementById("userEmail").textContent = data.email;
    document.getElementById("userRole").textContent = data.role;

    const avatar = document.getElementById("profileAvatar");

    avatar.src =
      data.role === "etudiant"
        ? (data.photo ? `${API}/${data.photo}` :
           `https://ui-avatars.com/api/?name=${data.nom}+${data.prenom}`)
        : (data.logo ? `${API}/${data.logo}` :
           `https://ui-avatars.com/api/?name=${data.nom}+${data.prenom}`);

    renderFields(data);

  } catch (err) {
    console.error(err);
    alert("Failed to load profile");
  }
}

/* ================= RENDER STUDENT ================= */
function renderStudent(p) {
  return `
    <label>University</label>
    <input id="university" value="${p.university || ""}" />

    <label>Degree</label>
    <input id="degree" value="${p.degree || ""}" />

    <label>Field of Study</label>
    <input id="field_of_study" value="${p.field_of_study || ""}" />

    <label>Graduation Year</label>
    <input id="graduation_year" value="${p.graduation_year || ""}" />

    <label>Phone</label>
    <input id="phone" value="${p.phone || ""}" />

    <label>Bio</label>
    <textarea id="bio">${p.bio || ""}</textarea>

    <label>Photo</label>
    <input type="file" id="photo" />
  `;
}

/* ================= RENDER ENTERPRISE ================= */
function renderEnterprise(p) {
  return `
    <label>Company Name</label>
    <input id="company_name" value="${p.company_name || ""}" />

    <label>Sector</label>
    <input id="sector" value="${p.sector || ""}" />

    <label>Website</label>
    <input id="website" value="${p.website || ""}" />

    <label>Phone</label>
    <input id="phone" value="${p.phone || ""}" />

    <label>Address</label>
    <input id="address" value="${p.address || ""}" />

    <label>Description</label>
    <textarea id="description">${p.description || ""}</textarea>

    <label>Logo</label>
    <input type="file" id="logo" />
  `;
}

/* ================= MAIN RENDER ================= */
function renderFields(profile) {
  const container = document.getElementById("dynamicFields");

  if (profile.role === "etudiant") {
    container.innerHTML = renderStudent(profile);
  } else {
    container.innerHTML = renderEnterprise(profile);
  }
}

/* ================= SUBMIT ================= */
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  if (currentRole === "etudiant") {
    [
      "university",
      "degree",
      "field_of_study",
      "graduation_year",
      "phone",
      "bio"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) formData.append(id, el.value);
    });

    const photo = document.getElementById("photo")?.files[0];
    if (photo) formData.append("photo", photo);
  }

  if (currentRole === "entreprise") {
    [
      "company_name",
      "sector",
      "website",
      "phone",
      "address",
      "description"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) formData.append(id, el.value);
    });

    const logo = document.getElementById("logo")?.files[0];
    if (logo) formData.append("logo", logo);
  }

  try {
    const res = await fetch(`${API}/profile`, {
      method: "PUT",
      credentials: "include",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert("Profile updated successfully!");
    loadProfile();

  } catch (err) {
    console.error(err);
    alert("Error updating profile");
  }
});

/* ================= BOOT ================= */
document.addEventListener("DOMContentLoaded", loadProfile);