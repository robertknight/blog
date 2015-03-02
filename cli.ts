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
import post_list_view = require('./views/post_list');

var Marked = require('marked');
var react_tools = require('react-tools');

interface SiteConfig {
	outputDir: string;
	title: string;
	componentsDir: string;
}

function renderPage(title: string, content: string, root: string) {
		var html = `
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="${root}/theme.css">
<title>${title}</title>
</head>
<body>
${content}
</body>
</html>
		`;
	return html;
}

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

function extractSnippet(content: string) {
	var idealLength = 400;
	var snippet = '';
	var paragraphs = content.split(/\n\s*\n/);
	var paragraphIndex = 0;
	while (snippet.length < idealLength && paragraphIndex < paragraphs.length) {
		if (snippet.length == 0) {
			snippet += '\n\n';
		}
		snippet += paragraphs[paragraphIndex];
		++paragraphIndex;
	}
	return snippet;
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

// takes the JS source for an expression which returns a React Element
// and evaluates it to create a React component with a render() function
// which returns the result
function reactComponentFromSource(renderSource: string, componentsDir: string) {
	var componentNames = requiredComponentNames(renderSource);
	var components: react.Component<any,any>[] = [];

	var componentSearchPaths = [
	  path.resolve(componentsDir),
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
	slug: string;
	title: string;
	date: Date;
	tags: string[];
}

interface PostContent {
	metadata: PostMetadata;
	body: string;
}

function parsePostContent(filename: string, markdown: string) {
	var yamlMatcher = /^\s*---\n([^]*)---\n/;
	var yamlMatch = markdown.match(yamlMatcher);
	if (!yamlMatch) {
		throw new Error('Post is missing YAML metadata section');
	}

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
			slug: path.basename(filename, '.md'),
			title: metadataDoc.title,
			date: new Date(metadataDoc.date),
			tags: metadataDoc.tags.split(',').map((tag: string) => {
				return tag.trim();
			})
		},
		body: markdown.slice(yamlMatch[0].length)
	};
}

function fetchPosts(postsDir: string) {
	var posts: PostContent[] = [];
	var postSourceFiles = fs.readdirSync(postsDir);
	postSourceFiles.forEach((filename) => {
		var postFilePath = path.join(postsDir, filename);
		var ext = path.extname(filename);
		if (ext === '.md') {
			posts.push(parsePostContent(postFilePath, fs.readFileSync(postFilePath).toString()));
		}
	});
	return posts;
}

function generateIndex(config: SiteConfig, posts: PostContent[]) {
	var postList = post_list_view.PostListF({
		posts: posts.map((post) => {
			var snippetMarkdown = extractSnippet(post.body);
			var snippetJs = convertMarkdownToReactJs(snippetMarkdown);
			var snippetComponent = reactComponentFromSource(snippetJs, config.componentsDir);

			return <post_list_view.PostListEntry>{
				title: post.metadata.title,
				date: post.metadata.date,
				snippet: react.createElement(snippetComponent),
				slug: post.metadata.slug
			};
		})
	});
	var content = react.renderToString(postList);
	var page = renderPage(config.title, content, '.');
	fs.writeFileSync(`${config.outputDir}/index.html`, page);
}

function generateBlog(dir: string) {
	var configYaml = js_yaml.safeLoad(fs.readFileSync(dir + '/config.yml').toString());
	var config = <SiteConfig>{
		title: <string>configYaml.title,
		outputDir: path.resolve(`${dir}/${<string>configYaml.outputDir || '_site'}`),
		componentsDir: path.resolve(`${dir}/components`)
	};

	// remove and re-create output dir
	fs_extra.removeSync(config.outputDir);
	fs_extra.ensureDirSync(config.outputDir);

	// render posts to HTML
	var postsDir = dir + '/posts';
	var posts = fetchPosts(postsDir);
	posts.forEach((post) => {
		var contentJs = convertMarkdownToReactJs(post.body);

		var postComponent = reactComponentFromSource(contentJs, dir);
		var postElement = post_view.PostF({
			title: post.metadata.title,
			date: post.metadata.date,
			tags: post.metadata.tags
		}, react.createElement(postComponent));
		var pageContent = react.renderToString(postElement);
		var html = renderPage(post.metadata.title, react.renderToString(postElement), '../');

		var postDir = `${config.outputDir}/${post.metadata.slug}`;
		fs_extra.ensureDirSync(postDir);
		fs.writeFileSync(`${postDir}/index.html`, html);
	});

	generateIndex(config, posts);

	// copy CSS and assets
	fs_extra.copy(path.resolve(__dirname) + '/theme.css', `${config.outputDir}/theme.css`, () => {});
	fs_extra.copy(dir + '/assets', `${config.outputDir}/assets`, () => {});
}

commander.version('0.1.0')
         .usage('[options] <dir>');
commander.parse(process.argv);

generateBlog(commander.args[0]);
