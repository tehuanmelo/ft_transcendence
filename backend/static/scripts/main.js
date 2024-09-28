const initFunctions = {
    '/pong/': gameInitialization,
    // You can add more routes and their corresponding functions here
    // '/another-route/': anotherInitializationFunction,
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
            handleSpaLinkEvent(target)
        }
    });

    document.body.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const target = event.target;
            if (target.form) {
                event.preventDefault();
                const form = target.form
                const spalink = form.querySelector('.spa-link');
                handleSpaLinkEvent(spalink);
            }
        }
    })

    window.addEventListener('popstate', () => {
        const url = document.location.pathname;
        getPage(url);
    });
});

function handleSpaLinkEvent(target) {
    const method = target.getAttribute('data-method');
    const url = target.getAttribute('href');
    const formSelector = target.getAttribute('data-form');

    if (method === 'GET')
        getPage(url);
    else if (method === 'POST' && formSelector)
        postForm(formSelector, url);
}

function updateContent(pageHtml, url) {
    const parser = new DOMParser();
    const page = parser.parseFromString(pageHtml, 'text/html');

    const newContent = page.querySelector('#content').innerHTML;
    document.querySelector('#content').innerHTML = newContent;

    const newTitle = page.querySelector('title').innerHTML;
    document.title = newTitle;

    const oldUrl = document.location.pathname;
    if (oldUrl !== url)
        history.pushState(null, '', url);

    if (initFunctions[url])
        initFunctions[url]();
}

function getPage(url) {
    fetch(url)
        .then(response => {
            if (!response.ok)
                throw new Error('Invalid response');
            return response.text();
        })
        .then(pageHtml => updateContent(pageHtml, url))
        .catch(error => {
            console.error('Error when fetching the page:', error.message);
        });
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
            if (!response.ok)
                throw new Error('Invalid form post request');
            else if (response.redirected)
                redirectUrl = response.url;
            return response.text();
        })
        .then(pageHtml => {
            updateContent(pageHtml, redirectUrl);

            const modal = form.closest('.modal');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        })
        .catch(error => {
            console.error('Error when submitting the form:', error);
        });
}
