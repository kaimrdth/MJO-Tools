function updateWaitTimes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1"); // Replace with your sheet name
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues(); // Assumes data starts from row 2

  const acuityUserId = PropertiesService.getScriptProperties().getProperty('Acuity_USER_ID');
  const acuityApiKey = PropertiesService.getScriptProperties().getProperty('Acuity_API_Key');

  // Map AppointmentTypeIDs and corresponding CalendarIDs
  const appointmentTypes = {
    "Remote Intake": { id: 70516297, calendars: [5979796, 4795218, 5138140, 4795225, 4795223, 10680260,12438540,11238156, 12834073, 12961107] },
    "In-Person Intake": { id: 70517392, calendars: [5979796, 4795218, 5138140, 4795225, 4795223, 10680260,12438540,11238156, 12834073, 12961107] },
    "Remote Assessment": { id: 70517874, calendars: [5138140, 4795223, 10680260,12438540] },
    "In-Person Assessment": { id: 70517910, calendars: [5138140, 4795223, 10680260,12438540] }
  };

  const results = [];
  const waitTimesLog = [];

  rows.forEach((row) => {
    const appointmentType = row[1];
    if (appointmentTypes[appointmentType]) {
      const { id, calendars } = appointmentTypes[appointmentType];
      const { waitTime, soonestDate } = getEarliestAvailable(id, calendars, acuityUserId, acuityApiKey, appointmentType);
      results.push([waitTime]);
      waitTimesLog.push([new Date(), appointmentType, waitTime, soonestDate]);
    } else {
      results.push(["N/A"]);
      waitTimesLog.push([new Date(), appointmentType, "N/A", "N/A"]);
    }
  });

  sheet.getRange(2, 3, results.length, 1).setValues(results); // Assumes Column C is "Current Wait Time"
  logWaitTimes(waitTimesLog); // Log the wait times to Sheet2
}

function getEarliestAvailable(appointmentTypeId, calendarIds, userId, apiKey, appointmentType) {
  const baseUrl = `https://acuityscheduling.com/api/v1/availability/times`;
  let earliestDate = null;
  const daysToLookAhead = 100; // Increased lookahead to 100 days to capture appointments >3 weeks out

  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(userId + ':' + apiKey)
    },
    muteHttpExceptions: true // Prevents script from stopping on error
  };

  Logger.log(`Checking availability for ${appointmentType} with Appointment Type ID ${appointmentTypeId} and Calendar IDs: ${calendarIds.join(",")}`);

  // Loop through each day to check availability
  for (let i = 0; i < daysToLookAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    let url = `${baseUrl}?appointmentTypeID=${appointmentTypeId}&calendarID=${calendarIds.join(',')}&date=${dateString}`;
    let data;

    try {
      let response = UrlFetchApp.fetch(url, options);
      data = JSON.parse(response.getContentText());
      Logger.log(`API Response for ${appointmentType} on ${dateString} with batched calendars: ${JSON.stringify(data)}`);
    } catch (error) {
      Logger.log(`Error fetching data for ${appointmentType} on ${dateString}: ${error.message}`);
      return { waitTime: "Error fetching availability", soonestDate: "N/A" };
    }

    if (data.length === 0) {
      Logger.log(`No data found for batched calendars on ${dateString}. Checking each calendar individually.`);
      for (const calendarId of calendarIds) {
        url = `${baseUrl}?appointmentTypeID=${appointmentTypeId}&calendarID=${calendarId}&date=${dateString}`;
        try {
          response = UrlFetchApp.fetch(url, options);
          data = JSON.parse(response.getContentText());
          Logger.log(`API Response for ${appointmentType} on ${dateString} for Calendar ID ${calendarId}: ${JSON.stringify(data)}`);
          if (data.length > 0) {
            const availableDate = new Date(data[0].time);
            if (!earliestDate || availableDate < earliestDate) {
              earliestDate = availableDate;
            }
          }
        } catch (error) {
          Logger.log(`Error fetching data for Calendar ID ${calendarId} on ${dateString}: ${error.message}`);
        }
      }
    } else if (data.length > 0) {
      const availableDate = new Date(data[0].time);
      if (!earliestDate || availableDate < earliestDate) {
        earliestDate = availableDate;
      }
    }
    if (earliestDate) break;
  }

  if (earliestDate) {
    const now = new Date();
    const diffInDays = Math.round((earliestDate - now) / (1000 * 60 * 60 * 24));
    const soonestDateStr = earliestDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    let waitTime;
    if (diffInDays <= 7) {
      waitTime = `${diffInDays} days`;
    } else {
      const diffInWeeks = Math.round(diffInDays / 7);
      waitTime = `${diffInWeeks} ` + (diffInWeeks === 1 ? 'week' : 'weeks');
    }
    return { waitTime, soonestDate: soonestDateStr };
  } else {
    Logger.log(`No availability found for ${appointmentType} within ${daysToLookAhead} days.`);
    // If no appointment is found within 100 days, you could choose to display "No availability"
    return { waitTime: "No availability", soonestDate: "N/A" };
  }
}

function logWaitTimes(waitTimesLog) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2");
  
  // Add header row only if the sheet is empty
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(["Date", "Appointment Type", "Wait Time", "Soonest Date"]);
  }
  
  const today = new Date().toDateString(); // Get today's date as a string for comparison
  
  waitTimesLog.forEach(newRow => {
    const [newDate, appointmentType, waitTime, soonestDate] = newRow;
    const newDateString = newDate.toDateString();
    
    // Only process if it's today's data
    if (newDateString === today) {
      let rowFound = false;
      const existingData = logSheet.getDataRange().getValues();
      
      // Look for existing row with same date and appointment type
      for (let i = 1; i < existingData.length; i++) { // Start from 1 to skip header
        const existingDate = new Date(existingData[i][0]).toDateString();
        const existingAppointmentType = existingData[i][1];
        
        if (existingDate === today && existingAppointmentType === appointmentType) {
          // Update existing row
          logSheet.getRange(i + 1, 3, 1, 2).setValues([[waitTime, soonestDate]]);
          rowFound = true;
          break;
        }
      }
      
      // If no existing row found, append new row
      if (!rowFound) {
        logSheet.appendRow(newRow);
      }
    } else {
      // For non-today dates, just append (preserves historical data)
      logSheet.appendRow(newRow);
    }
  });
}

function setupTrigger() {
  ScriptApp.newTrigger("updateWaitTimes")
    .timeBased()
    .everyHours(1)
    .create();
}