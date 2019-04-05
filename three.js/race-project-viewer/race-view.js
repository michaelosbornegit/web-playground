// The GUI for viewing the race.

class RaceView {

  // the apex of the turns on this track will touch the edges of this imaginary
  // bounding box
  trackBoxWidth = 10;

  trackSurfaceWidth = 0.5;

  pointsToDrawCurvesWith = 40;

  scene;
  camera;
  renderer;

  constructor() {
    // set up the scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.camera.position.z = 40;
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  loadRaceInfo(raceInfo) {
    console.log(this.camera)
    console.log(raceInfo)
    // init variables
    let geometry;
    let material;

    // render the cube
    // geometry = new THREE.BoxGeometry(10, 10, 10);
    // material = new THREE.MeshBasicMaterial({
    //   color: 0xff0000
    // });
    // let cube = new THREE.Mesh(geometry, material);
    // this.scene.add(cube);

    this.drawTrackSurface(raceInfo.width, raceInfo.height);



    // add floor
    geometry = new THREE.PlaneBufferGeometry(50, 50);
    material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.z = -10;
    this.scene.add(plane);

    this.renderer.render(this.scene, this.camera)

  }

  loadParticipants(participants) {

  }

  // First models the inner racing edge of the track, then the outer edge,
  // then draws triangles between them to form the racing surface
  drawTrackSurface(widthRatio, heightRatio) {
    // initialize frequently used variables
    let points;
    let geometry;
    let material;
    let shape;

    // calculate inner and outer dimensions based off racing surface width
    let outerTrackWidth = this.trackBoxWidth;
    let outerTrackHeight = this.trackBoxWidth / widthRatio * heightRatio;

    let innerTrackWidth = this.trackBoxWidth - 2 * this.trackSurfaceWidth;
    let innerTrackHeight = outerTrackHeight - 2 * this.trackSurfaceWidth;

    this.drawTrackOutline(innerTrackWidth, innerTrackHeight);
    this.drawTrackOutline(outerTrackWidth, outerTrackHeight);
  }

  drawTrackOutline(width, height) {
    // initialize frequently used variables
    let points;
    let geometry;
    let material;
    let shape;

    // form inner track shape
    let turnOne = new THREE.CubicBezierCurve(
      new THREE.Vector2(-width / 2 + height / 2, height / 2),
      new THREE.Vector2(-width / 2 + height / 4, height / 2),
      new THREE.Vector2(-width / 2, height / 4),
      new THREE.Vector2(-width / 2, 0)
    );

    points = turnOne.getPoints(this.pointsToDrawCurvesWith);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    let turnTwo = new THREE.CubicBezierCurve(
      new THREE.Vector2(-width / 2, 0),
      new THREE.Vector2(-width / 2, -height / 4),
      new THREE.Vector2(-width / 2 + height / 4, -height / 2),
      new THREE.Vector2(-width / 2 + height / 2, -height / 2)
    );

    points = turnTwo.getPoints(this.pointsToDrawCurvesWith);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    let turnThree = new THREE.CubicBezierCurve(
      new THREE.Vector2(width / 2 - height / 2, -height / 2),
      new THREE.Vector2(width / 2 - height / 4, -height / 2),
      new THREE.Vector2(width / 2, -height / 4),
      new THREE.Vector2(width / 2, 0)
    );

    points = turnThree.getPoints(this.pointsToDrawCurvesWith);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    let turnFour = new THREE.CubicBezierCurve(
      new THREE.Vector2(width / 2, 0),
      new THREE.Vector2(width / 2, height / 4),
      new THREE.Vector2(width / 2 - height / 4, height / 2),
      new THREE.Vector2(width / 2 - height / 2, height / 2)
    );

    points = turnFour.getPoints(this.pointsToDrawCurvesWith);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)

    // bottom straight
    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(-width / 2 + height / 2, -height / 2, 0),
      new THREE.Vector3(width / 2 - height / 2, -height / 2, 0)
    );

    material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)

    // top straight
    geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(width / 2 - height / 2, height / 2, 0),
      new THREE.Vector3(-width / 2 + height / 2, height / 2, 0)
    );

    material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)
  }

}





// // init variables
// let geometry;
// let material;
// let object;
//
// let cubeDimension = 1;
// let cubeSpace = 50;
// let innerRad = 3;
// let outerRad = 7;
// let tunnelChunkDepth = 5;
// let cubesPerChunk = 40;
//
// let cubeGeometry = new THREE.BoxGeometry(cubeDimension, cubeDimension, cubeDimension);
// let cubeMaterial = new THREE.MeshStandardMaterial({
//   color: 0xff57b1
// });
//
// let cubes = [];
//
// function getRandomRadians() {
//   return Math.random() * 2 * Math.PI;
// }
//
// function getRandomPointOnCircle(radius) {
//   let randRadians = getRandomRadians();
//   return {
//     x: Math.cos(randRadians) * radius,
//     y: Math.sin(randRadians) * radius,
//   }
// }
//
// // randomly distribute the cubes
// for (let chunk = 1; chunk <= tunnelChunkDepth; chunk++) {
//   for (let i = 0; i < cubesPerChunk; i++) {
//     object = new THREE.Mesh(cubeGeometry, cubeMaterial);
//     point = getRandomPointOnCircle(innerRad);
//     object.position.x = point.x;
//     object.position.y = point.y;
//     object.position.z = 20 - chunk * (-Math.random() * cubeSpace);
//
//     object.rotation.x = getRandomRadians();
//     object.rotation.y = getRandomRadians();
//
//     cubes.push(object);
//     scene.add(object);
//   }
// }
//
// // // Create the top bars to use to nest each frame under using nesting
// // for (let i = 0; i < tunnelDepth; i++) {
// //   object = new THREE.Mesh(horizontalBarGeometry, tunnelMaterial);
// //   object.position.y = 0.5 * tunnelHeight - 0.5 * tunnelBorderDimension;
// //   tunnelFrames.push(object);
// // }
//
// // add lighting
// let light = new THREE.PointLight(0xffffff, 1, 100, 2);
// light.position.set(0, 0, 15);
// scene.add(light);
//
// light = new THREE.AmbientLight(0xffffff); // soft white light
// scene.add(light);
//
//
// // add fog
// scene.fog = new THREE.Fog(0x000000, 1, 60);
//
//
// // position camera
// camera.position.z = 20;
//
//
// // render loop
// function animate() {
//   requestAnimationFrame(animate);
//
//   // move frames towards camera
//   for (let cube of cubes) {
//     cube.position.z += 0.05;
//     if (cube.position.z > 20) {
//       cube.position.z -= cubeSpace * tunnelChunkDepth;
//     }
//   }
//
//   renderer.render(scene, camera);
// }
// animate();
