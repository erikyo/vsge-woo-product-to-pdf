import { beautifyArgs, mainColorHex, pageMargins, pageSize } from './const';
import { Attribute, FONTS, ProductApiResponse } from './types';
import beautify, { JSBeautifyOptions } from 'js-beautify';
import { ifElement, yyyymmdd } from './utils';
import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake';
import {
	Content,
	DynamicContent,
	Node,
	Style,
	StyleDictionary,
	TDocumentDefinitions,
} from 'pdfmake/interfaces';

type MediaImage = {
	logoImg: HTMLImageElement;
	mainImage: string;
	brandImage: string;
};

const metadataType: string[] = [
	'_cdmm_p_id',
	'_company',
	'brb_media_brochure',
	'brb_media_3d_model',
	'brb_media_3d_model_preview',
	'brb_media_manuals',
];

interface ParsedProductData {
	gtin: string;
	brandName: any;
	brandColor: string;
	comparison: { name: string; value: string[] }[] | undefined;
	address: any;
	description: string;
	mpn: string;
	media: string[];
	url: string;
	tags: string | undefined;
	approvals: string | undefined;
	name: string;
	relateds: number[];
	category: string;
	slug: string;
}

export const baseStyle: Style = {
	fontSize: 9,
	lineHeight: 1.2,
	columnGap: 20,
	font: 'Klavika',
};

export const mainStyle: StyleDictionary = {
	// Wrappers
	header: {
		margin: [ 0, 0, 0, 10 ],
	},

	// Product Title section
	productTitle: {
		fontSize: 16,
		bold: true,
		margin: [ 0, 15, 0, 0 ],
	},

	productSubTitle: {
		fontSize: 9,
		bold: false,
		margin: [ 0, 0, 0, 15 ],
	},

	// Product Attributes key - val
	props: {
		bold: true,
		fontSize: 9,
		lineHeight: 1.3,
	},

	propVal: {
		bold: false,
	},

	// Product image
	productImageWrapper: {
		height: pageSize.width / 2,
		margin: 15,
	},

	productImage: {
		alignment: 'center',
	},

	H2: {
		fontSize: 14,
		bold: true,
		margin: [ 0, 15, 0, 5 ],
	},

	H3: {
		fontSize: 12,
		bold: true,
		margin: [ 0, 15, 0, 5 ],
	},

	UL: {
		margin: [ 10, 2, 0, 2 ],
	},

	A: {
		color: '#0064bd',
		decoration: 'underline',
	},

	// Product Title section
	relatedTitle: {
		fontSize: 8,
		bold: true,
		lineHeight: 1.1,
	},
	relatedSubTitle: {
		fontSize: 7,
	},
};

export class makeProductPDF {
	date: Date;
	fonts: FONTS;
	/**
	 * the pdf content array
	 */
	pdfContent: Content = [];
	mediaImages: MediaImage | null = null;
	productData: ProductApiResponse;
	extraData: Record< string, any >;
	template: TDocumentDefinitions | null = null;
	productPDF: Record< string, any > | null = null;
	private defaultStyle: Style | undefined = undefined;
	private mainStyle: StyleDictionary | undefined = undefined;
	private filename: string;

	constructor( args: {
		fonts: FONTS;
		productData: ProductApiResponse;
		extraData: Record< string, any >;
	} ) {
		this.fonts = args.fonts;

		this.date = new Date();

		this.productData = args.productData;

		this.extraData = args.extraData;

		this.defaultStyle = baseStyle;
		this.mainStyle = mainStyle;

		this.filename = `${ this.productData.slug }-${ yyyymmdd(
			this.date
		) }.pdf`;
	}

	parse() {
		this.productPDF = this.parsePageData();
	}

	build() {
		this.template = this.buildTemplate();
	}

	async generate() {
		//const pdfMake = await import('pdfmake');

		const pdfDocGenerator: TCreatedPdf = pdfMake.createPdf(
			this.template,
			{},
			this.fonts
		);

		return pdfDocGenerator.getBlob( ( blob: Blob | MediaSource ) => {
			const link = document.createElement( 'a' );

			const blobURL = URL.createObjectURL( blob );
			link.download = this.filename;
			link.target = '_blank';
			link.href = blobURL;
			link.click();
			return true;
		} );
	}

