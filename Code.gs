/**
 * MendLab — Google Apps Script Web App (booking backend)
 * ==================================================================
 * This is the CURRENT script. It matches the website contract exactly:
 *
 *   GET  ?action=getSlots&date=YYYY-MM-DD
 *        -> { success: true, date, slots: [{ id: "15-16", label, available }] }
 *
 *   POST { date, slotId, customerName, phone, service, price, email, notes,
 *          locale }
 *        -> { success: true }  |  { success: false, error: "..." }
 *
 * Hours: twelve one-hour slots, 3:00 PM to 3:00 AM, every day. After-midnight
 * hours are encoded 24 = 12 AM, 25 = 1 AM, 26 = 2 AM so each slot stays on the
 * SAME evening's date.
 *
 * PRIVACY: the getSlots response contains ONLY slot ids + an available flag —
 * never names, phones, emails or notes.
 *
 * DEPLOY (do this every time you change the code):
 *   Deploy -> Manage deployments -> (edit / pencil) -> Version: New version
 *   -> Execute as: Me,  Who has access: Anyone  -> Deploy.
 *   (Creating a *new* deployment gives a different URL — always edit the
 *    existing one so the site's /exec URL keeps working.)
 */

// Leave "" to use the spreadsheet this script is bound to.
var SHEET_ID = "";
var BOOKINGS_TAB = "Bookings";
var CONTACTS_TAB = "Contacts";

// Slot start hours: 15..23, then 24(12AM), 25(1AM), 26(2AM).
var FIRST_SLOT_HOUR = 15;
var SLOT_COUNT = 12;

var BOOKING_HEADERS = [
  "Timestamp", "Date", "TimeSlot", "Status",
  "CustomerName", "Phone", "Service", "Price", "Email", "Notes", "Locale",
];

/* ------------------------------ GET: availability ----------------------- */

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (params.action !== "getSlots" || !params.date) {
      return json_({ success: true, service: "MendLab booking endpoint" });
    }

    var date = String(params.date).slice(0, 10);
    var bookedIds = getBookedSlotIds_(date);

    var slots = generateTimeSlots().map(function (slot) {
      return {
        id: slot.id,
        label: slot.label,
        available: bookedIds.indexOf(slot.id) === -1,
      };
    });

    return json_({ success: true, date: date, slots: slots });
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

/* ------------------------------ POST: booking --------------------------- */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Contact messages now go through WhatsApp, but keep this branch as a
    // harmless fallback in case anything still posts type:"contact".
    if (data.type === "contact") {
      appendRow_(CONTACTS_TAB,
        ["Timestamp", "Name", "Email", "Phone", "Message", "Locale"],
        [now_(), data.name, data.email, data.phone, data.message, data.locale]);
      return json_({ success: true });
    }

    var date = String(data.date || "").slice(0, 10);
    var slotId = String(data.slotId || "");
    if (!date || !slotId) {
      return json_({ success: false, error: "Missing date or slot." });
    }

    // Serialize the check-and-write so two people can't grab the same slot.
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (getBookedSlotIds_(date).indexOf(slotId) !== -1) {
        return json_({ success: false, error: "That time was just booked by someone else." });
      }
      appendRow_(BOOKINGS_TAB, BOOKING_HEADERS, [
        now_(), date, slotId, "Booked",
        data.customerName || "", data.phone || "", data.service || "",
        data.price || "", data.email || "", data.notes || "", data.locale || "",
      ]);
    } finally {
      lock.releaseLock();
    }

    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

/* ------------------------------ helpers --------------------------------- */

/** Twelve slots "15-16" … "26-27" with human labels. */
function generateTimeSlots() {
  var slots = [];
  for (var i = 0; i < SLOT_COUNT; i++) {
    var h = FIRST_SLOT_HOUR + i;
    slots.push({ id: h + "-" + (h + 1), label: formatHour_(h) + " – " + formatHour_(h + 1) });
  }
  return slots;
}

/** 15 -> "3:00 PM", 24 -> "12:00 AM", 26 -> "2:00 AM", 27 -> "3:00 AM". */
function formatHour_(h) {
  var hour = h % 24;
  var suffix = hour < 12 ? "AM" : "PM";
  var display = hour % 12;
  if (display === 0) display = 12;
  return display + ":00 " + suffix;
}

/** Slot ids already booked (not cancelled) for a date. Never returns names. */
function getBookedSlotIds_(date) {
  var sheet = getSheet_(BOOKINGS_TAB, false);
  if (!sheet) return [];

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0];
  var dateCol = headers.indexOf("Date");
  var slotCol = headers.indexOf("TimeSlot");
  var statusCol = headers.indexOf("Status");
  if (dateCol === -1 || slotCol === -1) return [];

  var booked = [];
  for (var i = 1; i < values.length; i++) {
    if (normalizeDate_(values[i][dateCol]) !== date) continue;
    if (statusCol !== -1 && String(values[i][statusCol]).toLowerCase() === "cancelled") continue;
    var id = String(values[i][slotCol]).trim();
    if (id && booked.indexOf(id) === -1) booked.push(id);
  }
  return booked;
}

/** Sheets may return a Date or a string — normalize to "YYYY-MM-DD". */
function normalizeDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value).trim().slice(0, 10);
}

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
}

function getSheet_(tabName, createIfMissing) {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      "No spreadsheet found. This script isn't bound to a Sheet. Open your " +
      "Google Sheet -> Extensions -> Apps Script, OR set SHEET_ID at the top " +
      "to your sheet id (the part between /d/ and /edit in the sheet URL)."
    );
  }
  var sheet = ss.getSheetByName(tabName);
  if (!sheet && createIfMissing) sheet = ss.insertSheet(tabName);
  return sheet;
}

function appendRow_(tabName, headers, row) {
  var sheet = getSheet_(tabName, true);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet.appendRow(row);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run THIS one from the editor to confirm writing to the sheet works.
 * (Never run doGet/doPost from the editor — they need a live web request.)
 * The first run asks you to authorize the script: Review permissions ->
 * choose your account -> Advanced -> "Go to project (unsafe)" -> Allow.
 */
function testWrite() {
  appendRow_(BOOKINGS_TAB, BOOKING_HEADERS, [
    now_(), "2026-01-01", "15-16", "Booked",
    "Test User", "0000000000", "Test service", "0 EGP", "", "manual test", "en",
  ]);
  Logger.log("testWrite OK — a row was added to the '" + BOOKINGS_TAB + "' tab.");
}
