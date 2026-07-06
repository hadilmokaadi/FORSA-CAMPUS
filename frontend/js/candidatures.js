async function loadCandidatures() {
    const res = await fetch('http://127.0.0.1:5000/mes-candidatures', {
        method: 'GET',
        credentials: 'include'
    });

    const data = await res.json();
    const liste = document.getElementById('liste');

    if (!Array.isArray(data) || data.length === 0) {
        liste.innerHTML = '<p style="text-align:center">Aucune candidature trouvée.</p>';
        return;
    }

    liste.innerHTML = data.map(c => `
        <div style="border:1px solid #ddd; padding:1rem; margin:0.5rem 0; border-radius:8px">
            <p><strong>Offre ID:</strong> ${c[2]}</p>
            <p><strong>CV:</strong> ${c[3]}</p>
            <p><strong>Statut:</strong> ${c[4]}</p>
            <p><strong>Date:</strong> ${c[5]}</p>
        </div>
    `).join('');
}

loadCandidatures();