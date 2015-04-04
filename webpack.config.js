var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var buildDir = __dirname + '/build';

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

var catalogPath = generateComponentCatalog(buildDir + '/components');

module.exports = {
	context: __dirname + '/build',
	node: {
		__filename: true
	},
	entry: {
		client: './client',
		components: [catalogPath],
		vendor: ['react']
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
		)
	]
};
