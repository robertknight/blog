import react = require('react');
import react_router = require('react-router');

import banner_view = require('./views/banner');
import post_view = require('./views/post');
import post_list_view = require('./views/post_list');

export interface AppDataSource {
	recentPosts(count: number): post_list_view.PostListEntry[];
	taggedPosts(tag: string): post_list_view.PostListEntry[];
	fetchPost(id: string): post_view.PostProps;
	fetchBannerInfo(): banner_view.BannerProps;
}

interface BlogRouteProps {
	banner: banner_view.BannerProps;
}

class BlogRoute extends react.Component<BlogRouteProps,{}> {
	static fetchData(model: AppDataSource) {
		return {
			banner: model.fetchBannerInfo()
		}
	}

	render() {
		return react.DOM.div({},
			banner_view.BannerF(this.props.banner),
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
		return {
			post: model.fetchPost(params.postId)
		}
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

