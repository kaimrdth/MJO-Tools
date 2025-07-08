
function updateMainSheetDates() {
  var mainSheetId = 'destination_google_sheets_ID';
  var upcomingDatesSheetId = 'source_google_sheets_ID';

  var upcomingDatesTab3Name = 'Updated Dates';

  var docketNumberColumnIndex = 1; // Column B (0-based)
  var dateColumnIndex = 6; // Column G - Adjournment Date (0-based)
  var courtPartColumnIndex = 7; // Column H - Court Part (0-based)
  var lastCourtDateMainIndex = 10; // Column K - Last Court Date in main sheet (0-based)
  var lastCourtDateUpdatedIndex = 15; // Column P - Last Court Date in Updated Dates (0-based)

  var mainSpreadsheet = SpreadsheetApp.openById(mainSheetId);
  var upcomingDatesSpreadsheet = SpreadsheetApp.openById(upcomingDatesSheetId);

  var upcomingDatesTab3 = upcomingDatesSpreadsheet.getSheetByName(upcomingDatesTab3Name);
  var tab3Data = upcomingDatesTab3.getDataRange().getValues();

  var mainSheetTabs = mainSpreadsheet.getSheets();

  // Ignore the first tab in the main sheet
  for (var j = 1; j < mainSheetTabs.length; j++) {
    var mainSheetTab = mainSheetTabs[j];
    var mainSheetTabData = mainSheetTab.getDataRange().getValues();

    for (var i = 1; i < tab3Data.length; i++) {
      var row = tab3Data[i];
      var docketNumber = row[docketNumberColumnIndex];
      var newRowDate = row[dateColumnIndex];
      var newRowCourtPart = row[courtPartColumnIndex];

      for (var k = 1; k < mainSheetTabData.length; k++) {
        if (mainSheetTabData[k][docketNumberColumnIndex] === docketNumber) {
          // Get the current adjournment date before updating
          var currentAdjDate = mainSheetTabData[k][dateColumnIndex];
          
          // Update the adjournment date with the new value
          mainSheetTab.getRange(k + 1, dateColumnIndex + 1).setValue(newRowDate);
          mainSheetTab.getRange(k + 1, courtPartColumnIndex + 1).setValue(newRowCourtPart);
          
          // Update Last Court Date column with the old adjournment date
          // Only update if there was a valid current adjournment date
          if (currentAdjDate && currentAdjDate !== '') {
            mainSheetTab.getRange(k + 1, lastCourtDateMainIndex + 1).setValue(currentAdjDate);
          }
          
          break;
        }
      }
    }
  }
}