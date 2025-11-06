import { Icon } from '../components/icon'

export default () => (
	<section>
		<h2>Display</h2>
		<h3>Icons</h3>
		<div role="group" style="margin-bottom: 1rem;">
			<Icon name="mdi:home" />
			<Icon name="mdi:account" size="24px" />
			<Icon name="mdi:github" size="24px" />
		</div>
		<h3>Buttons</h3>
		<div role="group" style="margin-bottom: 1rem;">
			<button aria-current="true">Active</button>
			<button>Primary</button>
			<button class="secondary">Secondary</button>
			<button class="contrast">Contrast</button>
			<button class="success">Success</button>
			<button class="warning">Warning</button>
			<button class="danger">Danger</button>
		</div>
		<h3>Iconed Buttons</h3>
		<div role="group">
			<button>
				<Icon name="mdi:home" size="18px" /> Home
			</button>
			<button class="secondary">
				<Icon name="mdi:account" size="18px" /> Account
			</button>
			<button class="contrast">
				<Icon name="mdi:github" size="18px" /> GitHub
			</button>
		</div>
	</section>
)


