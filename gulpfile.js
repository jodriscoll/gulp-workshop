/*
  # why Gulp.js and not another build tool such as, [Java]ant, [Require]grunt,
    [Amber]brocolli, or [React]webpack?
    "with every new technology comes a new build tool"
    gulp obtained its extraction from the Agunlar.js community because they were
    able to do a lot of operations sequentially without saving files or dealing
    with intermediates.
    For example, React.js and webpack is a tool for React.js because it deals
    with lots of issues they "think" gulp can't handle.
    My recommendation is to research the community of the technology you're
    working with, then decide with build tool best suites the need of your
    project – personal, I'm baise to Gulp :)
    Why? Gulp composition is simple. You can read and write a configuration file
    with little experience into ECMA6 or JavaScript experience. It also, with
    some "light" massaging works with both docker images and dev containers
    without the infamous "gulp reports false issues when working remote" issue.
    And, I personally think you can acheive anything you can with the other
    build tools using gulp.

  # gulp api notes for presentation ============================================
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

    - bundle.bundle emits a stream, but no vinyl file objects
    - vinyl-source-stream wraps the original stream into a vinyl file object
    - viny-buffer converts the stream contents to a buffer for plugins who need
      a buffer (such as uglify())
    -

  # preferred way of piping (large) javascript libraries
    1) filter files that have changed
    2) do performance heavy operations
    3) remember the old files
    4) and continue with the other ops

  # what is browserify?
    - Nifty tool for handling dependcies and packages inside client side
      javascript. You can actually install modules with npm and front end modules
      like jquery. Also, you can use the same const/require syntax as you would
      with node.
    - Browserify comes with a CLI but also comes with a streaming API – meaning,
      gulp emits a stream and browserify emits a stream, so, both tools emit a
      stream, but they both look different. Gulp emits virtual file objects in
      a virtual file system, whereas browserify just emits the plain text.
**/

// constant requirements
const gulp              = require('gulp');
const uglify            = require('gulp-uglify');
const concat            = require('gulp-concat');
const sass              = require('gulp-sass');
const cssmin            = require('gulp-clean-css');
const jshint            = require('gulp-jshint');
const jsstyle           = require('jshint-stylish');
const del               = require('del');
const bsync             = require('browser-sync');
const newer             = require('gulp-newer');
const cached            = require('gulp-cached');
const remember          = require('gulp-remember');
const sourcemaps        = require('gulp-sourcemaps');
const through2          = require('through2');
const browserify        = require('browserify');
const source            = require('vinyl-source-stream');
const buffer            = require('vinyl-buffer');
const tinify            = require('gulp-tinify');                               // *** requires an API key for tinypng.com/developers ***
const util              = require('gulp-util');

/*
  gulp default task and standard function through ECMA6
  ============================================================================
  gulp.task('default', () => {} );

  browsersync triggers
  ============================================================================
  bsync.reload        = reload the web app (.js, .html)
  bsync.stream        = stream in new versions of files (.img, .scss)

  gulp flag utility
  ============================================================================
  Add the following line to your gulpfile to test gulp-util flag output:
  console.log(util.env.production);

  Open CLI and run the following:
  $ gulp              = will return 'undefined'
  $ gulp --production = will return 'true'

  After configuration, execute the following through CLI to handle sourcemaps
  $ gulp              = sourcemaps WILL be generated
  $ gulp --production = sourcemaps WILL NOT be generated

*/

// create a boolean for development mode trigger
var devMode = true;

// define shorthand configuration variables
var config = {
  vhost:      {
    src:        'gulp-workshop.dev',
    route:      ':80',
    listener:   8000
  },
  production:   !!util.env.production,
  tinypng: {
    APIKEY:     'null'
  }
}

