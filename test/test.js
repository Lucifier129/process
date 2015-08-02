var should = require('should')
var assert = require('assert')
var Process = require('../dist/process')

describe('Process', function() {
    describe('#extend(...sources)', function() {
        it('should "以构造函数参数形式，合并对象到 store 属性中"', function() {
            var source = {
                a: 1,
                b: 2,
                c: 3
            }
            var process = new Process(source)
            assert.deepEqual(process.store, source)
            assert.notEqual(process.store, source)
        })
        it('should "调用 extend 方法，合并单个对象到 store 属性中"', function() {
            var process = new Process()
            var source = {
                a: 1,
                b: 2,
                c: 3
            }
            process.extend(source)
            assert.deepEqual(process.store, source)
            assert.notEqual(process.store, source)
        })
        it('should "调用 extend 方法，合并多个对象到 store 属性中"', function() {
            var process = new Process()
            var source1 = {
                a: 1,
                b: 2,
                c: 3
            }
            var source2 = {
                d: 4,
                e: 5,
                f: 6
            }
            process.extend(source1, source2)
            for (var key in source1) {
                assert.equal(process.store[key], source1[key])
            }
            for (var key in source2) {
                assert.equal(process.store[key], source2[key])
            }
        })
    })

    describe('#resolve(eventName, value)', function() {
        it('should "同步传值-无跳转"', function() {
            var add = function(num) {
                return num + 1
            }
            var process = new Process({
                add4: [add, add, add, add]
            })

            assert.equal(process.resolve('add4', 0), 4)
            assert.equal(process.resolve('add4', -4), 0)
        })
        it('should "同步传值－字符串跳转"', function() {
            var add = function(num) {
                return num + 1
            }
            var minus = function(num) {
                return num - 1
            }
            var process = new Process({
                add0: [add, add, add, 'minus3'],
                minus3: [minus, add, minus, minus, minus]
            })
            assert.equal(process.resolve('add0', 0), 0)
        })
        it('should "同步传值－调度器跳转"', function() {
            var add = function(num) {
                return num + 1
            }
            var minus = function(num) {
                return num - 1
            }
            var dispatcher = {
                goTo: function() {
                    return 'minus3'
                }
            }
            var process = new Process({
                add0: [add, add, add, dispatcher],
                minus3: [minus, minus, minus]
            })
            assert.equal(process.resolve('add0', 0), 0)
        })
        it('should "同步传值－复合跳转"', function() {
            var add = function(num) {
                return num + 1
            }
            var minus = function(num) {
                return num - 1
            }
            var dispatcher = {
                target: 'minus',
                goTo: function() {
                    return this.target
                }
            }
            var process = new Process({
                add0: [add, add, add, 'minus3'],
                minus: minus,
                minus3: [dispatcher, dispatcher, dispatcher]
            })
            assert.equal(process.resolve('add0', 0), 0)
        })
        it('should "异步传值-promise风格"', function(done) {
            var add = function(num) {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(num + 1)
                    }, 1)
                })
            }
            var process = new Process({
                add4: [add, add, add, add]
            })
            process.resolve('add4', 0).then(function(result) {
                assert.equal(result, 4)
                done()
            })
        })
        it('should "中断传值"', function() {
            var add = function(num) {
                return num + 1
            }
            var stop = function() {
                return null
            }
            var process = new Process({
                add3: [add, add, add, stop, function() {
                    throw new Error('如果未中断，抛出错误')
                }]
            })
            assert.equal(process.resolve('add3', 0), 3)
        })
        it('should "中断传值－分组模式"', function() {
            var add = function(num) {
                return num + 1
            }
            var stop = function() {
                return null
            }
            var process = new Process({
                add4: [add, add, add, [add, stop, function() {
                    throw new Error('如果未中断，抛出错误;中断后，返回上一次的值')
                }]]
            })
            assert.equal(process.resolve('add4', 0), 4)
        })
        it('should "调度器之忽略非法调度"', function() {
            var add = function(num) {
                return num + 1
            }
            var dispatcher = {
                goTo: function() {
                    return 'eventName which is not existed'
                }
            }
            var process = new Process({
                add4: [add, add, dispatcher, add, dispatcher, add]
            })
            assert.equal(process.resolve('add4', -4), 0)
        })
        it('should "调度器之事件循环"', function() {
        	var add = function(num) {
        		return num + 1
        	}
        	var dispatcher = {
        		goTo: function(value) {
        			return value < 100 ? 'toHundred' : null
        		}
        	}
        	var process = new Process({
        		toHundred: [add, add, dispatcher],
        	})
        	assert.equal(process.resolve('toHundred', 0), 100)
        })
        it('should "调度器之异步事件循环"', function(done) {
        	var add = function(num) {
        		return num + 1
        	}
        	var asyncAdd = function(num) {
        		return new Promise(function(resolve) {
        			resolve(add(num))
        		})
        	}
        	var dispatcher = {
        		goTo: function(value) {
        			return value < 100 ? 'toHundred' : null
        		}
        	}
        	var process = new Process({
        		toHundred: [add, asyncAdd, dispatcher],
        	})
        	process.resolve('toHundred', 0).then(function(result) {
        		assert.equal(result, 100)
        		done()
        	})
        })
        it('should "promise 异步处理器"', function(done) {
        	var factory = function() {
        		return new Promise(function(resolve) {
        			resolve(function(num) {
        				return num + 1
        			})
        		})
        	}

        	var process = new Process({
        		add3: [factory(), factory(), factory()]
        	})

        	process.resolve('add3', 0).then(function(result) {
        		assert.equal(result, 3)
        		done()
        	})
        })
        it('should "普通队列里的 promise 异步处理器"', function(done) {
        	var factory = function() {
        		return new Promise(function(resolve) {
        			resolve(function(num) {
        				return num + 1
        			})
        		})
        	}

        	var process = new Process({
        		add3: [factory(), factory(), factory()]
        	})

        	process.resolve('add3', 0).then(function(result) {
        		assert.equal(result, 3)
        		done()
        	})
        })
        it('should "调度器里的 promise 异步处理器"', function(done) {
        	var add = function(num) {
        		return num + 1
        	}
        	var dispatcher = {
        		goTo: function(value) {
        			return new Promise(function(resolve) {
        				resolve(value < 100 ? 'add' : value)
        			})
        		}
        	}
        	var process = new Process({
        		add: [add, dispatcher]
        	})

        	process.resolve('add', 12).then(function(result) {
        		assert.equal(result, 100)
        		done()
        	})
        })
    })
})
