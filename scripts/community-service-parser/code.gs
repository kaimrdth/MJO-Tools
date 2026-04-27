/**
 * Community Service Attendance Processor
 * 
 * Reads raw form data from "Form Responses 1", unifies English/Spanish columns,
 * pairs sign-in/sign-out records, and writes clean per-organization tabs.
 * 
 * Raw data columns:
 *   A: Timestamp | B: Score | C: Preferred Language
 *   D: First Name | E: Last Name | F: Today's Date | G: Organization | H: Sign In/Out
 *   I: Nombre | J: Apellido | K: Fecha de Hoy | L: Organizacion | M: Entrada/Salida
 *   N: Notes
 */

// ── Config ──────────────────────────────────────────────────────────────────
const RAW_SHEET_NAME = 'Form Responses 1';

// Orgs to generate tabs for (case-insensitive matching)
const ORGS = ['MJO', 'BJI', 'SIJC', 'MCJC'];

// How we try to match org strings from messy form input to canonical org names
const ORG_ALIASES = {
  'MJO':  ['mjo', 'manhattan justice opportunities', 'manhattan justice'],
  'BJI':  ['bji', 'brooklyn justice initiatives', 'brooklyn justice'],
  'SIJC': ['sijc', 'staten island justice center', 'staten island'],
  'MCJC': ['mcjc', 'midtown community justice center', 'midtown community'],
};

function processMJO() {
  processAttendance(['MJO']);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Participant Report')
    .addItem('Generate Report','showParticipantReport')
    .addToUi();
}
// ── Main ────────────────────────────────────────────────────────────────────

/**
 * Main entry point. Processes raw data and writes per-org tabs.
 * @param {string[]} [filterOrgs] - Optional subset of ORGS to process
 */
function processAttendance(filterOrgs) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName(RAW_SHEET_NAME);
  if (!rawSheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${RAW_SHEET_NAME}" not found.`);
    return;
  }

  const data = rawSheet.getDataRange().getValues();
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert('No data found in form responses.');
    return;
  }

  // Parse all rows (skip header)
  const records = [];
  for (let i = 1; i < data.length; i++) {
    const parsed = parseRow(data[i]);
    if (parsed) records.push(parsed);
  }

  // Group by org
  const byOrg = {};
  ORGS.forEach(org => byOrg[org] = []);

  records.forEach(r => {
    const canonical = matchOrg(r.org);
    if (canonical && byOrg[canonical]) {
      byOrg[canonical].push(r);
    }
  });

  // Write each org tab
  const orgsToProcess = filterOrgs || ORGS;
  orgsToProcess.forEach(org => {
    writeOrgTab(ss, org, byOrg[org] || []);
  });

  SpreadsheetApp.getUi().alert('Attendance tabs updated.');
}


// ── Row Parsing ─────────────────────────────────────────────────────────────

/**
 * Parses a single row, unifying English/Spanish columns.
 * Returns null if the row can't produce usable data.
 */
function parseRow(row) {
  const timestamp   = row[0];
  const language    = String(row[2] || '').trim().toLowerCase();

  // Unify fields: use whichever column set has data
  const firstName = titleCase(String(row[3] || row[8] || '').trim());
  const lastName  = titleCase(String(row[4] || row[9] || '').trim());
  const dateRaw   = row[5] || row[10];
  const orgRaw    = String(row[6] || row[11] || '').trim();
  const actionRaw = String(row[7] || row[12] || '').trim().toLowerCase();
  const notes     = String(row[13] || '').trim();

  if (!firstName && !lastName) return null;
  if (!orgRaw) return null;

  // Parse date — could be a Date object or a string like "3/25/2026" or "25/03/2026"
  const attendDate = parseFlexDate(dateRaw, timestamp);
  if (!attendDate) return null;

  // Determine sign-in vs sign-out (check OUT first — "in" is too greedy)
  const isSignOut = /sign\s*ing?\s*out|salida|out/i.test(actionRaw);
  const isSignIn = !isSignOut && /sign\s*ing?\s*in|entrada|in/i.test(actionRaw);
  const action = isSignOut ? 'OUT' : isSignIn ? 'IN' : 'UNKNOWN';

  // Use timestamp for actual time
  const time = (timestamp instanceof Date) ? timestamp : new Date(timestamp);

  return {
    fullName: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    date: attendDate,
    dateStr: formatDate(attendDate),
    org: orgRaw,
    action,
    time,
    timeStr: formatTime(time),
    notes,
  };
}


