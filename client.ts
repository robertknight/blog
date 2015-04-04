/// <reference path="typings/tsd.d.ts" />

import react = require('react');
import react_router = require('react-router');

import components = require('./components');
import data_source = require('./data_source');
import routes = require('./routes');
import scanner = require('./scanner');

require('whatwg-fetch');

function init(payload: SiteDataJson) {
	let componentLoader = new ComponentLoader();
	let jsonData = <SiteDataJson><any>payload;
	let appData = new data_source.DataSource(componentLoader, jsonData.config, jsonData.posts, jsonData.tags);

	var appElement = document.getElementById('app');
	react_router.run(<react_router.Route>routes.rootRoute, react_router.HistoryLocation, (handler, state) => {
		var props = routes.fetchRouteProps(appData, state);
		react.render(react.createElement(handler, props), appElement);
	});
}

interface SiteDataJson {
	config: scanner.SiteConfig;
	posts: scanner.PostContent[];
	tags: scanner.TagMap;
}

class ComponentLoader implements components.Loader {
	private catalog: {
		[name: string]: react.Component<{},{}>;
	};

	constructor() {
		this.catalog = require('./components/catalog');
	}

	load(name: string): react.Component<{},{}> {
		if (!this.catalog[name]) {
			console.error(`Unknown component: ${name}. Available components: ${Object.keys(this.catalog)}`);

			// fallback to a placeholder
			return null;
		}
		return this.catalog[name];
	}
}

declare var appRoot: string;
window.fetch(`${appRoot}/data.json`).then(res => {
	return res.json();
}).catch(err => {
	console.error(`Failed to load route data file: ${err}`);
	return {}
}).then(json => {
	if (!json) {
		return;
	}

	init(<SiteDataJson><any>json);
});


