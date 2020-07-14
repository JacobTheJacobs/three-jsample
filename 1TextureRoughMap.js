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
    var sphereMaterial = this.getMaterial("standard", "rgb(255, 255, 255)");
    var sphere = this.getSphere(sphereMaterial, 1, 24);
    this.obj=sphere

    var planeMaterial = this.getMaterial("standard", "rgb(255, 255, 255)");
    var plane = this.getPlane(planeMaterial, 30);

    var lightLeft = this.getSpotLight(2, "rgb(255, 220, 180)");
    var lightRight = this.getSpotLight(0.5, "rgb(255, 220, 180)");

    // manipulate objects
    sphere.position.y = sphere.geometry.parameters.radius;
    plane.rotation.x = Math.PI / 2;

    lightLeft.position.x = -5;
    lightLeft.position.y = 2;
    lightLeft.position.z = -4;

    lightRight.position.x = 5;
    lightRight.position.y = 2;
    lightRight.position.z = -4;

    planeMaterial.metalness = 0.1;
    planeMaterial.roughness = 0.7;
    sphereMaterial.metalness = 0;
    sphereMaterial.roughness =0;

    // manipulate objects
    const loader = new THREE.TextureLoader();
    planeMaterial.map = loader.load("2.png");
    planeMaterial.bumpMap = loader.load("2.jpg");
    planeMaterial.roughnessMap = loader.load("2.png");

    sphereMaterial.map = loader.load("3.jpg");
    sphereMaterial.bumpMap = loader.load("3.jpg");
    sphereMaterial.roughnessMap = loader.load("3.jpg");

    const maps = ["map", "bumpMap", "roughnessMap"];
    maps.forEach((mapName) => {
      const texture = planeMaterial[mapName];
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 5);
    });

    // add objects to the scene
    this.scene.add(sphere);
    this.scene.add(plane);
    this.scene.add(lightLeft);
    this.scene.add(lightRight);

    // camera
    this.camera = new THREE.PerspectiveCamera(
      45, // field of view
      window.innerWidth / window.innerHeight, // aspect ratio
      1, // near clipping plane
      1000 // far clipping plane
    );
    this.camera.position.z = 7;
    this.camera.position.x = -2;
    this.camera.position.y = 7;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    //render
    this.renderer = new THREE.WebGLRenderer({antialias:true});

    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor("rgb(23, 33, 120)");

    var controls = new OrbitControls(this.camera, this.el);
  };

  getPlane = (material, size) => {
    var geometry = new THREE.PlaneGeometry(size, size);
    material.side = THREE.DoubleSide;
    var obj = new THREE.Mesh(geometry, material);
    obj.receiveShadow = true;

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

  getSphere = (material, size, segments) => {
    var geometry = new THREE.SphereGeometry(size, segments, segments);
    var obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;

    return obj;
  };

  getMaterial = (type, color) => {
    var selectedMaterial;
    var materialOptions = {
      color: color === undefined ? "rgb(255, 255, 255)" : color,
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
    this.obj.rotation.y+=0.01
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
