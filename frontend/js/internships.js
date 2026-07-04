const API_BASE_URL = "http://127.0.0.1:5000/internships";

// Helper function to show modern status toast alerts
function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertMessage");
    if (!alertBox) return;
    
    alertBox.className = `alert alert-${type} rounded-3 d-block`;
    alertBox.innerText = message;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        alertBox.className = "alert d-none";
    }, 4000);
}

// =========================================================================
// 🏢 1. RECRUITER DASHBOARD PROCESSORS (DYNAMIC INTERACTIVE VIEW)
// =========================================================================

function loadMyOffers() {
    const container = document.getElementById("myOffersCardsContainer");
    if (!container) return;

    fetch(`${API_BASE_URL}/my-offers`, {
        method: "GET",
        credentials: "include", 
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error("401_UNAUTHORIZED");
        }
        if (!response.ok) throw new Error("Failed server stream.");
        return response.json();
    })
    .then(data => {
        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-secondary fw-semibold">
                    <i class="fa-solid fa-folder-open fs-3 d-block mb-2 text-muted"></i>
                    No active internships tracked under your profile id.
                </div>`;
            document.getElementById("countActiveOffers").innerText = "0";
            return;
        }

        // Update statistics grid counters small badge info
        document.getElementById("countActiveOffers").innerText = data.length;

        // Loop 3al internship items bech nkharjouhom dynamic cards
        data.forEach(offer => {
            const firstLetter = offer.title ? offer.title.charAt(0).toUpperCase() : 'I';
            
            // 🟢🔴 Logic bch nfar9ou bin Active (Green) w Closed (Red)
            let statusText = '';
            let badgeClass = '';

            if (offer.status === 'open' || offer.status === 'active') {
                statusText = 'Active';
                badgeClass = 'badge-status-active'; // Apply custom CSS Green look
            } else {
                statusText = 'Closed';
                badgeClass = 'badge-status-closed'; // Apply custom CSS Red look
            }
            
            // Output template render structural mapping layer
            const cardHtml = `
                <div class="card job-offer-card p-3 shadow-sm">
                    <div class="d-flex align-items-start gap-3">
                        <div class="company-logo-wrapper">
                            <img src="http://127.0.0.1:5000/uploads/photos/company-fallback.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" alt="Company">
                            <span class="company-logo-fallback" style="display:none;">${firstLetter}</span>
                        </div>

                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <h5 class="fw-bold text-dark mb-0 card-title-hover" style="font-size: 1.1rem; cursor: pointer;">${offer.title}</h5>
                                
                                <span class="badge ${badgeClass} rounded-pill px-2 py-1">
                                    <i class="fa-solid fa-circle fs-6 me-1 small"></i>${statusText}
                                </span>
                            </div>
                            <p class="text-primary fw-medium mb-2 small">Your Published Offer</p>
                            
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <span class="badge-meta"><i class="fa-solid fa-location-dot me-1"></i>${offer.location || 'N/A'}</span>
                                <span class="badge-meta"><i class="fa-solid fa-clock me-1"></i>${offer.duration || 'N/A'}</span>
                                <span class="badge-meta"><i class="fa-solid fa-wallet me-1"></i>${offer.salary ? offer.salary : 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                    <hr class="my-2 border-light">
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <span class="text-muted small"><i class="fa-solid fa-users me-1"></i> <strong>${offer.applications_count || 0}</strong> applications received</span>
                        <div class="d-flex gap-2">
                            <button class="btn btn-action-light" onclick="redirectToEdit(${offer.id})"><i class="fa-solid fa-pen-to-square me-1"></i> Edit</button>
                            <button class="btn btn-action-light text-danger" style="border-color: #fca5a5;" onclick="deleteOffer(${offer.id})"><i class="fa-solid fa-trash me-1"></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });
    })
    .catch(error => {
        console.error("Dashboard Stream Log:", error);
        if (error.message === "401_UNAUTHORIZED") {
            container.innerHTML = `
                <div class="text-center text-danger py-5 fw-bold">
                    <i class="fa-solid fa-lock d-block mb-2 fs-4"></i>
                    Session Unauthorized (401). Please run the login pipeline first!
                </div>`;
        } else {
            container.innerHTML = `<div class="text-center text-danger py-5 fw-bold">Cannot connect to Flask server pipeline. Ensure app.py context is active.</div>`;
        }
    });
}

function deleteOffer(id) {
    if (!confirm("Are you sure you want to permanently delete this internship listing?")) return;

    fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        credentials: "include"
    })
    .then(response => {
        if (response.ok) {
            showAlert("Internship listing deleted successfully!");
            loadMyOffers(); 
        } else {
            showAlert("Action failed or resource blocked.", "danger");
        }
    })
    .catch(error => console.error("Error operational layer:", error));
}

function redirectToEdit(id) {
    window.location.href = `form-internship.html?id=${id}`;
}

