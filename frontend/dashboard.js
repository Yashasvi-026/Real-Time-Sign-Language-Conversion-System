let hands;

let camera;
let predictionSequence = [];

let trainingSequence = [];

let currentLandmarks = [];

let predictedWords = [];

let finalSentence = "";


const trainBtn = document.getElementById("trainBtn");
const trainBox = document.getElementById("trainBox");
const cameraArea = document.getElementById("cameraArea");

const startTraining = document.getElementById("startTraining");
const cancelTraining = document.getElementById("cancelTraining");

const instructionPanel = document.getElementById("instructionPanel");

const detectedWord = document.getElementById("detectedWord");
const generatedSentence = document.getElementById("generatedSentence");

const saveSampleBtn = document.getElementById("saveSampleBtn");

const openCameraBtn = document.getElementById("openCameraBtn");

const cameraContainer = document.getElementById("cameraContainer");

const accordions = document.querySelectorAll(".accordion");
const clearWordBtn = document.getElementById("clearWordBtn");

let sampleCount = 0;

const userId = localStorage.getItem("userId");

async function loadUser() {

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/user/${userId}`
        );

        const result = await response.json();

        if (!result.success) return;

        if (result.user) {

            document.getElementById("username").innerText =
                result.user.username;

        }

    }

    catch (error) {

        console.log(error);

    }

}

async function loadWords() {

    try {

        const response = await fetch(

            `http://127.0.0.1:5000/get-words/${localStorage.getItem("userId")}`

        );

        const result = await response.json();

        if (!result.success) return;

        const wordList = document.getElementById("wordList");

        wordList.innerHTML = "";

        result.words.forEach((item) => {

            wordList.innerHTML += `

<div class="word-item">

    <span>${item.word}</span>

    <i
        class="fa-solid fa-trash deleteWord"
        data-id="${item.id}">
    </i>

</div>

`;

        });

    }

    

    catch (error) {

        console.log(error);

    }

    document.querySelectorAll(".deleteWord").forEach(btn => {

    btn.addEventListener("click", async () => {

        if(!confirm("Delete this word?"))
            return;

        try{

            const response = await fetch(

                `http://127.0.0.1:5000/delete-word/${btn.dataset.id}`,

                {
                    method:"DELETE"
                }

            );

            const result = await response.json();

            alert(result.message);

            if(result.success){

                loadWords();

            }

        }

        catch(error){

            console.log(error);

            alert("Backend Error");

        }

    });

});

}

loadUser();
loadWords();


accordions.forEach((accordion)=>{

    accordion.querySelector(".accordion-header")
    .addEventListener("click",()=>{

        accordion.classList.toggle("closed");

    });

});



trainBtn.addEventListener("click",()=>{

    trainBox.classList.toggle("hidden");

});


cancelTraining.addEventListener("click",()=>{

    trainBox.classList.add("hidden");

});



startTraining.addEventListener("click", async () => {

    const word = document
        .getElementById("newWord")
        .value
        .trim()
        .toUpperCase();

    if(word===""){

        alert("Please enter a word.");

        return;

    }

    try{

        const response = await fetch("http://127.0.0.1:5000/add-word",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                userId:localStorage.getItem("userId"),

                word:word

            })

        });

        const result = await response.json();

        alert(result.message);

        if(!result.success) return;
        loadWords();

        sampleCount = 0;

        document.getElementById("panelTitle").innerHTML = "Training Mode";

document.getElementById("generatedSentence").classList.add("hidden");

document.getElementById("trainingPanel").classList.remove("hidden");

document.getElementById("trainingPanel").innerHTML = `

<b>Word :</b> ${word}

<br><br>

Perform the sign <b>45 times.</b>

<br><br>

Click <b>Save Sample</b> only when the hand landmarks are completely visible.

<br><br>

<div class="progress">

    <div id="progressBar"></div>

</div>

<br>

<center>

<span id="progressText">

0 / 45

</span>

</center>

`;

        trainBox.classList.add("hidden");

    }

    catch(error){

        console.log(error);

        alert("Backend Error");

    }

});



