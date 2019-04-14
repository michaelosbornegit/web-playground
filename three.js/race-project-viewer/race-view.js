// The GUI for viewing the race.

class RaceView {

  // the apex of the turns on this track will touch the edges of this imaginary
  // bounding box
  trackBoxWidth = 10;
  trackSurfaceWidth = 0.7;
  curveAccuracy = 40;
  trackColor = 0x000000;
  racerHeight = 0.1;

  scene;
  camera;
  renderer;
  controls;
  raceInfo;
  participants;
  raceLineSegments;
  raceLineWidth;
  raceLineHeight;
  pointsOnTurns;
  pointsOnStraights;

  constructor() {
    // set up the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff)
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.camera.position.set(0, 0, 20);
    this.camera.up.set(0, 0, 1);
    this.camera.updateProjectionMatrix();

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.screenSpacePanning = true;
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI / 2;

    let that = this;
    this.controls.addEventListener('change', () => {
      that.renderer.render(that.scene, that.camera)
    }); // add this only if there is no animation loop (requestAnimationFrame)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }


  loadRaceInfo(raceInfo) {
    this.raceInfo = raceInfo;

    this.drawTrackSurface(raceInfo.width, raceInfo.height);
    this.calculatePointDistribution();

    this.renderer.render(this.scene, this.camera)

  }


  telemetryMessage(message) {
    let point = this.getPointAtDistance(message.distance)
    this.participants[message.number].mesh.position.set(point.x, point.y, this.racerHeight);

    this.renderer.render(this.scene, this.camera)
  }


  calculatePointDistribution() {
    let allPoints = (this.raceLineHeight * Math.PI) + (this.raceLineWidth - this.raceLineHeight) * 2;
    this.pointsOnTurns = (((this.raceLineHeight * Math.PI) / 4) / allPoints) * this.raceInfo.trackDistance;
    this.pointsOnStraights = ((this.raceLineWidth - this.raceLineHeight) / allPoints) * this.raceInfo.trackDistance;
  }


  loadParticipants(participants) {
    // index participants by their ID
    this.participants = [];
    for (let participant of participants.participants) {
      this.participants[participant.number] = {
        name: participant.name,
        startingDistance: participant.startingDistance,
      }
    }

    // put them on the track
    for (let participant of this.participants) {
      if (participant != undefined) {
        let geometry = new THREE.SphereGeometry(0.1, 32, 32);
        let material = new THREE.MeshBasicMaterial({
          color: 0x0000ff
        });
        let sphere = new THREE.Mesh(geometry, material);
        let position = this.getPointAtDistance(participant.startingDistance)
        sphere.position.set(position.x, position.y, this.racerHeight)
        participant.mesh = sphere;
        this.scene.add(sphere);
      }
    }

    this.renderer.render(this.scene, this.camera)
  }


  getPointAtDistance(distance) {
    while (distance < 0) {
      distance += this.raceInfo.trackDistance;
    }
    while (distance > this.raceInfo.trackDistance) {
      distance -= this.raceInfo.trackDistance;
    }

    let firstTurnDistance = this.pointsOnTurns;
    let secondTurnDistance = this.pointsOnTurns * 2;
    let firstStraightDistance = secondTurnDistance + this.pointsOnStraights;
    let thirdTurnDistance = this.pointsOnTurns * 3 + this.pointsOnStraights;
    let fourthTurnDistance = this.pointsOnTurns * 4 + this.pointsOnStraights;
    let secondStraightDistance = fourthTurnDistance + this.pointsOnStraights;

    let specificCurve;
    let t = 0;

    if (distance < firstTurnDistance) {
      // Lands on first turn
      t = distance / firstTurnDistance;
      specificCurve = this.raceLineSegments['turnOne'];
    } else if (distance < secondTurnDistance) {
      // Lands on second turn
      t = (distance - firstTurnDistance) / this.pointsOnTurns;
      specificCurve = this.raceLineSegments['turnTwo'];
    } else if (distance < firstStraightDistance) {
      // Lands on bottom straight
      t = (distance - secondTurnDistance) / this.pointsOnStraights;
      specificCurve = this.raceLineSegments['backStraight'];
    } else if (distance < thirdTurnDistance) {
      // Lands on third turn
      t = (distance - firstStraightDistance) / this.pointsOnTurns;
      specificCurve = this.raceLineSegments['turnThree'];
    } else if (distance < fourthTurnDistance) {
      // Lands on fourth turn
      t = (distance - thirdTurnDistance) / this.pointsOnTurns;
      specificCurve = this.raceLineSegments['turnFour'];
    } else if (distance < secondStraightDistance) {
      // Lands on top straight
      t = (distance - fourthTurnDistance) / this.pointsOnStraights;
      specificCurve = this.raceLineSegments['frontStraight'];
    }

    return specificCurve.getPoint(t);
  }


  // First models the inner racing edge of the track, then the outer edge,
  // then draws triangles between them to form the racing surface
  drawTrackSurface(widthRatio, heightRatio) {
    // initialize frequently used variables
    let points;
    let geometry;
    let material;
    let shape;

    // calculate inner, outer, and race line dimensions based off racing surface width
    let outerTrackWidth = this.trackBoxWidth;
    let outerTrackHeight = this.trackBoxWidth / widthRatio * heightRatio;

    this.raceLineWidth = this.trackBoxWidth - this.trackSurfaceWidth;
    this.raceLineHeight = outerTrackHeight - this.trackSurfaceWidth;

    let innerTrackWidth = this.trackBoxWidth - 2 * this.trackSurfaceWidth;
    let innerTrackHeight = outerTrackHeight - 2 * this.trackSurfaceWidth;

    let innerSegments = this.drawTrackOutline(innerTrackWidth, innerTrackHeight, false);
    this.raceLineSegments = this.drawTrackOutline(this.raceLineWidth, this.raceLineHeight, false);
    let outerSegments = this.drawTrackOutline(outerTrackWidth, outerTrackHeight, false);

    // draw triangles between the inside and outside to make the actual track surface
    this.fillInRaceTrack(innerSegments, outerSegments);
  }


  drawTrackOutline(width, height, draw) {
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

    points = turnOne.getPoints(this.curveAccuracy);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: this.trackColor
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    let turnTwo = new THREE.CubicBezierCurve(
      new THREE.Vector2(-width / 2, 0),
      new THREE.Vector2(-width / 2, -height / 4),
      new THREE.Vector2(-width / 2 + height / 4, -height / 2),
      new THREE.Vector2(-width / 2 + height / 2, -height / 2)
    );

    points = turnTwo.getPoints(this.curveAccuracy);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: this.trackColor
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    let turnThree = new THREE.CubicBezierCurve(
      new THREE.Vector2(width / 2 - height / 2, -height / 2),
      new THREE.Vector2(width / 2 - height / 4, -height / 2),
      new THREE.Vector2(width / 2, -height / 4),
      new THREE.Vector2(width / 2, 0)
    );

    points = turnThree.getPoints(this.curveAccuracy);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: this.trackColor
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    let turnFour = new THREE.CubicBezierCurve(
      new THREE.Vector2(width / 2, 0),
      new THREE.Vector2(width / 2, height / 4),
      new THREE.Vector2(width / 2 - height / 4, height / 2),
      new THREE.Vector2(width / 2 - height / 2, height / 2)
    );

    points = turnFour.getPoints(this.curveAccuracy);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: this.trackColor
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    // bottom straight
    let backStraight = new THREE.LineCurve(
      new THREE.Vector2(-width / 2 + height / 2, -height / 2, 0),
      new THREE.Vector2(width / 2 - height / 2, -height / 2, 0)
    );

    // only need 2 points for a line
    points = backStraight.getPoints(2);
    geometry = new THREE.BufferGeometry().setFromPoints(points);

    material = new THREE.LineBasicMaterial({
      color: this.trackColor
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)


    // top straight
    let frontStraight = new THREE.LineCurve(
      new THREE.Vector2(width / 2 - height / 2, height / 2, 0),
      new THREE.Vector2(-width / 2 + height / 2, height / 2, 0)
    );

    // only need 2 points for a line
    points = frontStraight.getPoints(2);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    material = new THREE.LineBasicMaterial({
      color: this.trackColor
    });

    shape = new THREE.Line(geometry, material);
    this.scene.add(shape)

    return {
      turnOne: turnOne,
      turnTwo: turnTwo,
      backStraight: backStraight,
      turnThree: turnThree,
      turnFour: turnFour,
      frontStraight: frontStraight,
    }
  }

  fillInRaceTrack(innerSegments, outerSegments) {
    let turnTriangles = 15;
    let straightTriangles = 2;
    let turnInc = 1 / turnTriangles;

    for (let property in innerSegments) {
      let inner = innerSegments[property];
      let outer = outerSegments[property];

      if (inner.type === "CubicBezierCurve") {
        let geometry = new THREE.BufferGeometry();
        let vertices = [];
        for (let i = 0; i < 1; i += turnInc) {
          let innerPoint = inner.getPoint(i);
          let innerNext = inner.getPoint(i + turnInc);
          let outerPoint = outer.getPoint(i);
          let outerNext = outer.getPoint(i + turnInc);
          // push two new triangles
          vertices.push(
            innerPoint.x, innerPoint.y, 0,
            outerPoint.x, outerPoint.y, 0,
            outerNext.x, outerNext.y, 0,

            innerPoint.x, innerPoint.y, 0,
            outerNext.x, outerNext.y, 0,
            innerNext.x, innerNext.y, 0,
          )
        }

        let float32Verticies = Float32Array.from(vertices);
        geometry.addAttribute('position', new THREE.BufferAttribute(float32Verticies, 3));
        let material = new THREE.MeshBasicMaterial({
          color: this.trackColor
        });
        let mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh)
      } else if (inner.type === "LineCurve") {
        let geometry = new THREE.BufferGeometry();
        let vertices = [
          inner.getPoint(1).x, inner.getPoint(1).y, 0,
          inner.getPoint(0).x, inner.getPoint(0).y, 0,
          outer.getPoint(1).x, outer.getPoint(1).y, 0,

          outer.getPoint(1).x, outer.getPoint(1).y, 0,
          inner.getPoint(0).x, inner.getPoint(0).y, 0,
          outer.getPoint(0).x, outer.getPoint(0).y, 0,
        ];

        let float32Verticies = Float32Array.from(vertices);
        geometry.addAttribute('position', new THREE.BufferAttribute(float32Verticies, 3));
        let material = new THREE.MeshBasicMaterial({
          color: this.trackColor
        });
        let mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh)
      }
    }
  }

}
