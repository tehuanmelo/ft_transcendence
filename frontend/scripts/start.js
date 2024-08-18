const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    if (form.checkValidity() === false) {
        e.preventDefault();
    }
    form.classList.add('was-validated');
});

// ! to remove
document.getElementById('login-btn').addEventListener('click', () => {
    console.log('logging in...');
});

document.getElementById('42-login-btn').addEventListener('click', () => {
    console.log('logging in with 42...');
});

document.getElementById('guest-login-btn').addEventListener('click', () => {
    console.log('logging in as guest...');
});

document.getElementById('sign-up').addEventListener('click', () => {
    console.log('signing up...');
});
