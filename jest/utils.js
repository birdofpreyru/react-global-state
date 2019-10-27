/**
 * Jest test utils.
 */

/* global document */

import { render, unmountComponentAtNode } from 'react-dom';

/**
 * Mounts `Scene` to the DOM, and returns the root scene element.
 * @param {React.ReactNode} scene
 * @return {HTMLElement}
 */
export function mount(scene) {
  const res = document.createElement('div');
  document.body.appendChild(res);
  render(scene, res);
  return res;
}

/**
 * Unmounts `scene` from the DOM.
 * @param {HTMLElement} scene
 */
export function unmount(scene) {
  unmountComponentAtNode(scene);
  scene.remove();
}
