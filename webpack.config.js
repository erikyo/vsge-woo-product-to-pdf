const path = require('path');

const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,
	resolve: {
		...defaultConfig.resolve,
		fallback: {
			stream: false,
			zlib: false,
			fs: false,
			util: false,
			'file-saver': false,
		},
	},
};
