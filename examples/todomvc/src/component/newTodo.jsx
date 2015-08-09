import React, { Component } from 'react'
const ENTER_KEY = 13
const ESCAPE_KEY = 27
export default class NewTodo extends Component {
	handleBlur(e) {
		let title = e.currentTarget.value.trim()
		if (title) {
			this.process.resolve('addTodo', title)
			e.currentTarget.value = ''
		}
	}
	handleKeyup(e) {
		let keyCode = e.keyCode
		if (keyCode === ENTER_KEY || keyCode === ESCAPE_KEY) {
			this.handleBlur(e)
		}
	}
	render() {
		return (
			<header id="header">
				<h1>todos</h1>
				<input
					id="new-todo"
					placeholder="What needs to be done?"
					onBlur={ ::this.handleBlur }
					onKeyUp={ ::his.handleKeyup }
					autoFocus={true} />
			</header>
			)
	}
}