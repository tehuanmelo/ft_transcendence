// friends.js

function sendFriendRequest(action, friendUsername, successMessage = null) {
    const url = `/users/${action}/${friendUsername}/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend: friendUsername })
    })
        .then(response => {
            if (response.ok) {
                if (successMessage)
                    showSuccessMessage(successMessage);

            }
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
    sendFriendRequest('add_friend', friendUsername, 'Friend request sent successfully.');
}

function removeFriend(friendUsername) {
    sendFriendRequest('remove_friend', friendUsername);
}

function acceptFriend(friendUsername) {
    sendFriendRequest('accept_friend', friendUsername);
}

function rejectFriend(friendUsername) {
    sendFriendRequest('reject_friend', friendUsername);
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');

    // Create the alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.setAttribute('role', 'alert');
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alertElement);

    // Automatically remove the alert after 3 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
        alertElement.classList.add('hide');
        setTimeout(() => {
            alertContainer.removeChild(alertElement);
        }, 150); // Allow time for the hide transition
    }, 3000);
}

function showErrorMessage(message) {
    showAlert(message, 'danger');
}

function showSuccessMessage(message) {
    showAlert(message, 'success');
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

function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById('friendUsername').value;
    if (query)
        searchUsers(query);
}

function searchUsers(query) {
    if (query.length > 0) {
        fetch(`/users/friends/search/${query}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success)
                    displaySearchResults(data.users);
                else
                    showErrorMessage(data.error_message);
            })
            .catch((error) => {
                showErrorMessage('A network error occurred.');
            });
    }
    else
        document.getElementById('searchResults').innerHTML = '';
}

function displaySearchResults(users) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (users.length > 0) {
        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'friend-card';

            userCard.innerHTML = `
                <div class="friend-info">
                    <div class="friend-avatar">
                        ${user.profile_image
                    ? `<img src="${user.profile_image}" class="rounded-circle" alt="${user.username}'s Profile Image">`
                    : `<img src="/static/images/default_user.jpg" class="rounded-circle" alt="Default User Image">`}
                    </div>
                    <div class="friend-details ms-3">
                        <span class="friend-username">${user.username}</span>
                    </div>
                </div>
                <button type="button" class="friend-action" onclick="addFriend('${user.username}')">
                    <i class="fas fa-user-plus"></i>
                </button>
            `;

            searchResults.appendChild(userCard);
        });
    }
    else
        searchResults.innerHTML = '<div class="no-friends">No users found.</div>';
}
