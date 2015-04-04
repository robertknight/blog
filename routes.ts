import assign = require('object-assign');
import react = require('react');
import react_router = require('react-router');

import header_view = require('./views/header');
import post_view = require('./views/post');
import post_list_view = require('./views/post_list');

export interface AppDataSource {
	recentPosts(count: number): post_list_view.PostListEntry[];
	taggedPosts(tag: string): post_list_view.PostListEntry[];
	fetchPost(id: string): post_view.PostProps;
	fetchHeaderInfo(): header_view.HeaderProps;
}

export interface AppRouteStatic {
	fetchData?(model: AppDataSource, params: Object): Object;
}

export function fetchRouteProps(data: AppDataSource, state: react_router.RouterState) {
	// gather all of the data that this route requires
	var routeData = {
		params: state.params,
		title: ''
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

	return routeData;
}

interface BlogRouteProps {
	header: header_view.HeaderProps;
}

class BlogRoute extends react.Component<BlogRouteProps,{}> {
	static fetchData(model: AppDataSource) {
		var headerInfo = model.fetchHeaderInfo();
		return {
			title: headerInfo.name,
			header: headerInfo
		}
	}

	render() {
		return react.DOM.div({},
			header_view.HeaderF(this.props.header),
			react.createElement(react_router.RouteHandler, this.props)
		);
	}
}

interface PostRouteProps extends react_router.RouteProp {
	params: {
		postId: string;
	};
	post: post_view.PostProps;
}

class PostRoute extends react.Component<PostRouteProps,{}> {
	static fetchData(model: AppDataSource, params: {postId: string}) {
		var post = model.fetchPost(params.postId);

		return {
			title: post.title,
			post: post
		};
	}

	render() {
		return post_view.PostF(this.props.post);
	}
}

interface PostListRouteProps extends react_router.RouteProp {
	posts: post_list_view.PostListEntry[];
}

class PostListRoute extends react.Component<PostListRouteProps,{}> {
	static fetchData(model: AppDataSource) {
		return {
			posts: model.recentPosts(10)
		};
	}

	render() {
		return post_list_view.PostListF({
			posts: this.props.posts
		});
	}
}

interface TaggedPostsRouteProps {
	params: {
		tag: string;
	};
	posts: post_list_view.PostListEntry[];
}

class TaggedPostsRoute extends react.Component<TaggedPostsRouteProps,{}> {
	static fetchData(model: AppDataSource, params: {tag: string}) {
		return {
			title: `Posts tagged ${params.tag}`,
			posts: model.taggedPosts(params.tag)
		};
	}

	render() {
		return post_list_view.PostListF({
			posts: this.props.posts
		});
	}
}

var RouteF = react.createFactory(react_router.Route);
var DefaultRouteF = react.createFactory(react_router.DefaultRoute);

export var rootRoute = RouteF({name: 'home', path: '/', handler: BlogRoute},
	RouteF({name: 'post', path: '/posts/:postId', handler: PostRoute}),
	RouteF({name: 'tagged', path: '/posts/tagged/:tag', handler: TaggedPostsRoute}),
	DefaultRouteF({handler: PostListRoute})
);

