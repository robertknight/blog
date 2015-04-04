import react = require('react');

import components = require('./components');
import routes = require('./routes');
import scanner = require('./scanner');
import post_view = require('./views/post');

/** DataSource provides the data required to render the various
  * routes.
  */
export class DataSource implements routes.AppDataSource {
	private componentLoader: components.Loader;
	private config: scanner.SiteConfig;
	private posts: scanner.PostContent[];
	private tags: scanner.TagMap;

	constructor(componentLoader: components.Loader,
	            config: scanner.SiteConfig,
	            posts: scanner.PostContent[],
	            tags: scanner.TagMap) {
		this.componentLoader = componentLoader;
		this.config = config;
		this.posts = posts;
		this.tags = tags;
	}

	private convertPostExtract(post: scanner.PostContent) {
		var snippetMarkdown = scanner.extractSnippet(post.body);
		var snippetJs = components.convertMarkdownToReactJs(snippetMarkdown);
		var snippetComponent = components.reactComponentFromSource(snippetJs, this.componentLoader);

		return {
			title: post.metadata.title,
			date: new Date(post.metadata.date),
			snippet: react.createElement(snippetComponent),
			url: scanner.postUrl(this.config, post.metadata)
		};
	}

	private convertPost(post: scanner.PostContent): post_view.PostProps {
		var contentJs = components.convertMarkdownToReactJs(post.body);
		var postComponent = components.reactComponentFromSource(contentJs, this.componentLoader);
		return {
			title: post.metadata.title,
			date: new Date(post.metadata.date),
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

	fetchHeaderInfo() {
		return {
			name: this.config.author.name,
			photoUrl: this.config.author.photoUrl,
			socialLinks: {
				twitter: this.config.author.twitterId,
				github: this.config.author.githubId,
				email: this.config.author.email
			},
			rootUrl: this.config.rootUrl
		};
	}
}


