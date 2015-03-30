/// <reference path="typings/tsd.d.ts" />

import fs = require('fs');
import marked = require('marked');
import react = require('react');
import path = require('path');
import js_yaml = require('js-yaml');

var Marked = require('marked');
var react_tools = require('react-tools');

export interface SiteConfig {
	inputDir: string;
	outputDir: string;
	title: string;
	componentsDir: string;

	rootUrl: string;
}

export function convertMarkdownToReactJs(content: string) {
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

export function extractSnippet(content: string) {
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
export function reactComponentFromSource(renderSource: string, componentsDir: string) {
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

export interface PostMetadata {
	slug: string;
	title: string;
	date: Date;
	tags: string[];
}

export interface PostContent {
	metadata: PostMetadata;
	body: string;
}

export function postUrl(config: SiteConfig, post: PostMetadata) {
	return `${config.rootUrl}/posts/${post.slug}`;
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

export interface TagMap {
	[tag: string]: PostContent[];
}

export function generateTagMap(posts: PostContent[]) {
	var tagMap: {[tag:string]: PostContent[]} = {};
	posts.forEach((post) => {
		post.metadata.tags.forEach((tag) => {
			if (!tagMap[tag]) {
				tagMap[tag] = [];
			}
			tagMap[tag].push(post);
		});
	});
	return tagMap;
}

export interface PostListEntry {
	title: string;
	date: Date;
	snippetSource: string;
	url: string;
}

export function readConfig(dir: string) {
	var configYaml = js_yaml.safeLoad(fs.readFileSync(dir + '/config.yml').toString());
	var config = <SiteConfig>{
		inputDir: dir,
		title: <string>configYaml.title,
		outputDir: path.resolve(`${dir}/${<string>configYaml.outputDir || '_site'}`),
		componentsDir: path.resolve(`${dir}/components`),
		rootUrl: <string>configYaml.rootUrl || ''
	};
	return config;
}

export function readPosts(config: SiteConfig) {
	var postsDir = config.inputDir + '/posts';
	return fetchPosts(postsDir);
}

