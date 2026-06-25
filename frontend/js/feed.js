const API = "http://127.0.0.1:5000";
const REACTION_EMOJI = { like: "👍", love: "❤️", support: "🤝" };

// ─────────────────────────────
// USER AUTH (no role-redirect here)
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
        closeAllReactionPickers();
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
// FEED — load + render posts
// ─────────────────────────────
const feedList = document.getElementById("feedList");

function loadFeed() {
    fetch(`${API}/posts`, { credentials: "include" })
        .then(res => res.json())
        .then(renderFeed)
        .catch(err => console.error("Erreur chargement feed:", err));
}

function reactionSummary(reactions) {
    const entries = Object.entries(reactions || {}).filter(([, c]) => c > 0);
    if (entries.length === 0) return "Réagir";
    return entries.map(([type, count]) => `${REACTION_EMOJI[type] || "👍"} ${count}`).join("  ");
}

function renderFeed(posts) {
    if (!posts || posts.length === 0) {
        feedList.innerHTML = `<div class="feed-empty">Aucune publication pour l'instant. Soyez le premier à partager quelque chose !</div>`;
        return;
    }

    feedList.innerHTML = "";

    posts.forEach(post => {
        const authorName = `${post.nom || ""} ${post.prenom || ""}`.trim() || "Utilisateur";
        const authorInitial = (authorName[0] || "U").toUpperCase();
        const date = post.created_at ? new Date(post.created_at).toLocaleString("fr-FR") : "";

        const box = document.createElement("div");
        box.className = "post-box";
        box.dataset.postId = post.id;

        box.innerHTML = `
            <div class="post-head">
                <div class="post-avatar">${authorInitial}</div>
                <div style="flex:1;">
                    <div class="post-author">${escapeHtml(authorName)}</div>
                    <div class="post-meta">${escapeHtml(post.role || "")} · ${date}</div>
                </div>
                ${post.is_owner ? `
                    <div class="post-owner-actions">
                        <button class="icon-btn" title="Modifier" onclick="startEditPost(${post.id})">✎</button>
                        <button class="icon-btn danger" title="Supprimer" onclick="deletePost(${post.id})">🗑</button>
                    </div>` : ""}
            </div>
            ${post.content ? `<div class="post-content" id="post-content-${post.id}">${escapeHtml(post.content)}</div>` : `<div class="post-content" id="post-content-${post.id}"></div>`}
            ${post.image ? `<img class="post-image" src="${API}/uploads/${post.image}" alt="">` : ""}
            <div class="post-actions">
                <div class="reaction-wrapper">
                    <button class="post-action-btn reaction-trigger ${post.my_reaction ? "active" : ""}"
                            onclick="toggleReactionPicker(event, ${post.id})">
                        <span class="reaction-text">${reactionSummary(post.reactions)}</span>
                    </button>
                    <div class="reaction-picker" id="picker-${post.id}">
                        <button type="button" title="J'aime" onclick="react(${post.id}, 'like')">👍</button>
                        <button type="button" title="J'adore" onclick="react(${post.id}, 'love')">❤️</button>
                        <button type="button" title="Solidaire" onclick="react(${post.id}, 'support')">🤝</button>
                    </div>
                </div>
                <button class="post-action-btn" onclick="toggleComments(${post.id}, this)">
                    💬 <span class="comment-count">${post.comment_count}</span>
                </button>
            </div>
            <div class="comments-section" id="comments-${post.id}">
                <div class="comment-list" id="comment-list-${post.id}"></div>
                <div class="comment-input-row">
                    <input type="text" placeholder="Écrire un commentaire…" id="comment-input-${post.id}"
                           onkeydown="if(event.key==='Enter') submitComment(${post.id})">
                    <button class="comment-send" onclick="submitComment(${post.id})">Envoyer</button>
                </div>
            </div>
        `;

        feedList.appendChild(box);
    });
}

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
}

// ─────────────────────────────
// EDIT / DELETE OWN POSTS
// ─────────────────────────────
function startEditPost(postId) {
    const contentEl = document.getElementById(`post-content-${postId}`);
    const currentText = contentEl.innerText;

    contentEl.style.display = "none";

    const row = document.createElement("div");
    row.className = "post-edit-row";
    row.id = `post-edit-row-${postId}`;
    row.innerHTML = `
        <textarea id="post-edit-input-${postId}">${escapeHtml(currentText)}</textarea>
        <div class="post-edit-actions">
            <button class="btn-cancel-post" onclick="cancelEditPost(${postId})">Annuler</button>
            <button class="btn-save-post" onclick="saveEditPost(${postId})">Enregistrer</button>
        </div>
    `;
    contentEl.insertAdjacentElement("afterend", row);
}

function cancelEditPost(postId) {
    const row = document.getElementById(`post-edit-row-${postId}`);
    if (row) row.remove();
    document.getElementById(`post-content-${postId}`).style.display = "block";
}

function saveEditPost(postId) {
    const input = document.getElementById(`post-edit-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    fetch(`${API}/posts/${postId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    })
        .then(res => res.json())
        .then(() => loadFeed())
        .catch(err => console.error("Erreur modification post:", err));
}

function deletePost(postId) {
    if (!confirm("Supprimer cette publication ?")) return;

    fetch(`${API}/posts/${postId}`, {
        method: "DELETE",
        credentials: "include"
    })
        .then(res => res.json())
        .then(() => loadFeed())
        .catch(err => console.error("Erreur suppression post:", err));
}

