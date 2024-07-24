const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    if (form.checkValidity() === false) {
        e.preventDefault();
    }
    form.classList.add('was-validated');
});

// ! to remove
const btn = document.getElementById('login-btn');
btn.addEventListener('click', () => {
    console.log('click');
});
