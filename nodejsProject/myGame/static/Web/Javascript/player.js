// Imports and setup
import * as THREE from 'three';

import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

// Declare necessary variables and controls
let controls;
let mixer;
const animationActions = [];
const clock = new THREE.Clock();
let wPressed = false;
let aPressed = false;
let sPressed = false;
let dPressed = false;

const walls = []; 

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 30;
camera.position.y = 2;

//Lights
const createLights = ()=>{
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.8);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);

    mainLight.position.set(10, 10, 10);
    scene.add( ambientLight, mainLight);
}

createLights();

// Load GLTF model
const loader = new GLTFLoader();
loader.load('../models/Maze_One.glb',(gltf)=>{
    const mesh = gltf.scene;
    mesh.scale.set(0.5, 0.5, 0.5);
    scene.add(mesh);

    // Assuming the walls are part of the mesh structure:
    mesh.traverse((child) => {
        if (child.isMesh) {
            walls.push(child); // Add each wall to the walls array
        }
    });

    mixer = new THREE.AnimationMixer(mesh);

    gltf.animations.forEach((clip)=>{
        const action = mixer.clipAction(clip);
        animationActions.push(action);
        action.play();
    });
});

// Event listeners for keyboard input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(event){
    if (event.code === "KeyW"){
        wPressed = true;}
    if (event.code === "KeyA"){
        aPressed = true;}
    if (event.code === "KeyS"){
        sPressed = true;}
    if (event.code === "KeyD"){
        dPressed = true;}
}

function keyUpHandler(event){
    if (event.code === "KeyW"){
        wPressed = false;}
    if (event.code === "KeyA"){
        aPressed = false;}
    if (event.code === "KeyS"){
        sPressed = false;}
    if (event.code === "KeyD"){
        dPressed = false;}
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


// Raycaster setup for multiple directions
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

// Create raycasters for each direction
const raycasters = directions.map(dir => new THREE.Raycaster(camera.position, dir.normalize()));

// Function to update raycaster origins
function updateRaycasters() {
    raycasters.forEach((raycaster, i) => {
        raycaster.set(camera.position, directions[i].clone().normalize());
    });
}

// Check collisions in each direction
function checkCollisions() {
    updateRaycasters(); // Update raycaster positions to current player position

    for (let raycaster of raycasters) {
        const collisions = raycaster.intersectObjects(walls); // Walls is an array of maze wall objects

        if (collisions.length > 0 && collisions[0].distance < 0.5) {
            return true; // Collision detected within 0.5 units
        }
    }
    return false;
}

// Animate function
function animate() {
    const delta = clock.getDelta();
    if (mixer){ 
        mixer.update(delta);}
    moveSide();
    moveForward();
    renderer.render(scene, camera);
    requestAnimationFrame(animate); 

}
animate();

// Handle window resize
window.addEventListener("resize",()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Orbit controls
// controls = new OrbitControls(camera, renderer.domElement);
// controls.update();
