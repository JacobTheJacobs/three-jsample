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
    this.camera.position.z = 100;
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
  };

  //MESH
  addCustomSceneObjects = () => {
    //create sky box
    const loader = new THREE.CubeTextureLoader().load([
      "./galaxy/posx.jpg",
      "./galaxy/negx.jpg",
      "./galaxy/posy.jpg",
      "./galaxy/negy.jpg",
      "./galaxy/posz.jpg",
      "./galaxy/negz.jpg",
    ]);
    this.scene.background = loader;

    //group all the obj into one
    this.capsule = new THREE.Group();
    //SPHERE first obj half sphere
    const geometry = new THREE.SphereGeometry(
      2, //radius
      30, // widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
      20, //heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
      0, //phiStart — specify horizontal starting angle. Default is 0.
      Math.PI * 2, //phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
      //ROTATE THE SPHERE
      0, //thetaStart — specify vertical starting angle. Default is 0.
      Math.PI / 2 //thetaLength — specify vertical sweep angle size. Default is Math.PI.
    );
    const material = new THREE.MeshLambertMaterial({
      //skeleton true or false
      wireframe: false,
      //make it shiny
      envMap: loader,
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.capsule.add(sphere);

    //CYLINDER
    const geometry2 = new THREE.CylinderGeometry(
      2, //radiusTop
      2, //radiusBottom
      5, //height
      30, //radialSegments
      1, //heightSegments
      true //openEnded
    );
    const cylinder = new THREE.Mesh(geometry2, material);

    this.capsule.add(cylinder);
    //move sphere on top
    sphere.position.y = 2.5;
    //make copy on sphere
    const sphere2 = sphere.clone();
    this.capsule.add(sphere2);
    //rotate the sphere2
    sphere2.rotation.z = Math.PI; //180 deg
    //move sphere to bottom
    sphere2.position.y = -2.5;
    //boom a took a pill in ibiza
    this.scene.add(this.capsule);
  };

  //UPDATE
  startAnimationLoop = () => {
    this.capsule.rotation.z += 0.01;
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

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
