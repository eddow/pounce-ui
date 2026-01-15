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

## Usage Pattern
```tsx
// Using a Pounce-UI Input with 2-way binding to a mutts reactive state
<Input value={state.username} />
```
(Note: `babel-plugin-jsx-reactive` handles the binding magic).


