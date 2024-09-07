const contentDiv = document.getElementById('content');
let initialState;

// Ensure the initial content is stored in the history state when the page first loads
window.addEventListener("DOMContentLoaded", async () => {
    const currentPath = window.location.pathname;
    await loadContent(currentPath);

    initialState = { content: contentDiv.innerHTML };
    window.history.replaceState(initialState, '');
});

// Listen for the popstate event to handle back/forward navigation
window.addEventListener("popstate", (event) => {
    if (event.state) {
        contentDiv.innerHTML = event.state.content;
    } else {
        // Handle the case where there is no state (e.g., the first page load)
        contentDiv.innerHTML = initialState.content;
    }
});

const validRoutes = [
    { url: '/', file: 'start.html' },
    { url: '/login', file: 'login-form.html' },
    { url: '/register', file: 'register-form.html' },
    { url: '/2fa', file: '2fa-form.html' },
    // { url: '/home', file: 'home.html' },
    // { url: '/tournament', file: 'tournament.html' },
    // { url: '/about', file: 'about.html' },
    // { url: '/profile', file: 'profile.html' },
     { url: '/pong', file: 'pong.html' },
];

const loadedScripts = new Set();
function loadScript(src, callback) {

    if (loadedScripts.has(src)) {
        console.log('Script already loaded:', url);
        return;
    }


    var script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;

    // Handle script load
    script.onload = function() {
        console.log('Script loaded successfully:', src);
        loadedScripts.add(src);
        if (callback) callback();
    };

    // Handle script error
    script.onerror = function() {
        console.error('Script failed to load:', src);
    };

    document.head.appendChild(script);
}

async function loadContent(url, postLoadHandler = null) {
    // basically check if the url requested is in the validRoutes
    // if it is then display that content
    const route = validRoutes.find(route => route.url === url);
    if (!route) {
        //! to be worked upon
        console.error('Invalid route:', url);
        alert('Requested content not found.');
        return;
    }

    try {
        const response = await fetch(route.file, {
            method: 'Get',
            headers: {
                'Content-Type': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw Error('Network response was not ok');
        }

        const sectionHtml = await response.text();
        contentDiv.innerHTML = sectionHtml;

        // Save the new state
        const state = {
            content: sectionHtml,
            url: url
        }
        window.history.pushState(state, '', url);

        if (postLoadHandler)
            await postLoadHandler();
    } catch (error) {
        // ! to be removed
        console.error('Failed to load section:', error);
        alert('There was an issue loading the content. Please try again.');
    }
}

async function loadGame() {
    loadScript('/scripts/pong.js', function() {
    console.log('Script loaded and callback executed.');
    document.body.id = "gradbackground";
});

}
