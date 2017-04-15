/*
  # gulp api
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


// gulp default task and standard function through ECMA6
// gulp.task('default', () => {} );

gulp.task('clean', () => {
  // del module is the most direct way to manage files within node
  return del('dist/**/*');
});

// javascript validator (not overly strict)
gulp.task('lint', () => {
  // *.js     = all files with the file type of .js
  // **/      = all files within any directory
  // !app/**  = ignore files/directories meeting wildcard placements
  return gulp.src(['app/scripts/**/*.js', '!app/scripts/vendor/*.js'])                // first glob everything, then throw away what you don't need
    .pipe(jshint())                                                                   // jshint alters virtual file contents
    .pipe(jshint.reporter('default'))                                                 // report if we've wrote good/bad javascript
    .pipe(jshint.reporter('fail'));                                                   // fail if we haven't done so
});

// run the javascript task pipeline
gulp.task('scripts', gulp.series('lint', () => {
  // **/*     = gulp adds everything (including folders) captured in the wildcard
  //            during .dest()
  //            * note: .concat() breaks this catch-all
  return gulp.src('app/scripts/**/*.js')
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(bsync.stream());                                                      // will reload the browser and load the new version (javascript)
}));

// run the css task pipeline
gulp.task('styles', () => {
  return gulp.src('app/styles/main.scss')
    .pipe(sass())
    .pipe(cssmin())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(bsync.stream());                                                      // will inject the new version into the browser (css only)
    // .pipe(browserSync.stream(browserSync.reload), (done) => {
    //   done();
    // })
});

gulp.task('server', (done) => {
  bsync({
    server: {
      // serve files from dist/ (or if not found app/)
      baseDir: ['dist', 'app']
    }
  });
  done();
})

// when the default task is executed, parallel additional gulp tasks previously defined
// $ gulp
// gulp.task('default', gulp.parallel(
//   'styles',
//   gulp.series('lint', 'scripts', (done) => {
//     // when lint and scripts have completed, alert the console of the completion
//     console.log('\u2713 JavaScript Series Completed!');
//     // nothing to return here; telling gulp that after this execution above, the whole thing is "done"
//     done();
//   })));

gulp.task('default', gulp.series('clean',
  gulp.parallel('styles', 'scripts'), 'server', (done) => {
    gulp.watch('app/styles/**.scss', gulp.parallel('styles'));
    gulp.watch('app/scripts/**.js', gulp.parallel('lint', 'scripts'));
    done();
  }
));
