import { config } from '@vue/test-utils'

/**
 * jsdom gaps that VueUse / reka-ui touch during component tests. Everything else
 * stays real: a test that needs a fake router or fake DOM events should say so
 * explicitly in the file instead of inheriting it from here.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList,
})

Object.defineProperty(window, 'scrollTo', { writable: true, value: () => undefined })

Element.prototype.scrollIntoView = () => undefined

// reka-ui positions popovers with ResizeObserver; jsdom has no implementation.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver ??= ResizeObserverStub

if (typeof globalThis.crypto?.randomUUID !== 'function') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    configurable: true,
    value: () => `test-${Math.random().toString(36).slice(2)}`,
  })
}

config.global.stubs = {}
