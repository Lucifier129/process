# process
基于单向数据流的 JavaScript 流程管理机制

## 工作原理

在 JavaScript 中，变量所对应的值，可以在函数之间传入与返回。

```javascript
var add = function(num) {
    return num + 1
}
var minus = function(num) {
    return num - 1
}

minus(add(add(1))) // => 1
```

对于异步的场景，我们也拥有 es6.promise 可以传递返回值。

```javascript
var add = function(num) {
    return num + 1
}
var minus = function(num) {
    return num - 1
}
Promise.resolve(1).then(add).then(add).then(minus).then(function(value) {
    console.log(value) // => 1
})
```

我们完全可以将上述两种技术整合到一起，像下面这样运用：

```javascript
var add = function(num) {
    return num + 1
}
var minus = function(num) {
    return num - 1
}
var asyncAdd = function(num) {
    return new Promise(function(resolve) {
        setTimeout(resolve.bind(null, num + 1), 200)
    })
}
var taskStore = {
    add4: [add, add, add, add, minus, add] //调用5次add，一次minus，使一个数值增加4
    asyncAdd3: [add, minus, asyncAdd, add, asyncAdd] //异步增值场景
}
//设想有这种 API
var process = new Process(taskStore)

//像这样传入初始值

//同步场景
process.resolve('add4', -4) // => 0

//异步场景
process.resolve('asyncAdd3', -3).then(function(value) {
    console.log(value) // => 0
})
```

这样做有几个好处：

- 数据传递方式更为整洁和直观。像这种 `minus(add(add(1)))` 代码从阅读顺序上，是反直觉的，最先出现的 `minus` 实际上最后调用

- 模糊化同步与异步的差别。`asyncAdd` 后面的 `add` 不需要显示地写 `then` 函数

- 增强可维护性。修改某个处理环节，能够快速而又明确对应到具体函数；增加某个环节、调整某几个环节的顺序，也非常便利。

就上面显示的情形来说，还有几个问题有待解决。

### 如何复用一个函数组合？

当 taskHandler 是字符串类型时，跳转到其对应的 `taskStore[taskHandler]`

```javascript
var taskStore = {
    add4: [add, add, add, add, minus, add] //调用5次add，一次minus，使一个数值增加4
    asyncAdd3: [add, minus, asyncAdd, add, asyncAdd] //异步增值场景
    asyncAdd7: ['add4', 'asyncAdd3'] //复用 add4 和 asyncAdd3
}

var process = new Process(taskStore)

//异步场景
process.resolve('asyncAdd7', -7).then(function(value) {
    console.log(value) // => 0
})
```


### 如何中断传值？

在 js 中有两个表示空的数据类型，一个是 undefined ，另一个是 null。前者是函数默认返回值，所以我们可以用后者来作为中断传值的标识。

当一个 taskHandler 返回 null 时，后面的 taskHandler 将不会执行。

```javascript
var process = new Process({
    add: [function(num) {
        return null
    }, function(num) {
        return num + 1
    }]
})

//中断传值都返回 null, 如果是异步的，那么 promise.resolve 的值也是 null
process.resolve('add', -1) // => null
```

### 如何便捷地记录状态？

给 `Process` 配置 `state` 属性，所有 taskHandler 接受三个参数： `value`、`state`、`process`

```javascript
var taskStore = {
    update: function(value, state, process) {
        state.cache = value
        process.state === state // true
    }
}
var process = new Process(taskStore, {
    cache: '默认状态'
})

process.resolve('update', '更新状态')
process.state.cache // 更新状态
```

### 如何灵活跳转？

加入 taskHandler 是一个具有 goTo 方法的对象，那么将`value`、`state`与 `process`传入其 goTo 方法，该方法返回一个新的 taskHandler，如果这个新的 taskHandler 是函数，则直接执行；是字符串，则跳转；是数组，则循环；还是 goTo 对象，则递归。

如果找不到合法的 taskHandler ，则跳过。

```javascript
var add = function(num) {
    return num + 1
}
var minus = function(num) {
    return num - 1
}


var process = new Process({
    addToTen: [add, {
        goTo: function(value, state, process) {
            return value < 10 ? 'add' : null
        }
    }]
})

process.resolve('addToTen', -10) // => 10
```

### 如何做错误处理？

taskStore 中设置一个特殊属性 `taskStore.error`，它的规则与 taskStore 完全一样，只是调用规则不同。

```javascript

//寻找 process.store.taskName ，调用它对应的 taskHandler 队列
process.resolve(taskName, value)

//寻找 process.store.error.errorName，调用它对应的 taskHandler 队列
process.reject(errorName, value)
```

### 如何嵌套传值？

`process.willResolve(taskName)`方法接受一个参数 taskName，返回一个接受 value 的函数，相当于 `process.resolve.bind(process, taskName)`。

利用这个特性，两个 process 可以嵌套传值。

```javascript
process1.extend({
    add: [add, add, process2.willResolve('add3'), process3.willReject('errorName01')]
})
```


## 安装方式


```shell
npm install process-table
```

- CommonJs

```javascript
var Process = require('process-table')
var add = function(num) {
    return num + 1
}
var process = new Process({
    add4: [add, add, add, add]
})

process.resolve('add4', 0) // => 4
```

- AMD

```javascript
define(['process'], function(Process) {
    var add = function(num) {
        return num + 1
    }
    var process = new Process({
        add4: [add, add, add, add]
    })
    
    process.resolve('add4', 0) // => 4
})
```

- script

```html
<script src="process.js"></script>
<sciprt>
var process = new Process({
    add: function(num) {
        return num + 1
    }
})
process.resolve('add', 9) // => 10
<script>
```

## API 介绍

### 实例化 new Process(taskStore, initialState)

taskStore 是一个 key-value 对象，其 key 为 taskName，其 value 为 taskHandler。

taskHandler 可以是函数、字符串、数组、thanable 对象以及具有 goTo 方法的普通对象。

```javascript
var taskStore = {
    showState: function(value, state, process) {
        console.log(state)
        return value
    },
    add: function(num, state) {
        return num + 1
    },
    minus: function(num) {
        return num - 1
    },
    add0: ['add', 'minus'] //task 允许数组、字符串、对象
    addToTen: {
        goTo: function(value) {
            return value < 10 ? 'add' : null
        }
    },
    error: {
        404: function(value) {
            console.log(value, 404)
        }
    }
}
var process = new Process(taskStore, {
    test: 'initial state'
})

process.resolve('minus', 10) // => 9
process.reject()
```

### Process#resolve(taskName, value)
TODO

### Process#reject(errorName, value)
TODO

### Process#willResolve(taskName)
TODO

### Process#willReject(errorName)
TODO
