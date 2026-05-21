/**
 * كَوادر النقل — Google Apps Script
 * يستقبل بيانات النماذج ويسجّلها في Google Sheet.
 * كل صفة (سائق / صاحب مركبة / شركة) في تبويب (Sheet) منفصل.
 *
 * طريقة الربط في ملف SETUP.md.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  try {
    var data = JSON.parse(e.postData.contents);
    var role = (data.role || "general").toString();

    // اسم التبويب حسب الصفة
    var tabNames = {
      driver: "السائقون",
      owner_car: "أصحاب المركبات",
      company: "الشركات"
    };
    var tabName = tabNames[role] || "أخرى";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }

    // الأعمدة = مفاتيح البيانات. نضيف الجديدة تلقائيًا في الهيدر.
    var headers = [];
    if (sheet.getLastRow() === 0) {
      headers = ["submitted_at"].concat(Object.keys(data).filter(function (k) {
        return k !== "submitted_at";
      }));
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#0f2740")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      // أضف أي مفتاح جديد لم يكن موجودًا
      Object.keys(data).forEach(function (k) {
        if (headers.indexOf(k) === -1) {
          headers.push(k);
          sheet.getRange(1, headers.length).setValue(k)
            .setFontWeight("bold").setBackground("#0f2740").setFontColor("#ffffff");
        }
      });
    }

    var row = headers.map(function (h) {
      return data[h] != null ? data[h] : "";
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("المجال.كوم — endpoint يعمل ✓");
}
