document
.getElementById("forgotForm")
.addEventListener("submit", function(e){


    e.preventDefault();


    const email =
        document.getElementById("email").value;



    fetch("http://127.0.0.1:5000/forgot-password",{


        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },


        body:JSON.stringify({
            email:email
        })


    })


    .then(res=>res.json())


    .then(data=>{


        document.getElementById("msg").innerText =
        data.message;


    })


    .catch(err=>{

        console.log(err);

        document.getElementById("msg").innerText =
        "Server error";

    });


});