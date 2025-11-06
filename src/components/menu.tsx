import { For } from 'pounce-ts'
import { A } from '../lib/router'

export interface MenuProps {
	summary: JSX.Element | string
	children: JSX.Element | JSX.Element[]
	class?: string
}

export interface MenuItemProps {
	href: string
	children: JSX.Element | string
}

const MenuComponent = (props: MenuProps) => {
	return (
		<details
			class={props.class ?? 'dropdown'}
			onClick={(e) => {
				const target = e.target as HTMLElement
				if (target.closest('a')) {
					;(e.currentTarget as HTMLDetailsElement).removeAttribute('open')
				}
			}}
		>
			<summary>{props.summary}</summary>
			<ul>
				{Array.isArray(props.children) ? (
					<For if={Array.isArray(props.children)} each={props.children}>
						{(child) => <li>{child}</li>}
					</For>
				) : (
					<li>{props.children}</li>
				)}
			</ul>
		</details>
	)
}

const MenuItem = (props: MenuItemProps) => {
	return <A href={props.href}>{props.children}</A>
}

export const Menu = Object.assign(MenuComponent, {
	Item: MenuItem,
})
