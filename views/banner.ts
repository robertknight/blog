import react = require('react');
import style = require('ts-style');

var theme = style.create({
	topBanner: {
		borderBottom: '1px solid #ddd'
	},

	name: {
		fontSize: 24
	},

	nameSeparator: {
		borderLeft: '1px solid #bbb'
	}

});

interface SocialLinks {
	twitter: string;
	github: string;
}

interface BannerProps {
	name: string;
	photoUrl: string;
	socialLinks: SocialLinks;
}

function twitterUrl(id: string) {
	return `https://twitter.com/${id}`;
}

function githubUrl(id: string) {
	return `https://github.com/${id}`;
}

/** Banner displayed at the top of the blog with author
  * details.
  */
export class Banner extends react.Component<BannerProps, {}> {
	render() {
		var socialLinks: react.ReactNode[] = [];
		if (this.props.socialLinks.twitter) {
			socialLinks.push(react.DOM.a({href: twitterUrl(this.props.socialLinks.twitter)},
				`@${this.props.socialLinks.twitter}`
			));
		}
		if (this.props.socialLinks.github) {
			socialLinks.push(react.DOM.a({href: githubUrl(this.props.socialLinks.github)}),
				'GitHub'
			);
		}

		return react.DOM.div(style.mixin(theme.topBanner),
			react.DOM.span(style.mixin(theme.name)),
			react.DOM.span(style.mixin(theme.nameSeparator)),
			socialLinks
		);
	}
}