// ── Org Matching ────────────────────────────────────────────────────────────

/**
 * Matches a raw org string to a canonical org name.
 * Tries exact match first, then alias substring matching.
 */
function matchOrg(rawOrg) {
  const lower = rawOrg.toLowerCase().trim();

  // Direct match
  for (const org of ORGS) {
    if (lower === org.toLowerCase()) return org;
  }

  // Alias matching
  for (const [canonical, aliases] of Object.entries(ORG_ALIASES)) {
    for (const alias of aliases) {
      if (lower.includes(alias) || alias.includes(lower)) {
        return canonical;
      }
    }
  }

  return null;
}


// ── Tab Writing ─────────────────────────────────────────────────────────────

/**
 * Creates (or clears) an org tab and writes paired attendance records.
 */
function writeOrgTab(ss, orgName, records) {
  // Get or create sheet
  let sheet = ss.getSheetByName(orgName);
  if (!sheet) {
    sheet = ss.insertSheet(orgName);
  } else {
    sheet.clear();
    sheet.clearFormats();
  }

  // Pair sign-ins with sign-outs
  const paired = pairRecords(records);

  // Sort: date descending, then full name ascending
  paired.sort((a, b) => {
    const dateDiff = b.date.getTime() - a.date.getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.fullName.localeCompare(b.fullName);
  });

  // Build output rows
  const output = [];
  let currentDateStr = '';

  // Summary header
  const uniqueDates = [...new Set(paired.map(p => p.dateStr))];
  const uniqueNames = [...new Set(paired.map(p => p.fullName))];

  output.push([`${orgName} — Community Service Attendance`, '', '', '', '', '']);
  output.push([`Last updated: ${new Date().toLocaleString()}`, '', '', '', '', '']);
  output.push([`${uniqueDates.length} dates | ${uniqueNames.length} unique participants | ${paired.length} total records`, '', '', '', '', '']);
  output.push(['', '', '', '', '', '']);

  // Column headers
  output.push(['Date', 'Full Name', 'Sign In', 'Sign Out', 'Hours', 'Notes']);

  // Data rows grouped by date
  paired.forEach(p => {
    if (p.dateStr !== currentDateStr) {
      if (currentDateStr !== '') {
        output.push(['', '', '', '', '', '']); // spacer between date groups
      }
      currentDateStr = p.dateStr;
    }

    output.push([
      p.dateStr,
      p.fullName,
      p.signIn || '',
      p.signOut || '',
      p.hours || '',
      p.notes || '',
    ]);
  });

  // Write to sheet
  if (output.length > 0) {
    sheet.getRange(1, 1, output.length, 6).setValues(output);
  }

  // Format
  formatOrgSheet(sheet, output.length);
}

/**
 * Pairs records by name + date using timestamps only.
 * Ignores the action column entirely — earliest timestamp = sign-in,
 * latest timestamp = sign-out. If only one record exists, it's treated
 * as a sign-in with no sign-out.
 */
function pairRecords(records) {
  // Group by name + date
  const groups = {};

  records.forEach(r => {
    const key = `${r.fullName}|||${r.dateStr}`;
    if (!groups[key]) {
      groups[key] = { entries: [], fullName: r.fullName, date: r.date, dateStr: r.dateStr, notes: [] };
    }
    groups[key].entries.push(r);
    if (r.notes) groups[key].notes.push(r.notes);
  });

  const paired = [];

  Object.values(groups).forEach(g => {
    // Sort all entries by timestamp
    g.entries.sort((a, b) => a.time - b.time);

    const earliest = g.entries[0];
    const latest = g.entries.length > 1 ? g.entries[g.entries.length - 1] : null;

    let hours = '';
    if (earliest && latest) {
      const diffMs = latest.time.getTime() - earliest.time.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      if (diffHrs > 0 && diffHrs < 24) {
        hours = Math.round(diffHrs * 100) / 100;
      }
    }

    paired.push({
      fullName: g.fullName,
      date: g.date,
      dateStr: g.dateStr,
      signIn: earliest ? earliest.timeStr : '',
      signOut: latest ? latest.timeStr : '',
      hours: hours,
      notes: g.notes.join('; '),
    });
  });

  return paired;
}


