# Pounce-UI Documentation

## Overview
Pounce-UI provides the standard component library for Pounce applications. It is built on `pounce-ts` and uses `mutts` for state.

## Styling
*   **PicoCSS**: Used as the base CSS framework.
*   **Sass**: Custom styles are written in SCSS.

## Components
*   **Dockview**: Integrates `dockview-core` for window management.
*   **Standard Controls**: Inputs, Buttons, etc., designed to work with Pounce's two-way binding system.
*   **Multiselect**: A dropdown component for selecting multiple items from a list, with customizable trigger and item rendering.

## Utilities
### `stored(initialState)`
Located in `src/lib/storage.ts`.
Creates a reactive state that is automatically synchronized with `localStorage`.
- **SSR-proof**: Safely handles non-browser environments.
- **Inter-tab sync**: Listens to `storage` events to sync across tabs.
- **JSON Serialization**: Values are stored as JSON strings.
- **Playwright-proof**: Robust against restricted storage access.

```tsx
import { stored } from '../lib/storage'
const state = stored({ theme: 'light' })
// updates to state.theme persist to localStorage
// updates from other tabs automatically update state.theme
```

### `<dynamic>` Tag Stability
- **Stable for interactive components**: The `<dynamic>` tag in `pounce-ts` is now stable. It only recreation the DOM node when the `tag` property changes. Other property updates are handled reactively by the element itself, preserving state (like focus and scroll).
- **Proper usage**: Use `<dynamic tag={state.tag} ... />` to ensure reactivity if the `tag` can change.
