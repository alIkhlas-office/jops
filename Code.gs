/**
 * المجال.كوم — Google Apps Script
 *
 * POST: يستقبل بيانات النماذج ويسجّلها (تبويب لكل صفة).
 * GET ?sheet=<role>&key=<SECRET>: يرجّع كل صفوف التبويب JSON
 *
 * شغّل onOpen() مرة واحدة لتثبيت المنيو والأعمدة الإضافية:
 *   📌 المنيو "المجال" يظهر في الـ Sheets ويتيح:
 *     - تسجيل توظيف (مع ربط شركة)
 *     - إلغاء التوظيف (يرجع الشخص "متاح")
 *     - تثبيت أعمدة التوظيف
 */

var SECRET_KEY = "elmogal-sync-2026-X9k7M";   // ← غيّرها لقيمة سرية متطابقة مع .env

var TAB_NAMES = {
  driver:     "السائقون",
  owner_car:  "أصحاب المركبات",
  sales_rep:  "المناديب",
  company:    "الشركات"
};

// Worker sheets that support hire tracking (companies excluded).
var WORKER_TABS = [TAB_NAMES.driver, TAB_NAMES.owner_car, TAB_NAMES.sales_rep];

// Extra columns added to every worker sheet so hire status can be tracked.
var HIRE_COLUMNS = ["status", "hired_by_company", "hired_company_phone", "hired_at"];

// ─────────────── Menu on open ───────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("👤 المجال")
    .addItem("✅ تسجيل توظيف للصف المحدد", "menuMarkHired")
    .addItem("❌ إلغاء التوظيف (إرجاع لـ متاح)", "menuMarkAvailable")
    .addSeparator()
    .addItem("🔧 تثبيت أعمدة التوظيف لكل التبويبات", "ensureHireColumnsAll")
    .addToUi();
}

/** Ensure the hire-tracking columns exist on every worker tab. */
function ensureHireColumnsAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  WORKER_TABS.forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (sh) ensureHireColumns_(sh);
  });
  SpreadsheetApp.getUi().alert("تم تثبيت أعمدة التوظيف ✓");
}

function ensureHireColumns_(sheet) {
  if (sheet.getLastRow() === 0) return;
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  HIRE_COLUMNS.forEach(function (col) {
    if (headers.indexOf(col) === -1) {
      headers.push(col);
      sheet.getRange(1, headers.length)
        .setValue(col)
        .setFontWeight("bold")
        .setBackground("#0f2740")
        .setFontColor("#ffffff");
    }
  });
  // Default any blank `status` cell to "متاح" for existing rows.
  var statusCol = headers.indexOf("status") + 1;
  if (statusCol > 0 && sheet.getLastRow() > 1) {
    var range = sheet.getRange(2, statusCol, sheet.getLastRow() - 1, 1);
    var values = range.getValues();
    var changed = false;
    for (var i = 0; i < values.length; i++) {
      if (!values[i][0]) { values[i][0] = "متاح"; changed = true; }
    }
    if (changed) range.setValues(values);
  }
}

/** UI: mark selected row as hired by a chosen company. */
function menuMarkHired() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  if (WORKER_TABS.indexOf(sheet.getName()) === -1) {
    ui.alert("⚠ شغّل الأمر من تبويب: السائقون / أصحاب المركبات / المناديب");
    return;
  }
  var row = sheet.getActiveRange().getRow();
  if (row < 2) { ui.alert("اختر صف بيانات (مش الهيدر)."); return; }

  // Build list of companies from "الشركات" tab.
  var compTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_NAMES.company);
  if (!compTab || compTab.getLastRow() < 2) { ui.alert("⚠ ما فيش شركات مسجّلة في تبويب \"الشركات\"."); return; }
  var compHeaders = compTab.getRange(1, 1, 1, compTab.getLastColumn()).getValues()[0];
  var nameIdx  = compHeaders.indexOf("company_name");
  var phoneIdx = compHeaders.indexOf("phone");
  if (nameIdx === -1) { ui.alert("⚠ تبويب الشركات مفيش فيه عمود company_name."); return; }

  var compRows = compTab.getRange(2, 1, compTab.getLastRow() - 1, compTab.getLastColumn()).getValues();
  var compList = compRows.map(function (r, i) {
    return (i + 1) + ". " + r[nameIdx] + (phoneIdx > -1 ? " — " + r[phoneIdx] : "");
  }).filter(function (s) { return s.indexOf("undefined") === -1 && s.length > 3; });

  if (!compList.length) { ui.alert("⚠ مفيش شركات صالحة."); return; }

  var resp = ui.prompt(
    "تسجيل توظيف",
    "اختر رقم الشركة من القائمة:\n\n" + compList.join("\n"),
    ui.ButtonSet.OK_CANCEL
  );
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var idx = parseInt(resp.getResponseText(), 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= compRows.length) { ui.alert("رقم غير صحيح."); return; }

  var chosen = compRows[idx];
  var companyName  = chosen[nameIdx] || "";
  var companyPhone = phoneIdx > -1 ? (chosen[phoneIdx] || "") : "";

  ensureHireColumns_(sheet);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  setCell_(sheet, row, headers, "status", "متوظف");
  setCell_(sheet, row, headers, "hired_by_company", companyName);
  setCell_(sheet, row, headers, "hired_company_phone", companyPhone);
  setCell_(sheet, row, headers, "hired_at", new Date());

  // Visually mark the row.
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground("#d1fae5");
  ui.alert("✓ تم تسجيل توظيف هذا الشخص لدى \"" + companyName + "\"");
}

