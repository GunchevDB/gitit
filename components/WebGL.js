import * as THREE from "three";
import gsap from "gsap";

class WebGL {
  constructor(attributes = {}) {
    this.state = {
      interactive: false,
      spin: 0.0,
      rotation: 0.0,
    };
    this.resources = attributes.resources;
    this.resources.environment.mapping = THREE.EquirectangularReflectionMapping;
    this.element = attributes.element;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.element, antialias: true });
    this.renderer.setClearColor(0x252525, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    this.camera.position.set(2, 2, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene = new THREE.Scene();
    this.scene.environment = this.resources.environment;

    // Sort children by name
    this.elements = new THREE.Group();
    this.resources.model.scene.children = this.resources.model.scene.children.sort((a, b) => Number(a.userData.name) - Number(b.userData.name));
    this.elements.add(this.resources.model.scene);
    this.scene.add(this.elements);

    // Track the current group index
    this.currentGroupIndex = 0;
    this.groups = [
      [0],                    // Part 0
      [0, 1],                 // Parts 0 and 1
      [0, 1, 2, 3, 4, 5],     // Parts 0 to 5
      [0, 1, 2, 3, 4, 5, 6, 7], // Parts 0 to 7
    ];

    // Store initial positions and colors of the boxes
    this.initialPositions = this.elements.children[0].children.map(child => child.position.clone());
    this.initialColors = this.elements.children[0].children.map(child => child.material.color.clone());

    this.previousGroupIndexes = new Set(); // Track previously visible indexes
    this.showGroup(this.currentGroupIndex, true);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(rotation) {
    if (!this.state.interactive) {
      this.state.spin += 0.005;
    }

    this.state.rotation = gsap.utils.interpolate(this.state.rotation, rotation, 0.1) * 0.1;
    this.scene.rotation.y = this.state.rotation + this.state.spin;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  highlight(child) {
    child.material.color.set(0x00FF00); // Highlight green
  }

  resetHighlights() {
    const children = this.elements.children[0].children;
    children.forEach((child, index) => {
      child.material.color.copy(this.initialColors[index]);
    });
  }

  showGroup(groupIndex, initial = false) {
    const children = this.elements.children[0].children;
    const group = this.groups[groupIndex];
    const newIndexes = new Set(group);

    // Reset highlights before showing new group
    if (!initial) {
      this.resetHighlights();
    }

    children.forEach((child, index) => {
      if (newIndexes.has(index)) {
        child.visible = true;
        if (!initial && !this.previousGroupIndexes.has(index) && index !== 0) { // Only animate new boxes
          const targetY = this.initialPositions[index].y;
          child.position.y = targetY + 1; // Start position slightly above the target
          gsap.to(child.position, { y: targetY, duration: 1.5, ease: "power2.out" });
          gsap.fromTo(child.scale, { x: 1.2, y: 1.2, z: 1.2 }, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power2.out" });
          this.highlight(child);
        } else if (initial) {
          child.position.copy(this.initialPositions[index]);
        }
      } else if (!initial && this.previousGroupIndexes.has(index) && index !== 0) { // Only animate disappearing boxes
        const targetY = this.initialPositions[index].y + 1; // End position slightly above the target
        gsap.to(child.position, { y: targetY, duration: 1, ease: "power2.in", onComplete: () => { child.visible = false; } }); // Quicker animation
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
