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
    this.camera.position.z = 3;
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    //set 3d scene
    const cubeMap = new THREE.CubeTextureLoader();
    //x+ , x-, y+, y-,z+,z-
    const texture = cubeMap.load([
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
      'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
    ]);
    this.scene.background = texture;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
  };

  //MESH
  addCustomSceneObjects = () => {
    //Custom texture map
    const assetPath1 = "logo191.jpg";
    const texture = new THREE.TextureLoader().load(`${assetPath1}`);
    //Custom texture alpha map
    const assetPath2 = "logo190.jpg";
    const alpha = new THREE.TextureLoader().load(`${assetPath2}`);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    //map the texture
    const material1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
    });
    //map the texture with out transperent alpha would be invisble
    const material2 = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: texture,
      alphaMap: alpha,
      transparent: true,
      //making trasperent
      side: THREE.DoubleSide,
    });

    this.box1 = new THREE.Mesh(geometry, material1);
    this.box1.position.x = -1;

    this.scene.add(this.box1);
    this.box2 = new THREE.Mesh(geometry, material2);
    this.box2.position.x = 1;

    this.scene.add(this.box2);
  };

  //UPDATE
  startAnimationLoop = () => {
    this.box1.rotation.y += 0.01;
    this.box2.rotation.y -= 0.01;
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
