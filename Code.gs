/**
 * Mend Lab — Google Apps Script Web App
 * ------------------------------------------------------------------
 * Receives booking & contact submissions from the website and appends
 * each one as a row in a Google Sheet (one tab per submission type).
 *
 * SETUP (see README for the full walkthrough):
 *  1. Create a Google Sheet. Note its ID from the URL:
 *       https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
 *  2. In the Sheet: Extensions → Apps Script. Paste this file's contents.
 *  3. Set SHEET_ID below (or leave blank to use the bound spreadsheet).
 *  4. Deploy → New deployment → type "Web app":
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  5. Copy the Web App URL and put it in your site's env as
 *       NEXT_PUBLIC_BOOKING_SCRIPT_URL=<web app url>
 *
 * The website sends a JSON body (text/plain to avoid a CORS preflight).
 * Bookings and contact messages are told apart by the `type` field.
 */

// Leave empty ("") to use the spreadsheet this script is bound to.
var SHEET_ID = "";

// Tab (sheet) names created automatically if missing.
var BOOKINGS_TAB = "Bookings";
var CONTACTS_TAB = "Contacts";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.type === "contact" ? "contact" : "booking";

    if (type === "contact") {
      appendRow_(CONTACTS_TAB, ["submittedAt", "name", "email", "phone", "message", "locale"], data);
    } else {
      appendRow_(
        BOOKINGS_TAB,
        ["submittedAt", "service", "serviceValue", "date", "time", "name", "phone", "email", "notes", "locale"],
        data
      );
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * GET handler.
 *
 *   ?date=YYYY-MM-DD  -> { ok: true, booked: ["12:00", "15:00"] }
 *   (no params)       -> health check, so you can confirm the deployment is live
 *
 * PRIVACY: this endpoint is public. It returns ONLY the booked slot times for a
 * day — never names, phones, emails or notes. Do not add customer fields here.
 */
function doGet(e) {
  try {
    var date = e && e.parameter ? e.parameter.date : null;
    if (!date) {
      return json_({ ok: true, service: "MendLab submissions endpoint" });
    }

    var ss = SHEET_ID
      ? SpreadsheetApp.openById(SHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(BOOKINGS_TAB);
    if (!sheet) return json_({ ok: true, booked: [] });

    var values = sheet.getDataRange().getValues();
    if (values.length < 2) return json_({ ok: true, booked: [] });

    var headers = values[0];
    var dateCol = headers.indexOf("date");
    var timeCol = headers.indexOf("time");
    if (dateCol === -1 || timeCol === -1) return json_({ ok: true, booked: [] });

    var booked = [];
    for (var i = 1; i < values.length; i++) {
      if (normalizeDate_(values[i][dateCol]) !== date) continue;
      var time = normalizeTime_(values[i][timeCol]);
      if (time && booked.indexOf(time) === -1) booked.push(time);
    }
    return json_({ ok: true, booked: booked });
  } catch (err) {
    return json_({ ok: false, booked: [], error: String(err) });
  }
}

/** Sheets may hand back a Date object or a string — normalize to "YYYY-MM-DD". */
function normalizeDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value).trim().slice(0, 10);
}

/** Normalize "12:00", "12:00:00" or a Date to "HH:mm". */
function normalizeTime_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "HH:mm");
  }
  var match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  return (match[1].length === 1 ? "0" + match[1] : match[1]) + ":" + match[2];
}

function appendRow_(tabName, headers, data) {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
  }
  var row = headers.map(function (key) {
    return data[key] !== undefined ? data[key] : "";
  });
  sheet.appendRow(row);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
