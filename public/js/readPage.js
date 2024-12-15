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
    
    $('#search-icon').click(function() {
        
        $('#subnav').toggle();
    });
  
    
    $(document).click(function(event) {
        if (!$(event.target).closest('#search-icon').length && !$(event.target).closest('#subnav').length) {
            $('#subnav').hide();
        }
    });
});

// Lắng nghe sự kiện click trên nút Post
document.getElementById("postButton").addEventListener("click", function() {
    // Lấy giá trị từ input
    var noteContent = document.getElementById("noteInput").value;

    // Kiểm tra nếu có nội dung trong ô input
    if (noteContent.trim() !== "") {
        // Thêm bình luận mới vào phần Comments
        var commentSection = document.getElementById("commentsSection");

        // Tạo phần tử mới cho bình luận
        var newComment = document.createElement("div");
        newComment.classList.add("comment-box", "second", "d-flex", "p-3", "rounded", "mb-3");

        // Tạo nội dung cho bình luận
        newComment.innerHTML = `
            <img src="https://i.imgur.com/tPvlEdq.jpg" class="rounded-circle me-3" width="50" height="50" alt="avatar">
            <div class="w-100">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="text2 mb-0 fw-bold">Your Name</h6>
                    <span class="text-muted small">Just now</span>
                </div>
                <p class="text1 mb-1">${noteContent}</p>
                <div class="d-flex align-items-center">
                    <span class="text3 me-2">Upvote?</span>
                    <i class="fa fa-thumbs-o-up text-success me-1"></i>
                    <span class="text4">0</span>
                </div>
            </div>
        `;

        // Thêm bình luận mới vào cuối danh sách
        commentSection.appendChild(newComment);

        // Cập nhật số lượng bình luận
        var commentCount = document.getElementById("commentCount");
        var currentCount = parseInt(commentCount.innerText.split(" ")[0]);
        commentCount.innerText = (currentCount + 1) + " Comments";

        // Xóa nội dung input
        document.getElementById("noteInput").value = "";
    } else {
        alert("Please enter a comment.");
    }
});
