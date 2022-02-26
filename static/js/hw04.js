const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};

const destroyModal = ev =>{
    document.querySelector('#modal-container').innerHTML = "";
    document.getElementById("viewAll").focus();
};
const showPostDetail = ev => {
    const postId = ev.currentTarget.dataset.postId;

    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            let html = `
                <div class = "modal-bg">
                    <button id = "myButton" onclick = "destroyModal(event)">Close</button>
                    <div class = "modal">
                        <img src = "${post.image_url}" style = "width: 60%; height: 100%; border-bottom-left-radius: 5px; border-top-left-radius: 5px;"/>
                        <div style = "padding: 20px; margin-left 3%; width: 35%; height: 100%; float: right; overflow: auto;">
                `;

            for(let i = 0; i < post.comments.length; i ++){
                let comment = post.comments[i];
                html += `
                    <div style = "display: flex;">
                        <img src="${comment.user.thumb_url}" class = "circle2" style = "float: left; align-self:center;"/>
                        <div class = "username" style = "float: left; align-self:center; font-size: x-large; margin-left: 30px;">${comment.user.username}</div>
                    </div>
                    <div>
                        <div>
                            ${comment.text}
                        </div class = "suggestion-text">
                        <div style = "font-size: 0.9em; color: #555;">${comment.display_time}</div>
                    </div>
                    </br>
                `;
            }
            html +=
                `       </div> 
                    </div>
                </div>`;
            document.querySelector('#modal-container').innerHTML = html;
            document.getElementById("myButton").focus();
        })
};


const displayComments = (comments, postID) => {
    let html = '';
    let co = JSON.stringify(comments).replace(/"/g, '&quot;')
    if(comments.length > 1){
        html +=`
            <button id = "viewAll" class = "link" data-post-id = "${postID}" onclick = "showPostDetail(event)"> 
                view all ${comments.length} 
            comments</button>
        `
    }
    if(comments && comments.length > 0){
        const lastComment = comments[comments.length - 1];
        html +=  `
            <p>
                <strong>${lastComment.user.username}</strong>
                ${lastComment.text}
            </p>
            <div>${lastComment.display_time}</div>
        `
    }
    html += `
        <div class="add-comment">
            <div class="input-holder">
                <input id = "textBox" type="text" aria-label="Add a comment" placeholder="Add a comment...">
            </div>
            <button class="link" data-post-id="${postID}" onclick = "addComments(event)">Post</button>
        </div>
    `;
    return html;
};

const addComments = ev => {
    let text = document.getElementById('textBox').value;
    const elem = ev.currentTarget;
    const postData = {
        "post_id": elem.dataset.postId,
        "text": text
    };
    
    fetch("http://127.0.0.1:5000/api/comments", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
    displayPosts();
};




const likePost = (postId, elem) => {
    const postData = {
    };
    
    fetch(`http://127.0.0.1:5000/api/posts/${postId}/likes/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = '<i class="fas fa-heart"></i>';
            elem.setAttribute('aria-checked', 'true');
            elem.setAttribute('data-curr-id', data.id);
        });
};

const unlikePost = (postId, currId, elem) => {
    // issue a delete request:
    const deleteURL = `http://127.0.0.1:5000/api/posts/${postId}/likes/${currId}`;
    fetch(deleteURL, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = '<i class="far fa-heart"></i>';
            elem.setAttribute('aria-checked', 'false');
        });
};

const likeUnlike = ev => {
    console.log('like / unlike button clicked');
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    if (elem.getAttribute('aria-checked') === 'false') {
        // issue post request:
        likePost(elem.dataset.postId, elem);
    }else {
        // issue delete request:
        unlikePost(elem.dataset.postId, elem.dataset.currId, elem);
    }
    displayPosts();
}

const bookPost = (postId, elem) => {
    const postData = {
        "post_id": postId
    };
    
    fetch("http://127.0.0.1:5000/api/bookmarks/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = '<i class="fas fa-bookmark"></i>';
            elem.setAttribute('aria-checked', 'true');
            elem.setAttribute('data-curr-id', data.id);
        });
};

const unbookPost = (currId, elem) => {
    // issue a delete request:
    const deleteURL = `http://127.0.0.1:5000/api/bookmarks/${currId}`;
    fetch(deleteURL, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            elem.innerHTML = '<i class="far fa-bookmark"></i>';
            elem.setAttribute('aria-checked', 'false');
        });
};

const bookUnbook = ev => {
    console.log('book / unbook button clicked');
    const elem = ev.currentTarget;
    console.log(elem.dataset);
    if (elem.getAttribute('aria-checked') === 'false') {
        // issue post request:
        bookPost(elem.dataset.postId, elem);
    }else {
        // issue delete request:
        unbookPost(elem.dataset.currId, elem);
    }
    displayPosts();
}
const post2Html = post => {
    return `
        <section class="card">
            <div class="header">
                <h3> ${ post.user.username}</h3>
                <i class="fa fa-dots"></i>
            </div>
            <img src="${ post.image_url }" alt="Image posted by ${ post.user.username }" width="300" height="300">
            <div class="info">
                <div class="buttons">
                    <div>
                        <button style = "border:none;background-color:transparent; padding: 0px; font-size: 20.8px" data-curr-id = "${ post.current_user_like_id}" data-post-id="${post.id}" aria-checked="${ post.current_user_like_id ? 'true' : 'false'}" onclick = "likeUnlike(event)">
                            <i class="fa${ post.current_user_like_id ? 's' : 'r'} fa-heart"></i>
                        </button>
                        <i class="far fa-comment"></i>
                        <i class="far fa-paper-plane"></i>
                    </div>
                    <button style = "border:none;background-color:transparent; padding: 0px; font-size: 20.8px" data-curr-id = "${ post.current_user_bookmark_id}" data-post-id="${post.id}" aria-checked="${ post.current_user_bookmark_id ? 'true' : 'false'}" onclick = "bookUnbook(event)">
                        <i class="fa${ post.current_user_bookmark_id ? 's' : 'r'} fa-bookmark"></i>
                    </button>
                </div>
                <p class="likes"><strong>${ post.likes.length } like${post.likes.length != 1 ? 's' : ''}</strong></p>
                <div class="caption">
                <p>
                    <strong>${ post.user.username }</strong> 
                    ${ post.caption }
                </p>
            </div>
            <div class = "comments">
                ${displayComments(post.comments, post.id)}
            </div>
        </section>
    `;
};

// fetch data from your API endpoint:
const displayPosts = () => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};
// 1. Get the post data from the API endpoint
// 2. When that data arrives, we're going to build a bunch of HTML cards
// 3. Update the container and put the html inside of it
const initPage = () => {
    displayStories();
    displayPosts();
};

// invoke init page to display stories:
initPage();