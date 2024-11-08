import * as THREE from 'three';

//orbit control
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

import Stats from 'http://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js'
 

let stats;

//add orbit control
let controls;
 
//add control variables
let upstate = false;
let downstate = false;
let changed = false;

//const canvas = document.querySelector("#gameCanvas")

let animationActions = [];
let mixer;
let activeAction;
let lastAction;

const clock = new THREE.Clock();

//GLTF
const loader  = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();


renderer.setSize( window.innerWidth / 2, window.innerHeight/ 2);

renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );
document.querySelector("body").insertBefore(renderer.domElement, document.querySelector(".font"))

const geometry = new THREE.BoxGeometry( 1, 1, 1 ); // makes geometry
const material = new THREE.MeshBasicMaterial( { color: 0xedf50a } );
const material2 = new THREE.MeshBasicMaterial( { color: 0xf2304a } ); // makes the material


//Lights
const createLights = ()=>{
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.8);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);

    mainLight.position.set(10, 10, 10);
    scene.add( ambientLight, mainLight);
}

createLights();

const cube = new THREE.Mesh( geometry, material ); // makes the mesh for cube 1
const cube2 = new THREE.Mesh( geometry, material2 );

//FPS

stats = new Stats();
document.body.appendChild(stats.dom);


//group cubes with cube 1 and cube 2
let group = new THREE.Group();
group.add(cube);
group.add(cube2);


//group cube with the subgroup
let group2 = new THREE.Group();
group2.add(cube);
group2.add(group);

scene.add(group2);

const geometry5 = new THREE.BoxGeometry(20, 20, 20);

for (let i = 0; i < 2000; i ++){

    const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial ({ color: Math.random() * 0xffffff}));

    object.position.x = Math.random() * 800 - 400;
    object.position.y = Math.random() * 800 - 400;
    object.position.z = Math.random() * 800 - 400;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() + 5;
    object.scale.y = Math.random() + 5;
    object.scale.z = Math.random() + 5;
    
    scene.add(object);
}


//function geneerate mesh
const addPlane = (x, y, w , h, materialaspect)=> {
    //initialte the plan

    const geometry3 = new THREE.PlaneGeometry( w, h, 2 );
    const material3 = new THREE.MeshBasicMaterial( materialaspect );

    const plane = new THREE.Mesh( geometry3, material3 );

    plane.position.x = x;
    plane.position.y = y;
    plane.rotation.x = -Math.PI/2;

    scene.add( plane );


}

const texture = new THREE.TextureLoader().load('../images/goldpattern.png');
const materialAspectFloor = {
    map:texture,
    side: THREE.DoubleSide,
    transparent:true
}
addPlane(0, -3.6, 30, 30, materialAspectFloor );


camera.position.z = 10; // camera position
cube.position.y = 2;
cube2.position.y = 2;
cube2.position.x = 2

//add player
const player = new THREE.Mesh(geometry, material);
scene.add(player);



function animate() {

    stats.update();

	//cube.rotation.x += 0.01;
	//cube.rotation.y += 1;

    group.rotation.y += 0.03;
    group.rotation.x += 0.03;
    group2.rotation.x += 0.06;

    //add key control logic
    if(upstate){
        player.position.y += 0.02;

    }else if(downstate){
        player.position.y -= 0.02;

    }

    //change colour

    const render=()=>{
        requestAnimationFrame( render );

        if( mixer ) mixer.update( 0.01 );

        renderer.render(scene, camera);
    }



	renderer.render( scene, camera );

}

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( "resize", onWindowResize );

//skybox function
//Skybox function
const createskybox = ()=>{
    let bgMesh;
   
    const loader = new THREE.TextureLoader();
    loader.load("../images/SkyBox.jpg", function(texture){
        const sphereGeometry = new THREE.SphereGeometry( 240, 120, 80 );
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
 
        bgMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(bgMesh);
 
    })
   
}
 
createskybox();

//create orbit control

const createControls =()=>{
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
}

//update the control fucntion
createControls();

//create button logic

const moveup = ()=>{
    upstate = true;
    downstate = false;
}

const movedown = ()=>{
    upstate = false;
    downstate = true;
}

//add DOM event functiom

document.getElementById("upbutton").addEventListener("click", moveup);
document.getElementById("downbutton").addEventListener("click", movedown);
 
 
///////GLTF loader
// Load a glTF resource

//added new function to make more than one object using glb
let mesh;
loader.load(
    '../models/Maze_One.glb',  // called when the resource is loaded
 
    (gltf) => {
        mesh = gltf.scene;
        mesh.scale.set(0.1, 0.1, 0.1);
        scene.add(mesh); //add GLTF to the scene

        mixer = new THREE.AnimationMixer(mesh);

        gltf.animations.forEach( (clip ) => {
            const animationActions = mixer.clipAction( clip);
        })

        animationActions.push(animationActions);
 
    },
    // called when loading is in progresses
 
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
 
    },
    // called when loading has errors
 
    (error) => {
        console.log('An error happened' + error);
    }
);
 