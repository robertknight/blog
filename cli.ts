/// <reference path="typings/tsd.d.ts" />

import commander = require('commander');
import react = require('react');

function generateBlog(dir: string) {
	console.log('generating blog from', dir);
}

commander.version('0.1.0')
         .usage('[options] <dir>');
commander.parse(process.argv);

generateBlog(commander.args[0]);
