var webpack = require('webpack'),
path = require('path'),
AssetsPlugin = require('assets-webpack-plugin');
exec = require('child_process').exec,
NODE_ENV = process.env.NODE_ENV || 'development',
assetsPath = __dirname+'/resources/assets',
publicPath = __dirname+'/public';

function ErrorHandler() {};

ErrorHandler.prototype.apply = function(compiler) {

	compiler.plugin("should-emit", function(compilation) {
		if(compilation.errors.length > 0){
			return false;
		}
	});

	compiler.plugin("compilation", function(compilation) {
		compilation.plugin("should-record", function() {
			if(compilation.errors.length > 0){
				compilation.errors.map(function(e){
					if(e.error.loc)
						exec('osascript -e \'display notification "'+(e.dependencies[0]).request+'" with title "'+e.name+' error" subtitle "Line number:'+e.error.loc.line+'"\'');
				});
				return false;
			}
		});
	});

};

module.exports = {
	context: assetsPath+'/jsx',
	entry: {
		index: './index.jsx',
	},
	output: {
		path: publicPath+'/build/js',
		publicPath: '/build/js/',
		filename: NODE_ENV == 'development' ? '[name].js' : '[name]-[chunkhash:10].js'
	},
	module: {
		loaders: [{
			test: /\.jsx$/,
			include: assetsPath+'/jsx',
			loader: 'babel',
			query: {
				presets: ['react', 'es2015'],
				cacheDirectory: true
			}
		}, {
			test: /\.js$/,
			include: assetsPath+'/jsx',
			loader: 'babel',
			query: {
				presets: ['es2015'],
				cacheDirectory: true
			}
		}]
	},
	watch: NODE_ENV == 'development',
	watchOptions: {
		aggreagteTimeout: 100
	},
	devtool: NODE_ENV == 'development' ? 'cheap-inline-module-source-map' : null,
	plugins: [
		new ErrorHandler(),
		new webpack.EnvironmentPlugin('NODE_ENV'),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common'
		})
	],
	resolve: {
		root: path.resolve(assetsPath+'/jsx'),
		modulesDirectories: ['node_modules'],
		extensions: ['', '.js', '.jsx']
	}
};

if(NODE_ENV == 'production'){

	module.exports.plugins.push(
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				dead_code: true,
				warnings: false,
				drop_console: true,
				unsafe: true,
				sequences : true,
				booleans : true,
				loops : true,
				unused: true
			},
			comments: false,
			beautify: false,
		}),
		new AssetsPlugin({
			filename: 'webpack.json',
			path: assetsPath+'/manifest',
			processOutput(assets) {
				for(var key in assets){
					assets['js/'+key+'.js'] = 'js/'+assets[key].js.slice(module.exports.output.publicPath.length);
					delete assets[key];
				}

				return JSON.stringify(assets);
			}
		})
	);

}