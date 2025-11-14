import { Button } from '../components/button'
import { ButtonGroup } from '../components/buttongroup'
import { CheckButton } from '../components/checkbutton'
import { Container, Stack } from '../components/layout'
import { RadioButton } from '../components/radiobutton'
import { Toolbar } from '../components/toolbar'
import { Heading, Text } from '../components/typography'
import { stored } from '../lib/storage'

export default () => {
	const toolbarState = stored({
		bold: false,
		italic: false,
		underline: false,
		align: 'left' as 'left' | 'center' | 'right' | 'justify',
		viewMode: 'edit' as 'edit' | 'preview' | 'split',
	})

	return (
		<Container tag="section">
			<Stack gap="lg">
				<header>
					<Heading level={1}>Toolbars</Heading>
					<Text muted>Toolbar components for grouping buttons and controls.</Text>
				</header>

				<div>
					<Heading level={3}>Basic Toolbar</Heading>
					<Toolbar>
						<Button icon="mdi:content-save">Save</Button>
						<Button icon="mdi:undo">Undo</Button>
						<Button icon="mdi:redo">Redo</Button>
						<Toolbar.Spacer />
						<Button icon="mdi:settings">Settings</Button>
					</Toolbar>
				</div>

				<div>
					<Heading level={3}>Toolbar with CheckButtons</Heading>
					<Toolbar>
						<CheckButton
							icon="mdi:format-bold"
							aria-label="Bold"
							checked={toolbarState.bold}
							onCheckedChange={(checked) => {
								toolbarState.bold = checked
							}}
						/>
						<CheckButton
							icon="mdi:format-italic"
							aria-label="Italic"
							checked={toolbarState.italic}
							onCheckedChange={(checked) => {
								toolbarState.italic = checked
							}}
						/>
						<CheckButton
							icon="mdi:format-underline"
							aria-label="Underline"
							checked={toolbarState.underline}
							onCheckedChange={(checked) => {
								toolbarState.underline = checked
							}}
						/>
						<Toolbar.Spacer visible />
						<RadioButton
							icon="mdi:format-align-left"
							aria-label="Align left"
							value="left"
							group={toolbarState.align}
						/>
						<RadioButton
							icon="mdi:format-align-center"
							aria-label="Align center"
							value="center"
							group={toolbarState.align}
						/>
						<RadioButton
							icon="mdi:format-align-right"
							aria-label="Align right"
							value="right"
							group={toolbarState.align}
						/>
						<RadioButton
							icon="mdi:format-align-justify"
							aria-label="Justify"
							value="justify"
							group={toolbarState.align}
						/>
						<Toolbar.Spacer />
						<RadioButton
							icon="mdi:pencil"
							aria-label="Edit"
							value="edit"
							group={toolbarState.viewMode}
						/>
						<RadioButton
							icon="mdi:eye"
							aria-label="Preview"
							value="preview"
							group={toolbarState.viewMode}
						/>
						<RadioButton
							icon="mdi:view-split-horizontal"
							aria-label="Split"
							value="split"
							group={toolbarState.viewMode}
						/>
					</Toolbar>
				</div>

				<div>
					<Heading level={3}>Icon-only Toolbar</Heading>
					<Toolbar>
						<CheckButton icon="mdi:format-bold" aria-label="Bold" checked={toolbarState.bold} />
						<CheckButton
							icon="mdi:format-italic"
							aria-label="Italic"
							checked={toolbarState.italic}
						/>
						<CheckButton
							icon="mdi:format-underline"
							aria-label="Underline"
							checked={toolbarState.underline}
						/>
						<Toolbar.Spacer visible />
						<Button icon="mdi:link" aria-label="Insert link" />
						<Button icon="mdi:image" aria-label="Insert image" />
					</Toolbar>
				</div>

				<div>
					<Heading level={3}>Vertical Toolbar</Heading>
					<Toolbar orientation="vertical" style="width: fit-content;">
						<CheckButton icon="mdi:format-bold" aria-label="Bold" checked={toolbarState.bold} />
						<CheckButton
							icon="mdi:format-italic"
							aria-label="Italic"
							checked={toolbarState.italic}
						/>
						<CheckButton
							icon="mdi:format-underline"
							aria-label="Underline"
							checked={toolbarState.underline}
						/>
						<Toolbar.Spacer visible />
						<Button icon="mdi:link" aria-label="Insert link" />
					</Toolbar>
				</div>

				<div>
					<Heading level={3}>ButtonGroup - Connected Buttons</Heading>
					<Toolbar>
						<ButtonGroup>
							<RadioButton
								icon="mdi:format-align-left"
								aria-label="Align left"
								value="left"
								group={toolbarState.align}
							/>
							<RadioButton
								icon="mdi:format-align-center"
								aria-label="Align center"
								value="center"
								group={toolbarState.align}
							/>
							<RadioButton
								icon="mdi:format-align-right"
								aria-label="Align right"
								value="right"
								group={toolbarState.align}
							/>
						</ButtonGroup>
						<Toolbar.Spacer visible />
						<ButtonGroup>
							<CheckButton icon="mdi:format-bold" aria-label="Bold" checked={toolbarState.bold} />
							<CheckButton
								icon="mdi:format-italic"
								aria-label="Italic"
								checked={toolbarState.italic}
							/>
							<CheckButton
								icon="mdi:format-underline"
								aria-label="Underline"
								checked={toolbarState.underline}
							/>
						</ButtonGroup>
					</Toolbar>
				</div>
			</Stack>
		</Container>
	)
}
