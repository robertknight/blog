/// <reference path="DefinitelyTyped/commander/commander.d.ts" />
/// <reference path="DefinitelyTyped/node/node.d.ts" />
/// <reference path="DefinitelyTyped/marked/marked.d.ts" />
/// <reference path="DefinitelyTyped/fs-extra/fs-extra.d.ts" />
/// <reference path="DefinitelyTyped/js-yaml/js-yaml.d.ts" />
/// <reference path="DefinitelyTyped/react/react.d.ts" />
/// <reference path="DefinitelyTyped/mustache/mustache.d.ts" />

/// <reference path="fs-extra.d.ts" />
/// <reference path="react-router.d.ts" />
/// <reference path="../node_modules/ts-style/dist/ts-style.d.ts" />

declare module 'mustache' {
	export = Mustache;
}

declare module 'object-assign' {
	function assign<T>(input: Object, ...updates: Object[]): T;
	export = assign;
}
