export interface ProductData {
	url: string;
	name: string;
	slug: string;
	brandColor: string;
	brandName: string;
	description?: Element;
	media?: Element;
	relateds?: Element;
	comparison?: Element;
	mediaImages?: {
		mainImage?: string;
		logoImg?: HTMLImageElement;
		brandImage?: string;
	};
	address: string;
	props: string[][];
	images: string[];
}

export interface WebpageData {
	description: string | null;
	media: string | null;
	relateds: string | null;
	comparison: string | null;
}

export type FONTS = Record<string, Record<string, string>>;

export interface ProductApiResponse {
	id: number;
	name: string;
	slug: string;
	permalink: string;
	date_created: Date | string;
	date_created_gmt: Date | string;
	date_modified: Date | string;
	date_modified_gmt: Date | string;
	type: string;
	status: string;
	featured: boolean;
	catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
	description: string;
	short_description: string;
	sku: string;
	price: string;
	regular_price: string;
	sale_price: string;
	date_on_sale_from: Date | string;
	date_on_sale_from_gmt: Date | string;
	date_on_sale_to: Date | string;
	date_on_sale_to_gmt: Date | string;
	on_sale: boolean;
	purchasable: boolean;
	total_sales: number;
	virtual: boolean;
	downloadable: boolean;
	downloads: string[];
	download_limit: -1;
	download_expiry: -1;
	external_url: string;
	button_text: string;
	tax_status: string;
	tax_class: string;
	manage_stock: false;
	stock_quantity: null;
	backorders: 'no' | 'notify' | 'yes';
	backorders_allowed: false;
	backordered: false;
	low_stock_amount: null;
	sold_individually: false;
	weight: string;
	dimensions: {
		length: string;
		width: string;
		height: string;
	};
	shipping_required: true;
	shipping_taxable: true;
	shipping_class: string;
	shipping_class_id: number;
	reviews_allowed: true;
	average_rating: string;
	rating_count: number;
	upsell_ids: number[];
	cross_sell_ids: number[];
	parent_id: number;
	purchase_note: string;
	categories: {
		id: number;
		name: string;
		slug: string;
	}[];
	tags: {
		id: number;
		name: string;
		slug: string;
	}[];
	images: {
		id: number;
		date_created: Date | string;
		date_created_gmt: Date | string;
		date_modified: Date | string;
		date_modified_gmt: Date | string;
		src: string;
		name: string;
		alt: string;
	}[];
	attributes: {
		id: number;
		name: string;
		slug: string;
		position: number;
		visible: boolean;
		variation: boolean;
		options: string[];
	}[];
	variations: {
		id: number;
		date_created: Date | string;
		date_created_gmt: Date | string;
		date_modified: Date | string;
		date_modified_gmt: Date | string;
		purchase_price: string;
		sale_price: string;
		regular_price: string;
		permalink: string;
		variation_id: number;
	}[];
	default_attributes: unknown[];
	price_html: string;
	related_ids: number[];
	meta_data: {
		id: number;
		key: string;
		value: string;
	}[];
	_links: {
		self: {
			href: string;
		}[];
		collection: {
			href: string;
		}[];
	};
	lang: string;
	translations: Record<string, number>;
}
