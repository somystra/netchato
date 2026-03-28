// FIREBASE INTERACTION & INTERFACE LOGIC
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();

let userSession = null;

// Tizimni ishga tushirish
function initSystem(user) {
    userSession = user;
    document.getElementById('top-username').innerText = user.username;
    loadFeed();
    loadStories();
}

// Instagram Post yuklash funksiyasi
async function uploadPost(file) {
    const timestamp = Date.now();
    const storageRef = storage.ref(`posts/${userSession.uid}/${timestamp}_${file.name}`);
    
    try {
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        
        db.ref('insta_posts').push({
            uid: userSession.uid,
            username: userSession.username,
            avatar: userSession.avatar,
            content: url,
            type: file.type.startsWith('image/') ? 'img' : 'vid',
            caption: "NetGlobal OS orqali yuborildi 🚀",
            likes: 0,
            time: timestamp
        });
    } catch (error) {
        console.error("Yuklashda xatolik:", error);
    }
}

// Postlarni Real-time yuklash
function loadFeed() {
    const feed = document.getElementById('insta-feed');
    db.ref('insta_posts').on('child_added', (snap) => {
        const p = snap.val();
        const postHTML = createPostHTML(snap.key, p);
        feed.insertAdjacentHTML('afterbegin', postHTML);
    });
}

// Post HTML strukturasi
function createPostHTML(id, p) {
    return `
        <div class="insta-post" id="post-${id}">
            <div class="post-header" style="padding:10px; display:flex; align-items:center; gap:10px;">
                <img src="${p.avatar}" style="width:30px; height:30px; border-radius:50%;">
                <span style="font-weight:600; font-size:14px;">${p.username}</span>
            </div>
            <div class="post-media">
                ${p.type === 'img' ? `<img src="${p.content}">` : `<video controls src="${p.content}"></video>`}
            </div>
            <div class="post-footer" style="padding:12px;">
                <div class="btns" style="font-size:20px; display:flex; gap:15px; margin-bottom:8px;">
                    <i class="far fa-heart" onclick="like(this)"></i>
                    <i class="far fa-comment"></i>
                </div>
                <div style="font-size:13px;"><b>${p.username}</b> ${p.caption}</div>
            </div>
        </div>
    `;
}
