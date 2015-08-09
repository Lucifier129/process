import Process from 'process-table'
import storeProcess from './store'
import View from './component/view'
import React from 'react'

export default class App {
	constructor() {
		this.process = new Process()
		this.container = 'todoapp'
		this.combo()
		this.listen()
	}
	render(data) {
		React.render(<View {...data} process={ this.process } />, document.getElementById(this.container))
	}
	getData() {
		let activeFilter = location.hash
		debugger
		let todoCount = storeProcess.filterTodos({
			state: false
		}).length
		let completedCount = storeProcess.getStore().length - todoCount
		return {
			todos: storeProcess.dispatch(['getStore', store => {
				if (activeFilter === '#/active') {
					return {
						state: false
					}
				} else if (activeFilter === '#/completed') {
					return {
						state: true
					}
				}
				return {}
			}, 'filterTodos']),
			activeFilter,
			completedCount,
			todoCount,
			isAllCompleted: completedCount && !todoCount
		}
	}
	combo() {
		this.process.extend({
			'render': [::this.getData, ::this.render],
			'addTodo': [storeProcess.willResolve('addTodo'), 'render'],
			'updateTodo': [storeProcess.willResolve('updateTodo'), 'render'],
			'removeTodo': [storeProcess.willResolve('removeTodo'), 'render'],
			'toggleAll': [storeProcess.willResolve('toggleAll'), 'render'],
			'clearCompleted': [storeProcess.willResolve('clearCompleted'), 'render']
		})
	}
	listen() {
		let render = this.process.willResolve('render')
		window.addEventListener('hashchange', render, false)
		document.addEventListener('DOMContentLoaded', render, false)
	}
}

new App()