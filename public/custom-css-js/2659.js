<!-- start Simple Custom CSS and JS -->
<script type="text/javascript">
jQuery(document).ready(function($) {
    // Target the quantity field of this specific add-on
    var qtyField = $('input[name="pewc_group_1700_1903_qty"]');

    // Set default to 15 if empty or if page loaded
    qtyField.val(15);

    // Optional: prevent user going below 15
    qtyField.attr('min', 15);

    // If user manually sets less than 15, auto-correct it
    qtyField.on('change keyup', function() {
        if (parseInt($(this).val()) < 15) {
            $(this).val(15);
        }
    });
});
</script>
<!-- end Simple Custom CSS and JS -->
