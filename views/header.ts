import react = require('react');
import style = require('ts-style');

const TEXT_COLOR = '#eee';
const SOCIAL_LOGO_HEIGHT = 22;

var theme = style.create({
	topBanner: {
		backgroundColor: '#444',
		color: TEXT_COLOR,

		display: 'flex',
		flexDirection: 'row',
		alignContent: 'center',
		borderBottom: '1px solid #ddd',
		padding: 5,
		paddingTop: 10,
		paddingBottom: 10,

		' a': {
			textDecoration: 'none',
			color: TEXT_COLOR
		}
	},

	name: {
		fontSize: 18,
		lineHeight: SOCIAL_LOGO_HEIGHT + 'px'
	},

	sectionSeparator: {
		display: 'inline-block',
		borderLeft: '1px solid #bbb',
		marginLeft: 10,
		marginRight: 10
	},

	socialLinkImage: {
		height: SOCIAL_LOGO_HEIGHT,
		marginLeft: 5,
		marginRight: 5,
		opacity: 0.7,
		zIndex: 1,

		// FIXME: The GitHub logo looks awful during the hover transition
		// because anti-aliasing is lost
		transition: 'opacity .3s ease-in',

		':hover': {
			opacity: 1.0
		}
	}
}, __filename);

export interface SocialLinks {
	twitter: string;
	github: string;
	email: string;
}

export interface HeaderProps {
	name: string;
	photoUrl: string;
	socialLinks: SocialLinks;
	rootUrl: string;
}

function twitterUrl(id: string) {
	return `https://twitter.com/${id}`;
}

function githubUrl(id: string) {
	return `https://github.com/${id}`;
}

function mailLink(email: string) {
	return `mailto:${email}`;
}

/** Header displayed at the top of the blog with author
  * details.
  */
export class Header extends react.Component<HeaderProps, {}> {
	render() {
		var socialLinks: react.ReactNode[] = [];
		if (this.props.socialLinks.twitter) {
			socialLinks.push(react.DOM.a({
				href: twitterUrl(this.props.socialLinks.twitter),
				key: 'twitter'
			},
				react.DOM.img(style.mixin(theme.socialLinkImage, {src: '/twitter-white.png'}))
			));
		}
		if (this.props.socialLinks.github) {
			socialLinks.push(react.DOM.a({
				href: githubUrl(this.props.socialLinks.github),
				key: 'github'
			},
				react.DOM.img(style.mixin(theme.socialLinkImage, {src: '/github-white-120x120.png'}))
			));
		}
		if (this.props.socialLinks.email) {
			socialLinks.push(react.DOM.a({
				href: mailLink(this.props.socialLinks.email),
				key: 'email'
			},
				react.DOM.img(style.mixin(theme.socialLinkImage, {src: '/email-48x38.png'}))
			));
		}

		return react.DOM.div(style.mixin(theme.topBanner),
			react.DOM.span(style.mixin(theme.name),
				react.DOM.a({href: this.props.rootUrl}, this.props.name)
			),
			react.DOM.span(style.mixin(theme.sectionSeparator)),
			socialLinks
		);
	}
}

export var HeaderF = react.createFactory(Header);

