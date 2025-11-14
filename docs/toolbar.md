# Toolbar

Toolbar components for grouping buttons and controls with consistent styling and keyboard navigation.

## Toolbar

Container for grouping toolbar items. Ensures consistent sizing and spacing for buttons.

```tsx
import { Toolbar, Button } from 'pounce-ui'

<Toolbar>
	<Button icon="mdi:content-save">Save</Button>
	<Button icon="mdi:undo">Undo</Button>
	<Button icon="mdi:redo">Redo</Button>
	<Toolbar.Spacer />
	<Button icon="mdi:settings">Settings</Button>
</Toolbar>
```

### Orientation

Default is horizontal. Use `orientation="vertical"` for vertical layout.

```tsx
<Toolbar orientation="vertical" style="width: fit-content;">
	<Button icon="mdi:format-bold">Bold</Button>
	<Button icon="mdi:format-italic">Italic</Button>
</Toolbar>
```

### Styling

Buttons in toolbars automatically:
- Have consistent height matching form elements
- Have no margins (perfect alignment)
- Icon-only buttons are square with matching dimensions

## Toolbar.Spacer

Flexible spacer that takes available space. Use between items to push content apart.

```tsx
<Toolbar>
	<Button>Left</Button>
	<Toolbar.Spacer />
	<Button>Right</Button>
</Toolbar>
```

### Visible Divider

Use `visible` prop to show a divider line instead of being invisible.

```tsx
<Toolbar>
	<CheckButton icon="mdi:format-bold" />
	<Toolbar.Spacer visible />
	<RadioButton icon="mdi:format-align-left" />
</Toolbar>
```

### Fixed Width

Use `width` prop for fixed-width spacing (e.g., `width="1px"` or `width="0.5rem"`).

```tsx
<Toolbar.Spacer visible width="1px" />
```

## CheckButton

Toggle button with checked/active state. Useful for on/off controls like formatting options.

```tsx
import { CheckButton } from 'pounce-ui'

<CheckButton
	icon="mdi:format-bold"
	checked={isBold}
	onCheckedChange={(checked) => { isBold = checked }}
	aria-label="Bold"
/>
```

### With Text

```tsx
<CheckButton
	icon="mdi:cloud-sync"
	checked={syncEnabled}
	onCheckedChange={(checked) => { syncEnabled = checked }}
>
	Sync enabled
</CheckButton>
```

### Two-way Binding

The `checked` prop is reactive. Setting it directly updates the button state.

```tsx
const state = stored({ enabled: false })

<CheckButton
	checked={state.enabled}
	onCheckedChange={(checked) => { state.enabled = checked }}
/>
// Or simply:
<CheckButton checked={state.enabled} />
// Clicking will toggle state.enabled automatically
```

### Variants

Supports all button variants: `primary`, `secondary`, `contrast`, `outline`.

```tsx
<CheckButton variant="outline" checked={isActive}>Outline</CheckButton>
```

### Icon Position

Use `iconPosition="end"` to place icon after text.

```tsx
<CheckButton icon="mdi:check" iconPosition="end" checked={enabled}>
	Enabled
</CheckButton>
```

### Icon-only

When only an icon is provided (no children), the button becomes square. Always provide `aria-label` for accessibility.

```tsx
<CheckButton icon="mdi:format-bold" aria-label="Bold" checked={isBold} />
```

## RadioButton

Button for mutually exclusive selection within a group. Uses 2-way binding for the selected value.

```tsx
import { RadioButton } from 'pounce-ui'

const viewMode = stored('edit' as 'edit' | 'preview' | 'split')

<Toolbar>
	<RadioButton
		icon="mdi:pencil"
		value="edit"
		group={viewMode}
		aria-label="Edit"
	/>
	<RadioButton
		icon="mdi:eye"
		value="preview"
		group={viewMode}
		aria-label="Preview"
	/>
	<RadioButton
		icon="mdi:view-split-horizontal"
		value="split"
		group={viewMode}
		aria-label="Split"
	/>
</Toolbar>
```

### Two-way Binding

The `group` prop is 2-way bound. Setting `group = value` automatically checks the matching radio button. Clicking a radio button sets `group = value`.

```tsx
const align = stored('left' as 'left' | 'center' | 'right')

// These are all in the same logical group because they share the same 'group' prop
<RadioButton value="left" group={align} />   // checked when align === 'left'
<RadioButton value="center" group={align} /> // checked when align === 'center'
<RadioButton value="right" group={align} />  // checked when align === 'right'

// Clicking any button sets: align = that button's value
// Setting align = 'center' programmatically checks the center button
```

### With Text

```tsx
<RadioButton value="small" group={size}>Small</RadioButton>
<RadioButton value="medium" group={size}>Medium</RadioButton>
<RadioButton value="large" group={size}>Large</RadioButton>
```

### Generic Value Types

RadioButton supports any value type, not just strings.

```tsx
type Theme = 'light' | 'dark' | 'auto'
const theme = stored<Theme>('auto')

<RadioButton value="light" group={theme}>Light</RadioButton>
<RadioButton value="dark" group={theme}>Dark</RadioButton>
<RadioButton value="auto" group={theme}>Auto</RadioButton>
```

### Variants and Icon Position

Same as CheckButton: supports `variant` and `iconPosition` props.

## ButtonGroup

Visual container for grouping buttons with connected styling (no gaps, rounded outer borders only).

```tsx
import { ButtonGroup } from 'pounce-ui'

<Toolbar>
	<ButtonGroup>
		<RadioButton value="left" group={align} icon="mdi:format-align-left" />
		<RadioButton value="center" group={align} icon="mdi:format-align-center" />
		<RadioButton value="right" group={align} icon="mdi:format-align-right" />
	</ButtonGroup>
	<Toolbar.Spacer visible />
	<ButtonGroup>
		<CheckButton icon="mdi:format-bold" checked={bold} />
		<CheckButton icon="mdi:format-italic" checked={italic} />
		<CheckButton icon="mdi:format-underline" checked={underline} />
	</ButtonGroup>
</Toolbar>
```

### Orientation

Use `orientation="vertical"` for vertical button groups.

```tsx
<ButtonGroup orientation="vertical">
	<Button>Top</Button>
	<Button>Middle</Button>
	<Button>Bottom</Button>
</ButtonGroup>
```

### Sizing

ButtonGroup has `width: fit-content` by default, so it won't expand to fill available space. Use within a Toolbar with Spacer for positioning.

## Keyboard Navigation

All buttons within group containers (Toolbar, ButtonGroup, or elements with `role="group"`, `role="radiogroup"`, `role="toolbar"`) support keyboard navigation:

- **Arrow keys** (Left/Right for horizontal, Up/Down for vertical): Navigate between buttons in the same container
- **Tab**: Exits the group and continues normal tab navigation
- Disabled buttons are skipped during navigation

This works automatically for all button types (Button, CheckButton, RadioButton) when they're inside a group container.

```tsx
// Keyboard navigation works automatically
<Toolbar>
	<Button>First</Button>
	<CheckButton checked={enabled} />
	<RadioButton value="a" group={value} />
	<RadioButton value="b" group={value} />
	<Button>Last</Button>
</Toolbar>
// Arrow keys navigate through all 5 buttons; Tab exits
```

### Radio Groups

Within a `role="radiogroup"` container, only radio buttons participate in navigation.

## Accessibility

- CheckButton uses `role="checkbox"` with `aria-checked`
- RadioButton uses `role="radio"` with `aria-checked`
- Icon-only buttons require `aria-label`
- Toolbar uses `role="toolbar"`
- ButtonGroup uses `role="group"`

