document
.getElementById("resetForm")
.addEventListener("submit", function(e){

    e.preventDefault();


    const password =
    document.getElementById("password").value;


    const params =
    new URLSearchParams(window.location.search);


    const token =
    params.get("token");



    fetch("http://127.0.0.1:5000/reset-password", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            token: token,
            password: password
        })

    })


    .then(res => res.json())


    .then(data => {

        document.getElementById("msg").innerText =
        data.message;


        if(data.message === "Password updated"){
            setTimeout(()=>{
                window.location.href="login.html";
            },2000);
        }

    })


    .catch(err=>{
        console.log(err);
    });

});