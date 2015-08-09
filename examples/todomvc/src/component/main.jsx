import React, { Component } from 'react'
import Todos from './todos'
export default class Main extends Component {
	render() {
		let { todos, isAllCompleted, process } = this.props
		return (
			<section id="main">
				<input id="toggle-all" type="checkbox" onChange={ e => process.resolve('toggleAll', e.currentTarget.checked) } checked={ isAllCompleted } />
				<label htmlFor="toggle-all">Mark all as complete</label>
				<Todos todos={ todos } process={ process } />
			</section>
			)
	}
}
