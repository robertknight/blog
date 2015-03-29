import react = require('react');
import react_router = require('react-router');

import banner = require('views/banner');
import post = require('views/post');
import post_list = require('views/post_list');

export interface PostListEntry {
	title: string;
}

export interface PostData {
	title: string;
	body: string;
}

export interface AppDataSource {
	recentPosts(count: number): PostListEntry[];
	taggedPosts(tag: string): PostListEntry[];
	fetchPost(id: string): PostData;
}

class BlogRoute extends react.Component<{},{}> {
	render() {
		return react.DOM.div({},
			react.createElement(react_router.RouteHandler, this.props)
		);
	}
}

interface PostRouteProps extends react_router.RouteProp {
	params: {
		postId: string;
	};
}

class PostRoute extends react.Component<PostRouteProps,{}> {
	static fetchData(model: AppDataSource, params: {postId: string}) {
		return {
			post: model.fetchPost(params.postId)
		}
	}

	render() {
		return react.DOM.div({}, `This post is ${this.props.params.postId}`);
	}
}

interface PostListRouteProps extends react_router.RouteProp {
	posts: Array<{title:string}>;
}

class PostListRoute extends react.Component<PostListRouteProps,{}> {
	static fetchData(model: AppDataSource) {
		return {
			posts: model.recentPosts(10)
		};
	}

	render() {
		return react.DOM.div({}, 
			this.props.posts.map(post => react.DOM.div({}, post.title))
		);
	}
}

interface TaggedPostsRouteProps {
	params: {
		tag: string;
	};
}

class TaggedPostsRoute extends react.Component<TaggedPostsRouteProps,{}> {
	static fetchData(model: AppDataSource, params: {tag: string}) {
		return model.taggedPosts(params.tag);
	}

	render() {
		return react.DOM.div({}, `List of posts tagged ${this.props.params.tag} here`);
	}
}

var RouteF = react.createFactory(react_router.Route);
var DefaultRouteF = react.createFactory(react_router.DefaultRoute);

export var rootRoute = RouteF({name: 'home', path: '/', handler: BlogRoute},
	RouteF({name: 'post', path: '/posts/:postId', handler: PostRoute}),
	RouteF({name: 'tagged', path: '/posts/tagged/:tag', handler: TaggedPostsRoute}),
	DefaultRouteF({handler: PostListRoute})
);