// ── Formatting ──────────────────────────────────────────────────────────────

function formatOrgSheet(sheet, totalRows) {
  // Column widths
  sheet.setColumnWidth(1, 120);  // Date
  sheet.setColumnWidth(2, 200);  // Full Name
  sheet.setColumnWidth(3, 100);  // Sign In
  sheet.setColumnWidth(4, 100);  // Sign Out
  sheet.setColumnWidth(5, 80);   // Hours
  sheet.setColumnWidth(6, 250);  // Notes

  // Title row
  sheet.getRange('A1').setFontSize(14).setFontWeight('bold');

  // Subtitle rows
  sheet.getRange('A2:A3').setFontColor('#666666').setFontSize(10);

  // Column header row (row 5)
  const headerRange = sheet.getRange(5, 1, 1, 6);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f3f3');
  headerRange.setBorder(null, null, true, null, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // Freeze header
  sheet.setFrozenRows(5);

  // Number format for hours column
  if (totalRows > 5) {
    sheet.getRange(6, 5, totalRows - 5, 1).setNumberFormat('0.00');
  }
}


// ── Utilities ───────────────────────────────────────────────────────────────

function titleCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
}

/**
 * Flexible date parser. Handles Date objects, "M/D/YYYY", "D/M/YYYY", etc.
 * Falls back to timestamp if dateRaw is garbage.
 */
function parseFlexDate(dateRaw, timestamp) {
  if (dateRaw instanceof Date && !isNaN(dateRaw)) {
    return stripTime(dateRaw);
  }

  if (typeof dateRaw === 'string' && dateRaw.trim()) {
    const d = new Date(dateRaw);
    if (!isNaN(d)) return stripTime(d);
  }

  // Fallback to timestamp
  if (timestamp instanceof Date && !isNaN(timestamp)) {
    return stripTime(timestamp);
  }

  return null;
}

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(d) {
  if (!d) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'M/d/yyyy');
}

function formatTime(d) {
  if (!d || isNaN(d)) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'h:mm a');
}


// ── Participant Report ──────────────────────────────────────────────────────

/**
 * Shows HTML dialog with searchable participant dropdown.
 * ALL data is read server-side and passed into the HTML as JSON.
 * The dialog is fully client-side — no google.script.run calls needed,
 * which avoids the per-user authorization issue with HtmlService callbacks.
 */
function showParticipantReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (!ORGS.includes(sheetName)) {
    SpreadsheetApp.getUi().alert(
      'Navigate to an org tab (MJO, BJI, SIJC, or MCJC) first, then run this again.'
    );
    return;
  }

  // Read ALL data server-side before opening the dialog
  const allData = readOrgTabData(sheet);
  if (allData.names.length === 0) {
    SpreadsheetApp.getUi().alert('No participant data found on this tab.');
    return;
  }

  const html = HtmlService.createHtmlOutput(buildReportPickerHtml(allData, sheetName))
    .setWidth(500)
    .setHeight(560)
    .setTitle('Participant Report — ' + sheetName);

  SpreadsheetApp.getUi().showModalDialog(html, 'Participant Report — ' + sheetName);
}

/**
 * Reads the org tab and returns all records + unique names.
 * This runs server-side so we have access to SpreadsheetApp.
 */
