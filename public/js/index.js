$(document).ready(function() {
    // executes when HTML-Document is loaded and DOM is ready

    // breakpoint and up  
    function handleResize() {
        if ($(window).width() >= 980) {  
            // when you hover a toggle show its dropdown menu
            $(".navbar .dropdown-toggle").hover(
                function () {
                    $(this).parent().addClass("show");
                    $(this).parent().find(".dropdown-menu").addClass("show");
                },
                function () {
                    $(this).parent().removeClass("show");
                    $(this).parent().find(".dropdown-menu").removeClass("show");
                }
            );

            // hide the menu when the mouse leaves the dropdown
            $(".navbar .dropdown-menu").mouseleave(function() {
                $(this).removeClass("show");  
            });
        } else {
            // Remove hover classes on smaller screens for better responsiveness
            $(".navbar .dropdown-toggle").off("mouseenter mouseleave");
        }
    }
    
});

$(document).ready(function() {
    // Sự kiện click vào biểu tượng kính lúp
    $('#search-icon').click(function() {
        // Toggle subnav visibility (hiện/ẩn subnav)
        $('#subnav').toggle();
    });
  
    // Đảm bảo khi click ra ngoài thì ẩn subnav
    $(document).click(function(event) {
        if (!$(event.target).closest('#search-icon').length && !$(event.target).closest('#subnav').length) {
            $('#subnav').hide();
        }
    });
});