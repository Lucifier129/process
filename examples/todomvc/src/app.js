import Process from 'process-table'
import store from './store'
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
	combo() {
		this.process.extend({
			'render': [
				store => ({
					store,
					activeFilter: location.hash
				}),
				store.willResolve('getInfoByActiveFilter'),
				::this.render
			],
			'addTodo': [
				title => {
					if (store.resolve('filterTodos', { title }).length !== 0) {
						alert('任务已存在')
						return null
					}
					return title
				},
				store.willResolve('addTodo'),
				'render'
			],
			'updateTodo': [store.willResolve('updateTodo'), 'render'],
			'removeTodo': [store.willResolve('removeTodo'), 'render'],
			'toggleAll': [store.willResolve('toggleAll'), 'render'],
			'clearCompleted': [store.willResolve('clearCompleted'), 'render'],
			'filterByTitle': [store.willResolve('filterByTitle'), 'render']
		})
	}
	listen() {
		let render = () => this.process.dispatch([store.willResolve('getStore'), 'render'])
		window.addEventListener('hashchange', render, false)
		document.addEventListener('DOMContentLoaded', render, false)
	}
}

new App()