document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.allow-click'))
            return;

        event.preventDefault();

        if (target.matches('.spa-link')) {
            const method = target.getAttribute('data-method');
            const url = target.getAttribute('href');
            const formSelector = target.getAttribute('data-form');

            if (method === 'GET')
                getPage(url);
            else if (method === 'POST' && formSelector)
                postForm(formSelector, url);
        }
    });

    window.addEventListener('popstate', () => {
        const url = document.location.pathname;
        getPage(url);
    });
});

function updateContent(pageHtml, url) {
    const parser = new DOMParser();
    const page = parser.parseFromString(pageHtml, 'text/html');

    const newContent = page.querySelector('#content').innerHTML;
    document.querySelector('#content').innerHTML = newContent;

    const newTitle = page.querySelector('title').innerHTML;
    document.title = newTitle;

    const oldUrl = document.location.pathname;
    console.log(url)
    if (oldUrl !== url)
        history.pushState(null, newTitle, url);
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
            console.error('Error when fetching the page:', error.message)
        });
}

function postForm(formSelector, url) {
    const form = document.querySelector(formSelector);
    const formData = new FormData(form);
    const redirectUrl = form.getAttribute('data-redirect');

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
            return response.text();
        })
        .then(pageHtml => updateContent(pageHtml, redirectUrl))
        .catch(error => {
            console.error('Error when submitting the form:', error);
        });
}
