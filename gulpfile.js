var gulp         = require('gulp')

  // Modules
  , sass         = require('gulp-ruby-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , minifycss    = require('gulp-minify-css')
  , jshint       = require('gulp-jshint')
  , uglify       = require('gulp-uglify')
  , imagemin     = require('gulp-imagemin')
  , rename       = require('gulp-rename')
  , clean        = require('gulp-clean')
  , concat       = require('gulp-concat')
  , notify       = require('gulp-notify')
  , cache        = require('gulp-cache')
  , livereload   = require('gulp-livereload')
  , connect      = require('gulp-connect')
  , template     = require('gulp-template')
  , stylish      = require('jshint-stylish')
  , lr           = require('tiny-lr')
  , server       = lr()

  // Config actions & paths
  , config       = require('./config.json')
  , paths        = config.paths
  , localPaths   = paths.local
  , distPaths    = paths.dist

  // Environment
  , environment  = null


/** Tasks **/

gulp.task('index-html', function() {
  return gulp.src(localPaths._ + '/index.html')
    .pipe(template({
        livereload: (environment === 'development')
      , environment: environment
    })).pipe(gulp.dest('dist'))
        .pipe(connect.reload())
})

gulp.task('html', ['index-html'], function() {
  return gulp.src(localPaths._ + '/**/*.html')
    .pipe(connect.reload())
})

gulp.task('styles', function() {
  var g = gulp.src(localPaths.styles + '/app.scss')
    .pipe(sass({ style: 'expanded' }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(distPaths.styles))

  if(environment === 'production') {
    g.pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(distPaths.styles))
  }

  g.pipe(connect.reload())
    .pipe(notify({ message: 'Styles task complete' }))
})

gulp.task('scripts', function() {
  var g = gulp.src(localPaths.scripts + '/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(concat('app.js'))
    .pipe(gulp.dest(distPaths.scripts))

  if(environment === 'production') {
    g.pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest(distPaths.scripts))
  }

  g.pipe(connect.reload())
    .pipe(notify({ message: 'Scripts task complete' }))
})

gulp.task('images', function() {
  return gulp.src(localPaths.images + '/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(distPaths.images))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Images task complete' }))
})

gulp.task('clean', function() {
  return gulp.src([
      distPaths.styles
    , distPaths.scripts
    , distPaths.images
  ], {read: false}).pipe(clean())
})


// Launching and watching

gulp.task('connect', connect.server({
    root: [distPaths._]
  , port: 1337
  , livereload: true
  , open: { browser: 'firefox-trunk' }
}))

gulp.task('watch', function () {
  gulp.watch([localPaths._ + '/**/*.html'], ['html'])
  gulp.watch(localPaths.styles + '/**/*.scss', ['styles'])
  gulp.watch(localPaths.scripts + '/**/*.js', ['scripts'])
  gulp.watch(localPaths.images + '/**/*', ['images'])
})


// Command-line tasks

gulp.task('default', ['clean'], function() {
  environment = 'development'
  gulp.start('connect', 'styles', 'scripts', 'images', 'watch')
})
