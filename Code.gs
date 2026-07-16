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

// Simple GET handler so you can confirm the deployment is live in a browser.
function doGet() {
  return json_({ ok: true, service: "Mend Lab submissions endpoint" });
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
