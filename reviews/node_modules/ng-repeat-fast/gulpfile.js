var fs = require('fs');
var gulp = require('gulp');
var bump = require('gulp-bump');
var mocha = require('gulp-spawn-mocha');
var karma = require('gulp-karma');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');
var browserify = require('browserify');
var _ = require('lodash');
var browserSync = require('browser-sync');

///////////////////////////////////////////////////////////////////////////////

var getPackageJson = function (pkg) {
    return pkg || require('./package.json');
};

var getName = function (pkg) {
    return getPackageJson(pkg).name;
};

var getVersion = function (pkg) {
    return getPackageJson(pkg).version;
};

var getBundleName = function (ext) {
    var pkg = getPackageJson();
    return getName(pkg) + '-' + getVersion(pkg) + ext;
};

///////////////////////////////////////////////////////////////////////////////

gulp.task('default', ['build']);
gulp.task('build', ['clean', 'bump', 'copy', 'browserify', 'test']);

gulp.task('clean', function (cb) {
    del(['dist/', 'coverage/', 'docs/'], cb);
});

gulp.task('bump', function () {
    return gulp.src('./package.json')
        .pipe(bump({ type: 'build-version' }))
        .pipe(gulp.dest('./'));
});

gulp.task('copy', function () {
    gulp.src('bower_components/angular/angular.min.js')
        .pipe(gulp.dest('site/'));
    gulp.src('bower_components/bootstrap/dist/css/bootstrap.css')
        .pipe(gulp.dest('site/'));
});

gulp.task('browserify', ['bump'], function () {
    var bundler = browserify({
        entries: ['./src/index.js'],
        debug: true,
        detectGlobals: true,
        insertGlobals: false,
        standalone: _.camelCase(require('./package.json').name)
    });
    return bundler
        .bundle()
        .pipe(source(getBundleName('.js')))
        .pipe(gulp.dest('dist/'))
        //
        .pipe(rename({ extname: '.min.js' }))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'))
    ;
});

gulp.task('test', function () {
    return gulp
        .src('tests/index.js', { read: false })
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }));
});

gulp.task('test-watch', function () {
    return gulp
        .src('tests/index.js', { read: false })
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'start'
        }));
});

gulp.task('http-server', function () {
    browserSync({
        server: {
            baseDir: './',
            directory: true
        },
        files: [
            'site/**/*.*',
            'src/**/*.*',
            'tests/**/*.*'
        ],
        open: false,
        notify: true,
        injectChanges: true,
        port: 5000
    });
});
