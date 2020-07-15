import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/js/lights/RectAreaLightUniformsLib";
import { Noise } from "noisejs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const style = {
  height: 800,
  width: 600, // we can control scene size by setting container dimensions
};

const vshader = `
uniform float u_time;
uniform float u_radius;

void main(){
  float delta =(sin(u_time)+1.0)/2.0;
  vec3 v = normalize(position)*u_radius;
  vec3 pos = mix(position,v,delta);
  gl_Position = projectionMatrix * modelViewMatrix * vec4 (pos,1.0);
}
`;
const fshader = `
`;

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
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    //init Clock
    this.clock = new THREE.Clock();
    //camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 150);

    //lights
    const ambient = new THREE.HemisphereLight(0xffffff, 0xaaaa66, 0.35);
    this.scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 10, 6);
    this.scene.add(light);

    //render
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref

    //controls
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(1, 1, 0);
    this.controls.update();

    const geometry = new THREE.BoxGeometry(30, 30, 30, 10, 10, 10);
    this.uniforms = {};
    this.uniforms.u_time = { value: 0.0 };
    this.uniforms.u_radius = { value: 20.0 };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vshader,
      wireframe: true,
    });

    const box = new THREE.Mesh(geometry, material);
    this.scene.add(box);
  };

  //UPDATE
  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);
    this.uniforms.u_time.value += this.clock.getDelta();
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
