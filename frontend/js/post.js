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
// COMPOSER — image preview + publish
// ─────────────────────────────
const postImageInput = document.getElementById("postImage");
const composerPreview = document.getElementById("composerPreview");
const composerPreviewImg = document.getElementById("composerPreviewImg");
const postSuccess = document.getElementById("postSuccess");
let selectedImageFile = null;

postImageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = function (e) {
        composerPreviewImg.src = e.target.result;
        composerPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

function publishPost() {
    const content = document.getElementById("postContent").value.trim();

    if (!content && !selectedImageFile) {
        alert("Écrivez quelque chose ou ajoutez une photo avant de publier.");
        return;
    }

    const formData = new FormData();
    formData.append("content", content);
    if (selectedImageFile) formData.append("image", selectedImageFile);

    const btn = document.getElementById("publishBtn");
    btn.disabled = true;
    btn.innerText = "Publication…";

    fetch(`${API}/posts`, {
        method: "POST",
        credentials: "include",
        body: formData
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById("postContent").value = "";
            postImageInput.value = "";
            selectedImageFile = null;
            composerPreview.style.display = "none";
            postSuccess.style.display = "block";

            setTimeout(() => {
                window.location.href = "feed.html";
            }, 1200);
        })
        .catch(err => console.error("Erreur publication:", err))
        .finally(() => {
            btn.disabled = false;
            btn.innerText = "Publier";
        });
}