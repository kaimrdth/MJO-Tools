// --- Group Appointments sync (current‑month) -----------------------------------
// Includes helper functions so the script can run standalone.
// Updated to handle multiple calendar IDs based on appointment type mappings
// -----------------------------------------------------------------------------

function fetchAndWriteGroupAppointments() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet       = spreadsheet.getSheetByName('GroupAppointments') || spreadsheet.insertSheet('GroupAppointments');
  const apiKey      = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!apiKey) throw new Error('API_KEY not set in Script Properties');

  const acuityUserId = '25722431';
  
  // Calendar ID mappings for specific appointment types
  const calendarMappings = {
    '77567367': '11998013',
    '23381332': '5601780',
    '33182300': '6818392',
    '30064732': '6460952',
    '77757462':'4286267'
  };
  
  // Default calendar for other appointment types
  const defaultCalendarId = '4795228';
  
  const appointmentTypeIds = [
    '59427338','56712045','43705757','29775894','27112038','30614666','56712131','22474051','30614540','59428215',
    '18752645','30357292','26256507','61876222','60738907','60739108','53577193','53577629','67524614','67823468',
    '67866731','68812565','73662405','74823118','74823207','72190521','30064732','23381332','77567367','77757462',
    '33182300','83238040','83237702', '90431546' // Added the new appointment type
  ];

  // ── date range (this month, inclusive) ─────────────────────────────────────
  const today        = new Date();
  const rangeStart   = new Date(today.getFullYear(), today.getMonth(), 1);   // 1st of month inclusive
  const rangeEnd     = new Date(today.getFullYear(), today.getMonth() + 1, 1); // 1st of next month (exclusive)

  const minDateStr = Utilities.formatDate(rangeStart, 'GMT', 'yyyy-MM-dd');
  const maxDateStr = Utilities.formatDate(rangeEnd,   'GMT', 'yyyy-MM-dd');

  Logger.log(`Fetching classes ${minDateStr} → ${maxDateStr}`);
  const classesData = fetchClassesForRangeMultiCalendar(appointmentTypeIds, calendarMappings, defaultCalendarId, rangeStart, rangeEnd, acuityUserId, apiKey);

  Logger.log(`Fetching appointments ${minDateStr} → ${maxDateStr}`);
  const appointmentsData = fetchAppointmentsForRangeMultiCalendar(appointmentTypeIds, calendarMappings, defaultCalendarId, rangeStart, rangeEnd, acuityUserId, apiKey);

  // ── Map classes ────────────────────────────────────────────────────────────
  const tz = 'America/New_York';
  const classesMap = {};
  classesData.forEach(c => {
    const date = Utilities.formatDate(new Date(c.time), tz, 'yyyy-MM-dd');
    const time = Utilities.formatDate(new Date(c.time), tz, 'hh:mm a');
    classesMap[`${date}|${time}|${c.name}`] = {
      date, time,
      className: c.name,
      facilitator: c.facilitator || '',
      appointments: []
    };
  });

  // ── Attach appointments ────────────────────────────────────────────────────
  appointmentsData.forEach(a => {
    const date = Utilities.formatDate(new Date(a.datetime), tz, 'yyyy-MM-dd');
    const time = Utilities.formatDate(new Date(a.datetime), tz, 'hh:mm a');
    const key  = `${date}|${time}|${a.type}`;
    if (classesMap[key]) {
      const client = `${a.firstName || ''} ${a.lastName || ''}`.trim();
      if (client) classesMap[key].appointments.push(client);
    }
  });

  // ── Prepare rows for Sheets ────────────────────────────────────────────────
  const rows = Object.values(classesMap).flatMap(c => {
    return c.appointments.length
      ? c.appointments.map(name => [c.date, c.time, c.className, c.appointments.length, c.facilitator, name])
      : [[c.date, c.time, c.className, 0, c.facilitator, '']];
  });

  rows.sort((a,b)=> new Date(`${a[0]} ${a[1]}`) - new Date(`${b[0]} ${b[1]}`));

  // ── Write to sheet ─────────────────────────────────────────────────────────
  sheet.clear();
  sheet.appendRow(['Date','Time','Group Name','# of People Signed Up','Facilitator','Client Name']);
  if (rows.length) sheet.getRange(2,1,rows.length,6).setValues(rows);
  else Logger.log(`No classes found for range ${minDateStr} → ${maxDateStr}.`);
}