// =========================================================================
// 📝 2. INTERACTIVE FORM HANDLERS
// =========================================================================

function checkFormMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const internshipId = urlParams.get("id");

    if (internshipId) {
        document.getElementById("formTitle").innerText = "Modify Internship Listing";
        document.getElementById("btn-submit").innerText = "Update Listing";
        
        fetch(`${API_BASE_URL}/${internshipId}`, {
            method: "GET",
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) throw new Error("Target payload structural failure.");
            return response.json();
        })
        .then(data => {
            document.getElementById("title").value = data.title;
            document.getElementById("location").value = data.location || '';
            document.getElementById("duration").value = data.duration || '';
            document.getElementById("salary").value = data.salary || '';
            document.getElementById("status").value = data.status || 'open';
            document.getElementById("description").value = data.description;
            document.getElementById("requirements").value = data.requirements || '';
        })
        .catch(error => console.error("Loader exception mapping:", error));
    }
}

function submitForm(event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const internshipId = urlParams.get("id");

    const payload = {
        title: document.getElementById("title").value,
        location: document.getElementById("location").value,
        duration: document.getElementById("duration").value,
        salary: document.getElementById("salary").value,
        status: document.getElementById("status").value,
        description: document.getElementById("description").value,
        requirements: document.getElementById("requirements").value
    };

    let endpoint = API_BASE_URL;
    let HTTP_METHOD = "POST";

    if (internshipId) {
        endpoint = `${API_BASE_URL}/${internshipId}`;
        HTTP_METHOD = "PUT";
    }

    fetch(endpoint, {
        method: HTTP_METHOD,
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", 
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            showAlert(internshipId ? "Listing updated successfully!" : "New internship published successfully!");
            setTimeout(() => {
                window.location.href = "dashboard-recruteur.html";
            }, 1500);
        } else {
            showAlert("Failed processing validation checks. Ensure security session parameters match.", "danger");
        }
    })
    .catch(error => {
        console.error("Submission log fault:", error);
        showAlert("Server offline link error.", "danger");
    });
}

// =========================================================================
// 🎓 3. CANDIDATE & PUBLIC PROCESSORS (BENTO DESIGN MODEL WITH GLOW & LOGOS)
// =========================================================================

