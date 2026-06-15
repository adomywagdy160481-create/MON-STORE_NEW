const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfZn0PW-22UGH0kc0CuRPf7YsZvx3Z7Agak01H5jby5OuEqtBJ3niCfzkky98XhQPB/exec"; 

let currentSelectedSize = "";
let currentProductTitle = ""; // سيحمل دائماً الاسم العربي للمطابقة مع الشيت
let currentDisplayTitle = "";  // يحمل الاسم المعروض حالياً حسب اللغة
let currentLang = "en"; // الموقع يفتح افتراضياً بالإنجليزية

// دالة تحويل اللغة (عربي / إنجليزي)
function toggleLanguage() {
    const htmlTag = document.getElementById('html-tag');
    const toggleBtn = document.getElementById('lang-toggle-btn');
    
    if (currentLang === "en") {
        currentLang = "ar";
        htmlTag.lang = "ar";
        htmlTag.dir = "rtl";
        toggleBtn.innerText = "EN";
    } else {
        currentLang = "en";
        htmlTag.lang = "en";
        htmlTag.dir = "ltr";
        toggleBtn.innerText = "AR";
    }

    // تحديث وصف الموقع السفلي
    const siteDesc = document.getElementById('site-description');
    siteDesc.innerHTML = siteDesc.getAttribute(`data-${currentLang}`);

    // تحديث أزرار الفلاتر الثلاثة
    document.getElementById('btn-all').innerText = document.getElementById('btn-all').getAttribute(`data-${currentLang}`);
    document.getElementById('btn-mon').innerText = document.getElementById('btn-mon').getAttribute(`data-${currentLang}`);
    document.getElementById('btn-chaos').innerText = document.getElementById('btn-chaos').getAttribute(`data-${currentLang}`);

    // تحديث نصوص الكروت
    document.querySelectorAll('.product-card').forEach(card => {
        const titleEl = card.querySelector('.product-title');
        const availEl = card.querySelector('.availability');
        const btnEl = card.querySelector('.view-details-btn');

        titleEl.innerText = card.getAttribute(`data-${currentLang}-title`);
        availEl.innerText = availEl.getAttribute(`data-${currentLang}`);
        btnEl.innerText = btnEl.getAttribute(`data-${currentLang}`);
    });

    // تحديث أزرار صفحة التفاصيل
    document.getElementById('buy-btn-text').innerText = document.getElementById('buy-btn-text').getAttribute(`data-${currentLang}`);
    document.getElementById('back-btn-text').innerText = document.getElementById('back-btn-text').getAttribute(`data-${currentLang}`);
}

// دالة فلترة المنتجات بناءً على الفئة المختارة
function filterProducts(category, buttonElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');

    document.querySelectorAll('.product-card').forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// دالة عرض تفاصيل المنتج وجلب المخزون بالاعتماد على الـ Card Object
function showProductDetails(cardElement, imgFront, imgBack) {
    // جلب الاسم العربي لمطابقة السكريبت الخاص بجوجل شيت بدقة
    currentProductTitle = cardElement.getAttribute('data-ar-title'); 
    currentDisplayTitle = cardElement.getAttribute(`data-${currentLang}-title`);

    // عرض الصور والعنوان الحالي
    document.getElementById('p-img-front').src = imgFront;
    document.getElementById('p-img-back').src = imgBack;
    document.getElementById('p-title').innerText = currentDisplayTitle;

    document.getElementById('main-store-page').style.display = 'none';
    document.getElementById('details-page').style.display = 'block';
    
    document.getElementById('myNumber').value = 1;
    currentSelectedSize = "";
    
    document.getElementById('p-stock-list').innerHTML = currentLang === "ar" ? "جاري تحميل المقاسات والمخزون..." : "Loading sizes and stock...";

    // جلب البيانات من شيت جوجل ومطابقتها بالاسم العربي
    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
        let productData = data.filter(r => r.name.toString().replace(/\s+/g, '').toLowerCase() === currentProductTitle.replace(/\s+/g, '').toLowerCase());
        
        let html = "";
        if (productData.length === 0) {
            html = currentLang === "ar" ? "لا توجد مقاسات متاحة لهذا المنتج حالياً." : "No sizes available for this product currently.";
        } else {
            productData.forEach(item => {
                if(currentLang === "ar") {
                    html += `<button class="size-option-btn" onclick="selectSize(this, '${item.size}')">مقاس (${item.size}) | متاح: ${item.stock} قطع فقط</button>`;
                } else {
                    html += `<button class="size-option-btn" onclick="selectSize(this, '${item.size}')">Size (${item.size}) | Available: ${item.stock} pcs</button>`;
                }
            });
        }
        document.getElementById('p-stock-list').innerHTML = html;
    })
    .catch(err => {
        console.error("Fetch Error:", err);
        document.getElementById('p-stock-list').innerHTML = currentLang === "ar" ? "خطأ في تحميل المخزون. تأكد من اتصالك." : "Error loading stock. Check your connection.";
    });
}

function selectSize(btn, size) {
    currentSelectedSize = size;
    document.querySelectorAll('.size-option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function updateValue(change) {
    let input = document.getElementById('myNumber');
    let val = parseInt(input.value) + change;
    input.value = val < 1 ? 1 : val;
}

function sendOrderToWhatsApp() {
    if (!currentSelectedSize) {
        return alert(currentLang === "ar" ? "من فضلك اختر المقاس أولاً!" : "Please select a size first!");
    }
    
    let quantity = document.getElementById('myNumber').value;
    let updateUrl = `${SCRIPT_URL}?update=true&name=${encodeURIComponent(currentProductTitle)}&size=${currentSelectedSize}&qty=${quantity}`;
    
    document.getElementById('p-stock-list').innerHTML = currentLang === "ar" ? "جاري تسجيل طلبك وتحديث المخزون..." : "Recording your order and updating stock...";

    fetch(updateUrl)
    .then(res => res.text())
    .then(text => {
        let msg = `طلب جديد: ${currentProductTitle} | المقاس: ${currentSelectedSize} | العدد: ${quantity}`;
        window.open("https://wa.me/201284962685?text=" + encodeURIComponent(msg), '_blank');
        setTimeout(() => { location.reload(); }, 1000);
    })
    .catch(err => {
        console.error("Update Error:", err);
        alert(currentLang === "ar" ? "حدث خطأ في الشبكة، سيتم تحويلك للواتساب مباشرة." : "Network error, redirecting to WhatsApp directly.");
        let msg = `طلب جديد: ${currentProductTitle} | المقاس: ${currentSelectedSize} | العدد: ${quantity}`;
        window.open("https://wa.me/201284962685?text=" + encodeURIComponent(msg), '_blank');
    });
}

function goBackToStore() {
    document.getElementById('details-page').style.display = 'none';
    document.getElementById('main-store-page').style.display = 'block';
}

function openAdminPanel() {
    let password = prompt(currentLang === "ar" ? "أدخل كلمة مرور الإدارة:" : "Enter Admin Password:");
    if(password === "MON") {
        window.open("https://sheets.google.com/", '_blank');
    } else {
        alert(currentLang === "ar" ? "كلمة المرور غير صحيحة" : "Incorrect password");
    }
}