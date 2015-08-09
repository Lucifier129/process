import Process from 'process-table'

let process = new Process()

export default process 

export let getStore = ::localStorage.getItem

export let saveStore = (name, data) => localStorage.setItem(name, JSON.stringify(data))

export let addItem = (source, store) => {
	let date = new Date()
	let item = Object.assign({
		id: date.getTime(),
		time: date.toLocaleString(),
		state: false
	}, source)
	return item
}

export let updateItem = (source, store) => {
	for (let item of store) {
		item.id === source.id && Object.assign(item, source)
	}
	return store
}

export let removeItem = (id, store) => {
	for (var i = 0; i < store.length; i++) {
		if (store[i].id === id) {
			store.splice(i, 0)
			break
		}
	}
	return store
}

export let toggleAll = (state, store) => {
	for (let item of store) {
		item.state = state
	}
	return store
}

export let filter = (query, store) => store.filter(item => {
	if (item === query) {
		return true
	}
	for (let key in query) {
		if (query[key] !== item[key]) {
			return false
		}
	}
	return true
})

process.extend({
	name: 'process-table',
	getStore() {
		return getStore(this.name) || []
	},
	saveStore(store) {
		return saveStore(this.name, store)
	},
	addTodo(title) {
		return this.dispatch(['getStore', store => addItem({ title }, store), 'saveStore'])
	},
	updateTodo(todo) {
		return this.dispatch(['getStore', store => updateItem(todo, store), 'saveStore'])
	},
	removeTodo(id) {
		return this.dispatch(['getStore', store => removeItem(id, store), 'saveStore'])
	},
	toggleAll(state) {
		return this.dispatch(['getStore', store => toggleAll(state, store), 'saveStore'])
	},
	filterTodos(query) {
		return this.dispatch(['getStore', store => filter(query, store), 'saveStore'])
	},
	clearCompleted() {
		return this.dispatch(['getStore', store => {
			for (var i = store.length - 1; i >= 0; i--) {
				store[i].state && store.splice(i, 1)
			}
			return store
		}, 'saveStore'])
	}
})