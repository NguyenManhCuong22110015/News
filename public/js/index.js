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


  $(document).ready(function() {
    $('.dropdown-toggle').dropdown();
    
});

 document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.form-inline');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('search-icon');

    function handleSearch(e) {
        e.preventDefault();
        
        const searchTerm = searchInput?.value?.trim();
        
        if (!searchTerm || searchTerm.length < 2) {
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: 'Please enter at least 2 characters to search'
            });
            return;
        }

        try {
            window.location.href = `/article/search?q=${encodeURIComponent(searchTerm)}`;
        } catch (error) {
            console.error('Search error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while searching. Please try again.'
            });
        }
    }

    searchForm?.addEventListener('submit', handleSearch);
    searchButton?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    });
});