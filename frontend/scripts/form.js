// const usersApiUrl = 'https://127.0.0.1:8000/api/users'; // development
const usersApiUrl = 'https://localhost:443/api/users';
const notificationEl = document.getElementById('notification');

// Event listener listens for submitting the registration info
document.addEventListener('submit', (event) => {
    event.preventDefault();

    const formEl = event.target.closest('form');

    if (formEl) {
        const formData = new FormData(formEl);
        const data = Object.fromEntries(formData);
        const isLoginForm = formEl.classList.contains('login-section');

        fetch(`${usersApiUrl}/${isLoginForm ? 'login' : 'register'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json().then(data => {
                if (!response.ok) {
                    const errorMessages = Object.values(data).flat().join(' ');
                    throw new Error(errorMessages);
                }

                showNotification(isLoginForm ? 'Login successful' : 'User registered successfully', 'success');

                setTimeout(() => {
                    // should redirect to home if login successful
                    history.back(); //! go back
                }, 2000);
            }))
            .catch(error => {
                showNotification(`Error: ${error.message}`, 'error');
                formEl.reset(); // clear the form
            });
    }
})

function showNotification(message, type) {
    notificationEl.textContent = message;
    notificationEl.className = `show ${type}`;  // add the class `show` and `type`
    notificationEl.style.display = 'block';

    // after 3s call the func to remove .show
    setTimeout(() => {
        notificationEl.classList.remove('show');
        // then after 0.3s turn style display to none to fade out the noti
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 300); // Match the transition duration
    }, 3000); // Adjust the delay as needed
}