import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/js/lights/RectAreaLightUniformsLib";
import { Noise } from "noisejs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
const style = {
  height: 800,
  width: 600, // we can control scene size by setting container dimensions
};

class App extends Component {
  //START
  componentDidMount() {
    this.sceneSetup();
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
    //GUI
    this.params = {
      spot: {
        enable: false,
        color: 0xffffff,
        distance: 0,
        angle: Math.PI / 3,
        penumbra: 0,
        helper: false,
        moving: false,
      },
      area: {
        enable: false,
        color: 0xffffff,
        width: 10,
        height: 10,
        helper: true,
        moving: true,
      },
    };
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;
    this.scene = new THREE.Scene();

    //init Clock
    this.clock = new THREE.Clock();
    const assetPath = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/";
    //skybox
    const envMap = new THREE.CubeTextureLoader()
      .setPath(`${assetPath}skybox1_`)
      .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
    this.scene.background = envMap;

    //camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 4, 57); //wide position
    this.camera.lookAt(0, 1.5, 0);

    //lights
    const ambient = new THREE.HemisphereLight(0xffffff, 0xaaaa66, 0.35);
    this.scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 10, 6);
    this.scene.add(light);

    //object
    const loader = new GLTFLoader();
    loader.load("blender3d2.glb", (gltf) => {
      this.obj = gltf.scene;
      this.scene.add(this.obj);
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.position.y = -7;
    });

    //render
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref

    //controls
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(1, 1, 0);
    this.controls.update();
  };

  //UPDATE
  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
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

  render() {
    return (
      <div>
        <div style={style} ref={(ref) => (this.el = ref)} />
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
