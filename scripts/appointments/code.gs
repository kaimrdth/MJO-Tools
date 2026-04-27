function getDateRange() {
  var today = new Date();
  
  // Calculate days until next Friday
  var dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  var daysUntilNextFriday = (12 - dayOfWeek) % 7; // Days until next week's Friday
  
  // Calculate the end date (Friday of the following week)
  var endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilNextFriday + 42); // Add 7 days to reach the following week's Friday
  
  // Format dates as 'yyyy-MM-dd'
  var dateFormat = "yyyy-MM-dd";
  var minDate = Utilities.formatDate(today, "GMT", dateFormat);
  var maxDate = Utilities.formatDate(endDate, "GMT", dateFormat);
  
  return { minDate: minDate, maxDate: maxDate };
}

function fetchAndWriteAppointmentsWithCalendarName() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Access the "Appointments" sheet, create it if it doesn't exist
  var appointmentsSheet = spreadsheet.getSheetByName("Appointments");
  if (!appointmentsSheet) {
    appointmentsSheet = spreadsheet.insertSheet("Appointments");
  }

  // Access the "Staff Lookup" sheet
  var staffLookupSheet = spreadsheet.getSheetByName("Staff Lookup");
  if (!staffLookupSheet) {
    Logger.log('Error: "Staff Lookup" sheet not found.');
    return;
  }

  // Get the data from "Staff Lookup" sheet
  var staffData = staffLookupSheet.getDataRange().getValues();
  
  // Find the index of "CalendarID" and "Calendar Name" columns
  var header = staffData[0];
  var calendarIdColIndex = header.indexOf("CalendarID");
  var calendarNameColIndex = header.indexOf("Calendar Name");

  if (calendarIdColIndex === -1 || calendarNameColIndex === -1) {
    Logger.log('Error: "CalendarID" or "Calendar Name" column not found in "Staff Lookup" sheet.');
    return;
  }

  // Create a lookup map for CalendarID to Calendar Name
  var calendarNameMap = {};
  for (var i = 1; i < staffData.length; i++) {
    var calendarId = staffData[i][calendarIdColIndex];
    var calendarName = staffData[i][calendarNameColIndex];
    if (calendarId && calendarName) {
      calendarNameMap[calendarId.toString()] = calendarName;
    }
  }

  if (Object.keys(calendarNameMap).length === 0) {
    Logger.log('No Calendar IDs with names found in "Staff Lookup" sheet.');
    appointmentsSheet.clear();
    // Update headers to include 'Calendar Name'
    appointmentsSheet.appendRow(['Appointment Date', 'Case Manager', 'Appointment Time', 'First Name', 'Last Name', 'Appointment Type', 'Notes', 'CalendarID', 'Calendar Name', 'Additional Notes']);
    appointmentsSheet.getRange(2, 1).setValue("No Calendar IDs available.");
    return;
  }

  // Retrieve Acuity API Key from script properties
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('ACUITY_API_KEY');

  if (!apiKey) {
    Logger.log('Error: ACUITY_API_KEY not set in script properties.');
    return;
  }

  var acuityUserId = '25722431';
  
  // Get the date range
  var dateRange = getDateRange();
  var minDate = dateRange.minDate;
  var maxDate = dateRange.maxDate;

  var appointmentsData = [];

  // Fetch appointments for each Calendar ID
  Object.keys(calendarNameMap).forEach(function(calendarId) {
    var url = `https://acuityscheduling.com/api/v1/appointments?calendarID=${calendarId}&minDate=${minDate}&maxDate=${maxDate}&includeForms=true`;
    var authString = Utilities.base64Encode(`${acuityUserId}:${apiKey}`);
    var options = {
      'headers': {'Authorization': 'Basic ' + authString},
      'method': 'get',
      'muteHttpExceptions': true
    };

    try {
      var response = UrlFetchApp.fetch(url, options);
      if (response.getResponseCode() === 200) {
        var appointments = JSON.parse(response.getContentText());
        
        // Add CalendarID and Calendar Name to each appointment
        appointments = appointments.map(function(appointment) {
          appointment.calendarId = calendarId;
          appointment.calendarName = calendarNameMap[calendarId];
          return appointment;
        });

        appointmentsData = appointmentsData.concat(appointments);
      } else {
        Logger.log(`Failed to fetch appointments for Calendar ID ${calendarId}. Response Code: ${response.getResponseCode()}`);
      }
    } catch (e) {
      Logger.log(`Error fetching appointments for Calendar ID ${calendarId}: ${e}`);
    }
  });

  if (appointmentsData.length === 0) {
    Logger.log('No appointments found for the specified date range.');
  }

  // Sort appointments by datetime
  appointmentsData.sort(function(a, b) {
    return new Date(a.datetime) - new Date(b.datetime);
  });

  // Exclude weekends
  appointmentsData = appointmentsData.filter(function(appointment) {
    var date = new Date(appointment.datetime);
    var day = date.getDay();
    // Exclude Saturdays (6) and Sundays (0)
    return day !== 0 && day !== 6;
  });

  // Clear existing content and set headers
  appointmentsSheet.clear();
  appointmentsSheet.appendRow(['Appointment Date', 'Case Manager', 'Appointment Time', 'First Name', 'Last Name', 'Appointment Type', 'Notes', 'CalendarID', 'Calendar Name', 'Additional Notes']);

  // Format data for Google Sheets
  var formattedData = appointmentsData.map(function(appointment) {
    var datetime = new Date(appointment.datetime);
    var formattedDate = Utilities.formatDate(datetime, "America/New_York", "yyyy-MM-dd");
    var formattedTime = Utilities.formatDate(datetime, "America/New_York", "hh:mm a");
    var caseManager = appointment.calendarName || 'Unknown';
    var appointmentType = appointment.type || 'Unknown';
    var notes = appointment.notes || 'N/A';
    var calendarId = appointment.calendarId || 'N/A';
    var calendarName = appointment.calendarName || 'N/A';

    // Extract the specific form field value
    var additionalNotes = 'N/A';
    if (appointment.forms && appointment.forms.length > 0) {
      // Iterate over forms
      for (var i = 0; i < appointment.forms.length; i++) {
        var form = appointment.forms[i];
        // Iterate over form fields
        for (var j = 0; j < form.values.length; j++) {
          var field = form.values[j];
          if (field.fieldID == 15710292) { // Adjust the fieldID as needed
            additionalNotes = field.value || 'N/A';
            break;
          }
        }
        if (additionalNotes !== 'N/A') {
          break;
        }
      }
    }

    return [formattedDate, caseManager, formattedTime, appointment.firstName, appointment.lastName, appointmentType, notes, calendarId, calendarName, additionalNotes];
  });

  // Write formatted data to the sheet
  if (formattedData.length > 0) {
    appointmentsSheet.getRange(2, 1, formattedData.length, 10).setValues(formattedData);
  } else {
    appointmentsSheet.getRange(2, 1).setValue("No appointments found for the specified date range.");
  }
}