import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { Noise } from "noisejs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const style = {
  height: 400,
  width: 500, // we can control scene size by setting container dimensions
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
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    //init Clock
    this.clock = new THREE.Clock();
    this.noise = new Noise(Math.random());
    this.scene = new THREE.Scene();
    // initialize objects
    var planeMaterial = this.getMaterial("basic", "rgb(255, 255, 255)");
    var plane = this.getPlane(planeMaterial, 30, 60);
    //set name
    this.obj = plane;

    // manipulate objects
    plane.rotation.x = Math.PI / 2;
    plane.rotation.z = Math.PI / 4;

    // add objects to the scene
    this.scene.add(plane);

    this.camera = new THREE.PerspectiveCamera(
      45, // field of view
      window.innerWidth / window.innerHeight, // aspect ratio
      1, // near clipping plane
      1000 // far clipping plane
    );
    this.camera.position.z = 20;
    this.camera.position.x = 0;
    this.camera.position.y = 5;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    //render
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
    this.renderer.shadowMap.enabled = true;

    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  };

  getPlane = (material, size, segments) => {
    var geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    material.side = THREE.DoubleSide;
    var obj = new THREE.Mesh(geometry, material);
    obj.receiveShadow = true;
    obj.castShadow = true;

    return obj;
  };

  getSpotLight = (intensity, color) => {
    color = color === undefined ? "rgb(255, 255, 255)" : color;
    var light = new THREE.SpotLight(color, intensity);
    light.castShadow = true;
    light.penumbra = 0.5;

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 1024; // default: 512
    light.shadow.mapSize.height = 1024; // default: 512
    light.shadow.bias = 0.001;

    return light;
  };

  getMaterial = (type, color) => {
    var selectedMaterial;
    var materialOptions = {
      color: color === undefined ? "rgb(255, 255, 255)" : color,
      wireframe: true,
    };

    switch (type) {
      case "basic":
        selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
        break;
      case "lambert":
        selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
        break;
      case "phong":
        selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
        break;
      case "standard":
        selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
        break;
      default:
        selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
        break;
    }

    return selectedMaterial;
  };

  //UPDATE
  startAnimationLoop = () => {
    //get the clock
    const elapsedTime = this.clock.getElapsedTime();

    //get the plane geometry
    const planeGeo = this.obj.geometry;
    //indivuling every vertex with index
    planeGeo.vertices.forEach((vertex,index) => {
      //multiply by *1 give act as freq effect
      vertex.z += Math.sin((elapsedTime)+index*0.1)*0.005;//as amplitude 0.005
    });

    //updating the vertices
    planeGeo.verticesNeedUpdate = true;
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    //get the plane
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