// ─────────────────────────────
// REACTIONS
// ─────────────────────────────
function closeAllReactionPickers() {
    document.querySelectorAll(".reaction-picker.open").forEach(el => el.classList.remove("open"));
}

function toggleReactionPicker(e, postId) {
    e.stopPropagation();
    const picker = document.getElementById(`picker-${postId}`);
    const wasOpen = picker.classList.contains("open");
    closeAllReactionPickers();
    if (!wasOpen) picker.classList.add("open");
}

function react(postId, reactionType) {
    fetch(`${API}/posts/${postId}/react`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_type: reactionType })
    })
        .then(res => res.json())
        .then(data => {
            const box = document.querySelector(`[data-post-id="${postId}"]`);
            const btn = box.querySelector(".reaction-trigger");
            const textEl = btn.querySelector(".reaction-text");

            btn.classList.toggle("active", !!data.my_reaction);
            textEl.innerText = reactionSummary(data.reactions);

            closeAllReactionPickers();
        })
        .catch(err => console.error("Erreur réaction:", err));
}

// ─────────────────────────────
// COMMENTS
// ─────────────────────────────
function toggleComments(postId, btn) {
    const section = document.getElementById(`comments-${postId}`);
    const willOpen = !section.classList.contains("open");
    section.classList.toggle("open");

    if (willOpen) loadComments(postId);
}

function loadComments(postId) {
    fetch(`${API}/posts/${postId}/comments`, { credentials: "include" })
        .then(res => res.json())
        .then(comments => renderComments(postId, comments))
        .catch(err => console.error("Erreur chargement commentaires:", err));
}

function renderComments(postId, comments) {
    const list = document.getElementById(`comment-list-${postId}`);
    list.innerHTML = "";

    comments.forEach(c => {
        const authorName = `${c.nom || ""} ${c.prenom || ""}`.trim() || "Utilisateur";
        const initial = (authorName[0] || "U").toUpperCase();

        const item = document.createElement("div");
        item.className = "comment-item";
        item.dataset.commentId = c.id;
        item.innerHTML = `
            <div class="comment-avatar">${initial}</div>
            <div class="comment-bubble">
                <div class="comment-author">${escapeHtml(authorName)}</div>
                <div class="comment-text" id="comment-text-${c.id}">${escapeHtml(c.content)}</div>
                ${c.is_owner ? `
                    <div class="comment-owner-actions" id="comment-actions-${c.id}">
                        <button onclick="startEditComment(${postId}, ${c.id}, '${escapeJs(c.content)}')">Modifier</button>
                        <button class="del" onclick="deleteComment(${postId}, ${c.id})">Supprimer</button>
                    </div>` : ""}
            </div>
        `;
        list.appendChild(item);
    });
}

function escapeJs(str) {
    return (str || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function submitComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    })
        .then(res => res.json())
        .then(() => {
            input.value = "";
            loadComments(postId);

            const box = document.querySelector(`[data-post-id="${postId}"]`);
            const countEl = box.querySelector(".comment-count");
            countEl.innerText = parseInt(countEl.innerText) + 1;
        })
        .catch(err => console.error("Erreur envoi commentaire:", err));
}

function startEditComment(postId, commentId, currentText) {
    const textEl = document.getElementById(`comment-text-${commentId}`);
    const actionsEl = document.getElementById(`comment-actions-${commentId}`);

    textEl.style.display = "none";
    actionsEl.style.display = "none";

    const row = document.createElement("div");
    row.className = "comment-edit-row";
    row.id = `edit-row-${commentId}`;
    row.innerHTML = `
        <input type="text" id="edit-input-${commentId}" value="${currentText.replace(/\\'/g, "'").replace(/"/g, "&quot;")}">
        <button class="save-btn" onclick="saveEditComment(${postId}, ${commentId})">OK</button>
        <button class="cancel-btn" onclick="cancelEditComment(${commentId})">Annuler</button>
    `;
    textEl.insertAdjacentElement("afterend", row);
}

function cancelEditComment(commentId) {
    const row = document.getElementById(`edit-row-${commentId}`);
    if (row) row.remove();
    document.getElementById(`comment-text-${commentId}`).style.display = "block";
    const actionsEl = document.getElementById(`comment-actions-${commentId}`);
    if (actionsEl) actionsEl.style.display = "flex";
}

function saveEditComment(postId, commentId) {
    const input = document.getElementById(`edit-input-${commentId}`);
    const content = input.value.trim();
    if (!content) return;

    fetch(`${API}/posts/${postId}/comments/${commentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    })
        .then(res => res.json())
        .then(() => loadComments(postId))
        .catch(err => console.error("Erreur modification commentaire:", err));
}

function deleteComment(postId, commentId) {
    if (!confirm("Supprimer ce commentaire ?")) return;

    fetch(`${API}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include"
    })
        .then(res => res.json())
        .then(() => {
            loadComments(postId);
            const box = document.querySelector(`[data-post-id="${postId}"]`);
            const countEl = box.querySelector(".comment-count");
            countEl.innerText = Math.max(0, parseInt(countEl.innerText) - 1);
        })
        .catch(err => console.error("Erreur suppression commentaire:", err));
}

// ─────────────────────────────
// INIT
// ─────────────────────────────
loadFeed();