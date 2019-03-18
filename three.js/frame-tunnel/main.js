// A slow travelling through a tunnel effect to use as a cool background for
// my portfolio webpage.


// set up the scene
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
// let camera = new THREE.OrthographicCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// init variables
let geometry;
let material;
let object;

// define variables for easy tweaking
let tunnelWidth = 10;
let tunnelHeight = 10;
let tunnelDepth = 50; // depth is how many segments deep, not units
let depthSpacing = 2;
let tunnelBorderDimension = 1; // border is 1 unit width/height

let tunnelMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff
});
// let tunnelMaterial = new THREE.MeshDepthMaterial();
let horizontalBarGeometry = new THREE.BoxGeometry(tunnelWidth, tunnelBorderDimension, tunnelBorderDimension);
let verticalBarGeometry = new THREE.BoxGeometry(tunnelBorderDimension, tunnelHeight - tunnelBorderDimension, tunnelBorderDimension);

let tunnelFrames = [];


// build tunnel frames

// Create the top bars to use to nest each frame under using nesting
for (let i = 0; i < tunnelDepth; i++) {
  object = new THREE.Mesh(horizontalBarGeometry, tunnelMaterial);
  object.position.y = 0.5 * tunnelHeight - 0.5 * tunnelBorderDimension;
  tunnelFrames.push(object);
}

// construct the frame
// everything is in the coord space of the
let depthIncrement = 0;
for (let topBar of tunnelFrames) {
  // bottom bar
  object = new THREE.Mesh(horizontalBarGeometry, tunnelMaterial);
  object.position.y = -tunnelHeight + 0.5 * tunnelBorderDimension;
  topBar.add(object);

  // left bar
  object = new THREE.Mesh(verticalBarGeometry, tunnelMaterial);
  object.position.x = -0.5 * tunnelWidth + 0.5 * tunnelBorderDimension;
  object.position.y = -0.5 * tunnelHeight + 0.5 * tunnelBorderDimension;
  topBar.add(object);

  // right bar
  object = new THREE.Mesh(verticalBarGeometry, tunnelMaterial);
  object.position.x = 0.5 * tunnelWidth - 0.5 * tunnelBorderDimension;
  object.position.y = -0.5 * tunnelHeight + 0.5 * tunnelBorderDimension;
  topBar.add(object);

  // position topBar
  topBar.position.z = depthIncrement;
  depthIncrement -= depthSpacing;

  scene.add(topBar);
}


// add lighting
let light = new THREE.PointLight(0xffffff, 1, 100, 2);
light.position.set(0, 0, 5);
scene.add(light);

light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);


// position camera
camera.position.z = 5;


// render loop
function animate() {
  requestAnimationFrame(animate);

  // move frames towards camera
  for (let frame of tunnelFrames) {
    frame.position.z += 0.01;
    if (frame.position.z > 5) {
      frame.position.z -= depthSpacing * tunnelFrames.length;
    }
  }

  renderer.render(scene, camera);
}
animate();
