import * as THREE from "three";
import { Character } from "./Character.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

const orbitControls = new OrbitControls(camera, renderer.domElement);

// Create clock
const clock = new THREE.Clock();

// Create NPC
let boids = [];
for (let i = 0; i < 100; i++) {
  let boid = new Character(0xff0000);
  boids.push(boid);
}

// Setup our scene
function setup() {
  scene.background = new THREE.Color(0x88d5ff);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.y = 35;
  camera.lookAt(0, 0, 0);

  //Create Light
  let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(0, 5, 5);
  scene.add(directionalLight);

  // Helper functions
  scene.add(new THREE.AxesHelper(50));
  scene.add(new THREE.GridHelper(50, 50));

  // Add the NPCs to the scene
  for (let i = 0; i < boids.length; i++) {
    scene.add(boids[i].gameObject);
  }

  // First call to animate
  animate();
}

// animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  let deltaTime = clock.getDelta();

  // Update our two characters

  for (let i = 0; i < boids.length; i++) {
    boids[i].align(boids);
    boids[i].cohesion(boids);
    boids[i].separation(boids);
    boids[i].update(deltaTime, boids);
  }

  // Update our orbit controls
  orbitControls.update();
}

setup();
