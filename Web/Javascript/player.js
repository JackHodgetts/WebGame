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

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
document.body.appendChild(renderer.domElement);
camera.position.z = 10;
camera.position.y = 10;

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
const moveSide=()=>{
    if (dPressed){
        camera.position.x += 0.1;}
    if (aPressed){
        camera.position.x -= 0.1;}
};

const moveforward=()=>{
    if (wPressed){
        camera.position.z -= 0.1;}
    if (sPressed){
        camera.position.z += 0.1;}
};

// Animate function
function animate() {
    const delta = clock.getDelta();
    if (mixer){ 
        mixer.update(delta);}
    moveSide();
    moveforward();
    renderer.render(scene, camera);
    requestAnimationFrame(animate); 

    let originalPoint = cube.position
    for (let i = 0,len = cube.vertices.length; i < len; i++) {
        const vertex = cube.vertices[i]
        //const directionVector = vertex.sub(originalPoint)
        const ray = new THREE.Raycaster(originalPoint,direction)
        let collisionResults = ray.intersectObjects( staticObjects )
        if(collisionResults.length  > 0 && collisionResults[0].distance < 0.5 ){
            console.log("yes");
            speed = 0
            cube.position.y = 0.5
        }
     } 
	cube.position.y -= speed * delta
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
