import React, { Component } from 'react'
import NewTodo from './newTodo'
import Main from './main'
import Filters from './filters'

export default class View extends Component {
	render() {
		let { isAllCompleted, todos, activeFilter, completedCount, todoCount, process } = this.props.data
		return (<div>
					<NewTodo addTodo={ addTodo } process={ process } />
					<Main
						isAllCompleted={ isAllCompleted }
						todos={ todos }
						 process={ process } />
					<Filters
						activeFilter={ activeFilter }
						completedCount={ completedCount }
						todoCount={ todoCount }
						process={ process } />
				</div>)
	}
}