saveSampleBtn.addEventListener("click", async ()=>{

    if(predictionSequence.length < 30){

        alert("Please keep your hand in front of the camera.");

        return;

    }

    const word = document
        .getElementById("newWord")
        .value
        .trim()
        .toUpperCase();

    try{

        const response = await fetch(

            "http://127.0.0.1:5000/save-sample",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    userId:localStorage.getItem("userId"),

                    word:word,

                    landmarks:predictionSequence

                })

            }

        );

        const result = await response.json();

        console.log(result);

        if(!result.success){

            alert(result.message);

            return;

        }


        sampleCount = result.sampleCount;

        document.getElementById("progressBar").style.width =

            (sampleCount/result.requiredSamples)*100 + "%";

        document.getElementById("progressText").innerHTML =

            sampleCount + " / " + result.requiredSamples;

        if(result.training){

            document.getElementById("panelTitle").innerHTML =

                "Training Started";

            document.getElementById("trainingStatus").innerHTML =

                "⏳ Model is training...";

        }

    }

    catch(error){

        console.log(error);

        alert("Backend Error");

    }

});



openCameraBtn.addEventListener("click", async () => {

    cameraArea.innerHTML = `

<div class="camera-wrapper">

    <div class="camera-overlay">

        <p>

            <b>Prediction :</b>

            <span id="detectedWord">

                Waiting...

            </span>

        </p>

        <p>

            <b>Confidence :</b>

            <span id="confidence">

                0%

            </span>

        </p>

        <p>

            <b>Predicted Words :</b>

        </p>

        <div id="predictedWords">

            ----

        </div>

    </div>


    <video
        id="video"
        autoplay
        playsinline>

    </video>

    <canvas id="outputCanvas"></canvas>

</div>

`;

    const video = document.getElementById("video");
    const canvas = document.getElementById("outputCanvas");

    const ctx = canvas.getContext("2d");

    const stream = await navigator.mediaDevices.getUserMedia({

        video:true

    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {

        canvas.width = video.videoWidth;

        canvas.height = video.videoHeight;

        initializeHands(video, canvas, ctx);

    };

});



clearWordBtn.addEventListener("click",()=>{

    if(predictedWords.length>0){

        predictedWords.pop();

    }

    document.getElementById("predictedWords").innerHTML=

        predictedWords.length?

        predictedWords.join(" ")

        :

        "----";

});



    document
.getElementById("resetSentenceBtn")
.addEventListener("click", async ()=>{

    predictedWords=[];

    finalSentence="";

    document.getElementById("predictedWords").innerHTML="----";

    generatedSentence.innerHTML="----";

    document.getElementById("detectedWord").innerHTML="Waiting...";

    document.getElementById("confidence").innerHTML="0%";

    await fetch(

        "http://127.0.0.1:5000/clear-sentence",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                userId:localStorage.getItem("userId")

            })

        }

    );
});


    document
.getElementById("enterBtn")
.addEventListener("click", async ()=>{

    if(predictedWords.length===0)
        return;

    const response = await fetch(

        "http://127.0.0.1:5000/generate-sentence",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                words:predictedWords

            })

        }

    );

    const result = await response.json();

    if(result.success){

        finalSentence = result.sentence;

        generatedSentence.innerHTML = finalSentence;

    }

});

document
.getElementById("speakBtn")
.addEventListener("click", async ()=>{

    if(finalSentence === "")
        return;

    try{

        const response = await fetch(

            "http://127.0.0.1:5000/speak",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    sentence: finalSentence

                })

            }

        );

        const result = await response.json();

        if(!result.success){

            alert(result.message);

        }

    }

    catch(error){

        console.log(error);

        alert("Speech Error");

    }

});

document
.querySelector(".logout")
.addEventListener("click",()=>{

    localStorage.removeItem("userId");

    localStorage.removeItem("token");

    window.location.href="../homepage/index.html";

});

