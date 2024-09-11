const form = document.getElementById('login') || document.getElementById('register');
console.log(form.id);
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitFormData(form);
});

async function submitFormData(form) {
    const usersApiUrl = 'https://localhost:443/api/users';
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log(`api url: ${usersApiUrl}/${form.id}`);

    try {
        const response = await fetch(`${usersApiUrl}/${form.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        console.log('Success!');
        alert('success!');
        show2faModal();
        // show success message
        // if the form is /register then redirect to log in page
        // if the form is /login then redirect to 2fa

    } catch (error) {
        console.error('There was an issue with the request: ', error);
        alert('Failed to submit the form. Please try again.');
    }
}

function show2faModal() {
    const modal = document.getElementById('2faModal');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
}

function hide2faModal() {
    const modal = document.getElementById('2faModal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}