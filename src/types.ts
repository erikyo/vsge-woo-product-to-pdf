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