	async process() {
		this.parse();
		this.build();
		return await this.generate();
	}

	generateLink( url: string ): Content | DynamicContent | undefined {
		return {
			stack: [
				{
					qr: url,
					fit: '55',
					foreground: '#333333',
					version: 5,
					margin: [ 0, 0, 0, 10 ],
				},
				{
					text: url,
					style: 'A',
				},
			],
			margin: [ 0, 40, 0, 0 ],
			alignment: 'center',
		};
	}

	parsePageData(): ParsedProductData {
		const parsedMetaData = {};
		this.productData.meta_data.forEach( ( item: any ) => {
			parsedMetaData[ item.key ] = item.value;
		} );
		return {
			url: document.location.toString(),
			name: this.productData.name,
			slug: this.productData.slug,
			mpn: this.productData.sku,
			gtin: this.productData?.sku as string,
			category: this.productData.categories
				.map( ( item ) => item.name )
				.join( ', ' ),
			tags: this.productData.tags
				?.map( ( item ) => item.name )
				.join( ', ' ),
			approvals: this.productData.approvals
				?.map( ( item ) => item.name )
				.join( ', ' ),
			brandColor: mainColorHex || '#222222',
			brandName: this.extraData.brand.name,
			description: beautify.html(
				this.productData.description,
				beautifyArgs as JSBeautifyOptions
			),
			media: this.productData.images.map( ( item ) => item.src ),
			relateds: this.productData.related,
			comparison: this.productData.attributes?.map( ( i ) => {
				return { name: i.name, value: i.options };
			} ),
			address: this.extraData.brand.address,
			...parsedMetaData,
		};
	}

	// collect term data
	parseAttributes( props: Attribute[] ) {
		const formattedProps: {
			text: ( string | { style: string; text: string } )[];
		}[] = [];
		props.forEach( ( e ) => {
			if ( ! e.name ) {
				return;
			}
			formattedProps.push( {
				text: [
					e.name,
					{
						text: Array.isArray( e.options )
							? e.options.join( ', ' )
							: e.options,
						style: 'propVal',
					},
				],
			} );
		} );
		return formattedProps;
	}

	toSlug( title: string ): string {
		return title
			.toLowerCase()
			.replace( /[^\w ]+/g, '' )
			.replace( / +/g, '_' );
	}

	parseTagAttr( tag: { attributes: string | any[] } ) {
		if ( tag.attributes && tag.attributes.length ) {
			const attributes = {};
			for ( let i = 0; i < tag.attributes.length; i++ ) {
				attributes[ tag.attributes[ i ].nodeName ] =
					tag.attributes[ i ].nodeValue;
			}
			return attributes;
		}
		return false;
	}

	//Recursively loop through DOM elements and assign properties to object
	treeHTML(
		element: { nodeName: any; childNodes: any },
		object: {
			type?: any;
			content?: any;
			bold?: any;
			text?: any;
			italics?: any;
		}
	) {
		object.type = element.nodeName;

		const nodeList = element.childNodes;

		if ( nodeList !== null && nodeList.length ) {
			object.content = [];

			for ( let i = 0; i < nodeList.length; i++ ) {
				if ( nodeList[ i ].nodeType === 3 ) {
					// nodeType 3	Text | Represents textual content in an element or attribute
					if ( object.type === 'STRONG' || object.type === 'B' ) {
						delete object.type;
						delete object.content;
						object.bold = true;
						object.text = nodeList[ i ].nodeValue;
					} else if ( object.type === 'EM' || object.type === 'I' ) {
						delete object.type;
						delete object.content;
						object.italics = true;
						object.text = nodeList[ i ].nodeValue;
					} else if ( nodeList[ i ].nodeValue !== ' ' ) {
						if (
							object.content[ object.content.length - 1 ] &&
							typeof object.content[
								object.content.length - 1
							] === 'string' &&
							typeof nodeList[ i ].nodeValue === 'string'
						) {
							object.content[ object.content.length - 1 ] =
								object.content[ object.content.length - 1 ] +
								nodeList[ i ].nodeValue;
						} else {
							object.content.push( {} );
							object.content[ object.content.length - 1 ] =
								nodeList[ i ].nodeValue;
						}
					}
				} else {
					if ( nodeList[ i ].nodeName === 'BR' ) {
						object.content[ object.content.length - 1 ] =
							object.content[ object.content.length - 1 ] + '\n';
					}

					if (
						nodeList[ i ].nodeName !== 'NOSCRIPT' &&
						nodeList[ i ].nodeName !== '#comment' &&
						nodeList[ i ].nodeName !== 'BR'
					) {
						object.content.push( {} );
					} else {
						continue;
					}

					// collect attributes
					let attributes: {};
					if (
						( attributes = this.parseTagAttr( nodeList[ i ] ) ) !==
						false
					) {
						object.content[ object.content.length - 1 ].attrs =
							attributes;
					}

					if (
						nodeList[ i ].nodeType === 3 &&
						nodeList[ i ].length <= 1
					) {
						// is simple text that we can store as content
						object.content[ object.content.length - 1 ].text =
							nodeList[ i ].nodeValue;
						object.content[ object.content.length - 1 ].class =
							nodeList[ i ].classList;
					} else {
						// isn't a text node so recursively we need to look inside the tag
						this.treeHTML(
							nodeList[ i ],
							object.content[ object.content.length - 1 ]
						);
					}
				}
			}
		}
	}

