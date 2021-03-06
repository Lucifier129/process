import React, { Component } from 'react'
const ENTER_KEY = 13
const ESCAPE_KEY = 27

export default class Todo extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			onEdit: false
		}
	}
	getClassName() {
		let className = []
		if (this.props.state) {
			className.push('completed')
		}
		if (this.state.onEdit) {
			className.push('editing')
		}
		return className.join(' ')
	}
	handleBlur(e) {
		let newTitle = e.currentTarget.value.trim()
		this.setState({
			onEdit: false
		})
		if (newTitle && newTitle !== this.props.title) {
			this.updateTodo({
				title: newTitle,
				time: new Date().toLocaleString()
			})
		} else if (!newTitle) {
			this.props.process('removeTodo', this.props.id)
		}
	}
	handleKeyup(e) {
		let keyCode = e.keyCode
		if (keyCode === ENTER_KEY ||  keyCode === ESCAPE_KEY) {
			this.handleBlur(e)
		}
	}
	handleDblclick() {
		let editor = React.findDOMNode(this.refs.editor)
		editor.value = this.props.title
		this.setState({
			onEdit: true
		})
		setTimeout(::editor.focus, 0)
	}
	toggleTodo(e) {
		this.updateTodo({
			state: e.currentTarget.checked
		})
	}
	updateTodo(options = {}) {
		this.props.process.resolve('updateTodo', {
			id: this.props.id,
			title: options.title || this.props.title,
			time: options.time || this.props.time,
			state: options.state !== undefined ? options.state : this.props.state
		})
	}
	render() {
		let { id, title, time, state, process } = this.props
		return (
			<li className={this.getClassName()} title={ time }>
				<div className="view">
					<input className="toggle" type="checkbox" onChange={ ::this.toggleTodo } checked={ state } />
					<label onDoubleClick={ ::this.handleDblclick }>{ title }</label>
					<button className="destroy" onClick={ e => process.resolve('removeTodo', id) }></button>
				</div>
				<input className="edit" onBlur={ ::this.handleBlur } onKeyUp={ ::this.handleKeyup } ref="editor" />
			</li>
			)
	}
}