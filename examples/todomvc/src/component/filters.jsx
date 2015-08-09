import React, { Component } from 'react'
export default class Filters extends Component {
	getClassName(name) {
		return this.props.activeFilter === name ? 'selected' : ''
	}
	getTodoCount() {
		let count = this.props.todoCount
		let text = ''
		if (count > 0) {
			text += count + (count > 1 ? ' items left' : ' item left')
		}
		return text
	}
	getCompletedCount() {
		let count = this.props.completedCount
		return count > 0 ? 'Clear completed (' + count + ')' : ''
	}
	render() {
		let { process } = this.props
		return (
			<footer id="footer">
				<span id="todo-count">{this.getTodoCount()}</span>
				<ul id="filters">
					<li>
						<a href="#/" className={this.getClassName('#/')}>All</a>
					</li>
					<li>
						<a href="#/active" className={this.getClassName('#/active')}>Active</a>
					</li>
					<li>
						<a href="#/completed" className={this.getClassName('#/completed')}>Completed</a>
					</li>
				</ul>
				<button id="clear-completed" onClick={ process.willResolve('clearCompleted') }>{this.getCompletedCount()}</button>
			</footer>
			)
	}
}