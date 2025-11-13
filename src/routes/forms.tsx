import { Checkbox, Combobox, Radio, Select, Switch } from '../components/forms'
import { Container, Inline, Stack } from '../components/layout'
import { Heading, Text } from '../components/typography'

export default () => (
	<Container tag="section">
		<Stack gap="lg">
			<header>
				<Heading level={1}>Forms</Heading>
				<Text muted>Controls and inputs styled with pounce-ui.</Text>
			</header>
			<section>
				<Heading level={3}>Selects and Combobox</Heading>
				<Stack>
					<Inline wrap gap="sm">
						<Select>
							<option>Alpha</option>
							<option>Bravo</option>
							<option>Charlie</option>
						</Select>
						<Select variant="secondary">
							<option>Secondary</option>
							<option>Option</option>
						</Select>
						<Select variant="contrast" fullWidth>
							<option>Full width</option>
							<option>Option</option>
						</Select>
					</Inline>
					<Inline wrap gap="sm">
						<Combobox placeholder="Combobox" options={['One', 'Two', 'Three']} />
						<Combobox
							variant="success"
							placeholder="With status tone"
							options={[
								{ value: 'ready', label: 'Ready' },
								{ value: 'running', label: 'Running' },
								{ value: 'complete', label: 'Complete' },
							]}
						/>
					</Inline>
				</Stack>
			</section>
			<section>
				<Heading level={3}>Checkboxes</Heading>
				<Inline wrap gap="md">
					<Checkbox checked={true}>Notifications</Checkbox>
					<Checkbox variant="success" description="Send weekly summaries">
						Summaries
					</Checkbox>
					<Checkbox variant="warning" description="Requires attention">
						Alerts
					</Checkbox>
					<Checkbox variant="danger" disabled>
						Disabled
					</Checkbox>
				</Inline>
			</section>
			<section>
				<Heading level={3}>Radio buttons</Heading>
				<Stack gap="md">
					<Stack gap="sm">
						<Text muted>Inline layout</Text>
						<Inline wrap gap="md">
							<Radio name="radio-sample-inline" value="a" checked>
								Option A
							</Radio>
							<Radio name="radio-sample-inline" value="b">
								Option B
							</Radio>
							<Radio name="radio-sample-inline" value="c" variant="success">
								Option C
							</Radio>
						</Inline>
					</Stack>
					<Stack gap="sm">
						<Text muted>Stacked layout</Text>
						<Stack gap="sm" align="start">
							<Radio name="radio-sample-stacked" value="a" checked>
								Option A
							</Radio>
							<Radio name="radio-sample-stacked" value="b">
								Option B
							</Radio>
							<Radio name="radio-sample-stacked" value="c" variant="success">
								Option C
							</Radio>
						</Stack>
					</Stack>
				</Stack>
			</section>
			<section>
				<Heading level={3}>Switches</Heading>
				<Inline wrap gap="md">
					<Switch>Default switch</Switch>
					<Switch variant="secondary" checked>
						Secondary
					</Switch>
					<Switch
						variant="success"
						checked
						description="Label on the leading side"
						labelPosition="start"
					>
						Maintenance
					</Switch>
					<Switch variant="danger" description="Disabled state" disabled>
						Disabled
					</Switch>
				</Inline>
			</section>
		</Stack>
	</Container>
)
