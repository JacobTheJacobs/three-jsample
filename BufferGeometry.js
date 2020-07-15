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

    const options = {
      func: "helix",
    };

    const plane = this.plane(10, 10,12); //x,y,z

    const klein = this.klein();
    const sphere = this.sphere();
    const mobius = this.mobius();
    const torus = this.torus();
    const helix = this.helix();

    this.createMesh(plane);
  };

  createMesh = (func) => {
    if (this.mesh !== undefined) this.scene.remove(this.mesh);
    const geometry = new THREE.ParametricBufferGeometry(func, 25, 50);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      wireframe: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  };

  plane = (u, v, target) => {
    const size = 80;
    u *= size;
    v *= size;
    target.set(u - size * 0.5, v - size * 0.5, 0);
  };

  klein = (v, u, target) => {
    u *= Math.PI;
    v *= 2 * Math.PI;
    u = u * 2;
    var x, y, z;
    if (u < Math.PI) {
      x =
        3 * Math.cos(u) * (1 + Math.sin(u)) +
        2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v);
      z =
        -8 * Math.sin(u) -
        2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
    } else {
      x =
        3 * Math.cos(u) * (1 + Math.sin(u)) +
        2 * (1 - Math.cos(u) / 2) * Math.cos(v + Math.PI);
      z = -8 * Math.sin(u);
    }
    y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);
    target.set(x, y, z).multiplyScalar(5);
  };

  sphere = (u, v, target) => {
    const radius = 30;
    u *= 2 * Math.PI;
    v *= Math.PI;
    const x = Math.cos(u) * Math.sin(v) * radius;
    const y = Math.cos(v) * radius;
    const z = Math.sin(u) * Math.sin(v) * radius;

    target.set(x, y, z);
  };

  mobius = (u, t, target) => {
    u *= Math.PI;
    t *= 2 * Math.PI;
    u = u * 2;
    var phi = u / 2;
    var major = 2.25,
      a = 0.125,
      b = 0.65;
    var x, y, z;
    x = a * Math.cos(t) * Math.cos(phi) - b * Math.sin(t) * Math.sin(phi);
    z = a * Math.cos(t) * Math.sin(phi) + b * Math.sin(t) * Math.cos(phi);
    y = (major + x) * Math.sin(u);
    x = (major + x) * Math.cos(u);
    target.set(x, y, z).multiplyScalar(15);
  };

  torus = (u, t, target) => {
    const R = 30;
    const r = 10;
    u *= 2 * Math.PI;
    t *= 2 * Math.PI;
    const n = R + Math.cos(u) * r;
    const x = Math.cos(t) * n;
    const z = Math.sin(t) * n;
    const y = r * Math.sin(u);
    target.set(x, y, z);
  };

  helix = (u, t, target) => {
    //thanks to https://math.stackexchange.com/questions/461547/whats-the-equation-of-helix-surface
    const R = 15;
    const r = 4;
    const turns = 4;
    const h = 3;
    const n = Math.sqrt(R * R + h * h);
    u *= 2 * Math.PI;
    t *= 2 * Math.PI * turns;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const cu = Math.cos(u);
    const su = Math.sin(u);
    const x = R * ct - r * ct * cu + (h * r * st * su) / n;
    const y = h * t + (R * r * su) / n - turns * h * h;
    const z = R * st - r * st * cu - (h * r * ct * su) / n;
    target.set(x, y, z);
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
