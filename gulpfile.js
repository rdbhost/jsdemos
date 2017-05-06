var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    gulp.watch("./**/*").on('change', browserSync.reload);
});

gulp.task('css', function() {
    return reload();

    // return gulp.src('src/**/*.css')
    //            .pipe(browserSync.stream());
});