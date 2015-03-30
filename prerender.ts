import fs = require('fs');
import fs_extra = require('fs-extra');
import mustache = require('mustache');
import assign = require('object-assign');
import path = require('path');
import react = require('react');
import react_router = require('react-router');

import components = require('./components');
import fs_util = require('./fs_util');
import post_view = require('./views/post');
import routes = require('./routes');
import scanner = require('./scanner');

class DataSource implements routes.AppDataSource {
	private config: scanner.SiteConfig;
	private posts: scanner.PostContent[];
	private tags: scanner.TagMap;

	constructor(config: scanner.SiteConfig, posts: scanner.PostContent[], tags: scanner.TagMap) {
		this.config = config;
		this.posts = posts;
		this.tags = tags;
	}

	private convertPostExtract(post: scanner.PostContent) {
		var snippetMarkdown = scanner.extractSnippet(post.body);
		var snippetJs = components.convertMarkdownToReactJs(snippetMarkdown);
		var snippetComponent = components.reactComponentFromSource(snippetJs, this.config.componentsDir);

		return {
			title: post.metadata.title,
			date: post.metadata.date,
			snippet: react.createElement(snippetComponent),
			url: scanner.postUrl(this.config, post.metadata)
		};
	}

	private convertPost(post: scanner.PostContent): post_view.PostProps {
		var contentJs = components.convertMarkdownToReactJs(post.body);
		var postComponent = components.reactComponentFromSource(contentJs, this.config.inputDir);
		return {
			title: post.metadata.title,
			date: post.metadata.date,
			tags: post.metadata.tags.map(tag => {
				return {
					tag: tag,
					indexUrl: `${this.config.rootUrl}/posts/tagged/${tag}`
				}
			}),
			url: scanner.postUrl(this.config, post.metadata),
			children: [react.createElement(postComponent, {key:'post'})]
		};
	}

	recentPosts(count: number) {
		return this.posts.map(post => this.convertPostExtract(post));
	}

	taggedPosts(tag: string) {
		return this.tags[tag].map(post => this.convertPostExtract(post));
	}

	fetchPost(id: string) {
		var matches = this.posts.filter(post => post.metadata.slug === id);
		if (matches.length > 0) {
			return this.convertPost(matches[0]);
		} else {
			return null;
		}
	}

	fetchBannerInfo() {
		return {
			name: this.config.title,
			photoUrl: 'http://www.gravatar.com/someurl',
			socialLinks: {
				twitter: 'joebloggs',
				github: 'joebloggs'
			}
		};
	}
}

interface AppRouteStatic {
	fetchData?(model: routes.AppDataSource, params: Object): Object;
}

function prerenderRoute(config: scanner.SiteConfig, route: string, outputDir: string, data: routes.AppDataSource) {
	console.log(`pre-rendering ${route} to ${outputDir}`);
	var template = fs.readFileSync('index.html').toString();
	react_router.run(<react_router.Route>routes.rootRoute, route, (handler, state) => {
		// gather all of the data that this route requires
		var routeData = {
			params: state.params,
			title: config.title
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
			title: routeData.title,
			body: body,
			appTheme: `${config.rootUrl}/theme.css`,
			appScript: `${config.rootUrl}/app.js`
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

	var dataSource = new DataSource(config, posts, tags);
	prerenderedRoutes.forEach(route => {
		prerenderRoute(config, route, config.outputDir + route, dataSource);
	});

	// copy CSS and assets
	fs_extra.copy(path.resolve(__dirname) + '/theme.css', `${config.outputDir}/theme.css`, () => {});
	fs_extra.copy(dir + '/assets', `${config.outputDir}/assets`, () => {});
}

