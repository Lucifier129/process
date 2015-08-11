import React, { Component } from 'react'
const ENTER_KEY = 13
const ESCAPE_KEY = 27
export default class NewTodo extends Component {
	handleKeyup(e) {
		let keyCode = e.keyCode
		if (keyCode === ENTER_KEY || keyCode === ESCAPE_KEY) {
			let title = e.currentTarget.value.trim()
			if (title) {
				this.props.process.resolve('addTodo', title)
				e.currentTarget.value = ''
			}
		}
	}
	handleInput(e) {
		this.props.process.resolve('filterByTitle', e.currentTarget.value.trim())
	}
	render() {
		return (
			<header id="header">
				<h1>todos</h1>
				<input
					id="new-todo"
					placeholder="What needs to be done?"
					onInput={ ::this.handleInput }
					onKeyUp={ ::this.handleKeyup }
					autoFocus={true} />
			</header>
			)
	}
}