function findDocketMatches() {
  const startTime = new Date();
  console.log('=== STARTING DOCKET LOOKUP ===');
  console.log('Start time:', startTime.toLocaleTimeString());
  
  // External spreadsheet ID
  const EXTERNAL_SHEET_ID = 'SOURCESHEET_ID';
  
  // List of sheet names to exclude (when checking all tabs)
  const EXCLUDED_SHEET_NAMES = [
    'Alchemer Master Sheet - No edits allowed',
    'RC Calendar',
    'Salesforce_Engagements',
    'MCJC Data',
    'MCJC Referrals',
    'RESET'
  ];
  
  try {
    console.log('Step 1: Getting user preference...');
    const ui = SpreadsheetApp.getUi();
    const userChoice = ui.alert(
      'Docket Lookup Options',
      'Do you want to check ALL tabs or a SPECIFIC month?\n\n' +
      'YES = Check all tabs\n' +
      'NO = Check specific month\n' +
      'CANCEL = Exit',
      ui.ButtonSet.YES_NO_CANCEL
    );
    
    let validSheets = [];
    let searchMode = '';
    
    let monthName = '';
    
    if (userChoice === ui.Button.YES) {
      // Check all tabs
      searchMode = 'ALL_TABS';
      console.log('User selected: Check all tabs');
    } else if (userChoice === ui.Button.NO) {
      // Check specific month
      searchMode = 'SPECIFIC_MONTH';
      console.log('User selected: Check specific month');
      
      const monthInput = ui.prompt(
        'Specific Month Search',
        'Enter the month and year (e.g., "June 2025"):',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (monthInput.getSelectedButton() === ui.Button.CANCEL) {
        console.log('User cancelled month input');
        return;
      }
      
      monthName = monthInput.getResponseText().trim();
      console.log('User entered month:', monthName);
      
      if (!monthName) {
        ui.alert('Error', 'Please enter a valid month and year.', ui.ButtonSet.OK);
        return;
      }
    } else {
      console.log('User cancelled operation');
      return;
    }
    
    console.log('Step 5: Getting current sheet...');
    const currentSheet = SpreadsheetApp.getActiveSheet();
    console.log('Current sheet name:', currentSheet.getName());
    
    console.log('Step 6: Opening external spreadsheet...');
    const externalSpreadsheet = SpreadsheetApp.openById(EXTERNAL_SHEET_ID);
    console.log('External spreadsheet opened successfully');
    
    console.log('Step 7: Getting sheets from external spreadsheet...');
    const allSheets = externalSpreadsheet.getSheets();
    console.log('Total sheets found:', allSheets.length);
    console.log('All sheet names:', allSheets.map(s => s.getName()));
    
    if (searchMode === 'ALL_TABS') {
      validSheets = allSheets.filter(sheet => 
        !EXCLUDED_SHEET_NAMES.includes(sheet.getName())
      );
      console.log('Valid sheets (after exclusions):', validSheets.length);
    } else if (searchMode === 'SPECIFIC_MONTH') {
      validSheets = allSheets.filter(sheet => {
        const sheetName = sheet.getName();
        return sheetName === monthName || sheetName === 'MCJC Referrals';
      });
      console.log(`Valid sheets for month "${monthName}":`, validSheets.length);
    }
    
    console.log('Valid sheet names:', validSheets.map(s => s.getName()));
    
    if (validSheets.length === 0) {
      console.log('No valid sheets found');
      ui.alert('Error', 'No valid sheets found for the specified criteria.', ui.ButtonSet.OK);
      return;
    }
    
    console.log('Step 4: Getting data from current sheet...');
    const lastRow = currentSheet.getLastRow();
    console.log('Last row in current sheet:', lastRow);
    
    if (lastRow < 3) {
      console.log('No data rows found (need at least row 3)');
      return;
    }
    
    // Get docket numbers from column B (starting from row 3)
    const docketRange = currentSheet.getRange(3, 2, lastRow - 2, 1);
    const docketValues = docketRange.getValues();
    console.log('Docket values to process:', docketValues.length);
    
    // Prepare results array for column K
    const results = [];
    
    console.log('Step 5: Processing each docket number...');
    // Process each docket number
    for (let i = 0; i < docketValues.length; i++) {
      const docketNumber = docketValues[i][0];
      const rowNum = i + 3; // Actual row number in sheet
      
      console.log(`\n--- Processing row ${rowNum} (${i + 1}/${docketValues.length}) ---`);
      console.log('Docket number:', docketNumber);
      
      // Skip empty cells
      if (!docketNumber || docketNumber.toString().trim() === '') {
        console.log('Empty docket number, skipping...');
        results.push(['']);
        continue;
      }
      
      let matchFound = false;
      let matchingSheetName = '';
      
      // Search through all valid sheets
      console.log('Searching through', validSheets.length, 'valid sheets...');
      for (let sheetIndex = 0; sheetIndex < validSheets.length; sheetIndex++) {
        const sheet = validSheets[sheetIndex];
        const sheetName = sheet.getName();
        console.log(`  Checking sheet ${sheetIndex + 1}/${validSheets.length}: "${sheetName}"`);
        
        // Get all data from column B in current sheet
        const sheetLastRow = sheet.getLastRow();
        console.log(`    Sheet has ${sheetLastRow} rows`);
        
        if (sheetLastRow > 0) {
          const sheetDocketRange = sheet.getRange(1, 2, sheetLastRow, 1);
          const sheetDocketValues = sheetDocketRange.getValues();
          console.log(`    Retrieved ${sheetDocketValues.length} values from column B`);
          
          // Check for match
          for (let j = 0; j < sheetDocketValues.length; j++) {
            const cellValue = sheetDocketValues[j][0];
            if (cellValue && cellValue.toString().trim() === docketNumber.toString().trim()) {
              console.log(`    ✓ MATCH FOUND in "${sheetName}" at row ${j + 1}!`);
              matchFound = true;
              matchingSheetName = sheetName;
              break;
            }
          }
          
          if (matchFound) break;
        }
      }
      
      // Add result
      const result = matchFound ? matchingSheetName : 'Missing';
      results.push([result]);
      console.log(`Result for row ${rowNum}: "${result}"`);
      
      // Log progress every 10 rows
      if ((i + 1) % 10 === 0) {
        console.log(`\n*** PROGRESS: Completed ${i + 1}/${docketValues.length} rows ***`);
      }
    }
    
    console.log('\nStep 6: Writing results to column K...');
    if (results.length > 0) {
      const resultRange = currentSheet.getRange(3, 11, results.length, 1);
      resultRange.setValues(results);
      console.log('Results written successfully');
    }
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    const matchCount = results.filter(r => r[0] !== 'Missing' && r[0] !== '').length;
    
    console.log('\n=== COMPLETION SUMMARY ===');
    console.log(`Search mode: ${searchMode === 'ALL_TABS' ? 'All tabs' : `Specific month: ${monthName}`}`);
    console.log(`Sheets searched: ${validSheets.map(s => s.getName()).join(', ')}`);
    console.log(`Processed ${results.length} rows in ${duration} seconds`);
    console.log(`Found ${matchCount} matches`);
    console.log(`Missing: ${results.length - matchCount}`);
    console.log('End time:', endTime.toLocaleTimeString());
    
    // Also log to Logger for persistence
    Logger.log(`Completed: ${results.length} rows processed, ${matchCount} matches found in ${duration} seconds`);
    
    // Show completion message to user
    ui.alert(
      'Lookup Complete',
      `Processed ${results.length} rows\n` +
      `Found ${matchCount} matches\n` +
      `Missing: ${results.length - matchCount}\n` +
      `Duration: ${duration} seconds`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    console.log('ERROR:', error.toString());
    console.log('Error stack:', error.stack);
    Logger.log('Error: ' + error.toString());
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('Error', 'An error occurred: ' + error.toString(), ui.ButtonSet.OK);
  }
}

// Optional: Function to clear column K before running
function clearResults() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear Results',
    'Are you sure you want to clear all results in column K?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    const currentSheet = SpreadsheetApp.getActiveSheet();
    const lastRow = currentSheet.getLastRow();
    
    if (lastRow >= 3) {
      const clearRange = currentSheet.getRange(3, 11, lastRow - 2, 1);
      clearRange.clearContent();
      console.log('Column K cleared');
      ui.alert('Success', 'Column K has been cleared.', ui.ButtonSet.OK);
    } else {
      ui.alert('Info', 'No data to clear.', ui.ButtonSet.OK);
    }
  }
}

// Optional: Function to run both clear and find
function runFullProcess() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Full Process',
    'This will clear column K and then run the docket lookup. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    // Clear first
    const currentSheet = SpreadsheetApp.getActiveSheet();
    const lastRow = currentSheet.getLastRow();
    
    if (lastRow >= 3) {
      const clearRange = currentSheet.getRange(3, 11, lastRow - 2, 1);
      clearRange.clearContent();
      console.log('Column K cleared before lookup');
    }
    
    // Then run lookup
    findDocketMatches();
  }
}