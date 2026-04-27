function consolidateGroupAppointments() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var currentMonthSheet = spreadsheet.getSheetByName("GroupAppointments");
  var nextMonthSheet = spreadsheet.getSheetByName("GroupAppointmentsNextMonth");
  var consolidatedSheet = spreadsheet.getSheetByName("AllGroupAppointments");

  if (!consolidatedSheet) {
    consolidatedSheet = spreadsheet.insertSheet("AllGroupAppointments");
  }

  // Clear the consolidated sheet before consolidating new data
  consolidatedSheet.clear();

  // Set headers
  consolidatedSheet.appendRow(['Date', 'Time', 'Group Name', '# of People Signed Up', 'Facilitator', 'Client Name']);

  var combinedData = [];

  // Function to fetch data from a sheet
  function fetchData(sheet) {
    if (sheet && sheet.getLastRow() > 1) { // Ensure there's data beyond the header
      var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
      combinedData = combinedData.concat(data);
    }
  }

  // Fetch data from current and next month sheets
  fetchData(currentMonthSheet);
  fetchData(nextMonthSheet);

  Logger.log("Total combined rows from current and next month: " + combinedData.length);

  if (combinedData.length > 0) {
    // Optionally, sort the combined data by Date and Time
    combinedData.sort(function(a, b) {
      var dateA = new Date(a[0] + ' ' + a[1]);
      var dateB = new Date(b[0] + ' ' + b[1]);
      return dateA - dateB;
    });

    // Write combined data to the consolidated sheet
    consolidatedSheet.getRange(2, 1, combinedData.length, combinedData[0].length).setValues(combinedData);
  } else {
    Logger.log("No data found in current or next month sheets to consolidate.");
  }
}