import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CurveExtras } from "three/examples/js/curves/CurveExtras";

const style = {
  height: 450,
  width: 550, // we can control scene size by setting container dimensions
};

class App extends Component {
  //RISIZE
  handleWindowResize = () => {
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.position.z = 1;
    this.scene.add(this.camera);

    this.camera.updateProjectionMatrix();
  };
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
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, // fov = field of view
      width / height, //ratio
      0.1, // near
      1000 // far
    );
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    this.scene.add(ambient);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 10, 60);
    this.scene.add(light);
    this.scene.background = new THREE.Color(0xaaaaaa);
    this.camera.position.z = 15;
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 4, 0);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
  };

  //MESH
  addCustomSceneObjects = () => {
    const height = 0.4;
    const geometry = new THREE.BoxGeometry(3, height, 0.9);
    const material = new THREE.MeshLambertMaterial({ color: 0xdcbcc7 });
    const mesh = new THREE.Mesh(geometry, material);

    ///JENGA 20 floors
    for (let row = 0; row < 20; row++) {
      //y position for each row + distance
      let yPos = row * (height + 0.05);
      //init rotate variable
      let offset = -1;
      //Each floor 3 block
      for (let count = 0; count < 3; count++) {
        const block = mesh.clone();
        //set the rotation of each floor
        if (row % 2) {
          //rotated blocks
          block.rotation.y = Math.PI / 2; //33 half evolution
          //increay y value each block in the row
          block.position.set(offset, yPos, 0);
        } else {
          //regular block
          block.position.set(0, yPos, offset);
        }
        this.scene.add(block);
        offset++;
      }
    }
  };

  //UPDATE
  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  render() {
    return <div style={style} ref={(ref) => (this.el = ref)} />;
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
