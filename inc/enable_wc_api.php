<?php

function set_wc_data_store( $stores ) {
    $stores['product-variable']  = 'WC_Product_Variable_Data_Store_CPT';
    $stores['product-variation'] = 'WC_Product_Variation_Data_Store_CPT';

    return $stores;
}

add_filter( 'woocommerce_data_stores', 'set_wc_data_store' );

function enable_taxonomy_rest( $args ) {
    $args['show_in_rest'] = true;

    return $args;
}

add_filter( 'woocommerce_taxonomy_args_product_cat', 'enable_taxonomy_rest' );
add_filter( 'woocommerce_taxonomy_args_product_tag', 'enable_taxonomy_rest' );

function register_rest_field_approvals() {
    register_rest_field( 'product', "approvals", array(
            "get_callback" => function ( $post ) {
                return wp_get_post_terms( $post['id'], 'product_approvals' );
            }
        ) );
}

add_action( 'rest_api_init', 'register_rest_field_approvals' );


function register_rest_field_application() {
    register_rest_field( 'product', "application", array(
            "get_callback" => function ( $post ) {
                return wp_get_post_terms( $post['id'], 'product_application' );
            }
        ) );
}

add_action( 'rest_api_init', 'register_rest_field_application' );


function register_rest_field_linked_product() {
    $types = array( "accessories", "related", "similar", "components", "delivery", "package" );
    foreach ( $types as $type ) {
        register_rest_field( 'product', $type, array(
                "get_callback" => function ( $post ) use ( $type ) {
                    return get_post_meta( $post['id'], '_' . $type . '_ids', true );
                }
            ) );
    }
}

add_action( 'rest_api_init', 'register_rest_field_linked_product' );