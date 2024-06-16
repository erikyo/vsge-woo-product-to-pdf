<?php

/**
 * edited generate schema function
 */
function the_product_data( $product = null ) {

    if ( ! is_object( $product ) ) {
        global $product;
    }

    if ( ! is_a( $product, 'WC_Product' ) ) {
        return;
    }

    $shop_name = get_bloginfo( 'name' );
    $site_url  = site_url();
    $custom_logo_id = get_theme_mod( 'custom_logo' );

    $json = array (
        "data" => $product,
            'brand'        => array(
                'name'  => $shop_name,
                'url'   => $site_url,
                'image' => has_custom_logo() ? wp_get_attachment_image_src($custom_logo_id, 'full')[0] : ''
            )
    );

    if ( $json ) {
        echo '<script id="ExtraProductData">var ExtraProductData =' . wc_esc_json( wp_json_encode( $json, JSON_PRETTY_PRINT ), true ) . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
}

function vsge_generate_product_data() {
    if (!is_admin() && class_exists( 'woocommerce' ) && is_product()) {
        the_product_data();
    }
}
add_action( 'wp_footer', "vsge_generate_product_data", 1 );

function register_rest_field_approvals() {
    register_rest_field('product', "approvals",
        array( "get_callback" => function ($post) {
            return wp_get_post_terms( $post['id'], 'product_approvals');
        } )
    );
}
add_action( 'rest_api_init', 'register_rest_field_approvals');


function register_rest_field_application() {
    register_rest_field('product', "application",
        array( "get_callback" => function ($post) {
            return wp_get_post_terms( $post['id'], 'product_application');
        } )
    );
}
add_action( 'rest_api_init', 'register_rest_field_application');


function register_rest_field_linked_product() {
    $types = array( "accessories","related", "similar", "components", "delivery", "package");
    foreach ( $types as $type ) {
        register_rest_field('product', $type,
            array( "get_callback" => function ($post) use ( $type ) {
                return get_post_meta( $post['id'], '_' . $type . '_ids', true );
            } )
        );
    }
}
add_action( 'rest_api_init', 'register_rest_field_linked_product');