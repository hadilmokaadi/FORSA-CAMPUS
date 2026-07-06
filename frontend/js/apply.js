document.getElementById('applyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('cv', document.getElementById('cv').files[0]);

    const uploadRes = await fetch('http://127.0.0.1:5000/upload-cv', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    const uploadResult = await uploadRes.json();
    
    if (!uploadResult.filename) {
        document.getElementById('msg').innerText = uploadResult.message;
        return;
    }

    const applyRes = await fetch('http://127.0.0.1:5000/apply', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            offre_id: document.getElementById('offre_id').value,
            cv: uploadResult.filename
        })
    });

    const result = await applyRes.json();
    document.getElementById('msg').innerText = result.message;
});