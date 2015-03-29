import react = require('react');
import react_router = require('react-router');

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
	}
}

class PostListRoute extends react.Component<{},{}> {
	render() {
		return react.DOM.div({}, 'List of posts goes here');
	}
}

interface TaggedPostsRouteProps {
	params: {
		tag: string;
	};
}

class TaggedPostsRoute extends react.Component<TaggedPostsRouteProps,{}> {
	render() {
		return react.DOM.div({}, `List of posts tagged ${this.props.params.tag} here`);
	}
}


class PostRoute extends react.Component<PostRouteProps,{}> {
	render() {
		return react.DOM.div({}, `This post is ${this.props.params.postId}`);
	}
}

var RouteF = react.createFactory(react_router.Route);
var DefaultRouteF = react.createFactory(react_router.DefaultRoute);

var appRoute = RouteF({name: 'home', path: '/', handler: BlogRoute},
	RouteF({name: 'post', path: '/posts/:postId', handler: PostRoute}),
	RouteF({name: 'tagged', path: '/posts/tagged/:tag', handler: TaggedPostsRoute}),
	DefaultRouteF({handler: PostListRoute})
);

export = appRoute;

