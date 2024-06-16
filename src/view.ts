import { makeProductPDF } from './makeProductPDF';
import { fonts } from './const';
import apiFetch from '@wordpress/api-fetch';

const endpoint = '/wc/v3/products';
/**
 * Get product data using the WooCommerce REST API
 * @param id
 */
async function getProductDataset( id: number ) {
	return await apiFetch( {
		path: `${ endpoint }/${ id }`,
	} ).then( ( result ) => result );
}

/**
 * Generate PDF from HTML wooCommerce product page
 * @param args
 */
async function genPDF( args ) {
	const product2pdf = new makeProductPDF( {
		fonts,
		productData: args,
		extraData: ExtraProductData as Record< string, any >,
	} );

	product2pdf.parse();

	return await product2pdf.generate();
}

// on click trigger the PDf from HTML fn
const downloadButtons: NodeListOf< HTMLButtonElement > =
	document.querySelectorAll( '.wp-block-vsge-save-pdf-button' ) || [];

for ( const downloadButton of downloadButtons ) {
	downloadButton.addEventListener( 'click', async ( e ) => {
		const productData = await getProductDataset(
			Number( downloadButton.dataset.productId )
		);

		// Checking to see if the download button has the class of loading. If it does, it will stop the propagation of the event and return a console log of "please wait!"
		if ( downloadButton.classList.contains( 'loading' ) ) {
			e.stopPropagation();
			return console.log( 'please wait!' );
		}

		// Add the loading class to the download button
		downloadButton.classList.add( 'loading' );

		genPDF( productData ).then( () => {
			downloadButton.classList.remove( 'loading' );
			console.log( 'PDF generated!' );
		} );
	} );
}
