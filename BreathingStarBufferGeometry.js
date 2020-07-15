import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/js/lights/RectAreaLightUniformsLib";
import { Noise } from "noisejs";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
const style = {
  height: 800,
  width: 600, // we can control scene size by setting container dimensions
};


class StarShape extends THREE.Shape{
  constructor(sides, innerRadius, outerRadius){
    super();
    let theta = 0;
    const inc = ((2 * Math.PI) / sides) * 0.5;
  
    this.moveTo(Math.cos(theta)*outerRadius, Math.sin(theta)*outerRadius);
  
    for(let i=0; i<sides; i++){
      theta += inc;
      this.lineTo(Math.cos(theta)*innerRadius, Math.sin(theta)*innerRadius);
      theta += inc;
      this.lineTo(Math.cos(theta)*outerRadius, Math.sin(theta)*outerRadius);
    }
  }  
}

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

    this.createMesh();
  };

   createMesh=()=>{
    const extrudeSettings = {
      depth: 1,
      bevelEnabled: false
    };
    const shape = new StarShape(5, 5, 12);
    const starGeometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
    this.group = new THREE.Group();
    this.scene.add( this.group);
    const geometry = new THREE.IcosahedronBufferGeometry( 60, 1 );
    const mat = new THREE.MeshBasicMaterial({wireframe:true});
    this.mesh = new THREE.Mesh(geometry, mat);
    this.scene.add( this.mesh);
    const position = geometry.getAttribute('position');
    const normal = geometry.getAttribute('normal');
    for(let i=0; i<position.array.length; i+=3){
      const color = new THREE.Color().setHSL(i/position.count, 1.0, 0.7);
      const material = new THREE.MeshStandardMaterial({ color: color });
      const star = new THREE.Mesh(starGeometry, material);
      const pos = new THREE.Vector3(position.array[i], position.array[i+1], position.array[i+2]);
      const norm = new THREE.Vector3(normal.array[i], normal.array[i+1], normal.array[i+2]);
      star.position.copy(pos);
      const target = pos.clone().add(norm.multiplyScalar(10.0));
      star.lookAt(target);
      this.group.add(star);
    }
  }

  updateMesh=()=>{
    const time =  this.clock.getElapsedTime();
    const geometry =  this.mesh.geometry;
    const position = geometry.getAttribute('position');
    const normal = geometry.getAttribute('normal');
    const radius = 40 + Math.sin(time) * 20;
    console.log(radius);
    for(let i=0; i<position.array.length; i+=3){
      const norm = new THREE.Vector3(normal.array[i], normal.array[i+1], normal.array[i+2]);
      const pos = norm.multiplyScalar(radius);
      position.array[i] = pos.x;
      position.array[i+1] = pos.y;
      position.array[i+2] = pos.z;
    }
    position.needsUpdate = true;
  }

  //UPDATE
  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);
    this.updateMesh()
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
