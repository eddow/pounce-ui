# Icons and Variants

## Icon

Thin wrapper around Iconify icons.

```tsx
import { Icon } from 'pounce-ui'

<Icon name="mdi:home" />
<Icon name="mdi:alert" size="24px" />
```

- `name` is the Iconify icon name.
- `size` accepts any CSS size (e.g., `24px`, `1.5rem`).

## Variants

Map semantic variants to Pico classes.

```ts
import { variantClass, type Variant } from 'pounce-ui'

const cls = variantClass('danger') // => 'danger'
```

Notes:
- `primary` (or undefined) returns an empty string, relying on Pico's default styles.
- Unsupported values map to `'secondary'`.

Available variants:
- `primary`, `secondary`, `contrast`, `danger`, `success`, `warning`
