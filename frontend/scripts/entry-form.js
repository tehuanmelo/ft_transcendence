async function handleFormLoad() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await submitFormData(loginForm, 'login');
        })
    }

    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await submitFormData(registrationForm, 'register');
        })
    }
}

async function submitFormData(form, action) {
    const usersApiUrl = 'https://localhost:443/api/users';
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${usersApiUrl}/${action}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        console.log('Success:', result);
        alert('success!')
        // Handle the success response here, like redirecting or showing a success message
    } catch (error) {
        console.error('There was an issue with the request: ', error);
        alert('Failed to submit the form. Please try again.');
    }
}
