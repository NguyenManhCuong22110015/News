$(document).ready(function () {
    const $dropdown = $(".navbar .dropdown");

    function showDropdown($el) {
        $el.addClass("show");
        $el.find(".dropdown-menu").addClass("show");
    }

    function hideDropdown($el) {
        $el.removeClass("show");
        $el.find(".dropdown-menu").removeClass("show");
    }

    // Hover support for desktop
    function bindHover() {
        if ($(window).width() >= 980) {
            $dropdown.off("mouseenter mouseleave").hover(
                function () {
                    showDropdown($(this));
                },
                function () {
                    hideDropdown($(this));
                }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    }

    bindHover();
    $(window).resize(bindHover);

    // Toggle dropdown on click (independent of hover)
    $(".dropdown-toggle").click(function (e) {
        e.preventDefault();
        const $parent = $(this).parent();
        const isOpen = $parent.hasClass("show");

        // Close all dropdowns
        $(".navbar .dropdown").removeClass("show").find(".dropdown-menu").removeClass("show");

        // Open if not already open
        if (!isOpen) {
            showDropdown($parent);
        }
    });

    // Click outside to close
    $(document).click(function (e) {
        if (!$(e.target).closest('.dropdown').length) {
            $(".navbar .dropdown").removeClass("show").find(".dropdown-menu").removeClass("show");
        }
    });
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