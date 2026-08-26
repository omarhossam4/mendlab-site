/**
 * MendLab — Google Apps Script Web App (booking backend)
 * ==================================================================
 * Website contract:
 *
 *   GET  ?action=getSlots&date=YYYY-MM-DD
 *        -> { success: true, date, slots: [{ id: "15-16", label, available }] }
 *
 *   POST { date, slotId, customerName, phone, service, area, price, deposit,
 *          policyAccepted, email, notes, locale }
 *        -> { success: true }  |  { success: false, error: "..." }
 *
 * Hours: twelve one-hour slots, 3:00 PM to 3:00 AM. After-midnight hours are
 * encoded 24 = 12 AM, 25 = 1 AM, 26 = 2 AM so each slot stays on the SAME
 * evening's date. Fridays are open like any other day (the old Friday
 * closure has been removed — see isFriday_ below, kept but unused in case
 * you want it again later).
 *
 * PRIVACY: the getSlots response contains ONLY slot ids + an available flag —
 * never names, phones, emails or notes.
 *
 * WHAT CHANGED IN THIS VERSION
 *   1. Rows are written BY COLUMN NAME, not by position. Reorder or rename
 *      nothing — just make sure the header text matches. Any header the sheet
 *      is missing gets appended to the right automatically, so old sheets keep
 *      working and new fields stop landing in the wrong column.
 *   2. Every appended booking is styled automatically (pink fill, bold red
 *      "Booked"), so new rows look like the ones above them.
 *   3. Fridays are no longer rejected — the site can now book any day of
 *      the week.
 *   4. Bookings now capture the chosen Area (Upper/Lower), a Deposit, and a
 *      PolicyAccepted flag. The deposit is ALWAYS recomputed server-side as
 *      50% of the numeric price — the client value is never trusted — and a
 *      booking is rejected unless the customer accepted the booking policies.
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
var FRIDAY = 5; // Date.getDay(): Sun=0 ... Fri=5

// Deposit required to confirm a booking, as a fraction of the session price.
var DEPOSIT_RATE = 0.5;

// Preferred header order, used ONLY when creating a brand new sheet.
// An existing sheet keeps whatever order it already has; any of these names
// it is missing gets appended to the right automatically (see syncHeaders_).
var BOOKING_HEADERS = [
  "Date", "TimeSlot", "Status", "CustomerName", "Phone", "Service", "Area",
  "Timestamp", "Price", "Deposit", "Email", "Notes", "PolicyAccepted",
  "Locale", "SlotId",
];

var CONTACT_HEADERS = ["Timestamp", "Name", "Email", "Phone", "Message", "Locale"];

// Row styling by Status value.
var ROW_STYLES = {
  booked: { background: "#fce5e0", statusColor: "#c0392b", statusBold: true },
  cancelled: { background: "#eeeeee", statusColor: "#777777", statusBold: false, strikethrough: true },
};

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
      appendRow_(CONTACTS_TAB, CONTACT_HEADERS, {
        Timestamp: now_(),
        Name: data.name || "",
        Email: data.email || "",
        Phone: data.phone || "",
        Message: data.message || "",
        Locale: data.locale || "",
      });
      return json_({ success: true });
    }

    var date = String(data.date || "").slice(0, 10);
    var slotId = String(data.slotId || "");
    if (!date || !slotId) {
      return json_({ success: false, error: "Missing date or slot." });
    }

    // The customer must have accepted the booking policies.
    if (!isTruthy_(data.policyAccepted)) {
      return json_({ success: false, error: "Booking policies must be accepted." });
    }

    // Friday closure removed — Fridays are bookable again. (Previously this
    // returned an error via isFriday_(date); that check has been dropped.)

    // Never trust the client's deposit: recompute it as 50% of the numeric
    // price. If the price can't be parsed we store a blank deposit rather than
    // a wrong number.
    var priceNum = parsePriceEGP_(data.price);
    var depositText = priceNum > 0
      ? Math.round(priceNum * DEPOSIT_RATE) + " EGP"
      : "";

    // Serialize the check-and-write so two people can't grab the same slot.
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (getBookedSlotIds_(date).indexOf(slotId) !== -1) {
        return json_({ success: false, error: "That time was just booked by someone else." });
      }
      appendRow_(BOOKINGS_TAB, BOOKING_HEADERS, {
        Timestamp: now_(),
        Date: date,
        TimeSlot: slotLabel_(slotId),
        SlotId: slotId,
        Status: "Booked",
        CustomerName: data.customerName || "",
        Phone: data.phone || "",
        Service: data.service || "",
        Area: data.area || "",
        Price: data.price || "",
        Deposit: depositText,
        Email: data.email || "",
        Notes: data.notes || "",
        PolicyAccepted: "yes",
        Locale: data.locale || "",
      });
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

/**
 * "15-16" -> "3:00 PM – 4:00 PM". Exactly the label the website shows.
 * For a compact style like "3 PM – 4 PM", swap formatHour_ for formatHourShort_
 * in the two calls below.
 */
