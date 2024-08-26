// Ensure the initial content is stored in the history state when the page first loads
window.addEventListener("DOMContentLoaded", () => {
    const initialState = {
        content: document.getElementById('content').innerHTML,
        url: ''
    };
    window.history.replaceState(initialState, '', '');
});

// Listen for the popstate event to handle back/forward navigation
window.addEventListener("popstate", (event) => {
    if (event.state) {
        document.getElementById('content').innerHTML = event.state.content;
    } else {
        // Handle the case where there is no state (e.g., the first page load)
        document.getElementById('content').innerHTML = initialState.content;
    }
});

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

    // Save the new state
    const state = {
        content: sectionHtml,
        url: sectionUrl
    }
    window.history.pushState(state, '', sectionUrl);
}
