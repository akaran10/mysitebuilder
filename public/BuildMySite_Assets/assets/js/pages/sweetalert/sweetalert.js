var BaseUIActivity = function() {
    // SweetAlert, for more examples you can check out https://github.com/t4t5/sweetalert
    var sweetAlert = function(){
        // Init an success alert on button click
        jQuery('.js-swal-success').on('click', function(){
            swal('Success', 'Everything updated perfectly!', 'success');
        });

        // Init an error alert on button click
        jQuery('.js-swal-error').on('click', function(){
            swal('Oops...', 'Something went wrong!', 'error');
        });
    };

    return {
        init: function() {
            // Init SweetAlert
            sweetAlert();
        }
    };
}();

// Initialize when page loads
jQuery(function(){ BaseUIActivity.init(); });