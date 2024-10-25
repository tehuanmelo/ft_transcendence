// friends.js

function sendFriendRequest(action, friendUsername, successMessage) {
    const url = `/users/${action}/${friendUsername}/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfTokenContext,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend: friendUsername })
    })
        .then(response => {
            if (response.ok)
                showSuccessMessage(successMessage);
            else {
                return response.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        showErrorMessage(data.error_message);
                    } catch (e) {
                        showErrorMessage('An unexpected error occurred.');
                    }
                });
            }
        })
        .catch((error) => {
            showErrorMessage('A network error occurred.');
        });
}

function addFriend(friendUsername) {
    sendFriendRequest('add_friend', friendUsername, 'Friend added successfully.');
}

function removeFriend(friendUsername) {
    sendFriendRequest('remove_friend', friendUsername, 'Friend removed successfully.');
}

function acceptFriend(friendUsername) {
    sendFriendRequest('accept_friend', friendUsername, 'Friend request accepted.');
}

function rejectFriend(friendUsername) {
    sendFriendRequest('reject_friend', friendUsername, 'Friend request rejected.');
}

function showSuccessMessage(successMessage) {
    document.getElementById('successMessage').innerText = successMessage;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
}

function showErrorMessage(errorMessage) {
    document.getElementById('errorMessage').innerText = errorMessage;
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
}

function showTab(tabName, event) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Update tab button state
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => link.classList.remove('active'));
    event.currentTarget.classList.add('active');
}
