window.addEventListener("popstate", (event) => {
    // If a state has been provided, we have a "simulated" page
    // and we update the current page.
    if (event.state) {
        // Simulate the loading of the previous page
        // document.documentElement.outerHTML = event.state.content;
        document.getElementById('welcome-menu').innerHTML = event.state.content;
    }
});

const initialState = {
    content: document.getElementById('welcome-menu').innerHTML,
    url: ''
};
window.history.replaceState(initialState, 0, '');

async function displaySection(file, sectionUrl) {
    const response = await fetch(file, {
        method: 'Get',
        headers: {
            'Content-Type': 'text/html',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    const sectionHtml = await response.text();
    document.getElementById('content').innerHTML = sectionHtml;
    const state = {
        content: sectionHtml,
        url: sectionUrl
    }
    window.history.pushState(state, '', sectionUrl);
}
