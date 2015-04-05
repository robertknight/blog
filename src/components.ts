import marked = require('marked');
import path = require('path');
import react = require('react');

var react_tools = require('react-tools');

export interface Loader {
	load(name: string): react.Component<{},{}>;
}

export function convertMarkdownToReactJs(content: string) {
	var jsx = marked(content.toString(), {}).replace(/\n/g, ' ');
	console.log('JSX output', jsx);
	jsx = '<div>' + jsx + '</div>';
	var js = 'return ' + react_tools.transform(jsx);
	return js;
}

function requiredComponentNames(contentSource: string) {
	var componentRegex = /React.createElement\(([A-z][A-Za-z]+)/g
	var match = componentRegex.exec(contentSource);
	var componentNames: string[] = [];
	while (match != null) {
		var componentClass = match[1];
		componentNames.push(componentClass);
		match = componentRegex.exec(contentSource);
	}
	return componentNames;
}

// takes the JS source for an expression which returns a React Element
// and evaluates it to create a React component with a render() function
// which returns the result
export function reactComponentFromSource(renderSource: string, loader: Loader) {
	var componentNames = requiredComponentNames(renderSource);
	var components: react.Component<any,any>[] = [];

	// load components required by the post
	componentNames.forEach((name) => {
		components.push(loader.load(name));
	});

	// create a semi-sandbox for running the post-generating
	// code
	var args = ['React'].concat(componentNames);
	var renderFunc = Function.apply({}, args.concat(renderSource));
	var postComponent = react.createClass({
		render: () => {
			return renderFunc.apply({}, [<any>react].concat(components))
		}
	});
	return postComponent;
}

