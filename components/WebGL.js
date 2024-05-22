import * as THREE from "three";
import gsap from "gsap";

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
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    this.camera.position.set(2, 2, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene = new THREE.Scene();
    this.scene.environment = this.resources.environment;

    // Sort children by name - in this case coming from the Blender file - 0 to 7
    this.elements = new THREE.Group();
    this.resources.model.scene.children = this.resources.model.scene.children.sort((a, b) => Number(a.userData.name) - Number(b.userData.name));
    this.elements.add(this.resources.model.scene);
    this.scene.add(this.elements);

    // Track the current group index
    this.currentGroupIndex = 0;
    this.groups = [
      [0],                    // Part 0
      [0, 1],                 // Part 1 added
      [0, 1, 2, 3],           // Parts 2 and 3 added
      [0, 1, 2, 3, 4, 5],     // Parts 4 and 5 added
      [0, 1, 2, 3, 4, 5, 6, 7], // Parts 6 and 7 added
    ];

    // Store initial positions and colors of the boxes
    this.initialPositions = this.elements.children[0].children.map(child => child.position.clone());
    this.initialColors = this.elements.children[0].children.map(child => child.material.color.clone());

    this.previousGroupIndexes = new Set();
    this.showGroup(this.currentGroupIndex, true);

    // Start the initial wiggle animation for the palette
    this.initialWiggleAnimation();
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(rotation) {
    this.state.rotation = gsap.utils.interpolate(this.state.rotation, rotation, 0.1) * 0.1;
    this.scene.rotation.y = this.state.rotation;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // Initialize wiggle animation with 360 icon on launch

  initialWiggleAnimation() {
    const icon = document.getElementById('icon-360');
    icon.style.opacity = 1; 

    const timeline = gsap.timeline({
      onComplete: () => {
        icon.style.opacity = 0; 
      }
    });
    timeline.to(this.elements.rotation, { y: THREE.MathUtils.degToRad(15), duration: 0.5, ease: "power2.inOut" })
            .to(this.elements.rotation, { y: 0, duration: 0.5, ease: "power2.inOut" })
            .to(this.elements.rotation, { y: THREE.MathUtils.degToRad(-15), duration: 0.5, ease: "power2.inOut" })
            .to(this.elements.rotation, { y: 0, duration: 0.5, ease: "power2.inOut" });
  }

  highlight(child) {
    child.material.color.set(0x00FF00); 
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
    const group = this.groups[groupIndex];
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
