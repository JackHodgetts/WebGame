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
let timeLeft = 60;
const walls = []; // Making an array for the walls of Maze
const buttons = []; // Making na array for the buttons around the Maze

let lookSpeed = 0.05;
let moveSpeed = 0.15;
let yaw = 0; // Left/Right rotation

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const canvas = document.querySelector("#gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
camera.position.set(0, 2, 30);
//camera.rotation.set(30, 0, 0);

// Stats for FPS display
stats = new Stats();
document.body.appendChild(stats.dom);

// Timer countdown
const startCountDown = setInterval(() => countdown(), 1000);

const countdown = () => {
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if (timeLeft === 0) {
        gameOver();
    }

};

const gameOver = () => clearInterval(startCountDown);

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

// Create Buttons
const createButton = (position) => {
    const buttonBaseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 15);
    const buttonBaseMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const buttonBase = new THREE.Mesh(buttonBaseGeometry, buttonBaseMaterial);
    buttonBase.position.set(position.x, position.y, position.z);

    const buttonGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 15);
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(position.x, position.y + 1.5, position.z);

    const buttonGroup = new THREE.Group();
    buttonGroup.add(buttonBase, button);
    scene.add(buttonGroup);

    buttons.push(buttonGroup);
};

// Spawn Buttons
createButton({ x: 10.5, y: 0, z: 5 });
createButton({ x: -7, y: 0, z: 1 });
createButton({ x: -13, y: 0, z: -15 });
createButton({ x: -10.5, y: 0, z: 18 });

// Key event listeners
// document.addEventListener("keydown", keyDownHandler, false);
// document.addEventListener("keyup", keyUpHandler, false);

document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "KeyW": wPressed = true; 
        break;
        case "KeyS": sPressed = true; 
        break;
        case "KeyA": yaw += lookSpeed; 
        break;
        case "KeyD": yaw -= lookSpeed; 
        break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "KeyW": wPressed = false; 
        break;
        case "KeyS": sPressed = false; 
        break;
    }
});
// Movement functions
const movePlayer = () => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

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
    camera.rotation.y = yaw; // Left/right rotation
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

const checkButtonCollision = () => buttons.some(buttonGroup => 
    new THREE.Box3().setFromObject(buttonGroup.children[1]).containsPoint(camera.position)
);

const checkCollisions = () => {
    updateRaycasters();
    return raycasters.some(raycaster => raycaster.intersectObjects(walls).some(collision => collision.distance < 0.5)) || checkButtonCollision();
};

// Animation loop
const animate = () => {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    movePlayer();
    CameraRotation();
    group.rotation.y += 0.03;
    group.rotation.x += 0.03;
    group2.rotation.x += 0.06;
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