document
.querySelector(".delete")
.addEventListener("click", async ()=>{

    const confirmDelete = confirm(

        "Are you sure you want to permanently delete your account?"

    );

    if(!confirmDelete){

        return;

    }

    try{

        const response = await fetch(

            "http://127.0.0.1:5000/delete-account/" +

            localStorage.getItem("userId"),

            {

                method:"DELETE"

            }

        );

        const result = await response.json();

        if(result.success){

            alert("Account Deleted Successfully");

            localStorage.clear();

            window.location.href="../homepage/index.html";

        }

        else{

            alert(result.message);

        }

    }

    catch(error){

        console.log(error);

        alert("Something went wrong");

    }

});



document
.querySelectorAll(".word-item i")
.forEach(btn=>{

    btn.addEventListener("click",()=>{

        btn.parentElement.remove();

    });

});
const username = localStorage.getItem("username");
document.getElementById("username").innerText=username;

if (username) {

    document.getElementById("username").innerText = username;

}
function initializeHands(video, canvas, ctx){

    hands = new Hands({

        locateFile: (file)=>{

            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

        }

    });

    hands.setOptions({

        maxNumHands:2,

        modelComplexity:1,

        minDetectionConfidence:0.6,

        minTrackingConfidence:0.6

    });

    hands.onResults(results=>{

    ctx.clearRect(0,0,canvas.width,canvas.height);


    currentLandmarks = new Array(126).fill(0);

    if(results.multiHandLandmarks){


        results.multiHandLandmarks.slice(0,2).forEach((hand, handIndex)=>{

            hand.forEach((lm, lmIndex)=>{

                const start = handIndex*63 + lmIndex*3;

                currentLandmarks[start] = lm.x;
                currentLandmarks[start+1] = lm.y;
                currentLandmarks[start+2] = lm.z;

            });

        });

    
        for(const landmarks of results.multiHandLandmarks){

            drawConnectors(ctx, landmarks, HAND_CONNECTIONS,{
                color:'#e9e1e1',
                lineWidth:2
            });

            drawLandmarks(ctx, landmarks,{
                color:'#a7090990',
                lineWidth:2,
                radius:3.5
            });

        }

    }

    
    predictionSequence.push([...currentLandmarks]);

    if(predictionSequence.length > 30){

        predictionSequence.shift();

    }

});

    camera = new Camera(video,{

        onFrame:async()=>{

            await hands.send({

                image:video

            });

        },

        width:640,

        height:480

    });

    camera.start();
    setInterval(

    predictWord,

    500

);

}
async function predictWord(){

    if(predictionSequence.length < 30)
        return;

    try{

        const response = await fetch(

            "http://127.0.0.1:5000/predict",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    userId: localStorage.getItem("userId"),

                    sequence: predictionSequence

                })

            }

        );

        const result = await response.json();

        if(result.success){

            document.getElementById("detectedWord").innerHTML =
                result.word || "Waiting...";

            document.getElementById("confidence").innerHTML =
                result.confidence + "%";

            if(

                result.word &&

                result.word !== "Waiting..." &&

                (
                    predictedWords.length === 0 ||

                    predictedWords[predictedWords.length - 1] !== result.word

                )

            ){

                predictedWords.push(result.word);

            }

            document.getElementById("predictedWords").innerHTML =

                predictedWords.length ?

                predictedWords.join(" ")

                :

                "----";

        }

    }

    catch(error){

        console.log(error);

    }

}

async function checkTraining(){

    const response = await fetch(

        "http://127.0.0.1:5000/training-status"

    );

    const result = await response.json();

    if(result.training){

        document.getElementById("trainingStatus").innerHTML =

        "⏳ Training Model...";

    }

    else if(result.completed){

        document.getElementById("trainingStatus").innerHTML =

        "Training Completed";

    }

}
setInterval(

    checkTraining,

    2000

);
