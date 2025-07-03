import { useState } from "react";

let listeners = [];

export function createMenuControl() {
  let currentMenu = null;

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  const openMenu = (menuName) => {
    currentMenu = menuName;
    listeners.forEach((l) => l(currentMenu));
  };

  const getCurrentMenu = () => currentMenu;

  return { openMenu, subscribe, getCurrentMenu };
}

export const menuControl = createMenuControl();
