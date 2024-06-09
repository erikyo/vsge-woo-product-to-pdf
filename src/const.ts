// THE PDF SETTINGS PASSED FROM WP ENQUEUE
export const assetsPath = 'assets';
export const mainColorHex = '#f00';

export const fonts: Record< string, Record< string, string > > = {
	Klavika: {
		normal: assetsPath + '/assets/fonts/klavika-light-webfont.ttf',
		italics: assetsPath + '/assets/fonts/klavika-light-italic-webfont.ttf',
		bold: assetsPath + '/assets/fonts/klavika-medium-webfont.ttf',
		bolditalics: assetsPath + '/assets/fonts/klavika-bold-webfont.ttf',
	},
};

export const ProductPageTabs = [
	'description',
	'relateds',
	'media',
	'comparison',
];

export const beautifyArgs = {
	indent_size: 0,
	indent_char: '',
	eol: '',
	end_with_newline: false,
	preserve_newlines: false,
	max_preserve_newlines: 0,
	wrap_line_length: 0,
	wrap_attributes: 'auto',
};

// convert millimeters to points (the ratio is 2.835)
export const mmToPoints = ( val ) => val * 2.835;

export const pageSize = {
	width: mmToPoints( 210.0 ),
	height: mmToPoints( 297.0 ),
};
export const pageMargins = [ 20, 40, 20, 30 ];