function slotLabel_(slotId) {
  var parts = String(slotId).split("-");
  if (parts.length !== 2) return String(slotId);
  var start = Number(parts[0]);
  var end = Number(parts[1]);
  if (isNaN(start) || isNaN(end)) return String(slotId);
  return formatHour_(start) + " – " + formatHour_(end);
}

/** 15 -> "3 PM", 24 -> "12 AM". Optional compact alternative. */
function formatHourShort_(h) {
  var hour = h % 24;
  var suffix = hour < 12 ? "AM" : "PM";
  var display = hour % 12;
  if (display === 0) display = 12;
  return display + " " + suffix;
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
  var idCol = headers.indexOf("SlotId");
  var statusCol = headers.indexOf("Status");
  if (dateCol === -1 || (slotCol === -1 && idCol === -1)) return [];

  // Lets old rows (raw ids in TimeSlot) and new rows (labels in TimeSlot,
  // raw id in SlotId) both resolve back to a slot id.
  var labelToId = {};
  generateTimeSlots().forEach(function (slot) {
    labelToId[slot.label] = slot.id;
  });

  var booked = [];
  for (var i = 1; i < values.length; i++) {
    if (normalizeDate_(values[i][dateCol]) !== date) continue;
    if (statusCol !== -1 && String(values[i][statusCol]).toLowerCase() === "cancelled") continue;

    var id = idCol !== -1 ? String(values[i][idCol]).trim() : "";
    if (!id && slotCol !== -1) {
      var cell = String(values[i][slotCol]).trim();
      id = labelToId[cell] || cell; // label -> id, or already a raw id
    }
    if (id && booked.indexOf(id) === -1) booked.push(id);
  }
  return booked;
}

/**
 * Kept for reference / in case Friday closures come back — no longer called
 * from doPost, so Fridays are treated like any other day.
 */
function isFriday_(date) {
  var p = date.split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getDay() === FRIDAY;
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
  var sheet = ss.getSheetByName(tabName);
  if (!sheet && createIfMissing) sheet = ss.insertSheet(tabName);
  return sheet;
}

/**
 * Read the sheet's current header row. If the sheet is empty, seed it with
 * `defaultHeaders`. Any name in `neededHeaders` that isn't present yet is
 * appended to the right so nothing ever silently lands in the wrong column.
 * Returns the final header array.
 */
function syncHeaders_(sheet, defaultHeaders, neededHeaders) {
  var lastCol = sheet.getLastColumn();

  if (sheet.getLastRow() === 0 || lastCol === 0) {
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    styleHeaderRow_(sheet, defaultHeaders.length);
    return defaultHeaders.slice();
  }

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
    return String(h).trim();
  });

  var missing = neededHeaders.filter(function (name) {
    return headers.indexOf(name) === -1;
  });

  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
    styleHeaderRow_(sheet, headers.length);
  }

  return headers;
}

