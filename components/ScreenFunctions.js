import gsap from 'gsap';
import * as THREE from 'three';

export function updateProgressBar(currentGroupIndex, groupsLength) {
      const progressBar = document.getElementById('progress-bar');
      const progress = ((currentGroupIndex + 1) / groupsLength) * 100;
      progressBar.style.width = `${progress}%`;
}

export function updateCardContent(group) {
      const cardIcon = document.querySelector('.card__icon .fa');
      const cardText = document.querySelector('.card__text h3');
      const cardSize = document.querySelector('.card__size');
    
      cardIcon.className = `fa ${group.icon}`;
      cardText.textContent = group.name;
      cardSize.textContent = group.size;
}

export function initialWiggleAnimation(elements) {
      const icon = document.getElementById('icon-360');
      icon.style.opacity = 1;
    
      const timeline = gsap.timeline({
        onComplete: () => {
          icon.style.opacity = 0;
        }
      });
      timeline.to(elements.rotation, { y: THREE.MathUtils.degToRad(15), duration: 0.5, ease: "power2.inOut" })
              .to(elements.rotation, { y: 0, duration: 0.5, ease: "power2.inOut" })
              .to(elements.rotation, { y: THREE.MathUtils.degToRad(-15), duration: 0.5, ease: "power2.inOut" })
              .to(elements.rotation, { y: 0, duration: 0.5, ease: "power2.inOut" });
}