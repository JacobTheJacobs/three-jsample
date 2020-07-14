import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
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
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(1, 20, 25);
    //loo at the obj
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    //lights
    const light = this.getDirectionalLight(2);
    light.position.x = 10;
    light.position.y = 5;
    light.position.z = 0;
    const sphere = this.getSphere(0.05);
    light.add(sphere);
    this.scene.add(light);

    // abmientLight lights
    const abmientLight = this.getAmbientLight(1);
    this.scene.add(abmientLight);

    //objects
    const boxGrid = this.getBoxGrid(10, 1.5);
    boxGrid.rotation.x = 83.26;
    boxGrid.position.z = -0.8;
    boxGrid.position.y = 6.7;
    this.scene.add(boxGrid);
    const floor = this.addCustomFloor(30);
    floor.add(boxGrid);
    this.scene.add(floor);
    this.obj = floor;
    boxGrid.name = "boxGrid";

    //controls
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    //set fog
    // this.scene.fog = new THREE.FogExp2(0xffffff, 0.2);

    //render
    this.renderer = new THREE.WebGLRenderer();
    //ENABLE SHADOW Map RENDERING
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
    //SET MORE FOOGY BACKGORUD
    this.renderer.setClearColor("rgb(23, 33, 120)");
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
    light.position.y = 2.3;
    //CASTING SHADOW ON OBJ ALDO NEED TO BE ON OMESH OBJ
    light.castShadow = true;
    return light;
  }

  //LIGHTS
  getSpotLight(intensity) {
    const light = new THREE.SpotLight(0xffffff, intensity);

    //CASTING SHADOW ON OBJ ALDO NEED TO BE ON OMESH OBJ
    light.castShadow = true;
    //ADJUST SHADOW BIAS
    light.shadow.bias = 0.01;
    return light;
  }

  //LIGHTS
  getDirectionalLight(intensity) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;
    return light;
  }

  //AMBIENT LIGHTS
  getAmbientLight(intensity) {
    const light = new THREE.AmbientLight("rgb(10,30,50)", intensity);
    return light;
  }

  //MESH
  addCustomSceneObjects = (w, h, d) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    //dont forget the phong works with shadow
    const material = new THREE.MeshPhongMaterial({
      color: "rgb(120, 120, 120)",
    });
    const box = new THREE.Mesh(geometry, material);
    //ref to the params of geometry set a box on a floor
    // box.position.z = box.geometry.parameters.height / 2 - 1;
    //CASTING SHADOW ON OBJ NEEDS TO RECIEVE IN FLOOR
    box.castShadow = true;
    return box;
  };

  //MESH GRID
  getBoxGrid = (amount, separationMultiplier) => {
    var group = new THREE.Group();

    for (var i = 0; i < amount; i++) {
      var obj = this.addCustomSceneObjects(1, 1, 1);
      obj.position.x = i * separationMultiplier;
      obj.position.y = obj.geometry.parameters.height / 2;
      group.add(obj);
      for (var j = 1; j < amount; j++) {
        var obj = this.addCustomSceneObjects(1, 1, 1);
        obj.position.x = i * separationMultiplier;
        obj.position.y = obj.geometry.parameters.height / 2;
        obj.position.z = j * separationMultiplier;
        group.add(obj);
      }
    }

    group.position.x = -(separationMultiplier * (amount - 1)) / 2;
    group.position.z = -(separationMultiplier * (amount - 1)) / 2;

    return group;
  };

  addCustomFloor = (size) => {
    const geometry = new THREE.PlaneGeometry(size, size);
    //dont forget the phong works with shadow
    const material = new THREE.MeshPhongMaterial({
      color: "rgb(120, 120, 120)",
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
    return floor;
  };

  //UPDATE
  startAnimationLoop = () => {
    this.obj.rotation.z += 0.001;
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);

    //get elapse time
    let timeElapsed = this.clock.getElapsedTime();

    const boxGrid = this.scene.getObjectByName("boxGrid");
    boxGrid.children.forEach((child,index) => {
      child.scale.y = Math.sin((timeElapsed*5+index)+1)+2/2;
       //child.position.y = child.scale.y ;
    });
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
