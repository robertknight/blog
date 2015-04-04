import react = require('react');

interface CodeViewProps {
	children: string;
	language: string;
}

class CodeView extends react.Component<CodeViewProps,{}> {
	render() {
		return react.DOM.div({},
			this.props.children
		);
	}
}

export = CodeView;

