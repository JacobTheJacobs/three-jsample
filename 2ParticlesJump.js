import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/js/lights/RectAreaLightUniformsLib";
import { Noise } from "noisejs";
import SimplexNoise from "simplex-noise";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import sound from "./c.mp3";
const style = {
  height: 400,
  width: 500, // we can control scene size by setting container dimensions
};

//initialise simplex noise instance
const noise = new SimplexNoise();

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      playing: false,
    };
  }

  //START
  componentDidMount() {
    this.sceneSetup();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
    window.addEventListener("mousedown", this.onMouseDown, false);
    //  this.audio = document.getElementsByClassName("audio")[0];
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
    this.clock = new THREE.Clock(true);
    //camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 12;
    this.camera.position.x = 2;

    //lights
    const ambient = new THREE.HemisphereLight(0xffffff, 0xaaaa66, 0.35);
    this.scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 10, 6);
    this.scene.add(light);

    //render
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref

    //controls
    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(-10, 0, -2);
    this.controls.update();

    //init particles
    const rand = (min, max) => min + Math.random() * (max - min);

    const MAX = 20;
    this.particles = new THREE.Group();
    const geo = new THREE.SphereBufferGeometry(1);
    const mat = new THREE.MeshLambertMaterial({ color: "orange" });

    for (let i = 0; i < MAX; i++) {
      const particle = new THREE.Mesh(geo, mat);
      particle.velocity = new THREE.Vector3(
        rand(-0.1, 0.1),
        12.06,
        rand(-0.01, 0.01)
      );
      particle.acceleration = new THREE.Vector3();
      particle.position.x = rand(-12, 1);
      particle.position.z = rand(-14, 1);
      particle.position.y = (-12, -3);
      this.particles.add(particle);
    }

    this.scene.add(this.particles);
    console.log(this.particles);
    //load audio
    this.simplex = new SimplexNoise(4);
  };

  start = () => {
    if (this.sound) {
      if (this.sound.isPlaying) {
        this.sound.pause();
        return;
      }
    }
    let listener = new THREE.AudioListener();
    this.camera.add(listener);

    this.sound = new THREE.Audio(listener);
    const loader = new THREE.AudioLoader();

    loader.load("captain.mp3", (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.play();
    });

    //Analyser
    this.analyser = new THREE.AudioAnalyser(this.sound, 128);
  };

  updateParticles = (baseFr, trebleFr, time) => {
    const amp = 22;
    const rf = 0.01;
    const radius = 2;
    console.log(this.particles);
    const position = [];

    this.particles.children.forEach((child, index) => {
      const distance =
        radius +
        baseFr * amp * 0.5 +
        this.simplex.noise3D(
          child.x + time * rf,
          child.y + time * rf,
          child.z + time * rf
        ) *
          amp *
          trebleFr;
      child.position.y = distance/80;
  
      console.log(distance);
      child.x = Math.random() * 2;
      child.y = Math.random() * 8;
      child.z = Math.random() * 2;
    });

    const particleMat = new THREE.PointsMaterial({
      color: "rgb(255,255,255)",
      size: 0.5,
      map: new THREE.TextureLoader().load("particle.jpg"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  };

  //UPDATE
  startAnimationLoop = () => {
    //console.log(this.frequency_array);
    console.log(this.analyser);
    console.log(this.particles);
    this.renderer.render(this.scene, this.camera);
    const time = this.clock.getElapsedTime();

    if (this.analyser) {
      const divisor = 22;

      const data = this.analyser.getFrequencyData();
      const avgFr = this.analyser.getAverageFrequency();
      // console.log(data);

      const lowerHalfArray = data.slice(0, data.length / 2 - 1);
      const upperHalfAray = data.slice(data.length / 2 - 1, data.length - 1);
      // console.log(lowerHalfArray);
      const lowerAvrFr = this.avg(lowerHalfArray) / divisor;
      const upperAvgFr = this.avg(upperHalfAray) / divisor;

      this.updateParticles(lowerAvrFr, upperAvgFr, time);
    }
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  //some helper functions here
  fractionate = (val, minVal, maxVal) => {
    return (val - minVal) / (maxVal - minVal);
  };

  modulate = (val, minVal, maxVal, outMin, outMax) => {
    var fr = this.fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + fr * delta;
  };

  avg = (arr) => {
    let total = arr.reduce(function (sum, b) {
      return sum + b;
    });
    return total / arr.length;
  };

  max = (arr) => {
    return arr.reduce(function (a, b) {
      return Math.max(a, b);
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
        <button onClick={() => this.start()}>Play</button>

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
