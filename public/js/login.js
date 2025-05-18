 function showAlert(message, type) {
      const alertContainer = document.getElementById("alertContainer");
      alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `;
    }

    // Xử lý khi nhấn "Get CODE"
    document.getElementById("getCodeButton").addEventListener("click", function () {
  const emailInput = document.getElementById("emailInput").value.trim();
  const getCodeButton = document.getElementById("getCodeButton");

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
    // Vô hiệu hóa nút và thêm hiệu ứng loading
    getCodeButton.disabled = true;
    getCodeButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;

    fetch('/send-email-getCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: emailInput }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === "Email xác nhận đã được gửi.") {
        showAlert("OTP has been sent to your email.", "success");
        document.getElementById("emailContainer").classList.add("hidden");
        document.getElementById("otpContainer").classList.remove("hidden");
      } else {
        showAlert("Failed to send OTP. Please try again later.", "danger");
      }
    })
    .catch(error => {
      showAlert("An error occurred while sending the OTP.", "danger");
    })
    .finally(() => {
      // Kích hoạt lại nút sau khi gửi xong
      getCodeButton.disabled = false;
      getCodeButton.innerHTML = "Get CODE";
    });

    const inputs = document.querySelectorAll(".code-input");
    inputs[0].focus();
    inputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        if (input.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });
    });
  } else {
    showAlert("Please enter a valid email address.", "danger");
  }
});


// Sửa xử lý "Verify CODE"
document.getElementById("submitCodeButton").addEventListener("click", function () {
  const inputs = document.querySelectorAll(".code-input");
  const code = Array.from(inputs).map(input => input.value).join("");

  if (code.length === 6) {
    const emailInput = document.getElementById("emailInput").value.trim();
    fetch('/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, otp: code }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "OTP xác nhận thành công.") {
          showAlert("OTP verified successfully.", "success");
          document.getElementById("otpContainer").classList.add("hidden");
          document.getElementById("newPasswordContainer").classList.remove("hidden");
        } else {
          showAlert("Invalid verification code.", "danger");
        }
      })
      .catch(() => showAlert("An error occurred while verifying the OTP.", "danger"));
  } else {
    showAlert("Please enter a 6-digit code.", "danger");
  }
});

// Sửa xử lý "Save Password"
document.getElementById("savePasswordButton").addEventListener("click", function () {
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (newPassword && confirmPassword && newPassword === confirmPassword) {
    const emailInput = document.getElementById("emailInput").value.trim();
    fetch('/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, newPassword }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showAlert("Password successfully reset!", "success");
        } else {
          showAlert(`Error resetting password: ${data.message}`, "danger");
        }
      })
      .catch(() => showAlert("An error occurred. Please try again.", "danger"));
  } else {
    showAlert("Passwords do not match or are empty.", "danger");
  }
});
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const captchaModal = new bootstrap.Modal(document.getElementById('captchaModal'));

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            captchaModal.show();
        });
    }

    window.onCaptchaSuccess = function(token) {
        const form = document.getElementById('signupForm');
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'h-captcha-response';
        input.value = token;
        form.appendChild(input);
        form.submit();
    };
});
    function togglePassword() {
      const passwordField = document.getElementById("password");
      const toggleIcon = document.getElementById("toggle-password");
      
      if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.textContent = "🙈";  
      } else {
        passwordField.type = "password";
        toggleIcon.textContent = "👁️";  // Trở lại icon mắt khi ẩn mật khẩu
      }
    }
    function togglePassword2() {
        const passwordField = document.getElementById("password2");
        const toggleIcon = document.getElementById("toggle-password2");
        
        if (passwordField.type === "password") {
          passwordField.type = "text";
          toggleIcon.textContent = "🙈";  
        } else {
          passwordField.type = "password";
          toggleIcon.textContent = "👁️";  // Trở lại icon mắt khi ẩn mật khẩu
        }
      }
   
      function showFormLogIn() {
        document.querySelector(".form-login").style.display = "block";
        
        document.querySelector(".form-signup").style.display = "none";
      }
    
      function showFormSignUp() {
        document.querySelector(".form-login").style.display = "none";
        
        document.querySelector(".form-signup").style.display = "block";
      }
window.onCaptchaVerified = function(token) {
    const form = document.getElementById('signupForm');
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'h-captcha-response';
    input.value = token;
    form.appendChild(input);
     form.action = '/auth/signup';
    form.submit();
}

function validateCaptcha(event) {
    event.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById('captchaModal'));
    hcaptcha.render('h-captcha', {
        sitekey: 'f2aacc22-14fa-4572-bc96-0028525e7082'
    });
    modal.show();
    return false;
}

        document.getElementById("getCodeButton").addEventListener("click", function () {
        const emailInput = document.getElementById("emailInput");
        const email = emailInput.value.trim();

        // Kiểm tra email hợp lệ
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            // Hiển thị container nhập mã xác thực
            document.getElementById("twoFactorContainer").classList.remove("hidden");

            // Tự động focus vào ô đầu tiên
            const inputs = document.querySelectorAll(".code-input");
            inputs[0].focus();

            // Chuyển qua ô tiếp theo khi nhập
            inputs.forEach((input, index) => {
            input.addEventListener("input", () => {
                if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
                }
            });
            });

            // Xóa ô trước khi backspace
            inputs.forEach((input, index) => {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && input.value === "" && index > 0) {
                inputs[index - 1].focus();
                }
            });
            });
        } else {
            alert("Please enter a valid email address!");
        }
        });