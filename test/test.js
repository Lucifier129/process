var should = require('should')
var assert = require('assert')
var Process = require('../dist/process')

describe('Process', function() {
    describe('#extend()', function() {
        it('should extend object to #store', function() {
            var process = new Process()
            var source = {
                a: 1,
                b: 2,
                c: 3
            }
            process.extend(source)
            for (var key in source) {
                assert.equal(process.store[key], source[key])
            }
        })
    })
})
