import react = require('react');

interface CodeViewProps {
	code: string;
	language: string;
}

class CodeView extends react.Component<CodeViewProps,{}> {
	render() {
		return react.DOM.div({},
			this.props.code
		);
	}
}

export = CodeView;

