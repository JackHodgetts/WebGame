// Imports and setup
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import Stats from 'http://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

let stats, controls, mixer;
const animationActions = [];
const clock = new THREE.Clock();
let wPressed = false;
let sPressed = false;
let timeLeft = 300;
const walls = []; // Making an array for the walls of Maze
const buttons = []; // Making na array for the buttons around the Maze
let canMove = false; // Flag to control player movement
let canRotate = false;
let gameStart = false;
let isLoaderActive = true; // Track if the loader is active

let lookSpeed = 0.05;
let moveSpeed = 0.15;
let yaw = 0;
let targetYaw = 0;
let initialYaw = yaw; //For restarting the game

let gameFinish = false;

let mazeDoor = null;

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const canvas = document.querySelector("#gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
camera.position.set(2, 2, 30);

const listener = new THREE.AudioListener();
camera.add(listener);

// Stats for FPS display
stats = new Stats();
document.body.appendChild(stats.dom);

// AudioLoader
const audioLoader = new THREE.AudioLoader();

// Timer countdown
const startCountDown = setInterval(() => countdown(), 1000);

const countdown = () => {
    if(!gameStart){
        return;
    }

    if (timeLeft <= 0) {
        gameOver();
        console.log("Time is up");
        return; 
    }

    timeLeft--; 

    const minutes = Math.floor(timeLeft / 60); 
    const seconds = timeLeft % 60; 

    // Format seconds to always be two digits
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    document.getElementById("timer").innerText = `${minutes}:${formattedSeconds}`;
};

//Gameover
const gameOver = () => {
    gameFinish = true;
    RestartButtonText.style.display = "block";

    canvas.style.opacity = "0.3";

    clearInterval(startCountDown);
}

const RestartButtonText = document.querySelector(".restartButton");

console.log("RestartButton Text Element:", RestartButtonText);

//Restart Game
const restartButton = document.getElementById("restart");
restartButton.addEventListener("click", () =>{
    console.log("RestartGame");
    camera.position.set(2, 2, 30);
    camera.rotation.set(0, 0, 0);
    yaw = initialYaw;

    buttons.forEach(buttonData => {
        buttonData.pressed = false;
        buttonData.top.position.y = 1.5;
    });

    gameFinish = false;
    timeLeft = 180; 
    doorOpen = false; 

    const minutes = Math.floor(timeLeft / 60); 
    const seconds = timeLeft % 60; 
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    document.getElementById("timer").innerText = `${minutes}:${formattedSeconds}`;

    //clearInterval(startCountDown);

    RestartButtonText.style.display = "none";
    canvas.style.opacity = 1;

    startCountDown = setInterval(() => countdown(), 1000);
});

// Loading Game
let loading = document.getElementById("loading");   
canvas.style.opacity = "0.3";
canvas.style.pointerEvents = "none";

setTimeout(() => {
    loading.style.transition = "opacity 0.5s ease";
    loading.style.opacity = 0; 
    setTimeout(() => {
        loading.style.display = 'none'; 
        canvas.style.transition = "opacity 0.5s ease";
        canvas.style.opacity = 1; 
        isLoaderActive = false;
        canMove = true;
        canRotate = true;
        gameStart = true;
        canvas.style.pointerEvents = "auto";
    }, 500); 
}, 3000); 


// Lights
const createLights = () => {
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.8);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 10, 10);
    scene.add(ambientLight, mainLight);
};
createLights();

// GLTF loader
const loader = new GLTFLoader();
loader.load('../models/Maze_One.glb', (gltf) => {
    const mesh = gltf.scene;
    mesh.scale.set(0.5, 0.5, 0.5);
    scene.add(mesh);
    mesh.traverse((child) => { 
        if (child.isMesh) walls.push(child); });

    mixer = new THREE.AnimationMixer(mesh);
    gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        animationActions.push(action);
        action.play();
    });
});

// Maze door loading
loader.load('../models/Maze_Door.glb', (gltf) => {
    const mesh = gltf.scene;
    mesh.scale.set(0.5, 0.5, 0.5);
    scene.add(mesh);
    
    mazeDoor = mesh;

    const doorMixer = new THREE.AnimationMixer(mesh);
    gltf.animations.forEach((clip) => {
        const action = doorMixer.clipAction(clip);
        animationActions.push(action);
        action.play();
    });
});

// Skybox
const createskybox = () => {
    const loader = new THREE.TextureLoader();
    loader.load("../images/SkyBox.jpg", (texture) => {
        const sphereGeometry = new THREE.SphereGeometry(240, 120, 80);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const bgMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(bgMesh);
    });
};
createskybox();

// Create Buttons
const createButton = (position) => {
    // Button base
    const buttonBaseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 15);
    const buttonBaseMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const buttonBase = new THREE.Mesh(buttonBaseGeometry, buttonBaseMaterial);
    buttonBase.position.set(position.x, position.y, position.z);

    // Button top
    const buttonGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 15);
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const buttonTop = new THREE.Mesh(buttonGeometry, buttonMaterial);
    buttonTop.position.set(position.x, position.y + 1.5, position.z);

    // Store button components in an object
    const buttonData = {
        base: buttonBase,
        top: buttonTop,
        pressed: false,
    };

    // Add to scene
    scene.add(buttonBase, buttonTop);

    // Store in buttons array
    buttons.push(buttonData);
};