function loadAllInternships() {
    const cardsContainer = document.getElementById("allInternshipsCards");
    if (!cardsContainer) return;

    fetch(API_BASE_URL)
    .then(response => response.json())
    .then(data => {
        cardsContainer.innerHTML = "";

        if (data.length === 0) {
            cardsContainer.innerHTML = `<div class="col-12 text-center py-5 text-secondary fw-semibold fs-6">No matching internship projects found active.</div>`;
            return;
        }

        data.forEach(offer => {
            const firstLetter = offer.title ? offer.title.charAt(0).toUpperCase() : 'I';
            
            // Premium Dynamic Badge Class Extraction
            let badgeClass = offer.status === 'open' || offer.status === 'active' ? 'badge-premium-active' : 'badge-premium-closed';
            let badgeText = offer.status === 'open' || offer.status === 'active' ? 'Active & Open' : 'Closed';

            const card = document.createElement("div");
            card.className = "col-12 mb-2"; 
            card.innerHTML = `
                <div class="card premium-job-card shadow-sm">
                    <div class="d-flex align-items-start gap-4">
                        
                        <!-- 🏢 LUXURY COMPANY LOGO CONFIG -->
                        <div class="premium-logo-box">
                            <img src="http://127.0.0.1:5000/uploads/photos/company-fallback.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" alt="Corporate">
                            <span class="premium-logo-fallback" style="display:none;">${firstLetter}</span>
                        </div>

                        <!-- ARCHITECTURE TEMPLATE CONTENT -->
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <h5 class="fw-bold text-dark mb-0" style="font-size: 1.2rem; letter-spacing: -0.3px;">${offer.title}</h5>
                                <span class="${badgeClass}">
                                    <i class="fa-solid fa-bolt fs-7 me-1"></i>${badgeText}
                                </span>
                            </div>
                            
                            <p class="fw-bold mb-3 small mt-1" style="color: #4f46e5;">${offer.company_name || 'Verified Corporate Partner'}</p>
                            
                            <p class="text-muted small mb-3" style="line-height: 1.5; font-size: 0.9rem; max-width: 95%;">${offer.description}</p>
                            
                            <!-- MODERN CONTENT METRICS -->
                            <div class="d-flex flex-wrap gap-2">
                                <span class="meta-pill"><i class="fa-solid fa-location-dot opacity-60"></i>${offer.location || 'Remote / Tunisia'}</span>
                                <span class="meta-pill"><i class="fa-solid fa-calendar-days opacity-60"></i>${offer.duration || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <hr class="my-3 opacity-10" style="border-color: #cbd5e1;">

                    <!-- ACTIONS GRID -->
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <div>
                            <span class="text-muted d-block" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">Stipend Allocation</span>
                            <span class="premium-salary-tag">${offer.salary ? offer.salary : 'Unpaid Program'}</span>
                        </div>
                        <a href="details-internships.html?id=${offer.id}" class="btn-action-premium text-decoration-none">
                            View Details <i class="fa-solid fa-arrow-right ms-1.5 small"></i>
                        </a>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    })
    .catch(error => console.error("Error global catalog layout stream:", error));
}

function searchInternships() {
    const query = document.getElementById("searchQuery")?.value.trim();
    const cardsContainer = document.getElementById("allInternshipsCards");
    if (!cardsContainer) return;

    if (!query) {
        loadAllInternships();
        return;
    }

    fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        cardsContainer.innerHTML = "";

        if (data.length === 0) {
            cardsContainer.innerHTML = `<div class="col-12 text-center py-5 text-muted fw-medium">No results found matching structural keyword "${query}".</div>`;
            return;
        }

        data.forEach(offer => {
            const firstLetter = offer.title ? offer.title.charAt(0).toUpperCase() : 'I';
            let badgeClass = offer.status === 'open' || offer.status === 'active' ? 'badge-premium-active' : 'badge-premium-closed';
            let badgeText = offer.status === 'open' || offer.status === 'active' ? 'Active & Open' : 'Closed';

            const card = document.createElement("div");
            card.className = "col-12 mb-2";
            card.innerHTML = `
                <div class="card premium-job-card shadow-sm">
                    <div class="d-flex align-items-start gap-4">
                        <div class="premium-logo-box">
                            <img src="http://127.0.0.1:5000/uploads/photos/company-fallback.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" alt="Corporate">
                            <span class="premium-logo-fallback" style="display:none;">${firstLetter}</span>
                        </div>

                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <h5 class="fw-bold text-dark mb-0" style="font-size: 1.2rem; letter-spacing: -0.3px;">${offer.title}</h5>
                                <span class="${badgeClass}">
                                    <i class="fa-solid fa-bolt fs-7 me-1"></i>${badgeText}
                                </span>
                            </div>
                            <p class="fw-bold mb-3 small mt-1" style="color: #4f46e5;">${offer.company_name || 'Verified Corporate Partner'}</p>
                            <p class="text-muted small mb-3" style="line-height: 1.5; font-size: 0.9rem; max-width: 95%;">${offer.description}</p>
                            
                            <div class="d-flex flex-wrap gap-2">
                                <span class="meta-pill"><i class="fa-solid fa-location-dot opacity-60"></i>${offer.location || 'Remote / Tunisia'}</span>
                                <span class="meta-pill"><i class="fa-solid fa-calendar-days opacity-60"></i>${offer.duration || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <hr class="my-3 opacity-10" style="border-color: #cbd5e1;">
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <div>
                            <span class="text-muted d-block" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">Stipend Allocation</span>
                            <span class="premium-salary-tag">${offer.salary ? offer.salary : 'Unpaid Program'}</span>
                        </div>
                        <a href="details-internships.html?id=${offer.id}" class="btn-action-premium text-decoration-none">
                            View Details <i class="fa-solid fa-arrow-right ms-1.5 small"></i>
                        </a>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    })
    .catch(error => console.error("Search processor trace exception:", error));
}


function loadInternshipDetails(id) {
    fetch(`${API_BASE_URL}/${id}`)
    .then(res => res.json())
    .then(offer => {
        // Remplissage des champs
        document.getElementById("det-title").innerText = offer.title;
        document.getElementById("det-company").innerText = offer.company_name || "Entreprise Partenaire";
        document.getElementById("det-location").innerText = offer.location || 'N/A';
        document.getElementById("det-duration").innerText = offer.duration || 'N/A';
        document.getElementById("det-salary").innerText = offer.salary || 'Non rémunéré';
        document.getElementById("det-description").innerText = offer.description;
        document.getElementById("det-requirements").innerText = offer.requirements || "Aucun critère spécifique.";
        
        // Logo
        const logo = document.getElementById("det-logo");
        if(logo) logo.src = offer.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.company_name || 'C')}&background=random`;

        // Badge & Bouton
        const badge = document.getElementById("det-badge");
        const applyBtn = document.getElementById("btn-apply");
        
        if (offer.status === 'open' || offer.status === 'active') {
            badge.innerText = "Ouvert";
            badge.classList.add("bg-success-subtle", "text-success");
            applyBtn.disabled = false;
        } else {
            badge.innerText = "Fermé";
            badge.classList.add("bg-danger-subtle", "text-danger");
            applyBtn.disabled = true;
            applyBtn.innerText = "Clôturé";
            applyBtn.style.backgroundColor = "#ccc";
        }
    })
    .catch(err => console.error("Erreur de chargement:", err));
}