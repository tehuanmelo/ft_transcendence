// main.js: contains routing logic and SPA loading

const initFunctions = {
    '/game/pong': gameInit,
    '/game/tictactoe/': tictactoeInit,
}

document.addEventListener('DOMContentLoaded', () => {
    // Handling case of page reloading to invoke required js
    const currentPath = document.location.pathname;
    if (initFunctions[currentPath])
        initFunctions[currentPath]();

    document.body.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.spa-link')) {
            event.preventDefault();
            handleSpaLinkEvent(target);
        }
    });

    document.body.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const target = event.target;
            const form = target.form;
            if (target.form && form.querySelector('.spa-link')) {
                event.preventDefault();
                const spalink = form.querySelector('.spa-link');
                handleSpaLinkEvent(spalink);
            }
        }
    })

    window.addEventListener('popstate', () => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop)
            backdrop.remove();
        const url = document.location.pathname;
        getPage(url, true);
    });


});

function handleSpaLinkEvent(target) {
    const method = target.getAttribute('data-method');
    const url = target.getAttribute('href');
    const formSelector = target.getAttribute('data-form');
    const onNavigation = target.getAttribute('on-spa-navigate');

    if (onNavigation != null)
        eval(onNavigation);
    if (method === 'GET')
        getPage(url);
    else if (method === 'POST' && formSelector)
        postForm(formSelector, url);
}

function updateContent(pageHtml, url, isPopstate = false) {
    const parser = new DOMParser();
    const page = parser.parseFromString(pageHtml, 'text/html');
    const newContent = page.querySelector('#content').innerHTML;
    document.querySelector('#content').innerHTML = newContent;

    if (isPopstate) {
        const pageTitle = page.title;
        if (pageTitle === 'Login') history.replaceState(null, '', '/users/login/');
        else if (pageTitle === 'Home') history.replaceState(null, '', '/');
    }
    else {
        const oldUrl = document.location.pathname;
        if (oldUrl !== url) history.pushState(null, '', url);
    }

    const newTitle = page.querySelector('title').innerHTML;
    document.title = '';
    document.title = newTitle;

    const urlWithoutParam = url.split('?')[0];
    if (initFunctions[urlWithoutParam])
        initFunctions[urlWithoutParam]();
}

function getPage(url, isPopstate = false) {
    fetch(url)
        .then(response => {
            if (!response.ok && response.status !== 404) throw new Error('Invalid response');
            return response.text();
        })
        .then(pageHtml => updateContent(pageHtml, url, isPopstate))
        .catch(error => console.error('Error when fetching the page:', error.message));
}

function postForm(formSelector, url) {
    const form = document.querySelector(formSelector);
    const formData = new FormData(form);
    let redirectUrl = url;

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': formData.get('csrfmiddlewaretoken')
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error('Invalid form post request');
            if (response.redirected) redirectUrl = response.url;
            return response.text();
        })
        .then(pageHtml => updateContent(pageHtml, redirectUrl))
        .catch(error => console.error('Error when submitting the form:', error));
}
