import style = require('ts-style');

export var theme = style.create({
	fonts: {
		title: {
			color: 'rgba(0,0,0,0.87)',
			fontWeight: 700,
	   		fontSize: 32
		},

	 	date: {
			color: '#666',
	   		fontSize: 14
		},

	    articleBody: {
			lineHeight: 1.8,
	   		color: 'rgba(0,0,0,0.76)'
		}
	}
});
