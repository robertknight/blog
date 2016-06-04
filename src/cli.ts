import commander = require('commander');
import path = require('path');

import scanner = require('./scanner');
import prerender = require('./prerender');

commander.version('0.1.0')
         .usage('[options] <dir>');
commander.parse(process.argv);

const inputDir = commander.args[0] || path.resolve('.');

prerender.generateBlog(inputDir);
