const { src, dest, series } = require('gulp');
const babel = require('gulp-babel');
const browserify = require('gulp-browserify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const uglify  = require('gulp-uglify');

function babelScripts() {
  return src('src/**/*.js')
    .pipe(babel())
    .pipe(dest('tmp/'))
}

function browserScripts() {
  return src('tmp/index.js')
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(uglify())
    .pipe(rename({ basename: 'bundle' }))
    .pipe(dest('lib/'))
    .pipe(dest('docs/lib/'))
}

function cleanScripts() {
  return src('tmp', { read: false })
    .pipe(clean())
}

exports.build = series(babelScripts, browserScripts, cleanScripts)