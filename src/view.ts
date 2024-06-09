import { makeProductPDF } from './makeProductPDF';
import { fonts } from './const';

/**
 * Generate PDF from HTML wooCommerce product page
 */
async function genPDF() {
	const args = {
		fonts,
	};
	const product2pdf = new makeProductPDF(args);
	product2pdf.generate().then(() => {
		document.getElementById('social-download').innerHTML = downloadIco;
		downloadButton.removeClass('loading');
	});
}

// on click trigger the PDf from HTML fn
const downloadButtons: NodeListOf<HTMLButtonElement> =
	document.querySelectorAll('.wp-block-vsge-save-pdf-button') || [];

for (const downloadButton of downloadButtons) {
	downloadButton.addEventListener('click', async (e) => {
		// Checking to see if the download button has the class of loading. If it does, it will stop the propagation of the event and return a console log of "please wait!"
		if (downloadButton.classList.contains('loading')) {
			e.stopPropagation();
			return console.log('please wait!');
		}
		downloadButton.classList.add('loading');

		await genPDF();
	});
}
