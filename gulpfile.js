const gulp = require('gulp'),
livereload = require('gulp-livereload'),
uglify = require('gulp-uglify'),
cleanCss = require('gulp-clean-css'),
pf = require('gulp-autoprefixer'),
gulpif = require('gulp-if'),
sass = require('gulp-sass'),
rev = require('gulp-rev'),
revOrigin = require('gulp-rev-origin'),
clean = require('gulp-clean'),
webpack = require('webpack'),
gutil = require('gulp-util'),
say = require('mac-notify'),
fs = require('fs');

const inky = require('inky'),
inlineCss = require('gulp-inline-css'),
inlinesource = require('gulp-inline-source'),
rename = require('gulp-rename');

var assetsPath = __dirname+'/resources/assets',
publicPath = __dirname+'/public',
viewsPath = __dirname+'/resources/views',
NODE_ENV = process.env.NODE_ENV || 'development',
firstRun = true;

if (NODE_ENV == 'development') {
	livereload.listen();
}

function errorHandler(e) {
	say({
		message: e.messageOriginal,
		title: e.plugin+' error',
		subtitle: 'Line number:'+e.line+':'+e.column
	});

	console.log(e);
}

var jsTask = function(e) {
	return gulp.src((typeof e == 'object')? e.path : assetsPath+'/js/**/*.js')
		.pipe(gulpif(NODE_ENV == 'production', uglify().on('error', errorHandler)))
		.pipe(gulpif(NODE_ENV == 'production', rev()))
		.pipe(gulp.dest(publicPath+'/build/js'))
		.pipe(gulpif(NODE_ENV == 'production', rev.manifest('js.json')))
		.pipe(gulpif(NODE_ENV == 'production', gulp.dest(assetsPath+'/manifest')));
};
gulp.task('js', ['clean'], jsTask);

gulp.task('webpack', ['clean'], function(cb) {
	webpack(require('./webpack.config.js'), (err, stats) => {
		if(err)
			throw new gutil.PluginError("webpack", err);

		if(stats.hasErrors()){
			var jsonStats = stats.toJson();

			if(jsonStats.errors.length > 0){
				say({
					title: 'Webpack',
					subtitle: 'Bundle error'
				});
			}
		}

		gutil.log("[webpack]", stats.toString({
			hash: true,
			version: true,
			timings: true,
			assets: true,
			colors: true,
			chunkModules: false,
			chunks: false
		}));

		if(cb && firstRun){
			firstRun = false;
			cb();
		}

	});
});

var sassTask =  function(e) {
	return gulp.src([assetsPath+'/sass/index.scss'])
		.pipe(sass({precision: 8}).on('error', errorHandler))
		.pipe(pf())
		.pipe(gulpif(NODE_ENV == 'production', cleanCss({
			keepSpecialComments: 0
		}).on('error', errorHandler)))
		.pipe(gulpif(NODE_ENV == 'production', rev()))
		.pipe(gulp.dest(publicPath+'/build/css'))
		.pipe(gulpif(NODE_ENV == 'production', rev.manifest('sass.json')))
		.pipe(gulpif(NODE_ENV == 'production', gulp.dest(assetsPath+'/manifest')));
};
gulp.task('sass', ['clean'], sassTask);

gulp.task('watch', ['sass', 'js', 'webpack'], function(){
	gulp.watch(assetsPath+'/sass/**/*.scss', sassTask);
	gulp.watch(assetsPath+'/js/**/*.js', jsTask);

	gulp.watch(publicPath+'/build/css/**/*.css').on('change', livereload.changed);
	gulp.watch(publicPath+'/build/js/**/*.js').on('change', livereload.changed);
	gulp.watch(viewsPath+'/**/*.php').on('change', livereload.changed);
	gulp.watch(publicPath+'/**/*.html').on('change', livereload.changed);

	say({
		message: '',
		title: 'Dev build ready',
		subtitle: 'Listening for changes'
	});
});

gulp.task('clean', function() {
	return gulp.src(publicPath+'/build', {read: false})
		.pipe(clean());
});

gulp.task('rev', ['sass', 'js', 'webpack'], function(cb) {
	var webpack = require(assetsPath+'/manifest/webpack.json');
	var js = require(assetsPath+'/manifest/js.json');
	var sass = require(assetsPath+'/manifest/sass.json');

	for(var key in js)
		webpack['js/'+key] = 'js/'+js[key];

	for(var key in sass)
		webpack['css/'+key] = 'css/'+sass[key];

	fs.writeFile(publicPath+'/build/rev-manifest.json', JSON.stringify(webpack), (err)=>{
		if(err){
			console.log(err);
			say('Somethins going wrong');
		}

		say('Build ready!!!');

		if(cb)
			cb();
	});
});

gulp.task('rev:origin', ['sass', 'js', 'webpack'], function(cb) {
	return gulp.src(publicPath+'/build/**/*.*')
		.pipe(revOrigin())
		.pipe(gulp.dest(publicPath+'/build'));
});

var defaultTasks = [];

if (NODE_ENV != 'development')
	defaultTasks.push('rev');
else
	defaultTasks.push('watch', 'rev:origin');

gulp.task('default', defaultTasks);

var emailSassTask = function(e) {
	return gulp.src((typeof e == 'object')? e.path : assetsPath+'/email/scss/*.scss')
		.pipe(sass({
			precision: 8
		}).on('error', errorHandler))
		.pipe(gulpif(NODE_ENV == 'production',
			pf()
		))
		.pipe(gulpif(NODE_ENV == 'production',
			cleanCss({
				keepSpecialComments: 0,
				mediaMerging: true
			}).on('error', errorHandler)
		))
		.pipe(gulp.dest(assetsPath+'/email/css'));
};
gulp.task('email:sass', emailSassTask);

var emailHtmlTask = function(e) {
	return gulp.src((typeof e == 'object')? e.path : assetsPath+'/email/*.html')
		.pipe(inlinesource())
		.pipe(inky())
		.pipe(inlineCss({
			preserveMediaQueries: true
		}))
		.pipe(gulp.dest(assetsPath+'/email/dist'));
};
gulp.task('email:html', ['email:sass'], emailHtmlTask);

gulp.task('email:build', ['email:sass', 'email:html'], function(cb) {
	gulp.src(assetsPath+'/email/dist/*.html')
		.pipe(rename({
			suffix: '.blade',
			extname: '.php'
		}))
		.pipe(gulp.dest(viewsPath+'/emails'));

	say('Email build ready');

	if(cb)
		cb();
})

gulp.task('email:watch', ['email:sass', 'email:html'], function() {
	gulp.watch(assetsPath+'/email/scss/**/*.scss', ['email:html']);
	gulp.watch(assetsPath+'/email/*.html', emailHtmlTask);

	gulp.watch(assetsPath+'/email/dist/*.html').on('change', livereload.changed);

	say({
		message: '',
		title: 'Emails dev build ready',
		subtitle: 'Listening for changes'
	});
});

gulp.task('email', (NODE_ENV != 'development')? ['email:build'] : ['email:watch']);