function styleHeaderRow_(sheet, colCount) {
  sheet.getRange(1, 1, 1, colCount)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#0b3d2e")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

/**
 * Append a row given an OBJECT keyed by header name. Column order in the
 * sheet is irrelevant — values are placed under their matching header.
 * The new row is then styled to match the rest of the sheet.
 */
function appendRow_(tabName, defaultHeaders, rowObject) {
  var sheet = getSheet_(tabName, true);
  var neededHeaders = Object.keys(rowObject);
  var headers = syncHeaders_(sheet, defaultHeaders, neededHeaders);

  var row = headers.map(function (name) {
    return Object.prototype.hasOwnProperty.call(rowObject, name) ? rowObject[name] : "";
  });

  var rowIndex = sheet.getLastRow() + 1;
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);

  styleRow_(sheet, headers, rowIndex, String(rowObject.Status || ""));
  return rowIndex;
}

/** Apply fill + status emphasis to one row, based on its Status value. */
function styleRow_(sheet, headers, rowIndex, status) {
  var style = ROW_STYLES[String(status).toLowerCase()];
  if (!style) return;

  var range = sheet.getRange(rowIndex, 1, 1, headers.length);
  range.setBackground(style.background);
  range.setFontColor("#000000");
  range.setFontWeight("normal");
  range.setFontLine(style.strikethrough ? "line-through" : "none");

  var statusCol = headers.indexOf("Status");
  if (statusCol !== -1) {
    sheet.getRange(rowIndex, statusCol + 1)
      .setFontColor(style.statusColor)
      .setFontWeight(style.statusBold ? "bold" : "normal");
  }
}

/** Extract a numeric EGP amount from values like "400 EGP" or "400". */
function parsePriceEGP_(value) {
  var digits = String(value == null ? "" : value).replace(/[^0-9.]/g, "");
  var n = parseFloat(digits);
  return isNaN(n) ? 0 : n;
}

/** Loose truthiness for form flags: "yes" / "true" / "1" (any case). */
function isTruthy_(value) {
  var s = String(value == null ? "" : value).trim().toLowerCase();
  return s === "yes" || s === "true" || s === "1";
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------ maintenance ----------------------------- */

/**
 * Run once from the editor to repaint EVERY existing row so the old rows and
 * the new ones look identical. Safe to re-run any time.
 */
function restyleAllRows() {
  var sheet = getSheet_(BOOKINGS_TAB, false);
  if (!sheet || sheet.getLastRow() < 2) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) {
    return String(h).trim();
  });
  var statusCol = headers.indexOf("Status");
  if (statusCol === -1) return;

  styleHeaderRow_(sheet, headers.length);

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  for (var i = 0; i < values.length; i++) {
    styleRow_(sheet, headers, i + 2, String(values[i][statusCol]));
  }
}

/**
 * Run once from the editor to convert the OLD rows ("16-17") into readable
 * labels and backfill their SlotId. Safe to re-run — already-converted rows
 * are left alone.
 */
function migrateSlotLabels() {
  var sheet = getSheet_(BOOKINGS_TAB, false);
  if (!sheet || sheet.getLastRow() < 2) return;

  var headers = syncHeaders_(sheet, BOOKING_HEADERS, ["TimeSlot", "SlotId"]);
  var slotCol = headers.indexOf("TimeSlot");
  var idCol = headers.indexOf("SlotId");
  if (slotCol === -1 || idCol === -1) return;

  var lastRow = sheet.getLastRow();
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  for (var i = 0; i < values.length; i++) {
    var cell = String(values[i][slotCol]).trim();
    if (!/^\d{1,2}-\d{1,2}$/.test(cell)) continue; // already a label
    values[i][slotCol] = slotLabel_(cell);
    values[i][idCol] = cell;
  }

  sheet.getRange(2, 1, lastRow - 1, headers.length).setValues(values);
}

/** Run once from the editor to confirm writing to the sheet works. */
function testWrite() {
  appendRow_(BOOKINGS_TAB, BOOKING_HEADERS, {
    Timestamp: now_(),
    Date: "2026-01-01",
    TimeSlot: slotLabel_("15-16"),
    SlotId: "15-16",
    Status: "Booked",
    CustomerName: "Test User",
    Phone: "0000000000",
    Service: "Test service",
    Area: "Upper Massage",
    Price: "400 EGP",
    Deposit: "200 EGP",
    Email: "",
    Notes: "manual test",
    PolicyAccepted: "yes",
    Locale: "en",
  });
}
