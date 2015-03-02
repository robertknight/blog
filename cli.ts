/// <reference path="typings/tsd.d.ts" />
/// <reference path="typings/marked-renderer.d.ts" />
/// <reference path="typings/fs-extra.d.ts" />
/// <reference path="node_modules/ts-style/dist/ts-style.d.ts" />

import commander = require('commander');
import fs = require('fs');
import fs_extra = require('fs-extra');
import marked = require('marked');
import react = require('react');
import path = require('path');
import js_yaml = require('js-yaml');

import post_view = require('./views/post');

var Marked = require('marked');
var react_tools = require('react-tools');

function convertMarkdownToReactJs(content: string) {
	var jsx = marked(content.toString(), {});
	jsx = '<div>' + jsx + '</div>';
	var js = 'return ' + react_tools.transform(jsx);
	return js;
}

function requiredComponentNames(contentSource: string) {
	var componentRegex = /React.createElement\(([A-z][A-Za-z]+)/g
	var match = componentRegex.exec(contentSource);
	var componentNames: string[] = [];
	while (match != null) {
		var componentClass = match[1];
		componentNames.push(componentClass);
		match = componentRegex.exec(contentSource);
	}
	return componentNames;
}

function loadComponent(name: string, searchPaths: string[]): react.Component<any,any> {
	var component: react.Component<any,any>;

	searchPaths.some((searchPath) => {
		try {
			var componentPath = searchPath + '/' + name;

			// test that the referenced component exists
			fs.statSync(componentPath + '.js');

			component = <react.Component<any,any>>require(componentPath);
			return true;
		} catch (ex) {
			// if the component does not exist, try the next search path,
			// otherwise alert the caller
			if (ex.code !== 'ENOENT') {
				throw ex;
			}
			return false;
		}
	});

	if (component) {
		return component;
	} else {
		throw new Error(`Failed to load component ${name}`);
	}
}

function createPostComponent(renderSource: string, sourceDir: string) {
	var componentNames = requiredComponentNames(renderSource);
	var components: react.Component<any,any>[] = [];

	var componentSearchPaths = [
	  path.resolve(sourceDir + '/components'),
	  path.resolve(path.resolve(__dirname) + '/components')
	];

	// load components required by the post
	componentNames.forEach((name) => {
		components.push(loadComponent(name, componentSearchPaths));
	});

	// create a semi-sandbox for running the post-generating
	// code
	var args = ['React'].concat(componentNames);
	var renderFunc = Function.apply({}, args.concat(renderSource));
	var postComponent = react.createClass({
		render: () => {
			return renderFunc.apply({}, [<any>react].concat(components))
		}
	});
	return postComponent;
}

interface PostMetadata {
	title: string;
	date: Date;
	tags: string[];
}

interface PostContent {
	metadata: PostMetadata;
	body: string;
}

function parsePostContent(markdown: string) {
	var yamlMatcher = /^\s*---\n([^]*)---\n/;
	var yamlMatch = markdown.match(yamlMatcher);
	if (!yamlMatch) {
		throw new Error('Post is missing YAML metadata section');
	}

	console.log('yaml content', yamlMatch[1]);

	var metadataDoc = js_yaml.safeLoad(yamlMatch[1]);
	if (!metadataDoc.title) {
		throw new Error('Missing metadata field: title');
	}
	if (!metadataDoc.date) {
		throw new Error('Missing metadata field: date');
	}
	metadataDoc.tags = metadataDoc.tags || '';
	
	return <PostContent>{
		metadata: {
			title: metadataDoc.title,
			date: new Date(metadataDoc.date),
			tags: metadataDoc.tags.split(',').map((tag: string) => {
				return tag.trim();
			})
		},
		body: markdown.slice(yamlMatch[0].length)
	};
}

function generateBlog(dir: string) {
	var siteDir = dir + '/_site';

	// remove and re-create output dir
	fs_extra.removeSync(siteDir);
	fs_extra.ensureDirSync(siteDir);

	// render posts to HTML
	var postsDir = dir + '/posts';
	var posts = fs.readdirSync(postsDir);
	posts.forEach((filename) => {
		var postFilePath = path.join(postsDir, filename);
		var ext = path.extname(filename);
		if (ext === '.md') {
			var post = parsePostContent(fs.readFileSync(postFilePath).toString());
			var contentJs = convertMarkdownToReactJs(post.body);
			
			var postComponent = createPostComponent(contentJs, dir);
			var postElement = post_view.PostF({
			  title: post.metadata.title,
			  date: post.metadata.date,
			  tags: post.metadata.tags
			}, react.createElement(postComponent));
			var pageContent = react.renderToString(postElement);

			var html = `
				<html>
				<head>
					<meta charset="UTF-8">
					<link rel="stylesheet" href="theme.css">
					<title>${post.metadata.title}</title>
				</head>
				<body>
					${pageContent}
				</body>
				</html>
			`;

			// write out the HTML
			fs.writeFileSync(siteDir + '/' + path.basename(filename, ext) + '.html', html);
		}
	});

	// generate index

	// copy CSS
	fs_extra.copy(path.resolve(__dirname) + '/theme.css', siteDir + '/theme.css', () => {});

	// copy assets
	fs_extra.copy(dir + '/assets', siteDir + '/assets', () => {});
}

commander.version('0.1.0')
         .usage('[options] <dir>');
commander.parse(process.argv);

generateBlog(commander.args[0]);
