# كَوادر النقل — صفحة تسجيل البيانات

موقع static جاهز للنشر على **GitHub Pages مجانًا**، يجمع بيانات السائقين وأصحاب المركبات والشركات ويسجّلها في **Google Sheet**.

## الملفات
| الملف | الوظيفة |
|------|---------|
| `index.html` | الصفحة الرئيسية + التصميم |
| `app.js` | منطق النماذج والتحكم في `?jos=` |
| `config.js` | **ضع هنا رابط Google Apps Script** |
| `Code.gs` | كود الخادم اللي يسجّل في الشيت |

## روابط النماذج
- سائق: `index.html?jos=driver`
- صاحب مركبة: `index.html?jos=owner_car`
- شركة: `index.html?jos=company`
- بدون باراميتر: تظهر صفحة اختيار الصفة.

---

## خطوة 1 — جهّز Google Sheet + Apps Script
1. افتح [sheets.new](https://sheets.new) لإنشاء جدول جديد (سمّيه مثلًا "بيانات كوادر النقل").
2. من القائمة: **Extensions → Apps Script**.
3. امسح أي كود موجود، والصق محتوى ملف `Code.gs` بالكامل.
4. اضغط **Save** (أيقونة الحفظ).

## خطوة 2 — انشر السكريبت كـ Web App
1. اضغط **Deploy → New deployment**.
2. عند **Select type** اختر **Web app**.
3. الإعدادات:
   - **Execute as:** `Me` (حسابك)
   - **Who has access:** `Anyone`  ← مهم جدًا علشان الموقع يقدر يبعت.
4. اضغط **Deploy**، وافق على الصلاحيات (Authorize).
5. انسخ الرابط الظاهر (`Web app URL`)، شكله:
   `https://script.google.com/macros/s/AKfyc..../exec`

## خطوة 3 — اربط الموقع بالشيت
افتح `config.js` وضع الرابط مكان النص:
```js
window.SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfyc..../exec";
```

> ملاحظة: لو عدّلت `Code.gs` لاحقًا، اعمل **Deploy → Manage deployments → Edit → Version: New version** علشان التعديل يفعّل.

---

## خطوة 4 — انشر على GitHub Pages
1. ارفع محتوى فولدر `landing/` لمستودع على GitHub (ممكن يكون الفرع `main`).
2. من **Settings → Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` و الفولدر `/ (root)` أو `/landing` حسب مكان الملفات.
3. هيظهر رابط الموقع خلال دقيقة، مثل:
   `https://USERNAME.github.io/REPO/?jos=driver`

---

## خطوة 5 — ربط الدومين الرئيسي elmogal.com
ملف `CNAME` موجود بالفعل وفيه `elmogal.com`، فالموقع هيُخدَم على الجذر مباشرة.

### أ) عند مزوّد الدومين (registrar)
بعد ما تشتري `elmogal.com`، ادخل إعدادات الـ DNS وضيف:

**سجلات A** للدومين الجذر (`@`) تشاور على سيرفرات GitHub:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
**وسجل CNAME** للـ www يشاور على صفحة GitHub:
```
www  →  USERNAME.github.io
```
(غيّر `USERNAME` لاسم حسابك على GitHub.)

### ب) في GitHub
1. **Settings → Pages → Custom domain** → اكتب `elmogal.com` → Save.
2. استنى لحد ما يظهر ✓ (DNS check)، بعدها فعّل **Enforce HTTPS**.

بكده الروابط تبقى:
- `https://elmogal.com/?jos=driver`
- `https://elmogal.com/?jos=owner_car`
- `https://elmogal.com/?jos=company`

> ملاحظة: انتشار الـ DNS ممكن ياخد من دقائق لـ 24 ساعة. لحد ما يجهز، استخدم رابط `USERNAME.github.io`.

---

## ملاحظات
- البيانات تتسجل في تبويبات منفصلة داخل نفس الشيت: **السائقون / أصحاب المركبات / الشركات**.
- أي حقل جديد تضيفه في `app.js` يُضاف عموده تلقائيًا في الشيت.
- لا شيء في الصفحة يكشف أنها نظام SaaS — العرض كأنها شركة توظيف وتوفير عمالة.
- التصدير لـ Excel: من الشيت **File → Download → Microsoft Excel (.xlsx)**.
