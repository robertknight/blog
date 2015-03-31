/// <reference path="typings/tsd.d.ts" />

import fs = require('fs');
import path = require('path');
import js_yaml = require('js-yaml');

interface SiteAuthor {
	name?: string;
	photoUrl?: string;
	twitterId?: string;
	githubId?: string;
}

export interface SiteConfig {
	inputDir: string;
	outputDir: string;
	componentsDir: string;
	rootUrl: string;
	
	title: string;
	author: SiteAuthor;
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
	var author = <SiteAuthor>configYaml.author || {};
	var config = <SiteConfig>{
		inputDir: dir,
		title: <string>configYaml.title,
		outputDir: path.resolve(`${dir}/${<string>configYaml.outputDir || '_site'}`),
		componentsDir: path.resolve(`${dir}/components`),
		rootUrl: <string>configYaml.rootUrl || '',
		author: author
	};
	return config;
}

export function readPosts(config: SiteConfig) {
	var postsDir = config.inputDir + '/posts';
	return fetchPosts(postsDir);
}

