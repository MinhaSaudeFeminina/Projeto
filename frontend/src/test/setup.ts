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

// jsdom não implementa métricas de layout em nós de texto, usadas pelo ProseMirror
// ao rolar até a seleção.
if (!("getClientRects" in Text.prototype)) {
  Object.defineProperty(Text.prototype, "getClientRects", { value: () => [] });
  Object.defineProperty(Text.prototype, "getBoundingClientRect", {
    value: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }),
  });
}
