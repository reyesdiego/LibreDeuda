/**
 * Created by kolesnikov-a on 12/05/2016.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var cleanCss = require('gulp-clean-css');
var duration = require('gulp-duration');
var htmlreplace = require('gulp-html-replace');
var minify = require('gulp-minify');
var babel = require('gulp-babel');


gulp.task('minify', function(){
    gulp.src(['app.js', 'class/*.js', 'directives/*', 'filters/*', 'login/*.js', 'lde/**/*.js', 'register/*.js', 'services/**/*.js'])
        .pipe(concat('app.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(minify({ noSource: true }).on('error', function(e) {
                console.log(e);
            }))
        .pipe(gulp.dest('build/webClient'))
});

gulp.task('minify-accessControl', function(){
    gulp.src(['AccessControl/app.js', 'AccessControl/login/*.js', 'AccessControl/users/*.js', 'AccessControl/services/**/*.js'])
        .pipe(concat('app.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(minify({ noSource: true }).on('error', function(e) {
            console.log(e);
        }))
        .pipe(gulp.dest('build/accessControl'))
});

gulp.task('minify-css', function() {
    gulp.src(['css/animate.css', 'css/app.css'])
        // Combine all CSS files found inside the src directory
        .pipe(concatCss('styles.min.css'))
        // Minify the stylesheet
        .pipe(cleanCss({ debug: true }))
        // Write the minified file in the css directory
        .pipe(gulp.dest('build/webClient/css/')).pipe(gulp.dest('build/accessControl/css/'));
    // place code for your default task here
});

gulp.task('html-replace', function() {
    gulp.src('index.html')
        .pipe(htmlreplace({
            'css': {
                src: ['css/styles.min.css', 'css/bootstrap-cosmo.min.css']
            },
            'bower': {
                src: ['lib/angular/angular.min.js',
                    'lib/angular-animate/angular-animate.min.js',
                    'lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'lib/angular-i18n/angular-locale_es-ar.js',
                    'lib/angular-sanitize/angular-sanitize.min.js',
                    'lib/angular-socket-io/socket.min.js',
                    'lib/angular-ui-router/angular-ui-router.min.js',
                    'lib/ng-idle/angular-idle.min.js'
                ]
            },
            'app': 'app-min.js',
            'socket': 'lib/socket.io.min.js'
        }))
        .pipe(gulp.dest('build/webClient'));
    gulp.src('AccessControl/index.html')
        .pipe(htmlreplace({
            'css': {
                src: ['css/styles.min.css', 'css/bootstrap-cosmo.min.css']
            },
            'bower': {
                src: ['lib/angular/angular.min.js',
                    'lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'lib/angular-ui-router/angular-ui-router.min.js'
                ]
            },
            'app': 'app-min.js'
        }))
        .pipe(gulp.dest('build/accessControl'))
});

gulp.task('copy-files', function(){
    var templates = {
        "login": "login/login.html",
        "register": "register/register.html",
        "lde": "lde/**/*.html",
        "services/dialogs": "services/dialogs/*.html",
        "lib": "lib/*",
        "images": "images/*",
        "fonts": "fonts/*",
        "css": "css/bootstrap-cosmo.min.css"
    };
    for (var template in templates) {
        console.log(template);
        gulp.src(templates[template])
          .pipe(gulp.dest("build/webClient/" + template))
    }
});

gulp.task('copy-files-accessControl', function(){
    var templates = {
        "login": "AccessControl/login/login.view.html",
        "users": "AccessControl/users/users.view.html",
        "services/dialogs": "AccessControl/services/dialogs/*.html",
        "images": "images/*",
        "fonts": "fonts/*",
        "css": "css/bootstrap-cosmo.min.css"
    };
    for (var template in templates) {
        console.log(template);
        gulp.src(templates[template])
            .pipe(gulp.dest("build/accessControl/" + template))
    }
});

gulp.task("copy-bower-dependencies", function () {
    var paths = {
        bower: "bower_components/",
        lib: "build/webClient/lib/"
    };

    var bower = {
        "angular": "angular/*.min*",
        "angular-animate": 'angular-animate/*.min*',
        "angular-bootstrap": 'angular-bootstrap/{*-tpls.min*,uib/**}',
        "angular-i18n": 'angular-i18n/angular-locale_es-ar.js',
        "angular-sanitize": 'angular-sanitize/*.min*',
        "angular-socket-io": 'angular-socket-io/*.min*',
        "angular-ui-router": 'angular-ui-router/release/*.min*',
        "ng-idle": 'ng-idle/*.min*'
    };

    for (var destinationDir in bower) {
        console.log(destinationDir);
        gulp.src(paths.bower + bower[destinationDir])
            .pipe(gulp.dest(paths.lib + destinationDir));
    }
});

gulp.task("copy-bower-dependencies-accessControl", function () {
    var paths = {
        bower: "bower_components/",
        lib: "build/accessControl/lib/"
    };

    var bower = {
        "angular": "angular/*.min*",
        "angular-bootstrap": 'angular-bootstrap/{*-tpls.min*,uib/**}',
        "angular-ui-router": 'angular-ui-router/release/*.min*'
    };

    for (var destinationDir in bower) {
        console.log(destinationDir);
        gulp.src(paths.bower + bower[destinationDir])
            .pipe(gulp.dest(paths.lib + destinationDir));
    }
});

gulp.task('default', ['minify-css', 'html-replace', 'copy-bower-dependencies', 'copy-bower-dependencies-accessControl', 'copy-files', 'copy-files-accessControl', 'minify', 'minify-accessControl']);