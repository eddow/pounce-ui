import { Alert } from '../components/alert'
import { Button } from '../components/button'
import { Icon } from '../components/icon'
import { Container, Grid, Inline, Stack } from '../components/layout'
import { Badge, Chip, Pill } from '../components/status'
import { Heading, Link, Text } from '../components/typography'

const surfaceStyle =
	'background: var(--pico-muted-border-color, rgba(0,0,0,.08)); padding: 0.75rem; border-radius: var(--pico-border-radius);'

export default () => (
	<Container tag="section">
		<Stack gap="lg">
			<header>
				<Heading level={1}>Display</Heading>
				<Text muted>Design primitives available in pounce-ui.</Text>
			</header>
			<div>
				<Heading level={3}>Typography</Heading>
				<Stack>
					<Heading level={2} variant="primary">
						Heading level 2
					</Heading>
					<Heading level={3} variant="secondary">
						Secondary tone heading
					</Heading>
					<Text>
						Regular body copy with <strong>strong emphasis</strong> and inline{' '}
						<Link href="https://picocss.com" target="_blank" rel="noreferrer">
							links
						</Link>
						.
					</Text>
					<Text size="sm" muted>
						Muted supporting text for fine print or captions.
					</Text>
				</Stack>
			</div>
			<div>
				<Heading level={3}>Icons</Heading>
				<Inline gap="md">
					<Icon name="mdi:home" />
					<Icon name="mdi:account" size="24px" />
					<Icon name="mdi:github" size="24px" />
				</Inline>
			</div>
			<div>
				<Heading level={3}>Buttons</Heading>
				<Inline role="group">
					<Button el:aria-current="true">Active</Button>
					<Button>Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="contrast">Contrast</Button>
					<Button variant="success">Success</Button>
					<Button variant="warning">Warning</Button>
					<Button variant="danger">Danger</Button>
				</Inline>
			</div>
			<div>
				<Heading level={3}>Iconed Buttons</Heading>
				<Inline role="group">
					<Button icon="mdi:home">Home</Button>
					<Button variant="secondary" icon="mdi:account">
						Account
					</Button>
					<Button variant="contrast" iconPosition="end" icon="mdi:github">
						GitHub
					</Button>
				</Inline>
			</div>
			<div>
				<Heading level={3}>Badges</Heading>
				<Inline wrap gap="sm">
					<Badge variant="primary">Primary</Badge>
					<Badge variant="secondary" icon="mdi:information-outline">
						Info
					</Badge>
					<Badge variant="success">Live</Badge>
					<Badge variant="warning">Beta</Badge>
					<Badge variant="danger">Error</Badge>
					<Badge variant="contrast">Dark</Badge>
				</Inline>
			</div>
			<div>
				<Heading level={3}>Chips</Heading>
				<Inline wrap gap="sm">
					<Chip icon="mdi:tag" variant="secondary">
						Label
					</Chip>
					<Chip icon="mdi:account" variant="success">
						Assigned
					</Chip>
					<Chip icon="mdi:lightning-bolt" variant="warning" dismissible>
						Fast track
					</Chip>
					<Chip variant="danger" dismissible>
						Blocking
					</Chip>
				</Inline>
			</div>
			<div>
				<Heading level={3}>Pills</Heading>
				<Inline wrap gap="sm">
					<Pill icon="mdi:calendar">Upcoming</Pill>
					<Pill variant="success" icon="mdi:check">
						Confirmed
					</Pill>
					<Pill variant="contrast" trailingIcon="mdi:chevron-right">
						Navigate
					</Pill>
				</Inline>
			</div>
			<div>
				<Heading level={3}>Layout primitives</Heading>
				<Stack gap="lg">
					<Stack style={surfaceStyle}>
						<strong>Stack</strong>
						<span>Vertical spacing with precise control.</span>
						<span>Gap defaults to 1.5× Pico spacing.</span>
					</Stack>
					<Inline wrap gap="sm" style={surfaceStyle}>
						<Button icon="mdi:alpha-a-circle">Alpha</Button>
						<Button icon="mdi:alpha-b-circle">Bravo</Button>
						<Button icon="mdi:alpha-c-circle">Charlie</Button>
						<Button icon="mdi:alpha-d-circle">Delta</Button>
						<Button icon="mdi:alpha-e-circle">Echo</Button>
					</Inline>
					<Grid minItemWidth="12rem" gap="sm">
						<article style={surfaceStyle}>
							<strong>Responsive cards</strong>
							<p>Auto-fit to minimum width of 12rem.</p>
						</article>
						<article style={surfaceStyle}>
							<strong>Custom columns</strong>
							<p>Grid integrates Pico spacing tokens.</p>
						</article>
						<article style={surfaceStyle}>
							<strong>Fluid layout</strong>
							<p>Combine with Container to center content.</p>
						</article>
					</Grid>
				</Stack>
			</div>
			<div>
				<Heading level={3}>Fluid container</Heading>
				<Container style={surfaceStyle}>
					<Inline wrap gap="sm">
						<span>Container without fluid width for media or dashboards.</span>
						<Button variant="secondary" icon="mdi:arrow-expand-horizontal">
							Expand
						</Button>
					</Inline>
				</Container>
				<Container fluid style={surfaceStyle}>
					<Inline wrap gap="sm">
						<span>Container with fluid width for media or dashboards.</span>
						<Button variant="secondary" icon="mdi:arrow-expand-horizontal">
							Expand
						</Button>
					</Inline>
				</Container>
			</div>
			<div>
				<Heading level={3}>Alerts</Heading>
				<Stack gap="sm">
					<Alert title="Heads up" variant="primary">
						You can use alerts for inline messaging and inline callouts.
					</Alert>
					<Alert title="Deployment ready" variant="success" icon="mdi:rocket-launch">
						All checks passed. Prepare to deploy when ready.
					</Alert>
					<Alert title="Action required" variant="warning" dismissible>
						Update the configuration before continuing.
					</Alert>
					<Alert title="Critical issue" variant="danger" dismissible>
						Service interruptions detected. Investigate immediately.
					</Alert>
				</Stack>
			</div>
		</Stack>
	</Container>
)
