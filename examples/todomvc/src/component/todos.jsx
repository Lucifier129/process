import React, { Component } from 'react'
import Todo from './todo'

export default class Todos extends Component {
	render() {
		let todoList = this.props.todos.map(todo => <Todo {...todo} key={ todo.id } process={ this.props.process }  />)
		return <ul id="todo-list">{ todoList }</ul>
	}
}