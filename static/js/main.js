// NETGLOBAL OS - PROFESSIONAL JS MODULE
// (HTML ichidagi onclick buyruqlaridan voz kechib, barcha tugmalarni JS orqali boshqaramiz)

// Barcha funksiyalar brauzer oynasi to'liq yuklangandan so'ng ishga tushadi
window.addEventListener('load', function() {

    // --- 1. FIREBASE XIZMATLARI (GLOBAL) ---
    const db = firebase.database();
    const auth = firebase.auth();
    const storage = firebase.storage();
    let currentUserData = null; // Tizimga kirgan foydalanuvchi ma'lumotlari

    console.log("NetGlobal OS: Firebase xizmatlari tayyor.");

    // --- 2. HTML ELEMENTLARNI CHAQIRISH (DOM) ---
    // Auth (Kirish)
    const authScreen = document.getElementById('auth-screen');
    const loginUi = document.getElementById('login-ui');
    const regUi = document.getElementById('reg-ui');
    const btnLoginGoogle = document.getElementById('btnLoginGoogle');
    const btnCompleteProfile = document.getElementById('btnCompleteProfile');
    const osUsernameInput = document.getElementById('os-username-input');

    // App (Asosiy interfeys)
    const mainOs = document.getElementById('main-os');
    const topUsernameDisplay = document.getElementById('top-username-display');
    const topAvatarImg = document.getElementById('top-avatar-img');
    const feedStreamCont = document.getElementById('feed-stream-cont');

    // Compose (Post yaratish)
    const btnOpenCompose = document.getElementById('btnOpenCompose');
    const btnCloseCompose = document.getElementById('btnCloseCompose');
    const composeWidgetModal = document.getElementById('compose-widget-modal');
    const mediaFileUpload = document.getElementById('media-file-upload');
    const btnPublishPost = document.getElementById('btnPublishPost');
    const postCaptionInput = document.getElementById('post-caption-input');

    // --- 3. TUGMALARGA FUNKSIYALARNI BIRIKTIRISH (EVENT LISTENERS) ---
    // Kirish tugmasi (Google)
    if (btnLoginGoogle) {
        btnLoginGoogle.addEventListener('click', handleGoogleLogin);
    }

    // Profilni yakunlash tugmasi
    if (btnCompleteProfile) {
        btnCompleteProfile.addEventListener('click', handleProfileCompletion);
    }

    // Post yaratish oynasini ochish
    if (btnOpenCompose) {
        btnOpenCompose.addEventListener('click', () => {
            composeWidgetModal.style.display = 'flex';
        });
    }

    // Post yaratish oynasini yopish
    if (btnCloseCompose) {
        btnCloseCompose.addEventListener('click', () => {
            composeWidgetModal.style.display = 'none';
        });
    }

    // Media fayl tanlash (change event)
    if (mediaFileUpload) {
        mediaFileUpload.addEventListener('change', function(e) {
            handleFileUpload(e.target.files[0]);
        });
    }

    // Postni ulashish tugmasi
    if (btnPublishPost) {
        btnPublishPost.addEventListener('click', handlePublishPost);
    }

    console.log("NetGlobal OS: Barcha tugmalar faollashtirildi.");


    // --- 4. ASOSIY FUNKSIYALAR MANTOQI ---

    // A. GOOGLE LOGIN MANTOQI
    function handleGoogleLogin() {
        console.log("Google Identity ishga tushdi...");
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then(res => {
            // Bazadan foydalanuvchini tekshirish
            db.ref('users/' + res.user.uid).once('value', snap => {
                if(snap.exists()) {
                    // Agar bazada bo'lsa, tizimni ishga tushirish
                    currentUserData = snap.val();
                    bootSystem();
                } else {
                    // Agar birinchi marta kirsa, profilni sozlash sahifasini ko'rsatish
                    loginUi.style.display = 'none';
                    regUi.style.display = 'block';
                }
            });
        }).catch(err => alert("Kirishda xatolik yuz berdi: " + err.message));
    }

    // B. PROFILNI YAKUNLASH MANTOQI
    function handleProfileCompletion() {
        const user = auth.currentUser;
        const uname = osUsernameInput.value.trim();
        if(!uname) return alert("Iltimos, noyob @username tanlang!");
        
        currentUserData = {
            uid: user.uid,
            fullname: user.displayName,
            username: uname.startsWith('@') ? uname : '@' + uname,
            avatar: user.photoURL,
            bio: "NetGlobal OS a'zosi"
        };
        
        // Ma'lumotlarni bazaga yozish
        db.ref('users/' + user.uid).set(currentUserData).then(() => {
            bootSystem();
        });
    }

    // C. SYSTEM BOOT MANTOQI (TIZIMNI ISHGA TUSHIRISH)
    function bootSystem() {
        console.log("NetGlobal OS ishga tushmoqda...");
        
        // Kirish sahifasini yopish, asosiy sahifani ochish
        authScreen.style.display = 'none';
        mainOs.style.display = 'flex';
        
        // Tepa qismdagi profil ma'lumotlarini yangilash
        topUsernameDisplay.innerText = currentUserData.username;
        topAvatarImg.src = currentUserData.avatar;
        
        // Postlarni lentaga chiqarish
        streamPostsToFeed();
    }

    // D. POST YUKLASH MANTOQI
    function handleFileUpload(file) {
        if(!file) return;
        alert("Fayl tanlandi: " + file.name + ". Ulashish tugmasini bosing.");
    }

    function handlePublishPost() {
        const fileInput = document.getElementById('media-file-upload');
        const file = fileInput.files[0];
        const caption = postCaptionInput.value.trim();
        
        if(!caption && !file) return alert("Post uchun biror narsa yozing yoki rasm tanlang!");
        
        console.log("Post ulashilmoqda...");
        composeWidgetModal.style.display = 'none'; // Oynani yopish
        
        if(file) {
            // Rasm yoki Video bo'lsa, avval Storage-ga yuklash
            const ref = storage.ref(`insta_pro/${Date.now()}_${file.name}`);
            ref.put(file).then(s => s.ref.getDownloadURL()).then(url => {
                const type = file.type.startsWith('image/') ? 'img' : 'vid';
                publishPostToDatabase({ type: type, content: url, caption: caption });
            }).catch(err => alert("Fayl yuklashda xato: " + err.message));
        } else {
            // Faqat matnli post bo'lsa
            publishPostToDatabase({ type: 'text', content: caption });
        }
    }

    // Post ma'lumotlarini Realtime Database-ga yozish
    function publishPostToDatabase(data) {
        db.ref('os_posts').push({
            ...data,
            uid: currentUserData.uid,
            username: currentUserData.username,
            avatar: currentUserData.avatar,
            time: Date.now(),
            likes: 0
        }).then(() => {
            postCaptionInput.value = ""; // Matn maydonini tozalash
            alert("Post muvaffaqiyatli ulashildi!");
        });
    }

    // E. FEED STREAMING (POSTLARNI LENTAGA CHIQARISH)
    function streamPostsToFeed() {
        console.log("Postlar yuklanmoqda...");
        feedStreamCont.innerHTML = ""; // Avvalgi postlarni tozalash

        db.ref('os_posts').limitToLast(30).on('child_added', snap => {
            const p = snap.val();
            let mediaHtml = "";
            
            if(p.type === 'img') mediaHtml = `<div class="post-media" style="width:100%;"><img src="${p.content}" style="width:100%;"></div>`;
            else if(p.type === 'vid') mediaHtml = `<div class="post-media"><video controls src="${p.content}" style="width:100%;"></video></div>`;
            else mediaHtml = `<div class="post-text-content" style="padding: 20px; background: rgba(0,0,0,0.2); font-size:16px;">${p.content}</div>`;
            
            const postHTML = `
            <div class="insta-post" id="post-${snap.key}" style="width:100%; max-width:500px; background:rgba(30,41,59,0.5); border-radius:16px; border:1px solid rgba(255,255,255,0.05); margin-bottom:25px; overflow:hidden;">
                <div class="post-header" style="padding:12px; display:flex; align-items:center; gap:10px;">
                    <img src="${p.avatar}" style="width:32px; height:32px; border-radius:50%;">
                    <b style="font-size:14px;">${p.username}</b>
                    ${p.uid === currentUserData.uid ? `<i class="fas fa-trash action-icon" style="margin-left:auto; opacity:0.3; cursor:pointer;" onclick="deleteOsPost('${snap.key}')"></i>` : ''}
                </div>
                ${mediaHtml}
                <div class="post-footer" style="padding:15px;">
                    <div class="post-btns" style="display:flex; gap:20px; font-size:22px; margin-bottom:10px;">
                        <i class="far fa-heart action-icon" onclick="likeOsPost('${snap.key}', this)"></i>
                        <i class="far fa-comment action-icon"></i>
                        <i class="far fa-paper-plane action-icon"></i>
                    </div>
                    <span class="likes-count" style="font-weight:600; font-size:14px;">${p.likes || 0} likes</span>
                    <div style="font-size:14px; margin-top:5px;"><b>${p.username}</b> ${p.caption || ''}</div>
                </div>
            </div>`;
            
            feedStreamCont.insertAdjacentHTML('afterbegin', postHTML);
        });
        
        db.ref('os_posts').on('child_removed', snap => {
            const el = document.getElementById('post-' + snap.key);
            if(el) el.remove();
        });
    }

});

// (Tashqi funksiyalar)
function likeOsPost(id, el) {
    el.classList.toggle('fas');
    el.classList.toggle('far');
    el.style.color = el.classList.contains('fas') ? '#ed4956' : '';
}

function deleteOsPost(id) {
    if(confirm("Postni o'chirishni tasdiqlaysizmi?")) {
        firebase.database().ref('os_posts/' + id).remove();
    }
}