/** UI: revert the selected row to "متاح". */
function menuMarkAvailable() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  if (WORKER_TABS.indexOf(sheet.getName()) === -1) {
    ui.alert("⚠ شغّل الأمر من تبويب عمالة.");
    return;
  }
  var row = sheet.getActiveRange().getRow();
  if (row < 2) { ui.alert("اختر صف بيانات."); return; }

  ensureHireColumns_(sheet);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  setCell_(sheet, row, headers, "status", "متاح");
  setCell_(sheet, row, headers, "hired_by_company", "");
  setCell_(sheet, row, headers, "hired_company_phone", "");
  setCell_(sheet, row, headers, "hired_at", "");
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground(null);
  ui.alert("✓ تم إرجاع الحالة لـ متاح");
}

function setCell_(sheet, row, headers, colName, value) {
  var idx = headers.indexOf(colName);
  if (idx === -1) return;
  sheet.getRange(row, idx + 1).setValue(value);
}

// ─────────────── POST (form submissions) ───────────────
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  try {
    var data = JSON.parse(e.postData.contents);
    var role = (data.role || "general").toString();
    var tabName = TAB_NAMES[role] || "أخرى";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) sheet = ss.insertSheet(tabName);

    // New worker submissions are "متاح" by default.
    if (WORKER_TABS.indexOf(tabName) !== -1) {
      if (data.status == null)              data.status = "متاح";
      if (data.hired_by_company == null)    data.hired_by_company = "";
      if (data.hired_company_phone == null) data.hired_company_phone = "";
      if (data.hired_at == null)            data.hired_at = "";
    }

    var headers = [];
    if (sheet.getLastRow() === 0) {
      headers = ["submitted_at"].concat(Object.keys(data).filter(function (k) { return k !== "submitted_at"; }));
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f2740").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Object.keys(data).forEach(function (k) {
        if (headers.indexOf(k) === -1) {
          headers.push(k);
          sheet.getRange(1, headers.length).setValue(k).setFontWeight("bold").setBackground("#0f2740").setFontColor("#ffffff");
        }
      });
    }

    var row = headers.map(function (h) { return data[h] != null ? data[h] : ""; });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ─────────────── GET (sync to backend) ───────────────
function doGet(e) {
  if (!e.parameter || Object.keys(e.parameter).length === 0) {
    return ContentService.createTextOutput("المجال.كوم — endpoint يعمل ✓");
  }
  if ((e.parameter.key || "") !== SECRET_KEY) {
    return jsonOut({ ok: false, error: "unauthorized" });
  }
  var role = (e.parameter.sheet || "").toString();
  if (!role) return jsonOut({ ok: true, sheets: Object.keys(TAB_NAMES) });

  var tabName = TAB_NAMES[role];
  if (!tabName) return jsonOut({ ok: false, error: "unknown role: " + role });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonOut({ ok: true, role: role, count: 0, rows: [] });
  }

  var range = sheet.getDataRange().getValues();
  var headers = range[0];
  var rows = [];
  for (var i = 1; i < range.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var v = range[i][j];
      if (v instanceof Date) v = v.toISOString();
      obj[headers[j]] = (v === "" || v == null) ? null : v;
    }
    var anyVal = Object.keys(obj).some(function (k) { return obj[k] != null && obj[k] !== ""; });
    if (anyVal) rows.push(obj);
  }
  return jsonOut({ ok: true, role: role, count: rows.length, rows: rows });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
