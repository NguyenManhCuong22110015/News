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
document.getElementById('sidebarToggle')?.addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});
document.addEventListener('DOMContentLoaded', function () {
   const likeIcon = document.querySelector('#sidebar .bi-heart');
  const likeCount = document.querySelector('#sidebar span:first-of-type');

  likeIcon.addEventListener('click', async function() {
    try {
      const articleId = '{{article.id}}';
      const response = await fetch('/article/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });
      
      if (response.ok) {
        const data = await response.json();
        likeCount.textContent = data.likes;
      if (this.classList.contains('bi-heart-fill')) {
          this.classList.replace('bi-heart-fill', 'bi-heart');
        } else {
          this.classList.replace('bi-heart', 'bi-heart-fill');
          this.style.color = '#d32710';
        }
      }
      else {
        Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to like this article',
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: true,
        confirmButtonText: 'Log In',
        timer: 5000
      }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to login page
            window.location.href = '/login';
          }
        });
      }
    } catch (error) {
      
      console.error('Error updating like:', error);
    }
  });

  // Comment scroll functionality
  const commentIcon = document.querySelector('#sidebar .bi-chat');
  commentIcon.addEventListener('click', function() {
    const commentSection = document.querySelector('.comment-container');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Save to clipboard functionality
  const bookmarkIcon = document.querySelector('#sidebar .bi-bookmark');
  bookmarkIcon.addEventListener('click', function() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      // Show notification
      Swal.fire({
        title: 'Link Copied!',
        text: 'Article link has been copied to clipboard',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  });

  // Share functionality
  const shareIcon = document.querySelector('#sidebar .bi-three-dots');
  shareIcon.addEventListener('click', function() {
    const url = window.location.href;
    const title = document.querySelector('h1').textContent;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback to custom share menu
      Swal.fire({
        title: 'Share this article',
        html: `
          <div class="d-flex justify-content-center">
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" class="mx-2">
              <i class="fab fa-facebook-f fa-2x"></i>
            </a>
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" target="_blank" class="mx-2">
              <i class="fab fa-twitter fa-2x"></i>
            </a>
            <a href="mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}" class="mx-2">
              <i class="fas fa-envelope fa-2x"></i>
            </a>
          </div>
        `,
        showConfirmButton: false
      });
    }
  });
    const COMMENTS_PER_PAGE = 5; // Số lượng bình luận mỗi trang
    const comments = document.querySelectorAll('.comment-item'); // Tất cả bình luận
    const pagination = document.getElementById('pagination'); // Container của phân trang
    const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE); // Tổng số trang

    // Hàm hiển thị bình luận theo trang
    function showCommentsPage(page) {
        const start = (page - 1) * COMMENTS_PER_PAGE;
        const end = start + COMMENTS_PER_PAGE;

       comments.forEach((comment, index) => {
    if (index >= start && index < end) {
        comment.setAttribute('style', 'display: flex !important;'); // Hiển thị bình luận
    } else {
        comment.setAttribute('style', 'display: none !important;'); // Ẩn bình luận
    }
});

        // Cập nhật trạng thái nút phân trang
        document.querySelectorAll('.page-item').forEach((item) => {
            item.classList.remove('active');
        });
        const activePage = document.querySelector(`.page-item[data-page="${page}"]`);
        if (activePage) activePage.classList.add('active');

        
    }

    // Hàm tạo nút phân trang
    function createPagination() {
        pagination.innerHTML = ''; // Xóa nút cũ nếu có
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                li.className = 'page-item';
                li.setAttribute('data-page', i);
                li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                li.addEventListener('click', (e) => {
                    e.preventDefault();
                    showCommentsPage(i); // Hiển thị bình luận theo trang
                });
                pagination.appendChild(li);
            }
        }
    }
    const scrollBtn = document.getElementById('scrollToTop');
  
  if (scrollBtn) {
    window.onscroll = function() {
      try {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          scrollBtn.classList.remove('d-none');
          scrollBtn.classList.add('d-block');
        } else {
          scrollBtn.classList.add('d-none');
          scrollBtn.classList.remove('d-block');
        }
      } catch (error) {
        console.error('Scroll handler error:', error);
      }
    };

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

    // Khởi tạo
    if (comments.length > 0) {
        createPagination();
        showCommentsPage(1); // Hiển thị trang đầu tiên
    }


  const chatButton = document.getElementById('chatButton');
    const chatContainer = document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const aricle_Id = '{{this.article.id}}'; 
        async function initializeChatbot() {
        try {
            const response = await fetch('/chatbot/loadArticle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: aricle_Id }) // Your article ID
            });
            
            if (!response.ok) {
                throw new Error('Failed to load article data');
            }

            // Enable chat interface after data is loaded
            chatButton.disabled = false;
            chatInput.disabled = false;
            sendMessageButton.disabled = false;
        } catch (error) {
            console.error('Initialization error:', error);
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('bot-message', 'error');
            errorMessage.textContent = 'Failed to initialize chatbot. Please refresh the page.';
            chatMessages.appendChild(errorMessage);
        }
    }

    // Call initialization on page load
    window.addEventListener('load', initializeChatbot);

  // Create reusable send message function
  async function sendMessage() {
    const message = chatInput.value.trim();

    if (message) {
      // Display user message
      const userMessage = document.createElement('div');
      userMessage.classList.add('user-message');
      userMessage.textContent = `You: ${message}`;
      chatMessages.appendChild(userMessage);

      try {
        // Show loading state
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('bot-message', 'loading');
        loadingMessage.textContent = 'Bot is typing...';
        chatMessages.appendChild(loadingMessage);

        // Call API
        const response = await fetch('/chatbot/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: message }),
        });

        const data = await response.json();

        // Remove loading message
        chatMessages.removeChild(loadingMessage);

        // Display bot response
        const botMessage = document.createElement('div');
        botMessage.classList.add('bot-message');
        botMessage.textContent = `Bot: ${data.answer || 'Sorry, I could not understand that.'}`;
        chatMessages.appendChild(botMessage);
      } catch (error) {
        // Display error message
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('bot-message', 'error');
        errorMessage.textContent = 'Bot: Sorry, an error occurred. Please try again later.';
        chatMessages.appendChild(errorMessage);
      }

      // Clear input and scroll
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // Add event listeners
  chatButton.addEventListener('click', () => {
    chatContainer.style.display = 
      chatContainer.style.display === 'none' || chatContainer.style.display === '' 
        ? 'flex' 
        : 'none';
  });

  sendMessageButton.addEventListener('click', sendMessage);

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });



});

document.getElementById('postButton').addEventListener('click', async function() {

  const content = document.getElementById('noteInput').value.trim();
    const article_id = '{{this.article.id}}';
    const user_id = '{{this.authUser.id}}';

    console.log(content, article_id, user_id);

    if (!content) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please write a comment'
        });
        return;
    }

    if (!user_id || !article_id) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'User or Article not found'
        });
        return;
    }

    try {
        const response = await fetch('/read/comment/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                article_id,
                user_id
            })
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Comment posted successfully'
            }).then(() => {
                // Reload page to show new comment
                location.reload();
            });
            document.getElementById('noteInput').value = '';
        } else {
            throw new Error('Failed to post comment');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to post comment'
        });
    }
});


    // Initialize chatbot data
