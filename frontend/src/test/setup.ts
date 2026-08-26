import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});
// jsdom não implementa scrollIntoView, usado pelo TipTap ao focar o editor.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom não implementa métricas de layout, usadas pelo ProseMirror ao rolar até
// a seleção. Ele mede tanto nós de texto quanto Range, então ambos precisam do
// polyfill — sem o de Range o editor derruba a suíte com erro não tratado.
const emptyRect = () => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

for (const prototype of [Text.prototype, Range.prototype]) {
  if (!("getClientRects" in prototype)) {
    Object.defineProperty(prototype, "getClientRects", { value: () => [] });
  }

  if (!("getBoundingClientRect" in prototype)) {
    Object.defineProperty(prototype, "getBoundingClientRect", { value: emptyRect });
  }
}
