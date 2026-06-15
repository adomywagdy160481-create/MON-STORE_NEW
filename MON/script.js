// الرابط الثابت والنهائي للـ Script الخاص بك
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfZn0PW-22UGH0kc0CuRPf7YsZvx3Z7Agak01H5jby5OuEqtBJ3niCfzkky98XhQPB/exec"; 

let currentSelectedSize = "";
let currentProductTitle = "";

// دالة عرض تفاصيل المنتج وجلب المخزون
function showProductDetails(title, imgFront, imgBack) {
    currentProductTitle = title;
    
    // 1. تغيير الصور فوراً أول ما تدوس
    document.getElementById('p-img-front').src = imgFront;
    document.getElementById('p-img-back').src = imgBack;
    
    // 2. إخفاء صفحة المتجر وإظهار صفحة التفاصيل فوراً
    document.getElementById('main-store-page').style.display = 'none';
    document.getElementById('details-page').style.display = 'block';
    
    // 3. كتابة العنوان
    document.getElementById('p-title').innerText = title;
    
    // إعادة تصفير العداد والمقاس المختار القديم
    document.getElementById('myNumber').value = 1;
    currentSelectedSize = "";
    document.getElementById('p-stock-list').innerHTML = "جاري تحميل المقاسات والمخزون...";

    // 4. جلب المقاسات من جوجل شيت
    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
        // فلترة ذكية لمطابقة اسم المنتج
        let productData = data.filter(r => r.name.toString().replace(/\s+/g, '').toLowerCase() === title.replace(/\s+/g, '').toLowerCase());
        
        let html = "";
        if (productData.length === 0) {
            html = "لا توجد مقاسات متاحة لهذا المنتج حالياً.";
        } else {
            productData.forEach(item => {
                // هنا التعديل السحري: بنعرض الرقم وجنبه كلمة "قطع" عشان الشكل يفضل حلو
                html += `<button class="size-option-btn" onclick="selectSize(this, '${item.size}')">مقاس (${item.size}) | متاح: ${item.stock} قطع فقط</button>`;
            });
        }
        document.getElementById('p-stock-list').innerHTML = html;
    })
    .catch(err => {
        console.error("Fetch Error:", err);
        document.getElementById('p-stock-list').innerHTML = "خطأ في تحميل المخزون. تأكد من اتصالك.";
    });
}

// دالة اختيار المقاس
function selectSize(btn, size) {
    currentSelectedSize = size;
    document.querySelectorAll('.size-option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// دالة تعديل الكمية (+ / -)
function updateValue(change) {
    let input = document.getElementById('myNumber');
    let val = parseInt(input.value) + change;
    input.value = val < 1 ? 1 : val;
}

// دالة إتمام الطلب والذهاب للواتساب بعد تحديث الشيت
function sendOrderToWhatsApp() {
    if (!currentSelectedSize) return alert("من فضلك اختر المقاس أولاً!");
    
    let quantity = document.getElementById('myNumber').value;
    let updateUrl = `${SCRIPT_URL}?update=true&name=${encodeURIComponent(currentProductTitle)}&size=${currentSelectedSize}&qty=${quantity}`;
    
    document.getElementById('p-stock-list').innerHTML = "جاري تسجيل طلبك وتحديث المخزون...";

    fetch(updateUrl)
    .then(res => res.text())
    .then(text => {
        console.log("Response from server:", text);
        let msg = `طلب جديد: ${currentProductTitle} | المقاس: ${currentSelectedSize} | العدد: ${quantity}`;
        window.open("https://wa.me/201284962685?text=" + encodeURIComponent(msg), '_blank');
        setTimeout(() => { location.reload(); }, 1000);
    })
    .catch(err => {
        console.error("Update Error:", err);
        alert("حدث خطأ في الشبكة، سيتم تحويلك للواتساب مباشرة.");
        let msg = `طلب جديد: ${currentProductTitle} | المقاس: ${currentSelectedSize} | العدد: ${quantity}`;
        window.open("https://wa.me/201284962685?text=" + encodeURIComponent(msg), '_blank');
    });
}

// العودة للمتجر
function goBackToStore() {
    document.getElementById('details-page').style.display = 'none';
    document.getElementById('main-store-page').style.display = 'block';
}

// فتح لوحة الإدارة
function openAdminPanel() {
    let password = prompt("أدخل كلمة مرور الإدارة:");
    if(password === "2010") {
        window.open("https://sheets.google.com/", '_blank');
    } else {
        alert("كلمة المرور غير صحيحة");
    }
}