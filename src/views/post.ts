import react = require('react');
import react_router = require('react-router');
import style = require('ts-style');

import typography = require('../theme/typography');
import shared_theme = require('../theme/shared');

var theme = style.create({
	post: {
		mixins: [shared_theme.content],
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

export interface PostProps {
	title: string;
	date: Date;
	url: string;
	children?: react.ReactNode[];
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
const DisqusCommentListF = react.createFactory(DisqusCommentList);

class HypothesisEmbed extends react.Component<{},{}> {
  render() {
    var scriptSrc = 'https://hypothes.is/embed.js';
    return react.DOM.script({
      src: scriptSrc,
      async: true,
    });
  }
}
const HypothesisEmbedF = react.createFactory(HypothesisEmbed);

const LinkF = react.createFactory(react_router.Link);

export class Post extends react.Component<PostProps,{}> {
	render() {
		return react.DOM.div(style.mixin(theme.post),
		  LinkF(style.mixin(theme.post.title, {
			  to: this.props.url
		  }), this.props.title),
		  react.DOM.div(style.mixin(theme.post.date), this.props.date.toDateString()),
		  this.renderTagList(),
		  react.DOM.div(style.mixin(theme.post.content),
			  this.props.children
		  ),
      HypothesisEmbedF()
		);
	}

	private renderTagList() {
		return react.DOM.div(style.mixin(theme.post.tagList),
			this.props.tags.map((tagEntry) => {
				return LinkF(style.mixin(theme.post.tagList.tag, {
					to: tagEntry.indexUrl,
					key: `tag-${tagEntry.tag}`,
				}), tagEntry.tag);
			})
		);
	}
}

export var PostF = react.createFactory(Post);
