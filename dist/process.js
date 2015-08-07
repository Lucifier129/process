/*!
 * LastModifyTime: 2015-08-07 12:54:26
 * Process.js Version: 0.0.4
 * Copyright(c) 2015 Jade Gu <guyingjie129@163.com>
 * MIT Licensed
 */
;
(function(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory()
    else if (typeof define === 'function' && (define.amd || define.cmd))
        define(factory)
    else if (typeof exports === 'object')
        exports["Process"] = factory()
    else
        root["Process"] = factory()
}(this, function() {
    var isType = function(type) {
        type = '[object ' + type + ']'
        return function(obj) {
            return obj != null && Object.prototype.toString.call(obj) === type
        }
    }
    var isObj = isType('Object')
    var isStr = isType('String')
    var isNum = isType('Number')
    var isFn = isType('Function')
    var isArr = Array.isArray || isType('Array')
    var isThenable = function(obj) {
        return obj != null && isFn(obj.then)
    }

    var slice = Array.prototype.slice
    var extend = function(target) {
        var sources = slice.call(arguments, 1)
        for (var i = 0, len = sources.length; i < len; i += 1) {
            var source = sources[i]
            if (!isObj(source)) {
                continue
            }
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key]
                }
            }
        }
        return target
    }

    function Process(store, state) {
        this.store = extend({}, store)
        this.state = extend({}, state)
    }

    Process.prototype = {
        extend: function() {
            return extend.apply(null, [this.store].concat(slice.call(arguments)))
        },
        setState: function() {
            return extend.apply(null, [this.state].concat(slice.call(arguments)))
        },
        resolve: function(taskName, value) {
            return this.dispatch(this.store[taskName], value)
        },
        reject: function(errorName, value) {
            var error = this.store.error
            if (!this.error) {
                this.error = new Process(error)
            } else if (isObj(error)) {
                this.error.extend(error)
            }
            return this.error.resolve(errorName, value)
        },
        willResolve: function(taskName) {
            var self = this
            return function(value) {
                return self.resolve(taskName, value)
            }
        },
        willReject: function(errorName) {
            var self = this
            return function(value) {
                return self.reject(errorName, value)
            }
        },
        dispatch: function(handler, value) {
            var self = this
            if (value === null) {
                return value
            }
            if (isFn(handler)) {
                return handler.call(self, value, self.state)
            }
            if (isStr(handler) || isNum(handler)) {
                return self.dispatch(self.store[handler], value)
            }
            if (isArr(handler)) {
                return handler.length ? self.pipe(handler, value) : value
            }
            if (isThenable(handler)) {
                return handler.then(function(asyncHandler) {
                    return self.dispatch(asyncHandler, value)
                })
            }
            if (isObj(handler) && isFn(handler.goTo)) {
                return self.dispatch(handler.goTo(value, self.state), value)
            }
            return value
        },
        pipe: function(handlers, value) {
            var self = this
            for (var i = 0, len = handlers.length; i < len; i += 1) {
                value = self.dispatch(handlers[i], value)
                if (value === null) {
                    return value
                }
                if (isThenable(value)) {
                    return i === len - 1 ? value : value.then(function(result) {
                        return self.dispatch(handlers.slice(i + 1), result)
                    })
                }
            }
            return value
        }
    }

    return Process
}));
