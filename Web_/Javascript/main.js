import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 5, 1, 1 ); // makes geometry
const material = new THREE.MeshBasicMaterial( { color: 0xedf50a } );
const material2 = new THREE.MeshBasicMaterial( { color: 0xf2304a } );
const material3 = new THREE.MeshBasicMaterial( { color: 0xf2304a, wireframe : true } ); // makes the material
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );
const cube = new THREE.Mesh( geometry, material ); // makes the mesh for cube 1
const cube2 = new THREE.Mesh( geometry, material2 );
const cube3 = new THREE.Mesh( geometry, material3 ); // makes the mesh for cube 2
scene.add( cube ); // adds cube to the scene
scene.add( cube2);
scene.add( cube3);// add cube to the scene

camera.position.z = 10; // camera position
cube2.position.y = 2;
cube3.position.x = -5;

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 1;

	renderer.render( scene, camera );

}

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerWidth;
    camera.aspect = window.innerHeight / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( "resize", onWindowResize );