/*
  # gulp api notes from presentation
    - gulp.task creats a new task
      it requires to return either a Stream, a Promise, or an Observable
    - gulp.src "globs" files and returns a stream of virtual file objects
      each file can be piped through a process (jshint, uglify, less, etc.)
    - gulp.dest saves the file back to the file system
    - const are npm requirements while gulp is running (stored within node_modules/)
    - the second parameter of gulp.task is always a function

    - gulp.series is a task function that runs tasks in sequential order.
    - gulp.parallel is task function that starts every task concurrently
    - Both task functions accept task names and other functions as parameters
      the can be combined infinitely

    - gulp.watch creates a file watchers and listens to changes
    - changes include 'change', 'add', 'unlink' and others
    - GrowserSync is a development tool that can be fully integrated in Gulp
    - Watchers trigger a browserSync.reload call

    - gulp-cached and gulp-remember can be sued to create file caches
    - The plugin filters non-changed files and ads them back to the stream once
      we are done with performance-heavy tasks
    - Additional to that, we can use gulp.lastRun in Gulp 4 to filter files
      during globbing
    - gulp-newer allows us to do incremental copies/builds on a per-file basis

  # preferred way of piping (large) javascript libraries
    1) filter files that have changed
    2) do performance heavy operations
    3) remember the old files
    4) and continue with the other ops
**/

// constant requirements
const gulp      = require('gulp');
const uglify    = require('gulp-uglify');
const concat    = require('gulp-concat');
const sass      = require('gulp-sass');
const cssmin    = require('gulp-clean-css');
const jshint    = require('gulp-jshint');
const del       = require('del');
const bsync     = require('browser-sync');
const newer     = require('gulp-newer');
const cached    = require('gulp-cached');
const remember  = require('gulp-remember');


// gulp default task and standard function through ECMA6
// gulp.task('default', () => {} );

// browsersync triggers
// bsync.reload   = reload the web app (.js, .html)
// bsync.stream   = stream in new versions of files (.img, .scss)

gulp.task('clean', () => {
  // del module is the most direct way to manage files within node
  return del('dist/**/*');
});


// javascript validator (not overly strict)
gulp.task('lint', () => {
  // *.js     = all files with the file type of .js
  // **/      = all files within any directory
  // !app/**  = ignore files/directories meeting wildcard placements
  return gulp.src(
    ['app/scripts/**/*.js', '!app/scripts/vendor/*.js'], {
      // only lint files sint the last time lint has been run
      since: gulp.lastRun('lint')
    })
    .pipe(jshint())                                                             // jshint alters virtual file contents
    .pipe(jshint.reporter('default'))                                           // report if we've wrote good/bad javascript
    .pipe(jshint.reporter('fail'));                                             // fail if we haven't done so
});

// start the javascript task pipeline
gulp.task('scripts', gulp.series('lint', () => {
  // **/*     = gulp adds everything (including folders) captured in the wildcard
  //            during .dest()
  //            * note: .concat() breaks this catch-all
  return gulp.src('app/scripts/**/*.js')
    .pipe(cached('scripts'))
    .pipe(uglify())
    .pipe(remember('scripts'))
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(bsync.stream());                                                      // will reload the browser and load the new version (javascript)
}));

// start the css task pipeline
gulp.task('styles', () => {
  return gulp.src('app/styles/main.scss')
    .pipe(sass())
    .pipe(cssmin())
    .pipe(remember('styles'))
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(bsync.stream());
});

gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe(newer('dist'))
    .pipe(gulp.dest('dist'))
    .pipe(bsync.stream());
})

// start a browsersync server listener
gulp.task('server', (done) => {
  bsync({
    server: {
      // browsersync set up to start a dev server, serving dist/
      baseDir: ['dist']                                                         // will 404 if nothing found
    }
  });
  done();
})

// run a series of watchers for the default gulp task
gulp.task('default', gulp.series('clean',
  gulp.parallel('html', 'styles', 'scripts'), 'server', (done) => {
    gulp.watch('app/styles/**.scss',  gulp.parallel('styles'));
    gulp.watch('app/**/*.html',       gulp.parallel('html'));
    gulp.watch('app/scripts/**.js',   gulp.parallel('lint', 'scripts'));
    done();
  }
));
