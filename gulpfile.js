var gulp = require('gulp')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var header = require('gulp-header')
var del = require('del')

var banner = 
`/*!
 * LastModifyTime: ${new Date().toLocaleString()}
 * Process
 * Copyright(c) 2015 Jade Gu <guyingjie129@163.com>
 * MIT Licensed
 */
 `

gulp.task('clean', function() {
	del('./dist/*.js')
})

gulp.task('default', ['clean'], function() {
	return gulp
		.src('./src/process.js')
		.pipe(header(banner))
		.pipe(gulp.dest('dist'))
		.pipe(rename('process.min.js'))
		.pipe(uglify())
		.pipe(header(banner))
		.pipe(gulp.dest('dist'))
})