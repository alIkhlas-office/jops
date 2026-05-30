/**
 * المجال.كوم — Google Apps Script
 *
 * POST: يستقبل بيانات النماذج ويسجّلها (تبويب لكل صفة).
 * GET ?sheet=<role>&key=<SECRET>: يرجّع كل صفوف التبويب JSON
 *   استعمله من Laravel sync لسحب البيانات للداتابيز.
 *
 * مهم: اضبط SECRET_KEY بقيمة قوية وتطابق .env في Laravel (SHEET_SYNC_KEY).
 */

var SECRET_KEY = "elmogal-sync-2026-X9k7M";   // ← غيّرها لقيمة سرية متطابقة مع .env

var TAB_NAMES = {
  driver:     "السائقون",
  owner_car:  "أصحاب المركبات",
  sales_rep:  "المناديب",
  company:    "الشركات"
};

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
  // Health check
  if (!e.parameter || Object.keys(e.parameter).length === 0) {
    return ContentService.createTextOutput("المجال.كوم — endpoint يعمل ✓");
  }

  // Auth
  if ((e.parameter.key || "") !== SECRET_KEY) {
    return jsonOut({ ok: false, error: "unauthorized" });
  }

  var role = (e.parameter.sheet || "").toString();
  if (!role) {
    // No sheet specified → list available sheets
    return jsonOut({ ok: true, sheets: Object.keys(TAB_NAMES) });
  }

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
    // Skip fully-empty rows
    var anyVal = Object.keys(obj).some(function (k) { return obj[k] != null && obj[k] !== ""; });
    if (anyVal) rows.push(obj);
  }

  return jsonOut({ ok: true, role: role, count: rows.length, rows: rows });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
