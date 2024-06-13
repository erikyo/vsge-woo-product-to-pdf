<?php

global $post;
?>

<a
    href="javascript:"
    title="<?php echo $attributes['title']; ?>"
    data-product-id="<?php echo $post->ID; ?>"
    <?php echo get_block_wrapper_attributes(); ?>
>
    <?php echo $attributes['icon'] ?>
</a>