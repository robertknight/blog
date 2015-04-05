import highlights = require('highlight.js');
import marked = require('marked');
import path = require('path');
import react = require('react');

var react_tools = require('react-tools');

export interface Loader {
	load(name: string): react.Component<{},{}>;
}

export function convertMarkdownToReactJs(content: string) {
	const markedOptions = {
		highlight: function(code: string, lang: string) {
			// add the 'hljs' class for use with the current highlights.js
			// theme
			let markedUpCode = `<div class="hljs">${highlights.highlightAuto(code).value}</div>`;

			// the JSX transform will lose new lines in <pre> blocks,
			// so we replace these with line-break tags up-front
			markedUpCode = markedUpCode.replace(/\n/g, '<br/>');

			return markedUpCode;
		}
	};
	let jsx = marked(content.toString(), markedOptions)
	  .replace(/\n/g, ' ')

	  // escape chars which are specially interpreted by
	  // JSX
	  .replace(/\{/g, '&#123;')
	  .replace(/\}/g, '&#125;')

	  // replace 'class' attributes added by marked with the 'className'
	  // prop which JSX/React recognize instead
	  .replace(/class=/g, 'className=');

	// wrap content in a root tag to make it valid JSX
	jsx = `<div>${jsx}</div>`;

	return `return ${react_tools.transform(jsx)}`;
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

