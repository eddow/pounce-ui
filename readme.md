# Pounce UI

Minimal UI utilities built on PicoCSS and pounce-ts.

## Documentation

See the docs per topic in `/docs`:

- [Dialog](./docs/dialog.md)
- [Toasts](./docs/toast.md)
- [Icons and Variants](./docs/icons-variants.md)

## TODOs

- Form primitives
	- Accessible `Field`, `Label`, `Description`, `Error` scaffolding
	- Consistent sizes/variants via `src/components/variants.ts`
	- Error dictionary integration and toast-on-error option
	- Inputs: Text, Textarea, Select, Switch, Range/Slider

- Date/Time picker
	- Keyboard-accessible calendar grid with range selection
	- Min/max, disabled dates, presets, and i18n
	- Time selection (HH:MM) and combined date-time

- Toast enhancements
	- Queueing and max-visible with viewport stacking
	- Actions (undo/retry) and optional progress
	- Programmatic API and grouped categories
