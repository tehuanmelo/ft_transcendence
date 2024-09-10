const contentDiv = document.getElementById('content');
let initialState;
let currentScript = null;
const loadedScripts = new Set();

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
    { url: '/', file: 'start.html', title: 'Pong', script: null },
    { url: '/login', file: 'login-form.html', title: 'Login', script: 'scripts/entry-form.js' },
    { url: '/register', file: 'register-form.html', title: 'Registration', script: 'scripts/entry-form.js' },
    { url: '/game', file: 'pong.html', title: 'Game', script: 'scripts/pong.js' },
    { url: '/home', file: 'home.html', title: 'Home', script: null },
    // { url: '/tournament', file: 'tournament.html', title: '', script: null },
    // { url: '/about', file: 'about.html', title: '', script: null },
    // { url: '/profile', file: 'profile.html', title: '', script: null },
];

async function loadContent(url) {
    const route = validRoutes.find(route => route.url === url);
    if (!route) {
        // TODO: make sure to not remove current content if route is invalid
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
        document.title = route.title;

        // Save the new state
        const state = {
            content: sectionHtml,
            url: url
        }
        window.history.pushState(state, '', url);

        if (currentScript) {
            document.head.removeChild(currentScript);
            currentScript = null;
        }

        if (route.script)
            loadScript(route.script);
    } catch (error) {
        // ! to be removed
        console.error('Failed to load section:', error);
        alert('There was an issue loading the content. Please try again.');
    }
}

function loadScript(src) {
    if (loadedScripts.has(src))
        return;

    var script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;

    // Handle script load
    script.onload = () => {
        loadedScripts.add(src);
        currentScript = script;
    };

    // Handle script error
    script.onerror = () => {
        console.error('Script failed to load:', src);
    };

    document.head.appendChild(script);
}
