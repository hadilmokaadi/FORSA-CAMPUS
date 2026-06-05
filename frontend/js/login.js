document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"
    });

    const result = await res.json();

    if (res.ok) {
        localStorage.setItem("user", JSON.stringify(result));
        window.location.href = "home.html";
    } else {
        document.getElementById("msg").innerText = result.message;
    }
});