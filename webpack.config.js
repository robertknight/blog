var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var buildDir = __dirname + '/build';

// generates a JavaScript file which requires all of the
// components that blog posts/pages might use
function generateComponentCatalog(componentsDir) {
	var catalogPath = componentsDir + '/catalog.js';
	var catalogSrc = [];
	fs.readdirSync(componentsDir).forEach(function(filename) {
		// component names start with an upper-case letter,
		// other files are helpers
		if (!filename.match(/[A-Z].*/)) {
			return;
		}
		
		var name = path.basename(filename, '.js');
		catalogSrc.push('exports.' + name + ' = require(\'./' + name + '\')');
	});
	fs.writeFileSync(catalogPath, catalogSrc.join('\n'));
	return catalogPath;
}

// lists the NPM dependencies required by the client app.
function listVendorDeps() {
	var GENERATOR_ONLY_DEPS = ['commander', 'fs-extra', 'mustache'];
	var npmDeps = JSON.parse(fs.readFileSync('package.json').toString()).dependencies;
	return Object.keys(npmDeps).filter(function(dep) {
		return GENERATOR_ONLY_DEPS.indexOf(dep) == -1;
	});
}

var catalogPath = generateComponentCatalog(buildDir + '/components');
var vendorDeps = listVendorDeps();

module.exports = {
	context: __dirname + '/build',
	node: {
		__filename: true
	},
	entry: {
		client: './client',
		components: [catalogPath],
		vendor: vendorDeps
	},
	output: {
		path: __dirname + '/build',
		filename: '[name].bundle.js'
	},
	module: {
		// reject unknown requires
		exprContextRegExp: /$^/,
		unknownContextRegExp: /$^/
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin(
		  'vendor', 'vendor.bundle.js'
		)/*,
		new webpack.optimize.UglifyJsPlugin({
		  compress: {
			  warnings: false
		  },
		  test: /vendor.bundle.js/
		})*/
	]
};
