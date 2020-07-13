import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CurveExtras } from "three/examples/js/curves/CurveExtras";

const style = {
  height: 900,
  width: 900, // we can control scene size by setting container dimensions
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
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      80, // fov = field of view
      width / height, //ratio
      0.1, // near
      1000 // far
    );
    //scene
    this.scene.background = new THREE.Color("grey");
    this.camera.position.set(0, 20, 12);

    //lights
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    this.scene.add(ambient);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 10, 60);
    this.scene.add(light);

    //controls
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    //SET CLOCK AS GLOBAL VARIABLE IMPORTANT!!!!!!!!!
    this.clock = new THREE.Clock();
    //render
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
  };

  //MESH
  addCustomSceneObjects = () => {
    //create sky box
    const assetPath = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/";
    const alpha = new THREE.TextureLoader().load(`${assetPath}dots.jpg`);
    const tex = new THREE.TextureLoader().load(
      `${assetPath}bricks-diffuse3.png`
    );
    const cubemap = new THREE.CubeTextureLoader()
      .setPath(`${assetPath}skybox1_`)
      .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
    this.scene.background = cubemap;

    //Using BoxGeometry
    const geometry = new THREE.BoxGeometry(1, 3, 1);
    //make the blocks stick together
    geometry.vertices.forEach((vertex) => (vertex.y += 1.5));
/*
    //Using BoxBufferGeometry
    const geometry = new THREE.BoxBufferGeometry(1, 3, 1);
    const position = geometry.getAttribute("position");
    for (let i = 1; i < position.array.length; i += 3) {
      position.array[i] += 1.5;
    }
    */
    const material = new THREE.MeshPhongMaterial();
    const block = new THREE.Mesh(geometry, material);

    this.parts = [];

    for (let i = 0; i < 4; i++) {
      const mesh = block.clone();

      this.parts.push(mesh);
      if (i === 0) {
        this.scene.add(mesh);
      } else {
        mesh.position.y = 3;
        this.parts[i - 1].add(mesh);
      }
    }
  };

  //UPDATE
  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    //Object for keeping track of time.

    //generate value to swing smoothly beetwen -1 to 1 (6sec)
    let theta = Math.sin(this.clock.getElapsedTime());
    //USING LOCAL CLOCK
    const clock = new THREE.Clock();
    let theta2 = clock.getElapsedTime();
    console.log(this.clock.getElapsedTime());
    console.log(theta);
    this.parts.forEach((part) => {
      part.rotation.z = theta;
      //part.rotation.z += clock.getElapsedTime();
     // part.position.y=clock.getElapsedTime();
    });
  };

  //RISIZE
  handleWindowResize = () => {
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.position.z = 15;
    this.scene.add(this.camera);
    this.camera.updateProjectionMatrix();
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