// define shorthand pathing variable references
var paths = {
  app:  {
    src:        'app/',
    styles:     'app/styles/',
    scripts:    'app/scripts/',
    images:     'app/imgs/',
  },
  dist:  {
    src:        'dist/',
    styles:     'dist/styles/',
    scripts:    'dist/scripts/',
    images:     'dist/imgs/',
    clean:      'dist/**/*'
  },
  src: {
    styles:     'app/styles/main.scss',
    scripts:    'app/scripts/*.js',
    images:     'app/**/*.{png,gif,jpg,svg}',
    html:       'app/**/*.html',
    vendor: {
      styles:   'app/styles/vendor/*.scss',
      scripts:  'app/scripts/vendor/*.js'
    }
  },
  watch: {
    styles:     'app/styles/**/*.scss',
    scripts:    'app/scripts/**.js',
    images:     'app/**/*.{png,gif,jpg,svg}',
    html:       'app/**/*.html'
  }
}

// create a function for the object passthrough
function passthrough() {
  return through2.obj();
}

// create a function testing the boolean and pass a return depending on result
function isDev(fn) {
  if(devMode) {
    return fn;
  } else {
    return passthrough();
  }
}

// create a variable for browserify main.js entry location
var bundle = browserify({
  entries: ['app/browserify/main.js']
});

// create a gulp task and manage a technology that isn't managed through Gulp
gulp.task('browserify', () => {
  return bundle.bundle()
    .pipe(source('browserfied.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.scripts));
});

// create a new task that deletes directories/files
gulp.task('clean', () => {
  return del(paths.dist.clean)
});

// create a task for javascript validation
gulp.task('lint', () => {
  return gulp.src(
    ['app/scripts/**/*.js', '!app/scripts/vendor/*.js'], {
      since: gulp.lastRun('lint')
    })
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('jshint-stylish', {beep: true}))
});

// create a task for the javascript pipeline
gulp.task('scripts', gulp.series('lint', () => {
  return gulp.src([paths.src.vendor.scripts, paths.src.scripts])
    .pipe(isDev(sourcemaps.init()))
    .pipe(cached('scripts'))
    .pipe(uglify())
    .pipe(remember('scripts'))
    .pipe(concat('main.min.js'))
    .pipe(config.production ? util.noop() : (sourcemaps.write('.')))
    .pipe(gulp.dest(paths.dist.scripts))
    .pipe(bsync.stream());
}));

// create a task for the sass/css pipeline
gulp.task('styles', () => {
  return gulp.src([paths.src.vendor.styles, paths.src.styles])
    .pipe(isDev(sourcemaps.init()))
    .pipe(sass())
    .pipe(cssmin())
    .pipe(concat('style.min.css'))
    .pipe(config.production ? util.noop() : (sourcemaps.write('.')))
    .pipe(gulp.dest(paths.dist.styles))
    .pipe(bsync.stream());
});

// create a task for the html pipeline
gulp.task('html', () => {
  return gulp.src(paths.src.html)
    .pipe(newer(paths.dist.src))
    .pipe(gulp.dest(paths.dist.src))
    .pipe(bsync.stream());
});

// create a task for handling images
gulp.task('imgs', () => {
  return gulp.src(paths.src.images)
    .pipe(newer(paths.dist.src))
    .pipe(tinify(config.tinypng.APIKEY))
    .pipe(gulp.dest(paths.dist.src))
    .pipe(bsync.stream());
});

// create a task for the browsersync real-time editing server
gulp.task('server', (done) => {
  bsync({
    baseDir: paths.dist.src,
    open: 'false',
    host: config.vhost.src,
    proxy: {
      target: config.vhost.src + config.vhost.route,
      ws: true
    },
    port: config.vhost.listener,
    // ui: true,
    logSnippet: false
  })
  done();
})

// inform gulp to run through a series of watchers for its default task
gulp.task('default', gulp.series('clean',
  gulp.parallel('imgs', 'html', 'styles', 'scripts'), 'server', (done) => {
    gulp.watch(paths.watch.styles,            gulp.parallel('styles'));
    gulp.watch(paths.watch.images,            gulp.parallel('imgs'));
    gulp.watch(paths.watch.html,              gulp.parallel('html'));
    gulp.watch(paths.watch.scripts,           gulp.parallel('lint', 'scripts'));
    done();
  }
));
