// This is the example from the three.js docs, and is the first thing I made
// in Three.js


// set up the scene
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
// can also set to window.innerWidth/2, window.innerHeight/2 for performance
// enhancements
// can also have false as a third argument to render at half resolution
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// init variables
let geometry;
let material;

// render the cube
geometry = new THREE.BoxGeometry(1, 1, 1);
material = new THREE.MeshStandardMaterial({
  color: 0xff0000
});
let cube = new THREE.Mesh(geometry, material);
scene.add(cube);


// add floor
geometry = new THREE.PlaneBufferGeometry(20, 20);
material = new THREE.MeshStandardMaterial({
  color: 0xdddddd,
  side: THREE.DoubleSide
});
var plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI / 2;
plane.position.y = -1.5;
scene.add(plane);


// add lighting
let light = new THREE.PointLight(0xffffff, 1, 100, 2);
light.position.set(2, 2, 2);
scene.add(light);

light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);


// position camera
camera.position.z = 3;


// render loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
