import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CurveExtras } from "three/examples/js/curves/CurveExtras";

const style = {
  height: 400,
  width: 400, // we can control scene size by setting container dimensions
};

class App extends Component {
  //START
  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
  }

  //END
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  //SCENE
  sceneSetup = () => {
    //SET CLOCK AS GLOBAL VARIABLE IMPORTANT!!!!!!!!!
    this.clock = new THREE.Clock();
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.scene = new THREE.Scene();
    let col = 0x605050;

    this.scene.background = new THREE.Color(col);
    this.scene.fog = new THREE.Fog(col, 10, 100);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 4, 7);
    this.camera.lookAt(0, 1.5, 0);

    //lights
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    this.scene.add(ambient);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 10, 6);
    this.scene.add(light);

    //controls
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    //render
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref

    //GRID
    const planeGeometry = new THREE.PlaneGeometry(200, 200); //x,y
    const planeMaterial = new THREE.MeshStandardMaterial();
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    //setting x
    plane.rotation.x = -Math.PI / 2; //-90deg
    this.scene.add(plane);
    //making the tiles
    const grid = new THREE.GridHelper(200, 80);
    this.scene.add(grid);
  };

  //MESH
  addCustomSceneObjects = () => {
    this.player = new THREE.Group();
    this.scene.add(this.player);

    const bodyGeometry = new THREE.CylinderBufferGeometry(0.5, 0.3, 1.6, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0xffcdf00 });
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.y = 0.8;
    body.scale.z = 0.5;
    this.player.add(body);

    const headGeometry = new THREE.SphereBufferGeometry(0.3, 20, 15);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 2.0;
    this.player.add(head);

    //cameras
    this.cameras = [];
    this.cameraIndex = 0;
    const followCam = new THREE.Object3D();
    followCam.position.copy(this.camera.position);
    this.player.add(followCam);
    this.cameras.push(followCam);

    const frontCam = new THREE.Object3D();
    frontCam.position.set(0, 3, -8);
    this.player.add(frontCam);
    this.cameras.push(frontCam);

    const overheadCam = new THREE.Object3D();
    overheadCam.position.set(0, 20, 0);
    this.cameras.push(overheadCam);
  };

  //UPDATE
  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);

    //add camera
    const dt = this.clock.getDelta();

    if (
      this.player.userData !== undefined &&
      this.player.userData.move !== undefined
    ) {
      this.player.translateZ(this.player.userData.move.forward * dt * 5);
      this.player.rotateY(this.player.userData.move.turn * dt);
    }

    //add camerea lerping code
    this.camera.position.lerp(
      //change the index to switch the cameras
      this.cameras[this.cameraIndex].getWorldPosition(new THREE.Vector3()),//v - Vector3 to interpolate towards.
      0.05//alpha - interpolation factor, typically in the closed interval [0, 1].
      //Linearly interpolate between this vector and v, where alpha is the percent distance along the line - alpha = 0 will be this vector, and alpha = 1 will be v.
    );
    //copy the player position
    const pos = this.player.position.clone();
    //update the position to 3 camera position higher
    pos.y += 3;
    this.camera.lookAt(pos);
  };

  //RISIZE
  handleWindowResize = () => {
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    this.scene.add(this.camera);
    this.camera.updateProjectionMatrix();
  };

  changeCamera = () => {
    this.cameraIndex++;
    if (this.cameraIndex >= this.cameras.length) this.cameraIndex = 0;
  };

  keyDown = (evt) => {
    let forward =
      this.player.userData !== undefined &&
      this.player.userData.move !== undefined
        ? this.player.userData.move.forward
        : 0;
    let turn =
      this.player.userData != undefined &&
      this.player.userData.move !== undefined
        ? this.player.userData.move.turn
        : 0;

    switch (evt.keyCode) {
      case 87: //W
        forward = -1;
        break;
      case 83: //S
        forward = 1;
        break;
      case 65: //A
        turn = 1;
        break;
      case 68: //D
        turn = -1;
        break;
    }

    this.playerControl(forward, turn);
  };

  keyUp = (evt) => {
    console.log(evt.keyCode);
    let forward =
      this.player.userData !== undefined &&
      this.player.userData.move !== undefined
        ? this.player.userData.move.forward
        : 0;
    let turn =
      this.player.move != undefined && this.player.userData.move !== undefined
        ? this.player.userData.move.turn
        : 0;

    switch (evt.keyCode) {
      case 87: //W
        forward = 0;
        break;
      case 83: //S
        forward = 0;
        break;
      case 65: //A
        turn = 0;
        break;
      case 68: //D
        turn = 0;
        break;
    }

    this.playerControl(forward, turn);
  };

  playerControl = (forward, turn) => {
    if (forward == 0 && turn == 0) {
      delete this.player.userData.move;
    } else {
      if (this.player.userData === undefined) this.player.userData = {};
      this.player.userData.move = { forward, turn };
    }
  };

  render() {
    return (
      <div>
        {" "}
        <a id="camera-btn" ref={(btn) => (this.btn = btn)}>
          <div onClick={()=>this.changeCamera()}>
            <i class="fas fa-camera"></i>click
          </div>
        </a>
        <div
          style={style}
          ref={(ref) => (this.el = ref)}
          onKeyUp={(e) => this.keyUp(e)}
          onKeyDown={(e) => this.keyDown(e)}
        />
      </div>
    );
  }
}

class Container extends Component {
  state = { isMounted: true };
  render() {
    const { isMounted = true } = this.state;
    return (
      <>
        <button
          onClick={() =>
            this.setState((state) => ({ isMounted: !state.isMounted }))
          }
        >
          {isMounted ? "Unmount" : "Mount"}
        </button>
        {isMounted && <App />}
        {isMounted && <div>Scroll to zoom, drag to rotate</div>}
      </>
    );
  }
}

export default Container;
