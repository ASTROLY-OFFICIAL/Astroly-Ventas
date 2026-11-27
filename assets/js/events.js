const bus = new EventTarget();
export const on = (type, fn) => bus.addEventListener(type, e => fn(e.detail));
export const emit = (type, detail = {}) => bus.dispatchEvent(new CustomEvent(type, {detail}));
