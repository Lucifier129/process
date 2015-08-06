/*!
 * LastModifyTime: Thu Aug 06 2015 22:40:04 GMT+0800 (CST)
 * Process
 * Copyright(c) 2015 Jade Gu <guyingjie129@163.com>
 * MIT Licensed
 */
 ;(function(root, factory) {
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
        return function(obj) {
            return obj != null ? Object.prototype.toString.call(obj) === '[object ' + type + ']' : false
        }
    }
    var isObj = isType('Object')
    var isStr = isType('String')
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
            if (!isObj(source) && !isFn(source)) {
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
        resolve: function(eventName, value) {
            return this.dispatch(this.store[eventName], value)
        },
        reject: function(errorName, value) {
            if (!this.error) {
                this.error = new Process()
            }
            if (isObj(this.store.error)) {
                this.error.extend(this.store.error)
            }
            return this.error.resolve(errorName, value)
        },
        willResolve: function(eventName) {
            var self = this
            return function(value) {
                return self.resolve(eventName, value)
            }
        },
        willReject: function(errorName) {
            var self = this
            return function(value) {
                return self.reject(errorName, value)
            }
        },
        dispatch: function(handler, value) {
            if (isFn(handler)) {
                return handler.call(this, value, this.state)
            } else if (isStr(handler)) {
                return this.dispatch(this.store[handler], value)
            } else if (isArr(handler) && handler.length) {
                return this.pipe(handler, value)
            } else if (isThenable(handler)) {
                var self = this
                return handler.then(function(asyncHandler) {
                    return self.dispatch(asyncHandler, value)
                })
            } else if (isObj(handler)) {
                return this.transform(handler, value)
            }
            return value
        },
        pipe: function(handlers, value) {
            var self = this
            for (var i = 0, len = handlers.length; i < len; i += 1) {
                value = this.dispatch(handlers[i], value)
                if (isThenable(value)) {
                    return i === len - 1 ? value : value.then(function(result) {
                        return self.pipe(handlers.slice(i + 1), result)
                    })
                } else if (value === null) {
                    return null
                }
            }
            return value
        },
        transform: function(obj, value) {
            if (isFn(obj.goTo)) {
                return this.dispatch(obj.goTo(value, this.state), value)
            }
            return value
        }
    }

    return Process
}));
