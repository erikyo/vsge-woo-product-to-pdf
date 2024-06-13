<?php
/**
 * Plugin Name: vsge-woo-product-to-pdf
 * Version: 0.1.0
 * Description: VSGE - mapbox block
 * Author:            codekraft
 * Text Domain:       vsge-woo-product-to-pdf
 * Domain Path:       languages/
 */

if ( ! defined( 'ABSPATH' ) ) exit;
if ( ! defined( 'VSGE_P2PDF_PATH' ) ) {
    define( 'VSGE_P2PDF_PATH', plugin_dir_path( __FILE__ ) );
}

add_action( 'init', function() {
    register_block_type( VSGE_P2PDF_PATH . '/build' );
} );

require VSGE_P2PDF_PATH . '/inc/index.php';