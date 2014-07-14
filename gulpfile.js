var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('default', function () {
    gulp.src('test/**/*.spec.js')
        .pipe(jasmine());
});