/**
 * @author mrdoob / http://mrdoob.com/
 * @author Michael Osborne
 */

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;
		let physics;

		// keep track of bodies and shapes for updating physics
		let bodyShapes = [];

		var events = {};

		var dom = document.createElement( 'div' );

		this.dom = dom;

		this.width = 500;
		this.height = 500;

		this.load = function ( json ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.gammaOutput = true;
			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );

			var project = json.project;

			if ( project.shadows ) renderer.shadowMap.enabled = true;
			if ( project.vr ) renderer.vr.enabled = true;

			dom.appendChild( renderer.domElement );

			this.setScene( loader.parse( json.scene ) );
			this.setCamera( loader.parse( json.camera ) );

			events = {
				init: [initCannon],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				touchstart: [],
				touchend: [],
				touchmove: [],
				update: [updatePhysics]
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for ( var eventKey in events ) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				if ( object === undefined ) {

					console.warn( 'APP.Player: Script without object.', uuid );
					continue;

				}

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: Event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

			dispatch( events.init, arguments );

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			if ( renderer.vr.enabled ) {

				dom.appendChild( THREE.WEBVR.createButton( renderer ) );

			}

		};

		this.setScene = function ( value ) {

			scene = value;

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			if ( camera ) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			if ( renderer ) {

				renderer.setSize( width, height );

			}

		};

		function dispatch( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		}

		var time, prevTime;

		function animate() {

			time = performance.now();

			try {

				dispatch( events.update, { time: time, delta: time - prevTime } );

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || "" ) );

			}

			renderer.render( scene, camera );

			prevTime = time;

		}

		// borrowed from the cannonjs documentation threejs example
		function initCannon() {
			physics = new CANNON.World();
			physics.gravity.set(0,-10,0);
			physics.solver.iterations = 10;

			// find the shapes we want to add physics to
			this.physicsObjectsInfo = [
				{
					name: 'carChassis',
					geometry: CANNON.Box,
					mass: 1
				},
				{
					name: 'wheelLF',
					geometry: CANNON.Cylinder,
					mass: 1
				},
				{
					name: 'wheelRF',
					geometry: CANNON.Cylinder,
					mass: 1
				},
				{
					name: 'wheelRR',
					geometry: CANNON.Cylinder,
					mass: 1
				},
				{
					name: 'wheelLR',
					geometry: CANNON.Cylinder,
					mass: 1
				},
				{
					name: 'ground',
					geometry: CANNON.Plane,
					mass: 0
				},
			];

			for (let physicsObjectInfo of this.physicsObjectsInfo) {
				let shape = scene.getObjectByName(physicsObjectInfo.name);
				// console.log(shape);

				let physShape;
				console.log(shape);
				// using scale because thats how I sized things in the online threejs editor, ideally these would be based on the actual sizes
				if (physicsObjectInfo.geometry === CANNON.Box) {					
					physShape = new physicsObjectInfo.geometry(new CANNON.Vec3(shape.scale.x, shape.scale.y, shape.scale.z));
					shape.position.y += 2;
				} else if (physicsObjectInfo.geometry === CANNON.Cylinder) {
					physShape = new physicsObjectInfo.geometry(shape.scale.x * shape.geometry.parameters.radiusTop, shape.scale.x * shape.geometry.parameters.radiusBottom, shape.scale.z * shape.geometry.parameters.height, shape.geometry.parameters.radialSegments);
				} else if (physicsObjectInfo.geometry === CANNON.Plane) {
					physShape = new physicsObjectInfo.geometry();
				}

				console.log(physShape);
				

				let body = new CANNON.Body({
					mass: physicsObjectInfo.mass,
				});
				body.addShape(physShape);
				body.quaternion.copy(shape.quaternion);
				body.position.copy(shape.position);
				body.angularVelocity.z = -10
				// shape.quaternion.copy(body.quaternion);
				// shape.position.copy(body.position);

				console.log(body);
				
				// body.scale.copy(shape.geometry.scale);
				
				
				physics.addBody(body);

				// add both to our tracking array to keep track of later
				bodyShapes.push({
					body: body,
					shape: shape
				})
			}
			
			// let shape = new CANNON.Box(new CANNON.Vec3(1,1,1));
			// body = new CANNON.Body({
			//   mass: 1
			// });
			// body.addShape(shape);
			// body.angularVelocity.set(0,10,0);
			// body.angularDamping = 0.5;
			// world.addBody(body);
		}

		function updatePhysics(args) {
			
			physics.step(1/60);

			bodyShapes.forEach(((bodyShape) => {
				bodyShape.shape.position.copy(bodyShape.body.position);
				bodyShape.shape.quaternion.copy(bodyShape.body.quaternion)
			}));
			// shape.position.copy(body.position);
			// shape.quaternion.copy(body.quaternion);
			// console.log(body.position);
			
		}

		this.play = function () {

			prevTime = performance.now();

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );
			document.addEventListener( 'touchstart', onDocumentTouchStart );
			document.addEventListener( 'touchend', onDocumentTouchEnd );
			document.addEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.start, arguments );

			renderer.setAnimationLoop( animate );

		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onDocumentKeyDown );
			document.removeEventListener( 'keyup', onDocumentKeyUp );
			document.removeEventListener( 'mousedown', onDocumentMouseDown );
			document.removeEventListener( 'mouseup', onDocumentMouseUp );
			document.removeEventListener( 'mousemove', onDocumentMouseMove );
			document.removeEventListener( 'touchstart', onDocumentTouchStart );
			document.removeEventListener( 'touchend', onDocumentTouchEnd );
			document.removeEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.stop, arguments );

			renderer.setAnimationLoop( null );

		};

		this.dispose = function () {

			while ( dom.children.length ) {

				dom.removeChild( dom.firstChild );

			}

			renderer.dispose();

			camera = undefined;
			scene = undefined;
			renderer = undefined;

		};

		//

		function onDocumentKeyDown( event ) {

			dispatch( events.keydown, event );

		}

		function onDocumentKeyUp( event ) {

			dispatch( events.keyup, event );

		}

		function onDocumentMouseDown( event ) {

			dispatch( events.mousedown, event );

		}

		function onDocumentMouseUp( event ) {

			dispatch( events.mouseup, event );

		}

		function onDocumentMouseMove( event ) {

			dispatch( events.mousemove, event );

		}

		function onDocumentTouchStart( event ) {

			dispatch( events.touchstart, event );

		}

		function onDocumentTouchEnd( event ) {

			dispatch( events.touchend, event );

		}

		function onDocumentTouchMove( event ) {

			dispatch( events.touchmove, event );

		}

	}

};
