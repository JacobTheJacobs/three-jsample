import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CurveExtras } from "three/examples/js/curves/CurveExtras";

const style = {
  height: 400,
  width: 500, // we can control scene size by setting container dimensions
};

class App extends Component {
  //START
  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    this.addCustomFloor(20);
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
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(1, 2, 5);
    //loo at the obj
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    //lights
    const pointLight = this.getPointLight(1);

    const sphere = this.getSphere(0.05);
    pointLight.add(sphere);
    this.scene.add(pointLight);

    //controls
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    //set fog
    // this.scene.fog = new THREE.FogExp2(0xffffff, 0.2);

    //render
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
    //SET MORE FOOGY BACKGORUD
    this.renderer.setClearColor("#A7F5F9");
  };

  //LIGHT SPHERE
  getSphere = (radius) => {
    const geometry = new THREE.SphereGeometry(radius, 24, 24);
    const material = new THREE.MeshBasicMaterial({
      color: "rgb(255,255,255)",
    });
    const sphere = new THREE.Mesh(geometry, material);
    return sphere;
  };

  //LIGHTS
  getPointLight(intensity) {
    const light = new THREE.PointLight(0xffffff, intensity);
    light.position.y=1.5
    return light;
  }

  //MESH
  addCustomSceneObjects = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: "#F77932",
    });
    this.box = new THREE.Mesh(geometry, material);
    //ref to the params of geometry set a box on a floor
    this.box.position.z = this.box.geometry.parameters.height / 2 - 1;

    this.scene.add(this.box);
  };

  addCustomFloor = (size) => {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
      color: "#A49494",
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.add(this.box);
    this.scene.add(this.mesh);
  };

  //UPDATE
  startAnimationLoop = () => {
    this.mesh.rotation.z += 0.001;
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
