const contentDiv = document.getElementById('content');

// Ensure the initial content is stored in the history state when the page first loads
window.addEventListener("DOMContentLoaded", () => {
    const initialState = {
        content: contentDiv.innerHTML,
        url: ''
    };
    window.history.replaceState(initialState, '', '');
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

async function displaySection(file, sectionUrl, postLoadHandler = null) {
    try {
        const response = await fetch(file, {
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
            url: sectionUrl
        }
        window.history.pushState(state, '', sectionUrl);

        if (postLoadHandler)
            await postLoadHandler();
    } catch (error) {
        // ! to be removed
        console.error('Failed to load section:', error);
        alert('There was an issue loading the content. Please try again.');
    }
}
