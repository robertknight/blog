import react = require('react');
import style = require('ts-style');

import typography = require('../theme/typography');

var theme = style.create({
	post: {
		maxWidth: 600,
		paddingTop: 60,
		marginLeft: 'auto',
		marginRight: 'auto',
		fontFamily: 'Ubuntu',

		tagList: {
			marginTop: 10,
			marginBottom: 5,

			tag: {
				display: 'inline-block',
				textDecoration: 'none',
				borderRadius: 3,
				border: '1px solid #ccc',
				color: '#aaa',

				transition: 'background-color .2s ease-in',
				padding: 5,
				paddingTop: 2,
				paddingBottom: 2,
				cursor: 'pointer',

				':hover': {
					backgroundColor: '#eee'
				}
			}
		},
		
		title: {
			mixins: [typography.theme.fonts.title],
			display: 'block',
			marginBottom: 10,
			textDecoration: 'none'
		},

		date: {
			mixins: [typography.theme.fonts.date]
		},

		content: {
			mixins: [typography.theme.fonts.articleBody],
			marginTop: 30,
			marginBottom: 30
		}
	},

	commentBox: {
		marginTop: 30
	}
});

interface PostProps {
	title: string;
	date: Date;
	url: string;
	children?: react.ReactElement<{}>[];
	tags: {
		tag: string;
		indexUrl: string;
	}[];
}

interface DisqusProps {
	shortName: string;
}

class DisqusCommentList extends react.Component<DisqusProps,{}> {
	render() {
		var scriptSrc = 'https://' + this.props.shortName + '.disqus.com/embed.js';
		return react.DOM.div(style.mixin(theme.commentBox),
			react.DOM.div({id: 'disqus_thread'}),
			react.DOM.script({
				src: scriptSrc,
				async: true,
				type: 'text/javascript'
			})
		);
	}
}

var DisqusCommentListF = react.createFactory(DisqusCommentList);

export class Post extends react.Component<PostProps,{}> {
	render() {
		return react.DOM.div(style.mixin(theme.post),
		  react.DOM.a(style.mixin(theme.post.title, {
			  href: this.props.url
		  }), this.props.title),
		  react.DOM.div(style.mixin(theme.post.date), this.props.date.toDateString()),
		  this.renderTagList(),
		  react.DOM.div(style.mixin(theme.post.content),
			  this.props.children
		  ),
		  DisqusCommentListF({shortName: 'robertknight'})
		);
	}

	private renderTagList() {
		return react.DOM.div(style.mixin(theme.post.tagList),
			this.props.tags.map((tagEntry) => {
				return react.DOM.a(style.mixin(theme.post.tagList.tag, {
					href: tagEntry.indexUrl
				}), tagEntry.tag);
			})
		);
	}
}

export var PostF = react.createFactory(Post);
