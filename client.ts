import react = require('react');
import react_router = require('react-router');
import routes = require('./routes');

var appElement = document.getElementById('app');
react_router.run(<react_router.Route>routes, react_router.HistoryLocation, (handler, state) => {
	react.render(react.createElement(handler, {params: state.params}), appElement);
});
