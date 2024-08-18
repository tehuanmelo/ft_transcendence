window.addEventListener("popstate", (event) => {
    // If a state has been provided, we have a "simulated" page
    // and we update the current page.
    if (event.state) {
        // Simulate the loading of the previous page
        // document.documentElement.outerHTML = event.state.content;
        document.getElementById('login-menu').innerHTML = event.state.content;
    }
});

const initialState = {
    content: document.getElementById('login-menu').innerHTML,
    url: ''
};
window.history.replaceState(initialState, 0, '');

async function displayRegister() {
    const response = await fetch('form.html', {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    const formHtml = await response.text();
    document.getElementById('login-menu').innerHTML = formHtml;
    const state = {
        content: formHtml,
        url: 'register',
    }
    window.history.pushState(state, '', 'register');
}

async function displayLogin() {
    const response = await fetch('login.html', {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    const loginHtml = await response.text();
    document.getElementById('login-menu').innerHTML = loginHtml;
    const state = {
        content: loginHtml,
        url: 'login'
    }
    window.history.pushState(state, '', 'login');
}