function readOrgTabData(sheet) {
  const data = sheet.getDataRange().getValues();
  const names = new Set();
  const records = [];

  // Data rows start at row 6 (after title, subtitle, summary, blank, header)
  for (let i = 5; i < data.length; i++) {
    const row = data[i];
    const name = String(row[1]).trim();
    if (!name || name === 'Full Name') continue;

    names.add(name);

    // Format date server-side since we have Utilities.formatDate
    let dateStr = '';
    let monthStr = '';
    let dateMs = 0;
    const d = (row[0] instanceof Date) ? row[0] : new Date(row[0]);
    if (d instanceof Date && !isNaN(d)) {
      dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), 'M/d/yyyy');
      monthStr = Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM yyyy');
      dateMs = d.getTime();
    }

    records.push({
      name: name,
      date: dateStr,
      month: monthStr,
      dateMs: dateMs,
      signIn: (row[2] instanceof Date) ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'h:mm a') : String(row[2] || ''),
      signOut: (row[3] instanceof Date) ? Utilities.formatDate(row[3], Session.getScriptTimeZone(), 'h:mm a') : String(row[3] || ''),
      hours: parseFloat(row[4]) || 0,
    });
  }

  return {
    names: [...names].sort(),
    records: records,
  };
}

/**
 * Community Service Attendance Processor — Incremental Update Addition
 * 
 * Adds an onFormSubmit trigger that processes each new row as it arrives,
 * upserting into the correct org tab instead of rebuilding from scratch.
 * 
 * SETUP: Run setupTrigger() once to install the form-submit trigger.
 * The full processAttendance() refresh is preserved as a rebuild/cleanup fallback.
 * 
 * HOW IT WORKS:
 *   1. New form submission fires onFormSubmit(e)
 *   2. Parse the new row (same logic as existing parseRow)
 *   3. Match to canonical org
 *   4. Look for existing row in the org tab with same name + date
 *      - Found → treat new entry as sign-out, update cols D/E/G
 *      - Not found → insert new sign-in row near the top (row 6, after headers)
 *   5. Update the summary line (row 3) with fresh counts
 * 
 * Column layout on org tabs (unchanged visible columns):
 *   A: Date | B: Full Name | C: Sign In | D: Sign Out | E: Hours | F: Notes
 *   G (hidden): Sign-in epoch (ms) — used to calculate hours on sign-out
 */


// ── Trigger Setup ───────────────────────────────────────────────────────────

/**
 * Run this once from the script editor to install the trigger.
 * (Menu-driven triggers can't fire onFormSubmit — needs installable trigger.)
 */
