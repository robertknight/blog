import fs = require('fs');
import fs_extra = require('fs-extra');
import mustache = require('mustache');
import assign = require('object-assign');
import path = require('path');
import react = require('react');
import react_router = require('react-router');

import fs_util = require('./fs_util');
import routes = require('./routes');
import scanner = require('./scanner');

class DataSource implements routes.AppDataSource {
	private posts: scanner.PostContent[];
	private tags: scanner.TagMap;

	constructor(posts: scanner.PostContent[], tags: scanner.TagMap) {
		this.posts = posts;
		this.tags = tags;
	}

	recentPosts(count: number) {
		return this.posts.map(post => {
			return {
				title: post.metadata.title,
			  	date: post.metadata.date,
			   	snippet: 'snippet'
			}
		});
	}

	taggedPosts(tag: string) {
		return this.tags[tag].map(entry => {
			return {
				title: entry.metadata.title
			}
		});
	}

	fetchPost(id: string) {
		var matches = this.posts.filter(post => post.metadata.slug === id);
		if (matches.length > 0) {
			return {
				title: matches[0].metadata.title,
				body: matches[0].body
			}
		} else {
			return null;
		}
	}
}

interface AppRouteStatic {
	fetchData?(model: routes.AppDataSource, params: Object): Object;
}

function prerenderRoute(route: string, outputDir: string, data: routes.AppDataSource) {
	console.log(`pre-rendering ${route} to ${outputDir}`);
	var template = fs.readFileSync('index.html').toString();
	react_router.run(<react_router.Route>routes.rootRoute, route, (handler, state) => {
		// gather all of the data that this route requires
		var routeData = {
			params: state.params
		};

		state.routes.forEach(route => {
			var handler: AppRouteStatic = (<any>route).handler;
			if (handler.fetchData) {
				// currently assumes that fetchData() returns a result
				// immediately. In future we may want to expand this
				// to allow promises
				var result = handler.fetchData(data, state.params);
				assign(routeData, result);
			}
		});

		// render route
		var body = react.renderToString(react.createElement(handler, routeData));
		var html = mustache.render(template, {
			title: 'Page Title',
			body: body,
			appTheme: 'theme.css',
			appScript: 'app.js'
		});
		fs_extra.ensureDirSync(outputDir);
		fs.writeFileSync(`${outputDir}/index.html`, html);
	});
}

export function generateBlog(dir: string) {
	// remove and re-create output dir
	var config = scanner.readConfig(dir);
	fs_extra.ensureDirSync(config.outputDir);
	fs_util.cleanDir(config.outputDir);
	
	// generate post and tag indexes
	var posts = scanner.readPosts(config);
	var tags = scanner.generateTagMap(posts);

	// pre-render routes
	var prerenderedRoutes = ['/'];

	posts.forEach(post => {
		prerenderedRoutes.push(`/posts/${post.metadata.slug}`);
	});

	Object.keys(tags).forEach(tag => {
		prerenderedRoutes.push(`/posts/tagged/${tag}`);
	});

	var dataSource = new DataSource(posts, tags);
	prerenderedRoutes.forEach(route => {
		prerenderRoute(route, config.outputDir + route, dataSource);
	});

	// copy CSS and assets
	fs_extra.copy(path.resolve(__dirname) + '/theme.css', `${config.outputDir}/theme.css`, () => {});
	fs_extra.copy(dir + '/assets', `${config.outputDir}/assets`, () => {});
}

