const imagesToUpload = [];  
const existingImages = new Set();  

function toggleLoading(isLoading) {
  const overlay = document.getElementById('loading-overlay');
  overlay.style.display = isLoading ? 'flex' : 'none';
}

$('#summernote').summernote({
  placeholder: 'Write your article here...',
  tabsize: 2,
  height: 1000,
  callbacks: {
    onImageUpload: function(files) {
      for (let file of files) {
        const objectURL = URL.createObjectURL(file);
        imagesToUpload.push({ file, placeholder: objectURL }); // Add new images to list
        $('#summernote').summernote('insertImage', objectURL); // Show image in editor
      }
    },
    onInit: function() {
      const content = $('#summernote').summernote('code');
      // Save existing image URLs from the article content
      $(content)
        .find('img')
        .each((_, img) => {
          existingImages.add(img.src);
        });
    }
  }
});

// Save article
$('#save-button').on('click', function() {
  const title = $('#title').val().trim();
  const summary = $('#summary').val().trim();
  const category = $('#category').val();
  const isPremium = $('#isPremium').is(':checked');
  const selectedTags = Array.from(document.querySelectorAll('#tagsContainer .btn.active'))
    .map(btn => btn.getAttribute('data-tag-id'));
  const tags = selectedTags;

  console.log(category)

  if (!category) {
    Swal.fire('Error', 'Please select a category', 'error');
    return;
}

  let content = $('#summernote').summernote('code');

  toggleLoading(true); // Show loading overlay

  // Upload only images not already in cloud
  const uploadPromises = imagesToUpload.map(({ file, placeholder }) => 
    uploadToCloud(file).then(url => ({ placeholder, url }))
  );

  Promise.all(uploadPromises)
    .then(results => {
      // Replace uploaded image placeholders with actual URLs from Cloud
      results.forEach(({ placeholder, url }) => {
        content = content.replace(new RegExp(placeholder, "g"), url);
      });
      return saveArticle({ title, content, summary, category, tags, isPremium });
    })
    .then(() => {
      // SweetAlert2 success message
      Swal.fire({
        title: 'Success!',
        text: 'Article saved successfully!',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Back',
        reverseButtons: true
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            window.history.back();
        }
    });
    imagesToUpload.length = 0; // Clear image list after successful save
    })
    .catch(error => {
      console.error("Error saving article:", error);
      // SweetAlert2 error message
      Swal.fire('Error', 'Error saving article.', 'error');
    })
    .finally(() => toggleLoading(false)); // Hide loading overlay
});

// Update article
$('#update-button').on('click', function() {
  const id = +$('#id').val().trim();
  const title = $('#title').val().trim() || "";
  const summary = $('#summary').val().trim() || "";
  const category = $('#category').val().trim() || "";
  const selectedTags = Array.from(document.querySelectorAll('#tagsContainer .btn.active'))
    .map(btn => btn.getAttribute('data-tag-id'));
  const tags = selectedTags;
  let content = $('#summernote').summernote('code');

  toggleLoading(true); // Show loading overlay

  // Upload only images not already in cloud
  const uploadPromises = imagesToUpload.map(({ file, placeholder }) => 
    uploadToCloud(file).then(url => ({ placeholder, url }))
  );

  Promise.all(uploadPromises)
    .then(results => {
      results.forEach(({ placeholder, url }) => {
        content = content.replace(new RegExp(placeholder, "g"), url);
      });
      return updateArticle({ id, title, content, summary, category, tags });
    })
    .then(() => {
      // SweetAlert2 success message
      Swal.fire({
        title: 'Success!',
        text: 'Article updated successfully!',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Back',
        reverseButtons: true
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            window.history.back();
        }
    });
    imagesToUpload.length = 0; // Clear image list after successful update
    })
    .catch(error => {
      console.error("Error updating article:", error);
      // SweetAlert2 error message
      Swal.fire('Error', 'Error updating article.', 'error');
    })
    .finally(() => toggleLoading(false)); // Hide loading overlay
});

// Upload image to Cloud
function uploadToCloud(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    $.ajax({
      url: '/upload-image', // Endpoint to upload image
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: response => resolve(response.imageUrl),
      error: error => reject(error.responseJSON || error)
    });
  });
}

// Save article data
async function saveArticle(articleData) {
  try {
    const response = await fetch('/writer/save-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) throw new Error('Failed to save article');
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Update article data
async function updateArticle(articleData) {
  try {
    const response = await fetch('/writer/update-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) throw new Error('Failed to update article');
  } catch (error) {
    console.error(error);
    throw error;
  }
}
