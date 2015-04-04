/// <reference path="../typings/tsd.d.ts" />

import commander = require('commander');

import scanner = require('./scanner');
import prerender = require('./prerender');

commander.version('0.1.0')
         .usage('[options] <dir>');
commander.parse(process.argv);

prerender.generateBlog(commander.args[0]);