// Spawn Buttons
createButton({ x: 10.5, y: 0, z: 5 });
createButton({ x: -7, y: 0, z: 1 });
createButton({ x: -13, y: 0, z: -15 });
createButton({ x: -10.5, y: 0, z: 18 });


document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyW": 
        wPressed = true; 
        break;
        case "KeyS": 
        sPressed = true; 
        break;
        case "KeyA": 
        targetYaw  += lookSpeed; 
        break;
        case "KeyD": 
        targetYaw  -= lookSpeed; 
        break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyW": 
        wPressed = false; 
        break;
        case "KeyS": 
        sPressed = false; 
        break;
    }
});

// Movement functions
const movePlayer = () => {
    if(!canMove || gameFinish){
        return;
    }

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    if (isButtonColliding && wPressed) {
        console.log("Player movement halted due to button collision.");
        return; 
    }

    // Forward/backward movement
    if (wPressed) {
        camera.position.addScaledVector(direction, moveSpeed);
        if (checkCollisions()) {
            camera.position.addScaledVector(direction, -moveSpeed); // Undo move if collision
        }
    }
    if (sPressed) {
        camera.position.addScaledVector(direction, -moveSpeed);
        if (checkCollisions()) {
            camera.position.addScaledVector(direction, moveSpeed); // Undo move if collision
        }
    }

};

const CameraRotation = () => {
    if(!canRotate){
        return;
    }

    if (!gameFinish) {
        yaw = THREE.MathUtils.lerp(yaw, targetYaw, 0.1); // Smoothly interpolate the yaw
        camera.rotation.y = yaw; // Apply the interpolated yaw to the camera
    }
};

// Raycaster setup for collision detection
const directions = [
    new THREE.Vector3(0, 0, -1),  // north
    new THREE.Vector3(0, 0, 1),   // south
    new THREE.Vector3(-1, 0, 0),  // west
    new THREE.Vector3(1, 0, 0),   // east
    new THREE.Vector3(-1, 0, -1), // northwest
    new THREE.Vector3(1, 0, -1),  // northeast
    new THREE.Vector3(-1, 0, 1),  // southwest
    new THREE.Vector3(1, 0, 1)    // southeast
];

const raycasters = directions.map(dir => new THREE.Raycaster(camera.position, dir.normalize()));

const updateRaycasters = () => raycasters.forEach((raycaster, i) => raycaster.set(camera.position, directions[i].normalize()));

const interactText = document.querySelector(".Interact-text");

console.log("Interact Text Element:", interactText);

let isButtonColliding = false;

function checkButtonCollision() {
    isButtonColliding = false; 

    // Iterate through each button in the scene
    for (let buttonData  of buttons) {
        const buttonTop = buttonData.top;

        // Dynamically update bounding box for the button
        const buttonBoundingBox = new THREE.Box3().setFromObject(buttonTop);

        // Create a small bounding box around the camera (player)
        const cameraBoundingBox = new THREE.Box3().setFromCenterAndSize(
            camera.position,
            new THREE.Vector3(0.5, 1.5, 0.5) 
        );

        // Check if the player's bounding box intersects with the button's bounding box
        if (buttonBoundingBox.intersectsBox(cameraBoundingBox)) {
            isButtonColliding = true; 

            interactText.style.display = "block";

            document.addEventListener("keydown", (event) => {
                if (event.code === "KeyE" && !buttonData.pressed) {
                    // Move button down slightly
                    buttonTop.position.y -= 0.1;
                    
                    //Sets the instant of the button from false to true
                    buttonData.pressed = true;

                    // Play sound cue (optional, add your audio logic here)
                    console.log("Button pressed!");
                    const buttonSound = new THREE.Audio(listener);
                    audioLoader.load('../images/ding-101492.mp3', function (buffer) {
                        buttonSound.setBuffer(buffer);
                        buttonSound.setLoop(false);
                        buttonSound.setVolume(1.0);
                        buttonSound.play();
                    });
                }
            });

            return; 
        }
    }

    if (!isButtonColliding) {
        interactText.style.display = "none";
    }
}


//Player Collision
const checkCollisions = () => {
    updateRaycasters();
    return raycasters.some(raycaster => raycaster.intersectObjects(walls).some(collision => collision.distance < 0.5)) || checkButtonCollision();
};

//A function for when all the buttons have be pressed
const areAllButtonsPressed = () => {
    return buttons.every((buttonData) => buttonData.pressed);
};

let doorOpen = false;

const openMazeDoor = () => {
    if (mazeDoor && !doorOpen) {
        console.log("Opening the maze door...");
        
        // Example of door rotation (adjust axis and angle as needed)
        mazeDoor.position.x -= 3.3;

        // Set the door as open
        doorOpen = true;
    }
};

const updateGameLogic = () => {
    if (areAllButtonsPressed() && !doorOpen) {
        openMazeDoor();
    }
};

// Animation loop
const animate = () => {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    movePlayer();
    CameraRotation();
    checkButtonCollision();
    updateGameLogic(); 
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};
animate();

// Resize handler
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
