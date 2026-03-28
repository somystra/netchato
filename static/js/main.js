// 1. Tizim o'zgaruvchilari
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();
let currentUser = null;

// 2. Kirish funksiyasi (Auth)
window.osLogin = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(res => {
        db.ref('users/' + res.user.uid).once('value', snap => {
            if(snap.exists()) {
                currentUser = snap.val();
                startOS();
            } else {
                document.getElementById('auth-step-1').style.display = 'none';
                document.getElementById('auth-step-2').style.display = 'block';
            }
        });
    }).catch(err => alert("Kirishda xatolik: " + err.message));
};

// 3. Profilni yakunlash
window.osComplete = function() {
    const u = auth.currentUser;
    const uname = document.getElementById('os-username').value.trim();
    if(!uname) return alert("Username kiriting!");
    
    currentUser = {
        uid: u.uid,
        name: u.displayName,
        username: uname.startsWith('@') ? uname : '@' + uname,
        avatar: u.photoURL,
        bio: "NetGlobal OS User"
    };
    
    db.ref('users/' + u.uid).set(currentUser).then(() => {
        startOS();
    });
};

// 4. Tizimni ishga tushirish (Main Boot)
function startOS() {
    const authWall = document.getElementById('auth-wall');
    if(authWall) authWall.style.display = 'none';
    
    // Profil ma'lumotlarini interfeysga yuklash
    const topUser = document.getElementById('top-username');
    if(topUser) topUser.innerText = currentUser.username;
    
    loadInstaFeed(); // Postlarni yuklash
    console.log("NetGlobal OS muvaffaqiyatli ishga tushdi!");
}

// 5. Instagram Post yuklash (Tugma bosilganda)
window.uploadToInsta = function(input) {
    const file = input.files[0];
    if(!file) return;

    // Yuklash boshlanganini ko'rsatish (Visual Feedback)
    console.log("Yuklanmoqda...");
    
    const ref = storage.ref(`insta_pro/${Date.now()}_${file.name}`);
    ref.put(file).then(s => s.ref.getDownloadURL()).then(url => {
        const type = file.type.startsWith('image/') ? 'img' : 'vid';
        db.ref('insta_posts').push({
            uid: currentUser.uid,
            username: currentUser.username,
            avatar: currentUser.avatar,
            content: url,
            type: type,
            likes: 0,
            caption: "Yangi post #NetGlobalOS",
            time: Date.now()
        });
        alert("Post muvaffaqiyatli yuklandi!");
    }).catch(err => alert("Yuklashda xato: " + err.message));
};

// 6. Postlarni Lentaga chiqarish
function loadInstaFeed() {
    const feed = document.getElementById('insta-feed');
    if(!feed) return;

    db.ref('insta_posts').on('child_added', snap => {
        const p = snap.val();
        const media = p.type === 'img' ? `<img src="${p.content}">` : `<video controls src="${p.content}"></video>`;
        
        const postHTML = `
            <div class="insta-post" id="${snap.key}">
                <div class="post-header" style="padding:12px; display:flex; align-items:center; gap:10px;">
                    <img src="${p.avatar}" style="width:32px; height:32px; border-radius:50%;">
                    <b style="font-size:14px;">${p.username}</b>
                </div>
                <div class="post-media">${media}</div>
                <div class="post-footer" style="padding:15px;">
                    <div class="post-btns" style="display:flex; gap:20px; font-size:22px; margin-bottom:10px;">
                        <i class="far fa-heart" onclick="window.likePost('${snap.key}', this)"></i>
                        <i class="far fa-comment"></i>
                        <i class="far fa-paper-plane"></i>
                    </div>
                    <span class="likes-count" style="font-weight:600; font-size:14px;">${p.likes || 0} likes</span>
                    <div style="font-size:14px; margin-top:5px;"><b>${p.username}</b> ${p.caption}</div>
                </div>
            </div>`;
        feed.insertAdjacentHTML('afterbegin', postHTML);
    });
}

// 7. Like funksiyasi
window.likePost = function(id, el) {
    el.classList.toggle('fas');
    el.classList.toggle('far');
    el.style.color = el.classList.contains('fas') ? '#ed4956' : '';
    // Like sonini oshirish mantiqini qo'shish mumkin
};
