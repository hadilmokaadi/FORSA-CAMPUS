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
        // حفظ بيانات المستخدم بما فيها الـ role الذي يرجعه السيرفر
        localStorage.setItem("user", JSON.stringify(result));
        
        // التوجيه الذكي بناءً على الدور (result.role هو الدور الذي يرجعه الخادم)
        if (result.role === "entreprise") {
            window.location.href = "dashboard-recruteur.html"; // الواجهة اللي بعثتها لي (Workspace Monitor)
        } else {
            window.location.href = "home.html"; // أو الواجهة الخاصة بالطالب
        }
    } else {
        document.getElementById("msg").innerText = result.message;
    }
});