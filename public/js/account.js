 let currentField = '';
            function closeModal() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal_db'));
            modal.hide();
        }

        function saveChanges() {
            const newValue = document.getElementById('modal-input').value;
            if (newValue.trim() !== '') {
                document.getElementById(currentField).innerText = newValue;
            }
            closeModal();
        }
        function openModal(title, fieldId) {
            {{!-- $('#datepicker').datepicker({
                format: 'dd/mm/yyyy',
                autoclose: true,
                todayHighlight: true
            }); --}}
            flatpickr("#datepicker", {
                enableTime: true,
                dateFormat: "d/m/Y",
                
                defaultDate: new Date(),
                time_24hr: true
            });
            const modal = new bootstrap.Modal(document.getElementById('modal_db'));
            document.getElementById('modal-title').innerText = `${title}`;
            currentField = fieldId;
            modal.show();
        }

    async function saveBirthday() {
    const newDate = $('#datepicker').datepicker('getFormattedDate');      
    if (!newDate) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select a date'
        });
        return;
    }
    const today = moment();

    if (moment(newDate, 'DD/MM/YYYY').isAfter(today)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select a valid date'
        });
        return;
    }

    try {
        const response = await fetch('/account/update-birthday', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                birthday: newDate
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            document.getElementById(currentField).innerText = newDate;
            closeModal();
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message
            }).then(() => {
                location.reload();
            });
        } else {
            throw new Error(data.message || 'Failed to update birthday');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message
        });
    }
}
        
        
        function openTextModal(title, fieldId, type) {
            const modal = new bootstrap.Modal(document.getElementById('modal_text'));
            document.getElementById('text-modal-title').innerText = `${title}`;
            currentField = fieldId;
            currentType = type; 
                const currentValue = document.getElementById(fieldId).innerText;
            document.getElementById('text-input').value = currentValue;
            modal.show();
        }

        async function saveTextChange() {
            const newValue = document.getElementById('text-input').value.trim();
            
            if (!newValue) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Please enter a value'
                });
                return;
            }

            // Validate based on type
            switch(currentType) {
                case 'email':
                    if (!isValidEmail(newValue)) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Please enter a valid email'
                        });
                        return;
                    }
                    break;
                case 'name':
                    if (newValue.length < 2) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Name must be at least 2 characters'
                        });
                        return;
                    }
                    break;
            }

            try {
                const response = await fetch('/account/update-field', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        field: currentType,
                        value: newValue
                    })
                });

                if (response.ok) {
                    document.getElementById(currentField).innerText = newValue;
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modal_text'));
                    modal.hide();
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Updated successfully'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update'
                });
            }
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }


        function openPasswordModal() {
            const modal = new bootstrap.Modal(document.getElementById('modal_password'));
            modal.show();
        }

        async function savePassword() {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validate empty fields
            if (!currentPassword || !newPassword || !confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'All fields are required'
                });
                return;
            }

            // Validate password strength
            {{!-- const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Password must be at least 8 characters with numbers and letters'
                });
                return;
            } --}}

            // Check password match
            if (newPassword !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'New passwords do not match'
                });
                return;
            }

            try {
                const response = await fetch('/account/update-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modal_password'));
                    modal.hide();
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Password updated successfully'
                    });
                } else {
                    throw new Error(data.message || 'Current password is incorrect');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message
                });
            }
        }