function setupTrigger() {
  // Remove any existing onFormSubmit triggers to avoid duplicates
  const existing = ScriptApp.getProjectTriggers();
  existing.forEach(t => {
    if (t.getHandlerFunction() === 'onFormSubmitIncremental') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('onFormSubmitIncremental')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();

  SpreadsheetApp.getUi().alert('Form submit trigger installed. New responses will auto-update org tabs.');
}


// ── Incremental Handler ─────────────────────────────────────────────────────

/**
 * Fires on each new form submission. Parses the row and upserts
 * into the matching org tab.
 */
function onFormSubmitIncremental(e) {
  try {
    // e.values is an array of cell values from the new row
    // e.range gives us the range if we need to read from the sheet instead
    const row = e.values || getRowFromRange(e.range);
    if (!row) return;

    const parsed = parseRow(row);
    if (!parsed) return;

    const canonical = matchOrg(parsed.org);
    if (!canonical) return;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(canonical);

    // If the org tab doesn't exist yet, create it with headers
    if (!sheet) {
      sheet = createOrgTabWithHeaders(ss, canonical);
    }

    upsertRecord(sheet, parsed);
    updateSummaryRow(sheet, canonical);

  } catch (err) {
    // Log errors but don't interrupt — form submissions shouldn't fail silently
    console.error('onFormSubmitIncremental error:', err.message, err.stack);
  }
}

/**
 * Fallback: read row values from the range if e.values isn't available.
 */
function getRowFromRange(range) {
  if (!range) return null;
  return range.getSheet().getRange(range.getRow(), 1, 1, 14).getValues()[0];
}


// ── Upsert Logic ────────────────────────────────────────────────────────────

/**
 * Inserts a new sign-in row or updates an existing row with sign-out data.
 * 
 * Match key: fullName + dateStr (same as the existing pairing logic).
 * 
 * If a matching row exists:
 *   - Compare timestamps to decide if this is a sign-out
 *   - Update sign-out time, calculate hours, merge notes
 * 
 * If no match:
 *   - Insert a new row at position 6 (right after headers, keeps newest on top)
 */
function upsertRecord(sheet, record) {
  const data = sheet.getDataRange().getValues();
  const dataStartRow = 6; // 1-indexed, rows 1-5 are title/summary/headers

  // Search for existing row with same name + date
  let matchSheetRow = -1; // 1-indexed sheet row number
  let matchSignInEpoch = null;

  for (let i = dataStartRow - 1; i < data.length; i++) { // i is 0-indexed
    const rowName = String(data[i][1] || '').trim();
    const rawDate = data[i][0];
    const rowDate = (rawDate instanceof Date && !isNaN(rawDate))
      ? formatDate(rawDate)
      : String(rawDate || '').trim();

    if (rowName === record.fullName && rowDate === record.dateStr) {
      matchSheetRow = i + 1; // convert to 1-indexed
      matchSignInEpoch = data[i][6] || null; // col G: stored sign-in epoch
      break;
    }
  }

  if (matchSheetRow > 0) {
    // ── UPDATE existing row (sign-out) ──
    updateExistingRow(sheet, matchSheetRow, record, matchSignInEpoch);
  } else {
    // ── INSERT new row (sign-in) ──
    insertNewRow(sheet, dataStartRow, record);
  }
}

/**
 * Updates an existing row with sign-out info.
 */
function updateExistingRow(sheet, sheetRow, record, storedSignInEpoch) {
  const newEpoch = record.time.getTime();

  // Calculate hours if we have a stored sign-in epoch
  let hours = '';
  if (storedSignInEpoch) {
    const diffMs = Math.abs(newEpoch - storedSignInEpoch);
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs > 0 && diffHrs < 24) {
      hours = Math.round(diffHrs * 100) / 100;
    }
  }

  // Determine if new record is earlier or later than stored sign-in
  if (storedSignInEpoch && newEpoch < storedSignInEpoch) {
    // Rare edge case: new submission is actually earlier — swap sign-in/sign-out
    sheet.getRange(sheetRow, 3).setValue(record.timeStr);         // C: new sign-in
    sheet.getRange(sheetRow, 7).setValue(newEpoch);               // G: new sign-in epoch
    // Sign-out stays as the original (later) time — already in col D
  } else {
    // Normal case: new submission is the sign-out
    sheet.getRange(sheetRow, 4).setValue(record.timeStr);         // D: sign-out
  }

  // Hours
  if (hours) {
    sheet.getRange(sheetRow, 5).setValue(hours).setNumberFormat('0.00'); // E: hours
  }

  // Merge notes
  if (record.notes) {
    const existingNotes = String(sheet.getRange(sheetRow, 6).getValue() || '');
    const merged = existingNotes ? existingNotes + '; ' + record.notes : record.notes;
    sheet.getRange(sheetRow, 6).setValue(merged);
  }
}

/**
 * Inserts a new sign-in row at the top of the data area (row 6).
 */
function insertNewRow(sheet, insertAtRow, record) {
  // Insert a blank row at position 6 to keep newest records on top
  sheet.insertRowBefore(insertAtRow);

  const newRow = [
    record.dateStr,         // A: Date
    record.fullName,        // B: Full Name
    record.timeStr,         // C: Sign In
    '',                     // D: Sign Out (pending)
    '',                     // E: Hours (pending)
    record.notes || '',     // F: Notes
    record.time.getTime(),  // G: Sign-in epoch (hidden)
  ];

  sheet.getRange(insertAtRow, 1, 1, 7).setValues([newRow]);

  // Hide column G if it isn't already
  if (!sheet.isColumnHiddenByUser(7)) {
    sheet.hideColumns(7);
  }
}


// ── Summary & Tab Scaffolding ───────────────────────────────────────────────

/**
 * Updates the summary line (row 3) with current counts.
 */
function updateSummaryRow(sheet, orgName) {
  const data = sheet.getDataRange().getValues();
  const dates = new Set();
  const names = new Set();
  let recordCount = 0;

  for (let i = 5; i < data.length; i++) { // 0-indexed, data starts at row 6
    const name = String(data[i][1] || '').trim();
    const date = String(data[i][0] || '').trim();
    if (!name) continue;
    names.add(name);
    if (date) dates.add(date);
    recordCount++;
  }

  sheet.getRange('A3').setValue(
    `${dates.size} dates | ${names.size} unique participants | ${recordCount} total records`
  );
  sheet.getRange('A2').setValue(`Last updated: ${new Date().toLocaleString()}`);
}

/**
 * Creates a fresh org tab with the standard header structure.
 * Used when the trigger fires but the tab hasn't been created yet.
 */
function createOrgTabWithHeaders(ss, orgName) {
  const sheet = ss.insertSheet(orgName);

  const headers = [
    [`${orgName} — Community Service Attendance`, '', '', '', '', ''],
    [`Last updated: ${new Date().toLocaleString()}`, '', '', '', '', ''],
    ['0 dates | 0 unique participants | 0 total records', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Date', 'Full Name', 'Sign In', 'Sign Out', 'Hours', 'Notes'],
  ];

  sheet.getRange(1, 1, 5, 6).setValues(headers);
  formatOrgSheet(sheet, 5);

  // Add hidden col G header
  sheet.getRange(5, 7).setValue('_epoch');
  sheet.hideColumns(7);

  return sheet;
}


// ── Modified Menu (add trigger setup option) ────────────────────────────────

/**
 * Replace your existing onOpen with this to add the trigger setup option.
 */



// ── Patch for Full Refresh ──────────────────────────────────────────────────

/**
 * OPTIONAL: If you want the full refresh to also write the hidden epoch column
 * so that incremental updates work correctly after a rebuild, patch writeOrgTab's
 * output section. Replace the data row push with:
 * 
 *   output.push([
 *     p.dateStr,
 *     p.fullName,
 *     p.signIn || '',
 *     p.signOut || '',
 *     p.hours || '',
 *     p.notes || '',
 *     p.signInEpoch || '',   // <-- add this
 *   ]);
 * 
 * And update pairRecords to carry forward the epoch:
 * 
 *   paired.push({
 *     ...existing fields,
 *     signInEpoch: earliest ? earliest.time.getTime() : '',
 *   });
 * 
 * Then after writing, hide column 7:
 *   sheet.hideColumns(7);
 */

/**
 * Builds the HTML for the participant picker + report display.
 * All data is embedded as JSON — no server callbacks needed.
 */
function buildReportPickerHtml(allData, sheetName) {
  const dataJson = JSON.stringify(allData);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Google Sans', Arial, sans-serif; padding: 20px; color: #333; }

    .search-box { position: relative; margin-bottom: 16px; }
    .search-box input {
      width: 100%; padding: 10px 12px; font-size: 14px;
      border: 2px solid #ddd; border-radius: 8px; outline: none;
    }
    .search-box input:focus { border-color: #4285f4; }

    .dropdown {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 10;
      max-height: 200px; overflow-y: auto;
      background: #fff; border: 1px solid #ddd; border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: none;
    }
    .dropdown.show { display: block; }
    .dropdown-item {
      padding: 8px 12px; cursor: pointer; font-size: 14px;
    }
    .dropdown-item:hover, .dropdown-item.active { background: #e8f0fe; }

    .report { margin-top: 8px; }
    .report h2 { font-size: 18px; margin-bottom: 4px; color: #1a73e8; }
    .report .org-label { font-size: 12px; color: #888; margin-bottom: 16px; }

    .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .stat-card {
      background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center;
    }
    .stat-card .value { font-size: 22px; font-weight: 700; color: #1a73e8; }
    .stat-card .label { font-size: 11px; color: #888; margin-top: 2px; }

    h3 { font-size: 13px; color: #555; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }

    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
    th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #e0e0e0; color: #555; font-weight: 600; }
    td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
    tr:hover td { background: #fafafa; }
    .hours-cell { font-weight: 600; }

    .empty { text-align: center; padding: 20px; color: #999; font-style: italic; }
  </style>
</head>
<body>
  <div class="search-box">
    <input type="text" id="search" placeholder="Start typing a participant name..." autocomplete="off" />
    <div class="dropdown" id="dropdown"></div>
  </div>
  <div id="report-area"></div>

  <script>
    // All data embedded server-side — no google.script.run needed
    const allData = ${dataJson};
    const sheetName = '${sheetName}';
    const names = allData.names;
    const records = allData.records;

    const input = document.getElementById('search');
    const dropdown = document.getElementById('dropdown');
    const reportArea = document.getElementById('report-area');
    let activeIdx = -1;

    input.addEventListener('input', function() {
      const q = this.value.toLowerCase().trim();
      if (!q) { dropdown.classList.remove('show'); return; }

      const matches = names.filter(n => n.toLowerCase().includes(q));
      if (matches.length === 0) { dropdown.classList.remove('show'); return; }

      activeIdx = -1;
      dropdown.innerHTML = matches.map((m, i) =>
        '<div class="dropdown-item" data-name="' + m.replace(/"/g, '&quot;') + '">' + m + '</div>'
      ).join('');
      dropdown.classList.add('show');

      dropdown.querySelectorAll('.dropdown-item').forEach(el => {
        el.addEventListener('click', () => selectName(el.dataset.name));
      });
    });

    input.addEventListener('keydown', function(e) {
      const items = dropdown.querySelectorAll('.dropdown-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        updateActive(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        updateActive(items);
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        selectName(items[activeIdx].dataset.name);
      }
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-box')) dropdown.classList.remove('show');
    });

    function updateActive(items) {
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
      if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
    }

    // All calculation happens client-side — instant, no server round-trip
    function selectName(name) {
      input.value = name;
      dropdown.classList.remove('show');

      const myRecords = records.filter(r => r.name === name);
      if (myRecords.length === 0) {
        reportArea.innerHTML = '<div class="empty">No records found for ' + name + '</div>';
        return;
      }

      // Total hours
      const totalHours = Math.round(myRecords.reduce((s, r) => s + r.hours, 0) * 100) / 100;

      // Total attendances
      const totalAttendances = myRecords.length;

      // Last attendance (use dateMs for comparison)
      let lastDateMs = 0;
      let lastDateStr = '';
      myRecords.forEach(r => {
        if (r.dateMs > lastDateMs) { lastDateMs = r.dateMs; lastDateStr = r.date; }
      });

      // Hours by month
      const byMonth = {};
      const monthOrder = [];
      myRecords.forEach(r => {
        if (!r.month) return;
        if (!byMonth[r.month]) { byMonth[r.month] = 0; monthOrder.push({ key: r.month, ms: r.dateMs }); }
        byMonth[r.month] += r.hours;
      });
      // Dedupe and sort chronologically
      const seenMonths = {};
      const sortedMonths = monthOrder.filter(m => {
        if (seenMonths[m.key]) return false;
        seenMonths[m.key] = true; return true;
      }).sort((a, b) => a.ms - b.ms);

      // Build report HTML
      let html = '<div class="report">';
      html += '<h2>' + name + '</h2>';
      html += '<div class="org-label">' + sheetName + '</div>';

      html += '<div class="stat-grid">';
      html += '<div class="stat-card"><div class="value">' + totalHours + '</div><div class="label">Total Hours</div></div>';
      html += '<div class="stat-card"><div class="value">' + totalAttendances + '</div><div class="label">Attendances</div></div>';
      html += '<div class="stat-card"><div class="value">' + lastDateStr + '</div><div class="label">Last Attended</div></div>';
      html += '</div>';

      if (sortedMonths.length > 0) {
        html += '<h3>Hours by Month</h3>';
        html += '<table><tr><th>Month</th><th style="text-align:right">Hours</th></tr>';
        sortedMonths.forEach(m => {
          html += '<tr><td>' + m.key + '</td><td class="hours-cell" style="text-align:right">' + (Math.round(byMonth[m.key] * 100) / 100) + '</td></tr>';
        });
        html += '</table>';
      }

      // All attendance records (sorted newest first already from the tab)
      html += '<h3>Attendance History</h3>';
      html += '<table><tr><th>Date</th><th>In</th><th>Out</th><th style="text-align:right">Hours</th></tr>';
      myRecords.forEach(r => {
        html += '<tr><td>' + r.date + '</td><td>' + r.signIn + '</td><td>' + r.signOut + '</td>';
        html += '<td class="hours-cell" style="text-align:right">' + (r.hours || '') + '</td></tr>';
      });
      html += '</table>';

      html += '</div>';
      reportArea.innerHTML = html;
    }
  </script>
</body>
</html>`;
}