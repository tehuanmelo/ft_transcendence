// const usersApiUrl = 'https://127.0.0.1:8000/api/users'; // development
const usersApiUrl = 'https://localhost:443/api/users';

document.querySelector('form').forEach(formEl => {
    formEl.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(formEl);
        const data = Object.fromEntries(formData.entries());
        const isLoginForm = formEl.classList.contains('login-section');
        const endpoint = `${usersApiUrl}/${isLoginForm ? 'login' : 'register'}`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMessages = Object.values(result).flat().join(' ');
                throw new Error(errorMessages);
            }

            if (isLoginForm)
                console.log('Login successful');
            else
                console.log('Registration successful');

            setTimeout(() => {
                // should redirect to home if login successful
                history.back(); //! go back
            }, 2000);

        } catch (error) {
            console.log(`Error: ${error.message}`);
            // formEl.reset(); // clear the form
        }
    })
})
