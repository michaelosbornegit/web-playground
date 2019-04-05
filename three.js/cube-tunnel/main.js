// This is another attempt at a cool background for a webpage. This one is
// going to be randomly distributed and randomly rotated cubes mucing past you.


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

let cubeDimension = 1;
let cubeSpace = 50;
let innerRad = 3;
let outerRad = 7;
let tunnelChunkDepth = 5;
let cubesPerChunk = 40;

let cubeGeometry = new THREE.BoxGeometry(cubeDimension, cubeDimension, cubeDimension);
let cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0xff57b1
});

let cubes = [];

function getRandomRadians() {
  return Math.random() * 2 * Math.PI;
}

function getRandomPointOnCircle(radius) {
  let randRadians = getRandomRadians();
  return {
    x: Math.cos(randRadians) * radius,
    y: Math.sin(randRadians) * radius,
  }
}

// randomly distribute the cubes
for (let chunk = 1; chunk <= tunnelChunkDepth; chunk++) {
  for (let i = 0; i < cubesPerChunk; i++) {
    object = new THREE.Mesh(cubeGeometry, cubeMaterial);
    point = getRandomPointOnCircle(innerRad);
    object.position.x = point.x;
    object.position.y = point.y;
    object.position.z = 20 - chunk * (-Math.random() * cubeSpace);

    object.rotation.x = getRandomRadians();
    object.rotation.y = getRandomRadians();

    cubes.push(object);
    scene.add(object);
  }
}

// // Create the top bars to use to nest each frame under using nesting
// for (let i = 0; i < tunnelDepth; i++) {
//   object = new THREE.Mesh(horizontalBarGeometry, tunnelMaterial);
//   object.position.y = 0.5 * tunnelHeight - 0.5 * tunnelBorderDimension;
//   tunnelFrames.push(object);
// }

// add lighting
let light = new THREE.PointLight(0xffffff, 1, 100, 2);
light.position.set(0, 0, 15);
scene.add(light);

light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);


// add fog
scene.fog = new THREE.Fog(0x000000, 1, 60);


// position camera
camera.position.z = 20;


// render loop
function animate() {
  requestAnimationFrame(animate);

  // move frames towards camera
  for (let cube of cubes) {
    cube.position.z += 0.05;
    if (cube.position.z > 20) {
      cube.position.z -= cubeSpace * tunnelChunkDepth;
    }
  }

  renderer.render(scene, camera);
}
animate();
