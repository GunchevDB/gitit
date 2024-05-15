import "./style.css";

import gsap from "gsap";

import Loader, { RESOURCE_TYPE } from "./components/Loader";
import WebGL from "./components/WebGL";
import Controller from "./components/Controller";
import Marquee from "./components/Marquee";

class Application {
  constructor(attributes = {}) {
    this.$element = attributes.element;
    this.setupRefs();
  }

  load = async (manifest = []) => {
    this.loader = new Loader();
    this.resources = await this.loader.load(manifest);
    this.setupComponents();
    this.setupEventListeners();
  };

  setupRefs() {
    this.$refs = [...this.$element.querySelectorAll("[data-select]")].reduce((object, $node) => {
      object[$node.dataset.select] = $node;
      return object;
    }, {});
  }

  setupComponents() {
    this.components = {
      webgl: new WebGL({ element: this.$refs.canvas, resources: this.resources }),
      controller: new Controller({ element: this.$element }),
    };
  }

  setupEventListeners() {
    this.observer = new ResizeObserver(this.handleResize);
    this.observer.observe(this.$element);

    gsap.ticker.add(this.handleTick);

    this.components.controller.addEventListener("state", this.handleControllerChange);

    this.$refs.previous.addEventListener("click", this.handlePreviousClick);
    this.$refs.next.addEventListener("click", this.handleNextClick);
  }

  handleControllerChange = (state) => {
    this.components.webgl.state.interactive = state.active;
  };

  handleResize = () => {
    this.components.webgl.setSize(this.$element.clientWidth, this.$element.clientHeight);
  };

  handleTick = () => {
    this.components.webgl.update(this.components.controller.state.position);
    this.components.webgl.render();
  };

  handlePreviousClick = () => {
    this.components.webgl.previousGroup();
  };

  handleNextClick = () => {
    this.components.webgl.nextGroup();
  };
}

const application = new Application({ element: document.body });
application.load([
  {
    id: "environment",
    type: RESOURCE_TYPE.Environment,
    src: "/environment.hdr",
  },
  {
    id: "model",
    type: RESOURCE_TYPE.Model,
    src: "/model.glb",
  },
]);
