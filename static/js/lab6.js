const toggleFollow = ev => {
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    if (elem.getAttribute('aria-checked') === 'false') {
        // issue post request:
        followUser(elem.dataset.userId, elem);
    } else {
        // issue delete request:
        unfollowUser(elem.dataset.followingId, elem);
    }
};

const followUser = (userId, elem) => {
    const postData = {
        "user_id": userId
    };
    
    fetch("http://127.0.0.1:5000/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'unfollow';
            elem.setAttribute('aria-checked', 'true');
            elem.classList.add('unfollow'); 
            elem.classList.remove('follow');
            elem.setAttribute('data-following-id', data.id);
        });
};

const unfollowUser = (followingId, elem) => {
    // issue a delete request:
    const deleteURL = `http://127.0.0.1:5000/api/following/${followingId}`;
    fetch(deleteURL, {
            method: "DELETE"
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = 'follow';
            elem.classList.add('follow');
            elem.classList.remove('unfollow');
            elem.removeAttribute('data-following-id');
            elem.setAttribute('aria-checked', 'false');
        });
};


const user2Html = user => {
    return `
    <div class="suggestion">
        <img src="${user.thumb_url}" />
        <div>
            <p class="username">${user.username}</p>
            <p class="suggestion-text">suggested for you</p>
        </div>
        <div>
            <button 
                class="follow" 
                aria-label="Follow"
                aria-checked="false"
                data-user-id="${user.id}" 
                onclick="toggleFollow(event);">follow</button>
        </div>
    </div>`;
};

const getSuggestions = () => {
    fetch('http://127.0.0.1:5000/api/suggestions/')
        .then(response => response.json())
        .then(users => {
            console.log(users);
            const html = users.map(user2Html).join('\n');
            document.querySelector('.suggestions').innerHTML = html;
        });
};


getSuggestions();