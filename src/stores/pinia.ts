import { createPinia } from 'pinia'

/**
 * A single Pinia instance, imported by modules outside a component setup
 * (the router guard, the `main.ts` event handler). Components use `useXStore()`
 * normally and pick this instance up from the app.
 */
export const pinia = createPinia()