	mapDOM( element: string | Element, json: boolean ) {
		const treeObject = {};

		// If string convert to document Node
		if ( typeof element === 'string' ) {
			let docNode;

			const parser = new DOMParser();
			docNode = parser.parseFromString( element, 'text/html' ); // or "text/xml"

			element = docNode.body;
		}

		this.treeHTML( element as Element, treeObject );

		return json ? JSON.stringify( treeObject ) : treeObject;
	}

	formatMedia( elements, sectionTitle = 'Media' ) {
		const mediaTree = [];

		const sectionTitleSlug = this.toSlug( sectionTitle );

		elements.forEach( function ( el, i ) {
			const media = {
				title: el.content[ 0 ].content[ 0 ].content.filter(
					( e ) => e.type === 'H3'
				),
				subtitle: el.content[ 0 ].content[ 0 ].content.filter(
					( e ) => e.type === 'H6'
				),
				data: el.content[ 0 ].content[ 0 ].content.filter(
					( e ) => e.type === 'IMG'
				),
				href: el.content[ 0 ].content.filter( ( e ) => e.type === 'A' ),
			};

			const mediaImages = {
				layout: 'noBorders',
				margin: [ 0, 0, 0, 5 ],
				table: {
					widths: [ 45, '*', 50 ],
					height: 40,
					alignment: 'center',
					body: [
						[
							{
								stack: [
									{
										fit: [ 40, 40 ],
										image:
											'mediaImage_' +
											sectionTitleSlug +
											'_' +
											i,
									},
								],
								margin: [ 5, 0, 5, 0 ],
								fillColor: '#f3f3f3',
							},
							{
								stack: [
									{
										text: media.title[ 0 ].content[ 0 ],
										style: 'relatedTitle',
									},
									{
										text: media.subtitle[ 0 ].content[ 0 ],
										style: 'relatedSubTitle',
									},
								],
								alignment: 'left',
								margin: [ 5, 5, 0, 0 ],
							},
							{
								qr: media.href[ 0 ].attrs.href,
								fit: '50',
								foreground: '#333',
								version: 6,
								alignment: 'right',
							},
						],
					],
				},
			};

			mediaTree.push( mediaImages );

			// adds the image src to media image collection
			mediaImages[ 'mediaImage_' + sectionTitleSlug + '_' + i ] =
				media.data[ 0 ].attrs[ 'data-src' ];
		} );
		return mediaTree;
	}

	formatTitle( sectionTitle: string ) {
		return { text: sectionTitle, style: 'H2', pageBreak: 'before' };
	}

