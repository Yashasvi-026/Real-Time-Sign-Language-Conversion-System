
const getStartedBtn = document.getElementById("getStartedBtn");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const passwordIcons = document.querySelectorAll(".toggle-password");

const topBtn = document.getElementById("topBtn");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

const forgotForm = document.getElementById("forgotForm");

const resetForm = document.getElementById("resetForm");
const loginEmail = document.getElementById("loginEmail");




registerTab.addEventListener("click", () => {

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    forgotForm.classList.add("hidden");
    resetForm.classList.add("hidden");

});

loginTab.addEventListener("click", () => {

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    forgotForm.classList.add("hidden");
    resetForm.classList.add("hidden");

});



passwordIcons.forEach(icon => {

    icon.addEventListener("click", () => {

        const input = icon.previousElementSibling;

        if (input.type === "password") {

            input.type = "text";

            icon.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        }

        else {

            input.type = "password";

            icon.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    });

});



window.addEventListener(

    "scroll",

    () => {

        if (window.scrollY > 400) {

            topBtn.style.display = "block";

        }

        else {

            topBtn.style.display = "none";

        }

    }

);

topBtn.addEventListener(

    "click",

    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

);



document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(

            this.getAttribute("href")

        );

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();

    const password = document.getElementById("loginPassword").value;

    try {

        const response = await fetch("http://127.0.0.1:5000/login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email: email,
                password: password

            })

        });

        const result = await response.json();

        alert(result.message);

        if (result.success) {
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("username", result.name);

            window.location.href = "../dashboard/dashboard.html";

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to connect to backend.");

    }

});



registerForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();

    const email = document.getElementById("registerEmail").value.trim();

    const password = document.getElementById("registerPassword").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    try {

        const response = await fetch("http://127.0.0.1:5000/register", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                name: name,

                email: email,

                password: password

            })

        });

        const result = await response.json();

        alert(result.message);

if(result.success){

    document.getElementById("otpEmailText").innerText =
        "We've sent a verification code to " + email;

    registerForm.classList.add("hidden");

    registerOtpForm.classList.remove("hidden");

}

    }

    catch (error) {

        console.error(error);

        alert("Cannot connect to backend.");

    }

});



const registerOtpForm = document.getElementById("registerOtpForm");

registerOtpForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("registerEmail").value.trim();

    const otp = document.getElementById("registerOtp").value.trim();

    try {

        const response = await fetch("http://127.0.0.1:5000/verify-register-otp", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: email,

                otp: otp

            })

        });

        const result = await response.json();

        alert(result.message);

        if (result.success) {

            registerOtpForm.reset();

            registerOtpForm.classList.add("hidden");

            registerForm.reset();

            loginTab.click();

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to connect to backend.");

    }

});


document.querySelectorAll("button").forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.transform = "scale(1.03)";

    });

    btn.addEventListener("mouseleave", () => {

        btn.style.transform = "scale(1)";

    });

});
getStartedBtn.addEventListener("click", () => {

   
    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    
    document.querySelector(".glass-card").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});


forgotForm.addEventListener("submit",function(e){

    e.preventDefault();

    forgotForm.classList.add("hidden");

    resetForm.classList.remove("hidden");

});
resetForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();

    const password = document.getElementById("newPassword").value.trim();

    const confirmPassword = document.getElementById("confirmPasswordReset").value.trim();

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    try {

        const response = await fetch("http://127.0.0.1:5000/reset-password", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email: email,

                password: password

            })

        });

        const result = await response.json();

        alert(result.message);

        if (result.success) {

            resetForm.reset();

            resetForm.classList.add("hidden");

            loginForm.classList.remove("hidden");

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to connect to backend.");

    }

});

forgotPasswordLink.addEventListener("click", async function(e){

    e.preventDefault();

    const email = loginEmail.value.trim();

    if(email === ""){

        alert("Please enter your registered email first.");

        loginEmail.focus();

        return;

    }

    try{

        const response = await fetch("http://127.0.0.1:5000/forgot-password",{

            method: "POST",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify({
                email: email
            })

        });

        const result = await response.json();

        alert(result.message);

        if(result.success){

            loginForm.classList.add("hidden");

            forgotForm.classList.remove("hidden");

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to connect to backend.");

    }

});