// --- Next Month Version ---------------------------------------------------
function fetchAndWriteGroupAppointmentsNextMonth() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("GroupAppointmentsNextMonth");
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('API_KEY');
  if (!sheet) {
    sheet = spreadsheet.insertSheet("GroupAppointmentsNextMonth");
  }

  var acuityUserId = '25722431';
  
  // Calendar ID mappings for specific appointment types
  var calendarMappings = {
    '77567367': '11998013',
    '23381332': '5601780',
    '33182300': '6818392',
    '30064732': '6460952'
  };
  
  // Default calendar for other appointment types
  var defaultCalendarId = '4795228';
  
  const appointmentTypeIds = [
    '59427338','56712045','43705757','29775894','27112038','30614666','56712131','22474051','30614540','59428215',
    '18752645','30357292','26256507','61876222','60738907','60739108','53577193','53577629','67524614','67823468',
    '67866731','68812565','73662405','74823118','74823207','72190521','30064732','23381332','77567367','77757462',
    '33182300','90431546' // Added the new appointment type
  ];

  var today = new Date();
  var firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  var lastDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  var minDateString = Utilities.formatDate(firstDayOfNextMonth, "GMT", "yyyy-MM-dd");
  var maxDateString = Utilities.formatDate(lastDayOfNextMonth, "GMT", "yyyy-MM-dd");

  Logger.log("Fetching classes from " + minDateString + " to " + maxDateString);
  var classesData = fetchClassesForRangeMultiCalendar(appointmentTypeIds, calendarMappings, defaultCalendarId, firstDayOfNextMonth, lastDayOfNextMonth, acuityUserId, apiKey);
  Logger.log("Classes Data: " + JSON.stringify(classesData));

  Logger.log("Fetching appointments from " + minDateString + " to " + maxDateString);
  var appointmentsData = fetchAppointmentsForRangeMultiCalendar(appointmentTypeIds, calendarMappings, defaultCalendarId, firstDayOfNextMonth, lastDayOfNextMonth, acuityUserId, apiKey);
  Logger.log("Appointments Data: " + JSON.stringify(appointmentsData));

  // Create a map of classes for quick lookup
  var classesMap = {};
  classesData.forEach(function(classItem) {
    var date = Utilities.formatDate(new Date(classItem.time), "GMT", "yyyy-MM-dd");
    var time = Utilities.formatDate(new Date(classItem.time), "America/New_York", "hh:mm a");
    var key = date + '|' + time + '|' + classItem.name;
    classesMap[key] = { 
      className: classItem.name, 
      date: date, 
      time: time, 
      facilitator: classItem.facilitator || '',
      appointments: []
    };
  });

  Logger.log("Classes Map: " + JSON.stringify(classesMap));

  // Associate appointments with their respective classes
  appointmentsData.forEach(function(appointment) {
    var className = appointment.type;
    var date = Utilities.formatDate(new Date(appointment.datetime), "GMT", "yyyy-MM-dd");
    var time = Utilities.formatDate(new Date(appointment.datetime), "America/New_York", "hh:mm a");
    var key = date + '|' + time + '|' + className;
    if (classesMap[key]) {
      var clientName = (appointment.firstName || '') + ' ' + (appointment.lastName || '');
      classesMap[key].appointments.push(clientName.trim());
    }
  });

  Logger.log("Updated Classes Map with Appointments: " + JSON.stringify(classesMap));

  // Format and organize data for Google Sheets
  var formattedData = [];

  Object.keys(classesMap).forEach(function(key) {
    var classInfo = classesMap[key];
    if (classInfo.appointments.length > 0) {
      classInfo.appointments.forEach(function(clientName) {
        formattedData.push([
          classInfo.date,
          classInfo.time,
          classInfo.className,
          classInfo.appointments.length,
          classInfo.facilitator,
          clientName
        ]);
      });
    } else {
      formattedData.push([
        classInfo.date,
        classInfo.time,
        classInfo.className,
        0,
        classInfo.facilitator,
        ''
      ]);
    }
  });

  Logger.log("Formatted Data: " + JSON.stringify(formattedData));

  // Sort the data by Date and Time for better readability
  formattedData.sort(function(a, b) {
    var dateA = new Date(a[0] + ' ' + a[1]);
    var dateB = new Date(b[0] + ' ' + b[1]);
    return dateA - dateB;
  });

  // Clear the sheet before writing new data
  sheet.clear();

  // Set headers
  sheet.appendRow(['Date', 'Time', 'Group Name', '# of People Signed Up', 'Facilitator', 'Client Name']);

  if (formattedData.length > 0) {
    sheet.getRange(2, 1, formattedData.length, 6).setValues(formattedData);
  } else {
    Logger.log("No classes found for range " + minDateString + " to " + maxDateString + ".");
  }
}

/* ──────────────────────────────────────────────────────────────
   Updated Helper Functions for Multiple Calendars
   ─────────────────────────────────────────────────────────── */