	formatRelateds( elements: Content ) {
		const relatedsTree: Record< string, any > = [];

		elements.shift(); // remove the first item because it's the section main title

		elements.forEach( function ( subEl: {
			content: { content: any[] }[];
		} ) {
			const sectionSubTitleSlug = subEl.content[ 0 ].content[ 0 ]
				.toLowerCase()
				.replace( /[^\w ]+/g, '' )
				.replace( / +/g, '_' );
			relatedsTree[ sectionSubTitleSlug ] = [];
			relatedsTree[ sectionSubTitleSlug ].push( {
				text: subEl.content[ 0 ].content[ 0 ],
				style: 'H3',
			} );

			// the ul that contains products
			subEl.content[ 1 ].content.forEach( function ( el, i ) {
				const related = {
					layout: 'noBorders',
					margin: [ 0, 0, 0, 5 ],
					table: {
						widths: [ 45, '*', 45 ],
						height: 40,
						alignment: 'center',
						body: [
							[
								{
									stack: [
										{
											fit: [ 40, 40 ],
											image:
												'mediaImage_' +
												sectionSubTitleSlug +
												'_' +
												i,
										},
									],
									margin: [ 5, 0, 5, 0 ],
									fillColor: '#f3f3f3',
								},
								{
									stack: [
										{
											text: el.title,
											style: 'relatedTitle',
										},
										{
											text: el.subtitle,
											style: 'relatedSubTitle',
										},
									],
									alignment: 'left',
									margin: [ 5, 5, 0, 0 ],
								},
								{
									qr: el.href,
									fit: '50',
									foreground: '#333',
									version: 6,
									alignment: 'right',
								},
							],
						],
					},
				};

				relatedsTree[ sectionSubTitleSlug ].push( related );

				this.mediaImages[
					'mediaImage_' + sectionSubTitleSlug + '_' + i
				] = related.data[ 0 ].attrs[ 'data-src' ];
			} );
		} );

		return relatedsTree;
	}

	colModel = function (
		column1: never[],
		column2: never[],
		breakPage: boolean
	) {
		return [
			{
				columns: [
					{
						stack: column1,
					},
					{
						stack: column2 || '',
					},
				],
				pageBreak: breakPage ? 'after' : null,
			},
		];
	};

	mapToColumns(
		elements: Node[],
		itemPerColumn: number
	): Record< string, any > {
		const columns = [];
		const formattedColumns = [];

		if ( elements[ 0 ].text ) {
			formattedColumns.push( elements.splice( 0, 1 ) );
		}

		if ( ! elements.length ) {
			// no elements
			return {};
		} else if ( elements.length < itemPerColumn ) {
			// if there are less elements than the number of items allowed per column we can split the content in two half columns
			columns.push(
				elements.splice( 0, Math.ceil( elements.length / 2 ) ),
				elements.splice( 0, elements.length )
			); // the number of items per column
		} else {
			// add the items to columns while the columns are full filled
			while ( elements.length > itemPerColumn ) {
				columns.push( elements.splice( 0, itemPerColumn ) );
			}

			// adds the remaining items
			if ( columns.length % 2 === 0 ) {
				// to a multiple columns
				columns.push(
					elements.splice( 0, Math.ceil( elements.length / 2 ) ),
					elements.splice( 0, elements.length )
				);
			} else {
				// to a single column
				columns.push( elements.splice( 0, elements.length ) );
			}
		}

		while ( columns.length > 0 ) {
			formattedColumns.push(
				this.colModel(
					columns.splice( 0, 1 ),
					columns.splice( 0, 1 ),
					columns.length > 0
				)
			);
		}

		return formattedColumns;
	}

