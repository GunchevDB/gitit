import { EventDispatcher } from "three";

class Controller extends EventDispatcher {
  constructor(attributes = {}) {
    super();

    this.state = {
      dragging: false,
      offset: 0,
      position: 0,
    };

    this.$element = attributes.element;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.$element.addEventListener("touchstart", this.handleTouchStart);
    this.$element.addEventListener("touchmove", this.handleTouchMove);
    this.$element.addEventListener("touchend", this.handleTouchEnd);
    this.$element.addEventListener("mousedown", this.handleMouseDown);
    this.$element.addEventListener("mousemove", this.handleMouseMove);
    this.$element.addEventListener("mouseup", this.handleMouseUp);
  }

  dragStart = (pixels) => {
    this.dispatchEvent({ type: "state", active: true });
    this.state.dragging = true;
    this.state.offset = pixels - this.state.position;
  };

  dragging = (pixels) => {
    if (this.state.dragging) {
      this.state.position = pixels - this.state.offset;
    }
  };

  dragStop = () => {
    this.dispatchEvent({ type: "state", active: false });
    this.state.dragging = false;
  };

  handleTouchStart = (event) => {
    this.dragStart(event.touches[0].clientX);
  };

  handleTouchMove = (event) => {
    this.dragging(event.touches[0].clientX);
  };

  handleTouchEnd = () => {
    this.dragStop();
  };

  handleMouseDown = (event) => {
    this.dragStart(event.clientX);
  };

  handleMouseMove = (event) => {
    this.dragging(event.clientX);
  };

  handleMouseUp = (event) => {
    this.dragStop();
  };
}

export default Controller;
