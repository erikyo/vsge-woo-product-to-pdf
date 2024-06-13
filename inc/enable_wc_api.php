<?php

function set_wc_data_store( $stores ) {
    $stores['product-variable'] = 'WC_Product_Variable_Data_Store_CPT';
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