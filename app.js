/* =========================================================
   كَوادر النقل — منطق النماذج والإرسال
   يتحكم في النموذج المعروض حسب باراميتر ?jos=
   driver | owner_car | sales_rep | company
   ========================================================= */

(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  // محافظات مصر
  const GOVS = ["القاهرة","الجيزة","الإسكندرية","القليوبية","الدقهلية","الشرقية","الغربية","المنوفية","البحيرة","كفر الشيخ","دمياط","بورسعيد","الإسماعيلية","السويس","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","الفيوم","بني سويف","مطروح","شمال سيناء","جنوب سيناء","البحر الأحمر","الوادي الجديد"];

  const govOptions = GOVS.map(g => ({ v: g, t: g }));

  // تعريف النماذج لكل صفة
  const FORMS = {
    driver: {
      title: "تسجيل بيانات سائق",
      subtitle: "سجّل خبراتك ورخصتك وسنتواصل معك بالفرص المناسبة.",
      badge: "🧑‍✈️ نموذج السائق",
      fields: [
        { name: "full_name", label: "الاسم بالكامل", type: "text", required: true, ph: "مثال: محمد أحمد علي" },
        { name: "phone", label: "رقم الموبايل", type: "tel", required: true, ph: "01xxxxxxxxx", pattern: "01[0-9]{9}", hint: "رقم مصري مكوّن من 11 رقم" },
        { name: "whatsapp", label: "رقم واتساب (إن وجد)", type: "tel", ph: "01xxxxxxxxx" },
        { name: "governorate", label: "المحافظة", type: "select", required: true, options: govOptions },
        { name: "age", label: "السن", type: "number", min: 18, max: 70, ph: "مثال: 32" },
        { name: "license_type", label: "نوع الرخصة", type: "select", required: true, options: [
          { v: "خاصة", t: "خاصة" },
          { v: "مهنية درجة أولى", t: "مهنية درجة أولى" },
          { v: "مهنية درجة ثانية", t: "مهنية درجة ثانية" },
          { v: "مهنية درجة ثالثة", t: "مهنية درجة ثالثة" },
          { v: "بدون رخصة", t: "بدون رخصة" },
        ]},
        { name: "experience_years", label: "سنوات الخبرة", type: "number", required: true, min: 0, max: 50, ph: "مثال: 5" },
        { name: "vehicle_types", label: "نوع المركبات التي تجيد قيادتها", type: "select", required: true, options: [
          { v: "ملاكي", t: "ملاكي" },
          { v: "ميكروباص", t: "ميكروباص" },
          { v: "ميني باص / أتوبيس", t: "ميني باص / أتوبيس" },
          { v: "نقل خفيف", t: "نقل خفيف" },
          { v: "نقل ثقيل", t: "نقل ثقيل" },
          { v: "تريلا", t: "تريلا" },
          { v: "موتوسيكل", t: "موتوسيكل (ديليفري)" },
        ]},
        { name: "has_own_vehicle", label: "هل تمتلك مركبة خاصة؟", type: "select", required: true, options: [
          { v: "نعم", t: "نعم، أمتلك مركبة" },
          { v: "لا", t: "لا، أبحث عن مركبة للعمل عليها" },
        ]},
        { name: "availability", label: "نوع العمل المطلوب", type: "select", options: [
          { v: "دوام كامل", t: "دوام كامل" },
          { v: "دوام جزئي", t: "دوام جزئي" },
          { v: "يومية", t: "يومية / مؤقت" },
        ]},
        { name: "current_salary", label: "الراتب الحالي (جنيه/شهريًا)", type: "number", min: 0, ph: "مثال: 6000", hint: "اتركه فارغًا إن كنت لا تعمل حاليًا" },
        { name: "expected_salary", label: "الراتب المتوقع (جنيه/شهريًا)", type: "number", required: true, min: 0, ph: "مثال: 9000" },
        { name: "notes", label: "ملاحظات إضافية", type: "textarea", full: true, ph: "أي تفاصيل تريد إضافتها..." },
      ],
    },

    owner_car: {
      title: "تسجيل بيانات صاحب مركبة",
      subtitle: "سجّل مركباتك وسنوفر لك فرص تشغيل مناسبة.",
      badge: "🚗 نموذج صاحب المركبة",
      fields: [
        { name: "full_name", label: "الاسم بالكامل", type: "text", required: true, ph: "مثال: أحمد محمود" },
        { name: "phone", label: "رقم الموبايل", type: "tel", required: true, ph: "01xxxxxxxxx", pattern: "01[0-9]{9}" },
        { name: "whatsapp", label: "رقم واتساب (إن وجد)", type: "tel", ph: "01xxxxxxxxx" },
        { name: "governorate", label: "المحافظة", type: "select", required: true, options: govOptions },
        { name: "vehicle_type", label: "نوع المركبة", type: "select", required: true, options: [
          { v: "ملاكي", t: "ملاكي" },
          { v: "ميكروباص", t: "ميكروباص" },
          { v: "ميني باص / أتوبيس", t: "ميني باص / أتوبيس" },
          { v: "نقل خفيف", t: "نقل خفيف" },
          { v: "نقل ثقيل", t: "نقل ثقيل" },
          { v: "تريلا", t: "تريلا" },
          { v: "موتوسيكل", t: "موتوسيكل" },
        ]},
        { name: "vehicle_model", label: "الماركة / الموديل", type: "text", ph: "مثال: تويوتا هايس 2019" },
        { name: "vehicles_count", label: "عدد المركبات", type: "number", required: true, min: 1, max: 500, ph: "مثال: 1" },
        { name: "with_driver", label: "هل المركبة مع سائق؟", type: "select", required: true, options: [
          { v: "بسائق", t: "نعم، تأتي مع سائق" },
          { v: "بدون سائق", t: "لا، بدون سائق" },
          { v: "أنا السائق", t: "أنا السائق وصاحب المركبة" },
        ]},
        { name: "availability", label: "متاحة للتشغيل", type: "select", options: [
          { v: "متاح فورًا", t: "متاح فورًا" },
          { v: "خلال أسبوع", t: "خلال أسبوع" },
          { v: "حسب الاتفاق", t: "حسب الاتفاق" },
        ]},
        { name: "current_income", label: "الدخل الحالي من المركبة (جنيه/شهريًا)", type: "number", min: 0, ph: "مثال: 8000", hint: "اتركه فارغًا إن لم تكن تشغّلها حاليًا" },
        { name: "expected_income", label: "الدخل المتوقع (جنيه/شهريًا)", type: "number", required: true, min: 0, ph: "مثال: 12000" },
        { name: "notes", label: "ملاحظات إضافية", type: "textarea", full: true, ph: "حالة المركبة، أي تفاصيل إضافية..." },
      ],
    },

    sales_rep: {
      title: "تسجيل بيانات مندوب",
      subtitle: "مندوب توصيل / مبيعات / تحصيل؟ سجّل بياناتك وفرص الشركات تجيلك.",
      badge: "🛵 نموذج المناديب",
      fields: [
        { name: "full_name", label: "الاسم بالكامل", type: "text", required: true, ph: "مثال: محمد أحمد علي" },
        { name: "phone", label: "رقم الموبايل", type: "tel", required: true, ph: "01xxxxxxxxx", pattern: "01[0-9]{9}" },
        { name: "whatsapp", label: "رقم واتساب (إن وجد)", type: "tel", ph: "01xxxxxxxxx" },
        { name: "governorate", label: "المحافظة", type: "select", required: true, options: govOptions },
        { name: "current_address", label: "مكان الإقامة الحالي", type: "text", required: true, ph: "مثال: المنيب — شارع كذا" },
        { name: "age", label: "السن", type: "number", min: 18, max: 60, ph: "مثال: 25" },
        { name: "rep_mode", label: "تعمل كـ مندوب…", type: "select", required: true, options: [
          { v: "بسيارة", t: "🚗 مندوب بسيارة (أمتلك سيارة)" },
          { v: "بموتوسيكل", t: "🏍 مندوب بموتوسيكل" },
          { v: "بدون مواصلات", t: "🚶 مندوب بدون مواصلات (الشركة بتوفر)" },
        ]},
        { name: "rep_type", label: "نوع المندوبية / التخصص", type: "select", required: true, options: [
          { v: "مبيعات ميداني", t: "💼 مبيعات ميداني" },
          { v: "توصيل / ديليفري", t: "🛵 توصيل / ديليفري" },
          { v: "تحصيل", t: "💰 تحصيل" },
          { v: "توزيع", t: "📦 توزيع" },
          { v: "أدوية / طبي", t: "💊 أدوية / طبي" },
          { v: "عقاري", t: "🏠 عقاري" },
          { v: "خدمة عملاء ميدانية", t: "🤝 خدمة عملاء ميدانية" },
          { v: "ترويج / دعاية", t: "📣 ترويج / دعاية" },
          { v: "جملة / B2B", t: "🛒 جملة / B2B" },
          { v: "فني / صيانة", t: "🔧 فني / صيانة" },
          { v: "شحن ولوجستيات", t: "🚛 شحن ولوجستيات" },
          { v: "أخرى", t: "أخرى" },
        ]},
        { name: "experience_years", label: "سنوات الخبرة كمندوب", type: "number", required: true, min: 0, max: 40, ph: "مثال: 3" },
        { name: "industry", label: "مجال الخبرة السابق", type: "select", options: [
          { v: "أغذية ومشروبات", t: "أغذية ومشروبات" },
          { v: "أدوية", t: "أدوية / صيدليات" },
          { v: "إلكترونيات", t: "إلكترونيات" },
          { v: "ملابس", t: "ملابس وتجزئة" },
          { v: "مواد بناء", t: "مواد بناء" },
          { v: "خدمات بنكية / تأمين", t: "خدمات بنكية / تأمين" },
          { v: "ديليفري عام", t: "ديليفري عام" },
          { v: "أخرى", t: "أخرى" },
        ]},
        { name: "education", label: "المؤهل الدراسي", type: "select", required: true, options: educationOptions },
        { name: "is_literate", label: "هل تجيد القراءة والكتابة؟", type: "select", showIfEducationLow: true, options: [
          { v: "نعم", t: "نعم، أجيد القراءة والكتابة" },
          { v: "لا",  t: "لا" },
        ]},
        { name: "availability", label: "نوع العمل المطلوب", type: "select", required: true, options: [
          { v: "دوام كامل", t: "دوام كامل" },
          { v: "دوام جزئي", t: "دوام جزئي" },
          { v: "بالعمولة", t: "بالعمولة فقط" },
          { v: "يومية", t: "يومية / مؤقت" },
        ]},
        { name: "current_salary", label: "الراتب الحالي (جنيه/شهريًا)", type: "number", min: 0, ph: "مثال: 5000", hint: "اتركه فارغًا إن كنت لا تعمل حاليًا" },
        { name: "expected_salary", label: "الراتب المتوقع (جنيه/شهريًا)", type: "number", required: true, min: 0, ph: "مثال: 8000" },
        { name: "notes", label: "ملاحظات إضافية", type: "textarea", full: true, ph: "خبرات سابقة، مناطق التغطية، أي تفاصيل تريد إضافتها..." },
      ],
    },

    company: {
      title: "تسجيل بيانات شركة",
      subtitle: "أخبرنا باحتياجك وسنوفر لك العمالة والمركبات المناسبة.",
      badge: "🏢 نموذج الشركات",
      fields: [
        { name: "company_name", label: "اسم الشركة", type: "text", required: true, ph: "مثال: شركة النور للنقل" },
        { name: "contact_person", label: "اسم المسؤول", type: "text", required: true, ph: "الاسم بالكامل" },
        { name: "phone", label: "رقم الموبايل", type: "tel", required: true, ph: "01xxxxxxxxx", pattern: "01[0-9]{9}" },
        { name: "email", label: "البريد الإلكتروني", type: "email", ph: "name@company.com" },
        { name: "governorate", label: "المحافظة", type: "select", required: true, options: govOptions },
        { name: "activity", label: "نشاط الشركة", type: "select", required: true, options: [
          { v: "نقل بضائع", t: "نقل بضائع ولوجستيات" },
          { v: "نقل ركاب", t: "نقل ركاب" },
          { v: "توصيل / ديليفري", t: "توصيل / ديليفري" },
          { v: "مقاولات", t: "مقاولات" },
          { v: "أخرى", t: "أخرى" },
        ]},
        { name: "need_type", label: "ما الذي تحتاجه؟", type: "select", required: true, options: [
          { v: "سائقين", t: "سائقين" },
          { v: "مركبات", t: "مركبات" },
          { v: "سائقين ومركبات", t: "سائقين ومركبات معًا" },
        ]},
        { name: "need_count", label: "العدد المطلوب", type: "number", min: 1, max: 1000, ph: "مثال: 10" },
        { name: "offered_salary", label: "الراتب الذي تقدّمه للسائق (جنيه/شهريًا)", type: "number", min: 0, ph: "مثال: 9000", hint: "يساعدنا في ترشيح المناسبين لك" },
        { name: "notes", label: "تفاصيل الاحتياج", type: "textarea", full: true, ph: "اشرح احتياجك بالتفصيل..." },
      ],
    },
  };

  // قراءة الباراميتر
  const params = new URLSearchParams(window.location.search);
  const jos = params.get("jos");
  const cfg = FORMS[jos];

  const chooser = document.getElementById("chooser");
  const formSection = document.getElementById("form-section");

  if (!cfg) {
    // لا يوجد باراميتر صالح — اعرض الاختيار
    chooser.style.display = "";
    formSection.style.display = "none";
    return;
  }

  // اعرض النموذج المناسب
  chooser.style.display = "none";
  formSection.style.display = "";

  document.getElementById("formTitle").textContent = cfg.title;
  document.getElementById("formSubtitle").textContent = cfg.subtitle;
  document.getElementById("formBadge").textContent = cfg.badge;
  document.getElementById("roleField").value = jos;
  document.title = cfg.title + " — المجال.كوم";

  // بناء الحقول
  const fieldsWrap = document.getElementById("fields");
  cfg.fields.forEach(f => {
    const wrap = document.createElement("div");
    wrap.className = "field" + (f.full || f.type === "textarea" ? " full" : "");

    const label = document.createElement("label");
    label.setAttribute("for", f.name);
    label.innerHTML = f.label + (f.required ? ' <span class="req">*</span>' : "");
    wrap.appendChild(label);

    let input;
    if (f.type === "select") {
      input = document.createElement("select");
      const ph = document.createElement("option");
      ph.value = ""; ph.textContent = "— اختر —";
      input.appendChild(ph);
      f.options.forEach(o => {
        const opt = document.createElement("option");
        opt.value = o.v; opt.textContent = o.t;
        input.appendChild(opt);
      });
    } else if (f.type === "textarea") {
      input = document.createElement("textarea");
      if (f.ph) input.placeholder = f.ph;
    } else {
      input = document.createElement("input");
      input.type = f.type;
      if (f.ph) input.placeholder = f.ph;
      if (f.pattern) input.pattern = f.pattern;
      if (f.min != null) input.min = f.min;
      if (f.max != null) input.max = f.max;
    }
    input.id = f.name;
    input.name = f.name;
    if (f.required) input.required = true;
    wrap.appendChild(input);

    if (f.hint) {
      const hint = document.createElement("div");
      hint.className = "hint";
      hint.textContent = f.hint;
      wrap.appendChild(hint);
    }
    fieldsWrap.appendChild(wrap);
  });

  // الإرسال
  const form = document.getElementById("dataForm");
  const alertBox = document.getElementById("alert");
  const submitBtn = document.getElementById("submitBtn");
  const spin = document.getElementById("spin");

  function showAlert(type, msg) {
    alertBox.className = "alert " + type + " show";
    alertBox.textContent = msg;
    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    alertBox.className = "alert";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const endpoint = window.SHEET_ENDPOINT;
    if (!endpoint || endpoint.indexOf("script.google.com") === -1) {
      showAlert("err", "لم يتم ضبط رابط الإرسال بعد. راجع ملف config.js.");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.submitted_at = new Date().toISOString();

    submitBtn.disabled = true;
    spin.style.display = "inline-block";

    try {
      // Apps Script يقبل text/plain لتفادي طلب CORS preflight
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      });
      // مع no-cors لا نقرأ الرد، لكن الطلب يصل بنجاح
      showSuccess();
    } catch (err) {
      submitBtn.disabled = false;
      spin.style.display = "none";
      showAlert("err", "حدث خطأ أثناء الإرسال. تأكد من اتصالك بالإنترنت وحاول مجددًا.");
    }
  });

  function showSuccess() {
    const card = document.getElementById("formCard");
    card.innerHTML =
      '<div class="done">' +
      '<div class="check">✓</div>' +
      '<h2>تم استلام بياناتك بنجاح!</h2>' +
      '<p>شكرًا لتسجيلك معنا. سيتواصل معك فريقنا في أقرب وقت.</p>' +
      '<div style="margin-top:24px"><a class="btn" href="?">تسجيل بصفة أخرى</a></div>' +
      "</div>";
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
