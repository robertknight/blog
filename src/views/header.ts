import react = require('react');
import react_router = require('react-router');
import style = require('ts-style');

const TEXT_COLOR = '#eee';
const SOCIAL_LOGO_HEIGHT = 22;

const LinkF = react.createFactory(react_router.Link);

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
	private imageUrl(name: string) {
		return `${this.props.rootUrl}/theme/${name}.png`;
	}

	private renderSocialLink(id: string, url: string, image: string) {
		const imgSrc = `${this.props.rootUrl}/theme/images/${image}.png`;
		return react.DOM.a({
			href: url,
			key: id
		}, react.DOM.img(style.mixin(theme.socialLinkImage, {src: imgSrc})));
	}

	render() {
		var socialLinks: react.ReactNode[] = [];
		if (this.props.socialLinks.twitter) {
			socialLinks.push(this.renderSocialLink('twitter', twitterUrl(this.props.socialLinks.twitter),
			  'twitter-white'));
		}
		if (this.props.socialLinks.github) {
			socialLinks.push(this.renderSocialLink('github', githubUrl(this.props.socialLinks.github),
			  'github-white-120x120'));
		}
		if (this.props.socialLinks.email) {
			socialLinks.push(this.renderSocialLink('email', mailLink(this.props.socialLinks.email),
			  'email-48x38'));
		}

		return react.DOM.div(style.mixin(theme.topBanner),
			react.DOM.span(style.mixin(theme.name),
				LinkF({to: this.props.rootUrl + '/'}, this.props.name)
			),
			react.DOM.span(style.mixin(theme.sectionSeparator)),
			socialLinks
		);
	}
}

export var HeaderF = react.createFactory(Header);

