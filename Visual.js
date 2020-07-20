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

const style = {
  height: 800,
  width: 900, // we can control scene size by setting container dimensions
};

class App extends Component {
  state = {
    playing: false,
    sound: "",
  };
  //START
  componentDidMount() {
    this.sceneSetup();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
    window.addEventListener("mousedown", this.onMouseDown, false);
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
      45,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    this.camera.position.set(0, 0, 30);
    this.camera.lookAt(0, 1, 0);

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

    this.planeGeometry = new THREE.PlaneBufferGeometry(6, 6, 10, 10);
    const material1 = new THREE.MeshBasicMaterial({
      color: 0x0000aa,
      wireframe: true,
    });

    const plane = new THREE.Mesh(this.planeGeometry, material1);
    plane.rotateX(-Math.PI / 3);
    this.scene.add(plane);

    this.ballGeometry = new THREE.IcosahedronBufferGeometry(1, 4);

    const material2 = new THREE.MeshBasicMaterial({
      color: 0xaa0000,
      wireframe: true,
    });

    this.ball = new THREE.Mesh(this.ballGeometry, material2);
    this.ball.position.y = 1;
    this.scene.add(this.ball);

    const particleMat = new THREE.PointsMaterial({
      color: "rgb(255,255,255)",
      size: 0.5,
      map: new THREE.TextureLoader().load("particle.jpg"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleGeo = new THREE.SphereGeometry(10, 64, 64);

    this.particleGeo.vertices.forEach((vertex) => {
      vertex.x += Math.random() - 0.5;
      vertex.y += Math.random() - 0.5;
      vertex.z += Math.random() - 0.5;
    });

    ///init particles system
    this.particleSystem = new THREE.Points(this.particleGeo, particleMat);
    this.scene.add(this.particleSystem);

    this.simplex = new SimplexNoise(4);
  };

  playSound = () => {
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

  onMouseDown = () => {
    if (this.sound) {
      if (this.sound.isPlaying) {
        this.sound.pause();
      } else {
        this.sound.play();
      }
    }
  };

  updateGround = (geometry, distortionFr, time) => {
    const position = geometry.getAttribute("position");
    const amp = 0.1;
    for (let i = 0; i < position.array.length; i += 3) {
      const offset =
        this.simplex.noise2D(
          position.array[i] + time * 0.0003,
          position.array[i + 1] + time * 0.0001
        ) *
        distortionFr *
        amp;
      position.array[i + 2] = offset;
    }
    position.needsUpdate = true;
  };

  updateParticles = ( baseFr, trebleFr, time) => {
    const amp = 22;
    const rf = 0.01;
    const radius=2
  
    const position = [];
    this.particleGeo.vertices.forEach((vertex,i) => {
      const vertex3 = (position[i], position[i + 1], position[i + 2]);
      const distance =radius +baseFr * amp * 0.5 +this.simplex.noise3D(
        vertex.x + time * rf,
        vertex.y + time * rf,
        vertex.z + time * rf
      ) * amp * trebleFr;
console.log(distance)
    vertex.x = Math.random() *2
    vertex.y = Math.random() *8
    vertex.z = Math.random() *2
    })
    const particleMat = new THREE.PointsMaterial({
      color: "rgb(255,255,255)",
      size: 0.5,
      map: new THREE.TextureLoader().load("particle.jpg"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });


    this.particleSystem.geometry.verticesNeedUpdate = true;
 
    

  };

  updateBall = (geometry, baseFr, trebleFr, time) => {
    const amp = 0.08;
    const rf = 0.01;
    const radius = geometry.parameters.radius;
    const position = geometry.getAttribute("position");

    for (let i = 0; i < position.array.length; i += 3) {
      const vertex = new THREE.Vector3(
        position.array[i],
        position.array[i + 1],
        position.array[i + 2]
      );
    
      vertex.normalize();
      const distance =
        radius +
        baseFr * amp * 0.5 +
        this.simplex.noise3D(
          vertex.x + time * rf,
          vertex.y + time * rf,
          vertex.z + time * rf
        ) *
          amp *
          trebleFr;
      vertex.multiplyScalar(distance);
      position.array[i] = vertex.x;
      position.array[i + 1] = vertex.y;
      position.array[i + 2] = vertex.z;
    }
    position.needsUpdate = true;
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

  //UPDATE
  startAnimationLoop = () => {
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
      this.updateGround(
        this.planeGeometry,
        this.modulate(avgFr, 0, divisor, 0.5, 3),
        time
      );

      this.updateBall(this.ballGeometry, lowerAvrFr, upperAvgFr, time);
      this.updateParticles(lowerAvrFr, upperAvgFr, time);
    }

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
        <button id="btn" onClick={() => this.playSound()}>
          Play
        </button>
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
