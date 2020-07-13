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
      60, // fov = field of view
      width / height, //ratio
      0.1, // near
      1000 // far
    );
    //scene
    this.scene.background = new THREE.Color("grey");
    this.camera.position.set(0, 1, 12);

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

    //mesh
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.95,
      roughness: 0.01,
      emissive: 0x222222,
      envMap: cubemap,
    });

    //Add meshes here
    const geometry1 = new THREE.CylinderGeometry(
      0, //radius top
      3, //radius base
      7, //heigt
      30 //number of segment
    );
    const geometry2 = new THREE.TorusGeometry(
      4, //radius
      1, //tube — Radius of the tube. Default is 0.4.
      16, //radialSegments — Default is 8
      100, //tubularSegments — Default is 6.,
    );
    const geometry3 = new THREE.TorusKnotGeometry(
      3, //radius 
      1, //tube — Radius of the tube. Default is 0.4.
      100, //tubularSegments 
      16, //radialSegments — Default is 8.
      2, //p — This value determines, how many times the geometry winds around its axis of rotational symmetry. Default is 2.
      3 //q — This value determines, how many times the geometry winds around a circle in the interior of the torus. Default is 3.
    );
    this.mesh = new THREE.Mesh(geometry3, material);
    this.scene.add(this.mesh);
  };

  //UPDATE
  startAnimationLoop = () => {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.z -= 0.01;
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
