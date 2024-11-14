// Imports and setup
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import Stats from 'http://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

let stats, controls, mixer;
const animationActions = [];
const clock = new THREE.Clock();
let wPressed = false;
let aPressed = false;
let sPressed = false;
let dPressed = false;
let upstate = false; 
let downstate = false;
let timeLeft = 60;
const walls = [];

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const canvas = document.querySelector("#gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
camera.position.set(0, 2, 30);

// Stats for FPS display
stats = new Stats();
document.body.appendChild(stats.dom);

// Timer countdown
let startCountDown = setInterval(countdown, 1000);
function countdown() {
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if (timeLeft === 0) gameOver();
}
function gameOver() {
    clearInterval(startCountDown);
}

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
    mesh.traverse((child) => { if (child.isMesh) walls.push(child); });

    mixer = new THREE.AnimationMixer(mesh);
    gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        animationActions.push(action);
        action.play();
    });
});

// Maze door loading
loader.load('../models/Door.glb', (gltf) => {
    const mesh = gltf.scene;
    mesh.scale.set(0.5, 0.5, 0.5);
    scene.add(mesh);

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

// Basic objects and groups
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xedf50a });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 2, 0);

const material2 = new THREE.MeshBasicMaterial({ color: 0xf2304a });
const cube2 = new THREE.Mesh(geometry, material2);
cube2.position.set(2, 2, 0);

let group = new THREE.Group();
group.add(cube, cube2);
let group2 = new THREE.Group();
group2.add(cube, group);
scene.add(group2);

// Random boxes in scene
for (let i = 0; i < 2000; i++) {
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object.position.set(Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400);
    object.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
    object.scale.set(Math.random() + 5, Math.random() + 5, Math.random() + 5);
    scene.add(object);
}

// Key event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(event) {
    if (event.code === "KeyW") wPressed = true;
    if (event.code === "KeyA") aPressed = true;
    if (event.code === "KeyS") sPressed = true;
    if (event.code === "KeyD") dPressed = true;
}
function keyUpHandler(event) {
    if (event.code === "KeyW") wPressed = false;
    if (event.code === "KeyA") aPressed = false;
    if (event.code === "KeyS") sPressed = false;
    if (event.code === "KeyD") dPressed = false;
}

// Movement functions
const moveSide = () => {
    if (dPressed) {
        camera.position.x += 0.1;
        if (checkCollisions()) camera.position.x -= 0.1; // Undo move if collision
    }
    if (aPressed) {
        camera.position.x -= 0.1;
        if (checkCollisions()) camera.position.x += 0.1; // Undo move if collision
    }
};

const moveForward = () => {
    if (wPressed) {
        camera.position.z -= 0.1;
        if (checkCollisions()) camera.position.z += 0.1; // Undo move if collision
    }
    if (sPressed) {
        camera.position.z += 0.1;
        if (checkCollisions()) camera.position.z -= 0.1; // Undo move if collision
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
function updateRaycasters() { 
    raycasters.forEach((raycaster, i) => { 
        raycaster.set(camera.position, directions[i].normalize()); 
    }); }
function checkCollisions() {
    updateRaycasters();
    for (let raycaster of raycasters) {
        if (raycaster.intersectObjects(walls).some(collision => collision.distance < 0.5)) return true;
    }
    return false;
}

// Animation loop
function animate() {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    moveSide();
    moveForward();
    group.rotation.y += 0.03;
    group.rotation.x += 0.03;
    group2.rotation.x += 0.06;
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// Resize handler
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Orbit controls
controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Button event listeners for player movement
document.getElementById("upbutton").addEventListener("click", () => { upstate = true; downstate = false; });
document.getElementById("downbutton").addEventListener("click", () => { upstate = false; downstate = true; });
