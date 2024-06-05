import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import { updateProgressBar, updateCardContent, initialWiggleAnimation } from "./ScreenFunctions";

class WebGL {
  constructor(attributes = {}) {
    this.state = {
      interactive: false,
      rotation: 0.0,
    };
    this.resources = attributes.resources;
    this.resources.environment.mapping = THREE.EquirectangularReflectionMapping;
    this.element = attributes.element;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.element, antialias: true });
    this.renderer.setClearColor(0x252525, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
    this.scene = new THREE.Scene();
    this.scene.environment = this.resources.environment;

    // Orbit controls for moving the camera up/down
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.rotateSpeed = 0.1; // Reduce rotation speed
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 3;

    // Sort children by name - in this case coming from the Blender file - 0 to 7
    this.elements = new THREE.Group();
    this.resources.model.scene.children = this.resources.model.scene.children.sort((a, b) => Number(a.userData.name) - Number(b.userData.name));
    this.elements.add(this.resources.model.scene);
    this.scene.add(this.elements);

    // Track the current group index
    this.currentGroupIndex = 0;
    this.groups = [
      { elements: [0], name: "Euro palette", icon: "fa-pallet", size: "80 x 120 x 14" }, // Part 0
      { elements: [0, 1], name: "AB-12-15", icon: "fa-location-dot", size: "80 x 120 x 25" }, // Part 1 added
      { elements: [0, 1, 2, 3], name: "AB-12-23", icon: "fa-location-dot", size: "80 x 30 x 30" }, // Parts 2 and 3 added
      { elements: [0, 1, 2, 3, 4, 5], name: "AB-12-45", icon: "fa-location-dot", size: "34 x 20 x 30" }, // Parts 4 and 5 added
      { elements: [0, 1, 2, 3, 4, 5, 6], name: "AB-12-18", icon: "fa-location-dot", size: "20 x 40 x 10" }, // Parts 6 added
      { elements: [0, 1, 2, 3, 4, 5, 6, 7], name: "AB-12-34", icon: "fa-location-dot", size: "10 x 60 x 10" }, // Parts 7 added
    ];

    // Store initial positions and colors of the boxes
    this.initialPositions = this.elements.children[0].children.map(child => child.position.clone());
    this.initialColors = this.elements.children[0].children.map(child => child.material.color.clone());

    this.previousGroupIndexes = new Set();
    this.showGroup(this.currentGroupIndex, true);

    // Start the initial wiggle animation for the palette
    initialWiggleAnimation(this.elements);

    // Adjust camera and controls initially
    this.adjustCameraAndControls(window.innerWidth, window.innerHeight);

    // Listen for window resize events
    window.addEventListener('resize', () => this.setSize(window.innerWidth, window.innerHeight));
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.adjustCameraAndControls(width, height);
  }

  adjustCameraAndControls(width, height) {
    // Adjust camera position and controls based on aspect ratio
    if (width > height) { // Landscape view
      this.camera.position.set(2, 2, 1); // Move the camera right
      this.camera.fov = 37;
    } else { // Portrait view
      this.camera.position.set(2, 2, 2);
      this.camera.fov = 65;
    }
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  update(rotation) {
    this.state.rotation = gsap.utils.interpolate(this.state.rotation, rotation, 0.1) * 0.1;
    this.scene.rotation.y = this.state.rotation;
    this.controls.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  highlight(child) {
    child.material.color.set(0x00ff00); 
  }

  resetHighlights() {
    const children = this.elements.children[0].children;
    children.forEach((child, index) => {
      child.material.color.copy(this.initialColors[index]);
    });
  }

  // Bring new boxes by pressing Next
  showGroup(groupIndex, initial = false) {
    const children = this.elements.children[0].children;
    const group = this.groups[groupIndex].elements;
    const newIndexes = new Set(group);

    // Reset highlights before showing new group
    if (!initial) {
      this.resetHighlights();
    }

    children.forEach((child, index) => {
      if (newIndexes.has(index)) {
        child.visible = true;
        if (!initial && !this.previousGroupIndexes.has(index) && index !== 0) {
          const targetY = this.initialPositions[index].y;
          child.position.y = targetY + 1;
          gsap.to(child.position, { y: targetY, duration: 1.5, ease: "power2.out" });
          gsap.fromTo(child.scale, { x: 1.2, y: 1.2, z: 1.2 }, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power2.out" });
          this.highlight(child);
        } else if (initial) {
          child.position.copy(this.initialPositions[index]);
        }
      } else if (!initial && this.previousGroupIndexes.has(index) && index !== 0) {
        const targetY = this.initialPositions[index].y + 1;
        gsap.to(child.position, { y: targetY, duration: 1, ease: "power2.in", onComplete: () => { child.visible = false; } });
      } else {
        child.visible = false;
      }
    });

    // Highlight all current group boxes
    if (!initial) {
      this.previousGroupIndexes.forEach(index => {
        if (!newIndexes.has(index) && index !== 0) {
          children[index].material.color.copy(this.initialColors[index]);
        }
      });
      group.forEach(index => {
        if (!this.previousGroupIndexes.has(index) && index !== 0) {
          this.highlight(children[index]);
        }
      });
    }

    this.previousGroupIndexes = newIndexes;
    updateProgressBar(this.currentGroupIndex, this.groups.length);
    updateCardContent(this.groups[groupIndex]);
  }

  nextGroup() {
    if (this.currentGroupIndex < this.groups.length - 1) {
      this.currentGroupIndex++;
      this.showGroup(this.currentGroupIndex);
    }
  }

  previousGroup() {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      this.showGroup(this.currentGroupIndex);
    }
  }
}

export default WebGL;
