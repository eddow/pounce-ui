// Minimal entry for the package; expose dialog API

import '@picocss/pico/css/pico.min.css'

export * from './components'
export * from './lib'
export * from './actions'

export { type DockviewApi, type DockviewPanelApi } from 'dockview-core'
