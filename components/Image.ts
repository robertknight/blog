import react = require('react');

interface ImageProps {
	src?: string;
	width?: number;
	height?: number;
}

class Image extends react.Component<ImageProps,{}> {
	render() {
		return react.DOM.img(this.props);
	}
}

export = Image;
