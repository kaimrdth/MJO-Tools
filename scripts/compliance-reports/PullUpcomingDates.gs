function copyUpcomingCourtDates() {
  // Constants
  const MAIN_SHEET_ID = 'SOURCE_SHEET_ID';
  const UPCOMING_DATES_SHEET_ID = 'DESTINATION_SHEET_ID';
  
  // List of sheet names to exclude
  const EXCLUDED_SHEET_NAMES = [
    'Alchemer Master Sheet - No edits allowed',
    'RC Calendar',
    'Salesforce_Engagements',
    'MCJC Data',
    'MCJC Referrals',
    'RESET'
  ];
  
  const UPCOMING_DATES_SHEET_NAME = 'Upcoming Dates';
  const DATE_COLUMN_INDEX = 6; // Index of the 'adj date' column (0-based)
  const DOCKET_NUMBER_INDEX = 1; // Index of the docket number column (0-based)
  const MANDATE_DATE_INDEX = 0; // Index of the mandate date column (0-based)
  const LAST_COURT_DATE_INDEX = 10; // Column K in main sheet (0-based)
  const LAST_COURT_DATE_UPCOMING_INDEX = 15; // Column P in upcoming dates sheet (0-based)
  const UPCOMING_WEEKS = 10;
  const TOTAL_COLUMNS = 10; // Original columns from main sheet
  const TOTAL_COLUMNS_WITH_LAST_COURT = 16; // Total columns including Last Court Date in upcoming sheet
  const HEADER_ROWS = 1;
  
  // Highlight color for new rows
  const HIGHLIGHT_COLOR = '#FFFF00'; // Yellow highlight
  
  function normalizeDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  
  function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }
  
  try {
    // Get Spreadsheets and Sheets
    const mainSpreadsheet = SpreadsheetApp.openById(MAIN_SHEET_ID);
    const mainSheets = mainSpreadsheet.getSheets();
    const upcomingDatesSpreadsheet = SpreadsheetApp.openById(UPCOMING_DATES_SHEET_ID);
    const upcomingDatesSheet = 
      upcomingDatesSpreadsheet.getSheetByName(UPCOMING_DATES_SHEET_NAME) ||
      upcomingDatesSpreadsheet.insertSheet(UPCOMING_DATES_SHEET_NAME);
    
    // Calculate date ranges
    const currentDate = normalizeDate(new Date());
    currentDate.setDate(currentDate.getDate()); // Skip today's date
    const endDate = normalizeDate(new Date());
    endDate.setDate(endDate.getDate() + UPCOMING_WEEKS * 7);
    
    // Get existing upcoming dates data and sort it
    let upcomingDatesData = [];
    let existingDocketNumbers = new Set();
    
    if (upcomingDatesSheet.getLastRow() > HEADER_ROWS) {
      const existingDataRange = upcomingDatesSheet.getRange(
        HEADER_ROWS + 1,
        1,
        upcomingDatesSheet.getLastRow() - HEADER_ROWS,
        TOTAL_COLUMNS_WITH_LAST_COURT
      );
      upcomingDatesData = existingDataRange.getValues();
      upcomingDatesData.forEach(row => existingDocketNumbers.add(row[DOCKET_NUMBER_INDEX]));
      
      // Clear any existing highlighting from previous runs
      existingDataRange.setBackground(null);
      
      existingDataRange.sort({
        column: DATE_COLUMN_INDEX + 1,
        ascending: true
      });
    }
    
    let newUpcomingDates = [];
    
    // Loop through all sheets except those in EXCLUDED_SHEET_NAMES
    mainSheets.forEach(function(sheet) {
      if (!EXCLUDED_SHEET_NAMES.includes(sheet.getName())) {
        // Get data including the Last Court Date column (if it exists)
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        
        if (lastRow > HEADER_ROWS) {
          const sheetData = sheet
            .getRange(HEADER_ROWS + 1, 1, lastRow - HEADER_ROWS, Math.max(lastCol, LAST_COURT_DATE_INDEX + 1))
            .getValues();
          
          // Filter rows based on date and duplicate check
          const sheetUpcomingDates = sheetData.filter(function(row) {
            const dateCell = row[DATE_COLUMN_INDEX];
            if (!dateCell) {
              return false;
            }
            const date = normalizeDate(new Date(dateCell));
            
            if (!isValidDate(date)) {
              Logger.log('Invalid Date: ' + dateCell);
              return false;
            }
            
            const docketNumber = row[DOCKET_NUMBER_INDEX];
            return date >= currentDate && date <= endDate && !existingDocketNumbers.has(docketNumber);
          }).map(function(row) {
            // Create new row with Last Court Date
            const newRow = row.slice(0, TOTAL_COLUMNS).concat(Array(TOTAL_COLUMNS_WITH_LAST_COURT - TOTAL_COLUMNS).fill(''));
            
            // Set Last Court Date
            // If there's already a Last Court Date in column K, use it
            // Otherwise, use the Mandate Date (referral date) from column A
            if (row[LAST_COURT_DATE_INDEX] && row[LAST_COURT_DATE_INDEX] !== '') {
              newRow[LAST_COURT_DATE_UPCOMING_INDEX] = row[LAST_COURT_DATE_INDEX];
            } else {
              newRow[LAST_COURT_DATE_UPCOMING_INDEX] = row[MANDATE_DATE_INDEX];
            }
            
            return newRow;
          });
          
          newUpcomingDates = newUpcomingDates.concat(sheetUpcomingDates);
        }
      }
    });
    
    if (newUpcomingDates.length > 0) {
      // Write new data to the sheet
      const newRowsRange = upcomingDatesSheet
        .getRange(upcomingDatesSheet.getLastRow() + 1, 1, newUpcomingDates.length, TOTAL_COLUMNS_WITH_LAST_COURT)
        .setValues(newUpcomingDates);
      
      // Highlight the new rows
      newRowsRange.setBackground(HIGHLIGHT_COLOR);
      
      // Sort all the data
      upcomingDatesSheet
        .getRange(HEADER_ROWS + 1, 1, upcomingDatesSheet.getLastRow() - HEADER_ROWS, TOTAL_COLUMNS_WITH_LAST_COURT)
        .sort({
          column: DATE_COLUMN_INDEX + 1,
          ascending: true
        });
    }
    
    Logger.log('Upcoming dates successfully updated. ' + newUpcomingDates.length + ' new records added and highlighted.');
  } catch (e) {
    Logger.log('Error: ' + e);
    Logger.log(e.stack);
  }
}
