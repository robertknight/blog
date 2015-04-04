import fs = require('fs');
import fs_extra = require('fs-extra');
import mustache = require('mustache');
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
			name: this.config.author.name,
			photoUrl: this.config.author.photoUrl,
			socialLinks: {
				twitter: this.config.author.twitterId,
				github: this.config.author.githubId,
				email: this.config.author.email
			},
			rootUrl: this.config.rootUrl + '/'
		};
	}
}

function prerenderRoute(config: scanner.SiteConfig, route: string, outputDir: string, data: routes.AppDataSource) {
	console.log(`Creating ${route}`);
	var template = fs.readFileSync('index.html').toString();
	react_router.run(<react_router.Route>routes.rootRoute, route, (handler, state) => {
		var props = routes.fetchRouteProps(data, state);

		// render route
		var body = react.renderToString(react.createElement(handler, props));
		var html = mustache.render(template, {
			title: props.title,
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
	var themeFiles = ['theme.css', 'github-white-120x120.png', 'twitter-white.png', 'email-48x38.png'];
	var themeDir = path.resolve(__dirname) + '/theme';

	themeFiles.forEach(themeFile => {
		const src = `${themeDir}/${themeFile}`;
		const dest = `${config.outputDir}/${themeFile}`;
		fs_extra.copy(src, dest, (err) => {
			if (err) {
				console.error(`Failed to copy ${src} to ${dest}: ${err}`);
			}
		});
	});
	fs_extra.copy(dir + '/assets', `${config.outputDir}/assets`, () => {});
}

