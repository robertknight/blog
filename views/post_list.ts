import react = require('react');
import style = require('ts-style');

import typography = require('../theme/typography');
import shared_theme = require('../theme/shared');

var theme = style.create({
	postList: {
		mixins: [shared_theme.content],

		entry: {
			title: {
				mixins: [typography.theme.fonts.title],

				display: 'block',
				textDecoration: 'none',
				marginBottom: 5
			},
			date: {
				mixins: [typography.theme.fonts.date]
			},
			snippet: {
				mixins: [typography.theme.fonts.articleBody]
			}
		},

		entrySeparator: {
			borderBottom: '1px solid #ccc',
			paddingBottom: 30,
			marginBottom: 30
		},

		readMoreLink: {
			display: 'inline-block',
			textDecoration: 'none',
			borderRadius: 10,
			border: '1px solid #ccc',
			padding: 5,
			paddingLeft: 15,
			paddingRight: 15,
			transition: 'background-color .2s ease-in',

			':hover': {
				backgroundColor: '#eee',
			}
		}
	}
});

export interface PostListEntry {
	title: string;
	date: Date;
	snippet: react.ReactNode;
	url: string;
}

export interface PostListProps {
	posts: PostListEntry[];
}

export class PostList extends react.Component<PostListProps,{}> {
	render() {
		var posts = this.props.posts.map((post, index) => {
			var postStyles = [<{}>theme.postList.entry];
			if (index < this.props.posts.length - 1) {
				postStyles.push(theme.postList.entrySeparator);
			}

			return react.DOM.div(style.mixin(postStyles, {
				key: post.title
			}),
				react.DOM.a(style.mixin(theme.postList.entry.title, {
					href: post.url
				}), post.title),
				react.DOM.div(style.mixin(theme.postList.entry.date), post.date.toDateString()),
				react.DOM.div(style.mixin(theme.postList.entry.snippet), post.snippet),
				react.DOM.a(style.mixin(theme.postList.readMoreLink, {
					href: post.url
				}), 'Continue reading →')
			);
		});

		return react.DOM.div(style.mixin(theme.postList),
			posts
		);
	}
}

export var PostListF = react.createFactory(PostList);

