//process.js
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

    var extend = function(target) {
        var args = Array.prototype.slice.call(arguments, 1)
        for (var i = 0, len = args.length; i < len; i += 1) {
            var source = args[i]
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

    function Process(store) {
        this.store = extend({}, store)
    }

    Process.prototype = {
        extend: function() {
            return extend.apply(null, [this.store].concat(Array.prototype.slice.call(arguments)))
        },
        resolve: function(eventName, value) {
            return this.dispatch(this.store[eventName], value)
        },
        reject: function(errorName, value) {
            return new Process(this.store.error).resolve(errorName, value)
        },
        willResolve: function(eventName) {
            var that = this
            return function(value) {
                return that.resolve(eventName, value)
            }
        },
        willReject: function(errorName) {
            var that = this
            return function(value) {
                return that.reject(errorName, value)
            }
        },
        dispatch: function(handler, value) {
            if (isFn(handler)) {
                return handler(value)
            } else if (isStr(handler)) {
                return this.resolve(handler, value)
            } else if (isArr(handler)) {
                return this.pipe(handler, value)
            } else if (isThenable(handler)) {
                var that = this
                return handler.then(function(asyncHandler) {
                    return that.dispatch(asyncHandler, value)
                })
            } else if (isObj(handler)) {
                return this.transform(handler, value)
            }
            return value
        },
        pipe: function(handlers, value) {
            var prev
            for (var i = 0, len = handlers.length; i < len; i += 1) {
                value = this.dispatch(handlers[i], prev = value)
                if (isThenable(value)) {
                    var that = this
                    return value.then(function(result) {
                        return that.pipe(handlers.slice(i + 1), result)
                    })
                } else if (value === null) {
                    return prev
                }
            }
            return value
        },
        transform: function(obj, value) {
            if (isFn(obj.goTo)) { 
                return this.dispatch(obj.goTo(value), value)
            }
            return value
        }
    }

    return Process

}));
