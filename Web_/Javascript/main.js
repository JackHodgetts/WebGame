import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 5, 1, 1 ); // makes geometry
const material = new THREE.MeshBasicMaterial( { color: 0xedf50a } ); // makes the material
const cube = new THREE.Mesh( geometry, material ); // makes the mesh for cube 1
const cube2 = new THREE.Mesh( geometry, material ); // makes the mesh for cube 2
scene.add( cube ); // adds cube to the scene
scene.add( cube2); // add cube to the scene

camera.position.z = 10; // camera position
cube2.position.y = 2;

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