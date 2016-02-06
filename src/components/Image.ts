import assign = require('object-assign');
import react = require('react');

interface ImageProps {
	src?: string;
	width?: number;
	height?: number;
}

interface ImageState {
	zoomed?: boolean;
}

class Image extends react.Component<ImageProps, ImageState> {
	private containerStyle: Object;
	private zoomedStyle: Object;

	constructor(props: ImageProps) {
		super(props)

		this.state = {
			zoomed: false,
		};
	}

	componentDidMount() {
		var image = <HTMLImageElement>react.findDOMNode(this.refs['img']);
		var zoomedWidth = Math.min(screen.width, image.naturalWidth);
		var scale = zoomedWidth / image.width;
		var zoomedHeight = image.width * scale;

		var xOffset = (screen.width - zoomedWidth) / 2;
		var yOffset = (screen.height - zoomedHeight) / 2;

		this.zoomedStyle = {
			position: 'relative',
			transform: `scaleX(${scale}) scaleY(${scale})`,
			transformOrigin: '50% 50%'
		};

		this.containerStyle = {
			width: image.width,
			height: image.height
		};
	}

	render() {
		var defaultStyle = {
			transition: 'transform .3s ease-out'
		};
		return react.DOM.div({
			style: this.containerStyle
		},
			react.DOM.img(assign({}, this.props, {
				onClick: () => {
					this.setState({zoomed: !this.state.zoomed});
				},
				ref: 'img',
				style: assign({}, defaultStyle, this.state.zoomed ? this.zoomedStyle : {})
			}))
		);
	}
}

export = Image;