function fetchClassesForRangeMultiCalendar(appointmentTypeIds, calendarMappings, defaultCalendarId, startDate, endDate, acuityUserId, acuityApiKey) {
  const minDateStr = Utilities.formatDate(startDate, 'GMT', 'yyyy-MM-dd');
  const maxDateStr = Utilities.formatDate(endDate,   'GMT', 'yyyy-MM-dd');
  
  let allClasses = [];
  
  // Get unique calendar IDs
  const calendarIds = new Set([defaultCalendarId, ...Object.values(calendarMappings)]);
  
  // Fetch classes from each calendar
  calendarIds.forEach(calendarId => {
    const url = `https://acuityscheduling.com/api/v1/availability/classes?minDate=${minDateStr}&maxDate=${maxDateStr}&includeUnavailable=true&includePrivate=true`;
    const options = {
      headers: { Authorization: 'Basic ' + Utilities.base64Encode(`${acuityUserId}:${acuityApiKey}`) },
      muteHttpExceptions: true
    };
    
    const res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() !== 200) {
      Logger.log(`Warning: Classes fetch failed for calendar ${calendarId}: ${res.getResponseCode()}: ${res.getContentText()}`);
      return;
    }
    
    const data = JSON.parse(res.getContentText());
    const filteredClasses = data.filter(c => appointmentTypeIds.includes(String(c.appointmentTypeID)));
    allClasses = allClasses.concat(filteredClasses);
  });
  
  return allClasses;
}

function fetchAppointmentsForRangeMultiCalendar(appointmentTypeIds, calendarMappings, defaultCalendarId, startDate, endDate, acuityUserId, acuityApiKey) {
  const minDateStr = Utilities.formatDate(startDate, 'GMT', 'yyyy-MM-dd');
  const maxDateStr = Utilities.formatDate(endDate,   'GMT', 'yyyy-MM-dd');
  
  let allAppointments = [];
  
  // Get unique calendar IDs
  const calendarIds = new Set([defaultCalendarId, ...Object.values(calendarMappings)]);
  
  // Fetch appointments from each calendar
  calendarIds.forEach(calendarId => {
    const url = `https://acuityscheduling.com/api/v1/appointments?calendarID=${calendarId}&minDate=${minDateStr}&maxDate=${maxDateStr}`;
    const options = {
      headers: { Authorization: 'Basic ' + Utilities.base64Encode(`${acuityUserId}:${acuityApiKey}`) },
      muteHttpExceptions: true
    };
    
    const res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() !== 200) {
      Logger.log(`Warning: Appointments fetch failed for calendar ${calendarId}: ${res.getResponseCode()}: ${res.getContentText()}`);
      return;
    }
    
    const data = JSON.parse(res.getContentText());
    const filteredAppointments = data.filter(a => appointmentTypeIds.includes(String(a.appointmentTypeID)));
    allAppointments = allAppointments.concat(filteredAppointments);
  });
  
  return allAppointments;
}

// Legacy helper functions for backward compatibility (these are now unused but kept for reference)
function fetchClassesForRange(calendarId, appointmentTypeIds, startDate, endDate, acuityUserId, acuityApiKey) {
  const minDateStr = Utilities.formatDate(startDate, 'GMT', 'yyyy-MM-dd');
  const maxDateStr = Utilities.formatDate(endDate,   'GMT', 'yyyy-MM-dd');
  const url = `https://acuityscheduling.com/api/v1/availability/classes?minDate=${minDateStr}&maxDate=${maxDateStr}&includeUnavailable=true&includePrivate=true`;
  const options = {
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(`${acuityUserId}:${acuityApiKey}`) },
    muteHttpExceptions: true
  };
  const res = UrlFetchApp.fetch(url, options);
  if (res.getResponseCode() !== 200) throw new Error(`Classes ${res.getResponseCode()}: ${res.getContentText()}`);
  const data = JSON.parse(res.getContentText());
  return data.filter(c => appointmentTypeIds.includes(String(c.appointmentTypeID)));
}

function fetchAppointmentsForRange(calendarId, appointmentTypeIds, startDate, endDate, acuityUserId, acuityApiKey) {
  const minDateStr = Utilities.formatDate(startDate, 'GMT', 'yyyy-MM-dd');
  const maxDateStr = Utilities.formatDate(endDate,   'GMT', 'yyyy-MM-dd');
  const url = `https://acuityscheduling.com/api/v1/appointments?calendarID=${calendarId}&minDate=${minDateStr}&maxDate=${maxDateStr}`;
  const options = {
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(`${acuityUserId}:${acuityApiKey}`) },
    muteHttpExceptions: true
  };
  const res = UrlFetchApp.fetch(url, options);
  if (res.getResponseCode() !== 200) throw new Error(`Appointments ${res.getResponseCode()}: ${res.getContentText()}`);
  const data = JSON.parse(res.getContentText());
  return data.filter(a => appointmentTypeIds.includes(String(a.appointmentTypeID)));
}