	mapComparisonToTable( elements: Record< string, any > ) {
		const comparisonTreeHeader = [];
		let comparisonTree = [];
		const rows: Record< string, any > = [];
		rows[ 0 ] = [];
		const rowsTableWidth = [ 120 ];

		// the table header
		if ( typeof elements[ 0 ].content[ 0 ] === 'string' ) {
			comparisonTreeHeader.push(
				elements[ 1 ].content[ 0 ].content.splice( 0, 1 )
			);
		}

		comparisonTreeHeader[ 0 ][ 0 ].content.forEach( function ( e, i ) {
			if ( typeof e.content[ i ] === 'string' ) {
				rows[ 0 ].push( {} );
				//rows[0].push({
				//   text: e.content[0],
				//  bold: true
				// });
			} else {
				const cellContent = e.content[ 0 ].content.filter(
					( e ) => e.type === 'SPAN'
				);
				rows[ 0 ].push( {
					alignment: 'center',
					stack: [
						{
							fit: [ 40, 40 ],
							margin: 3,
							image:
								'mediaImage_' + this.productData.slug + '_' + i,
						},
						{
							text: cellContent[ 0 ].content[ 0 ],
							bold: true,
							alignment: i === 0 ? 'left' : 'center',
						},
					],
				} );

				this.mediaImages[
					'mediaImage_' + this.productData.slug + '_' + i
				] = e.content[ 0 ].content[ 0 ].attrs[ 'data-src' ];
			}
			rowsTableWidth.push(
				460 / comparisonTreeHeader[ 0 ][ 0 ].content.length < 200
					? 460 / comparisonTreeHeader[ 0 ][ 0 ].content.length
					: 150
			);
		} );

		for ( let r = 1; r < elements[ 1 ].content[ 0 ].content.length; r++ ) {
			rows[ r ] = [];
			for (
				let c = 0;
				c < elements[ 1 ].content[ 0 ].content[ 0 ].content.length;
				c++
			) {
				rows[ r ].push( {
					text: elements[ 1 ].content[ 0 ].content[ r ].content[ c ]
						.content[ 0 ],
					bold:
						elements[ 1 ].content[ 0 ].content[ r ].content[ c ]
							.attrs || false,
					alignment: c === 0 ? 'left' : 'right',
				} );
			}
		}

		comparisonTree = {
			table: {
				widths: rowsTableWidth,
				body: rows,
			},
		};

		return comparisonTree;
	}

	private generateHeder(): Content | DynamicContent | undefined {
		return {
			style: 'header',
			layout: 'noBorders',
			table: {
				widths: [ '50%', '50%' ],
				body: [
					[
						{
							style: 'productImageWrapper',
							fillColor: '#f3f3f3',
							stack: [
								{
									image: 'mainImage',
									fit: [
										( pageSize.width - 50 ) / 2,
										( pageSize.width / 2 ) * 0.66,
									], // 3:2 ratio
									style: 'productImage',
								},
							],
						},
						{
							stack: [
								{
									text: this.productData.name,
									style: 'productTitle',
								},
								{
									text: this.productData.description,
									style: 'productSubTitle',
								},
								{
									style: 'props',
									stack: [
										this.parseAttributes(
											this.productData.attributes
										),
									],
								},
							],
							margin: [ 10, 0, 0, 0 ],
						},
					],
				],
				// optional space between columns
				columnGap: 0,
			},
		};
	}

	private header() {
		return [
			{
				layout: 'noBorders',
				fillColor: this.extraData.brand.color,
				table: {
					heights: 25,
					widths: [ '100%' ],
					body: [
						[
							{
								image: 'mainImage',
								fit: [ 45, 15 ],
								margin: [ 20, 5, 0, 0 ],
								alignment: 'left',
							},
						],
					],
					columnGap: 0,
				},
			},
		];
	}

	private pageBreakBefore(
		currentNode: { headlineLevel: number },
		followingNodesOnPage: string | any[]
	): TDocumentDefinitions[ 'pageBreakBefore' ] {
		return (
			currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0
		);
	}

	private footer(
		currentPage: number,
		pageCount: number
	): {
		margins: number[];
		fontSize: 6;
		text: ( { text: string } | { text: string; bold: boolean } | any )[];
		alignment: 'center';
	}[] {
		return [
			{
				fontSize: 6,
				alignment: 'center',
				margins: [ 20, 5, 20, 0 ],
				text: [
					{
						text:
							currentPage.toString() + ' of ' + pageCount + '\n',
					},
					{
						text:
							this.extraData.companyName +
							' ©' +
							this.date.getFullYear() +
							' - ',
						bold: true,
					},
					this.extraData.address,
				],
			},
		];
	}

	buildTemplate(): TDocumentDefinitions {
		return {
			// a string or { width: number, height: number }
			pageSize,

			// by default, we use portrait, you can change it to landscape if you wish
			pageOrientation: 'portrait',

			// [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
			pageMargins,

			info: {
				title: this.productData.slug,
				author: this.extraData.brand.name,
				subject: this.productData.name,
				keywords: `${ this.productData.name } ${ this.productData.name }`,
			},

			header: this.generateHeder(),
			footer: this.generateLink( this.extraData.url ),

			content: this.pdfContent,
			//images: {}, // this.mediaImages
			defaultStyle: this.defaultStyle,
			styles: this.mainStyle,
			pageBreakBefore: this.pageBreakBefore,
		};
	}
}
