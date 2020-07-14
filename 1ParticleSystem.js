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

    this.camera = new THREE.PerspectiveCamera(
      45, // field of view
      window.innerWidth / window.innerHeight, // aspect ratio
      1, // near clipping plane
      1000 // far clipping plane
    );
    this.camera.position.z = 0;
    this.camera.position.x = 0;
    this.camera.position.y = 1;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    //Particles
    const particleGeo = new THREE.Geometry();
    const particleMat = new THREE.PointsMaterial({
      color: "rgb(255,255,255)",
      size: 2,
      map: new THREE.TextureLoader().load("particle.jpg"),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    //number of particles
    const particleCount = 2000;
    const particleDistance = 100;

    for (let i = 0; i < particleCount; i++) {
      const posX = (Math.random() - 0.5) * particleDistance;
      const posY = (Math.random() - 0.5) * particleDistance;
      const posZ = (Math.random() - 0.5) * particleDistance;
      const particle = new THREE.Vector3(posX, posY, posZ);

      particleGeo.vertices.push(particle);
    }

    ///init particles system
    this.particleSystem = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particleSystem);

    //render
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
    this.renderer.shadowMap.enabled = true;

    this.controls = new OrbitControls(this.camera, this.el);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  };

  //UPDATE
  startAnimationLoop = () => {
    this.particleSystem.rotation.y += 0.001;
    this.particleSystem.geometry.vertices.forEach((particle) => {
      particle.x += (Math.random() - 1) * 0.1;
      particle.y += (Math.random() - 0.75) * 0.1;
      particle.z += Math.random() * 0.1;
      if (particle.x < -50) {
        particle.x = 50;
      }
      if (particle.y < -50) {
        particle.y = 50;
      }
      if (particle.z < -50) {
        particle.z = 50;
      }
      if (particle.z > 50) {
        particle.z = -50;
      }
    });
    this.particleSystem.geometry.verticesNeedUpdate = true;
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    //get the vertices
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
