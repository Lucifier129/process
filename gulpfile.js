var gulp = require('gulp')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var del = require('del')


gulp.task('clean', function() {
	del('./dist/*.js')
})

gulp.task('default', ['clean'], function() {
	return gulp
		.src('./src/process.js')
		.pipe(gulp.dest('dist'))
		.pipe(rename('process.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'))
})