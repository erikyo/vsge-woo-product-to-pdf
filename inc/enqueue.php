<?php

/**
 * edited generate schema function
 */
function the_product_data( $product = null ) {

    if ( ! is_object( $product ) ) {
        global $product;
    }

    if ( ! is_a( $product, 'WC_Product' ) || intval($product->get_price()) === 0 ) {
        return;
    }

    $shop_name = get_bloginfo( 'name' );
    $site_url  = site_url();
    $permalink = get_permalink( $product->get_id() );
    $custom_logo_id = get_theme_mod( 'custom_logo' );

    $markup = array(
        '@type'       => 'Product',
        '@id'         => $permalink . '#product', // Append '#product' to differentiate between this @id and the @id generated for the Breadcrumblist.
        'name'        => $product->get_name(),
        'slug'        => $product->get_slug(),
        'url'         => $permalink,
        'description' => wp_strip_all_tags( do_shortcode( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ) ),
        'brand'        => array(
            '@type' => 'Organization',
            'name'  => $shop_name,
            'url'   => $site_url,
            'image' => has_custom_logo() ? wp_get_attachment_image_src($custom_logo_id, 'full')[0] : ''
        )
    );

    $json = array (
        "@context" => "https://schema.org",
        "@graph" => $markup
    );

    if ( $markup ) {
        echo '<script id="productData" type="application/ld+json">' . wc_esc_json( wp_json_encode( $json, JSON_PRETTY_PRINT ), true ) . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
}

function vsge_generate_product_data() {
    if (!is_admin() && class_exists( 'woocommerce' ) && is_product()) {
        the_product_data();
    }
}
add_action( 'wp_footer', "vsge_generate_product_data", 1 );