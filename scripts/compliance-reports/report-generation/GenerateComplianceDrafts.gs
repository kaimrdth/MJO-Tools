/****************************************************
 * Main Function: Generates Compliance Reports in Batches
 ****************************************************/
function generateComplianceReports() {
  var startTime = new Date().getTime();
  var BATCH_SIZE = 15; // How many rows are we generating in one go?
  
  // Get script properties for progress tracking
  var props = PropertiesService.getScriptProperties();
  var savedRowIndex = parseInt(props.getProperty('currentRowIndex')) || 1;
  
  // Show dialog to get user input for starting row
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    'Set Starting Row',
    'Current saved position: Row ' + savedRowIndex + '\n\nEnter the row number to start processing from (or press Cancel to use saved position):',
    ui.ButtonSet.OK_CANCEL
  );
  
  var currentRowIndex;
  if (response.getSelectedButton() == ui.Button.OK) {
    var userInput = response.getResponseText().trim();
    if (userInput && !isNaN(userInput)) {
      currentRowIndex = parseInt(userInput);
      if (currentRowIndex < 1) {
        ui.alert('Invalid Input', 'Row number must be 1 or greater. Using saved position: ' + savedRowIndex, ui.ButtonSet.OK);
        currentRowIndex = savedRowIndex;
      }
    } else if (userInput === '') {
      // User entered empty string, use saved position
      currentRowIndex = savedRowIndex;
    } else {
      // Invalid input
      ui.alert('Invalid Input', 'Please enter a valid number. Using saved position: ' + savedRowIndex, ui.ButtonSet.OK);
      currentRowIndex = savedRowIndex;
    }
  } else {
    // User cancelled or closed dialog, use saved position
    currentRowIndex = savedRowIndex;
  }

  // 1) Grab your sheet and data
  var sheetName = "Upcoming Dates";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log("Error: Sheet '" + sheetName + "' not found.");
    return;
  }
  var data = sheet.getDataRange().getValues(); // includes header row
  
  // Validate that the starting row is within bounds
  if (currentRowIndex >= data.length) {
    ui.alert('Invalid Row', 'Starting row ' + currentRowIndex + ' is beyond the data range. Total rows: ' + data.length, ui.ButtonSet.OK);
    return;
  }
  
  Logger.log("Starting processing from row " + currentRowIndex + " with batch size " + BATCH_SIZE);
  
  // 2) RC-to-template mapping (adjust with your actual template IDs)
  var rcTemplateMap = {
    "Kai": "3490314r41930j4f0xx", // these are IDs to google doc templates with respective RC signatures at the bottom
  };

  // 3) Main folder ID (where subfolders + docs will be saved)
  var mainFolderId = "driverfolderIDs";
  var mainFolder = DriveApp.getFolderById(mainFolderId);

  // 3.1) Reorganize any old flat day folders into the new nested structure.
  reorganizeOldFolders(mainFolder);

  // Process rows in a batch
  var processedCount = 0;
  for (var i = currentRowIndex; i < data.length; i++) {
    // If we've processed our batch size, exit for this run.
    if (processedCount >= BATCH_SIZE) {
      Logger.log("Batch limit reached. Pausing execution.");
      break;
    }
    
    try {
      // Adjust column indices to match your spreadsheet
      var mandateDateRaw   = data[i][0]; // A: Mandate Date
      var docket           = data[i][1]; // B: Docket #
      var participantName  = data[i][2]; // C: Participant Name
      var charge           = data[i][3]; // D: Charge
      var dispo            = data[i][4]; // E: Dispo
      var mandate          = data[i][5]; // F: Mandate
      var adjournDateRaw   = data[i][6]; // G: Adjourn Date
      var part             = data[i][7]; // H: Part
      var notes            = data[i][8]; // I: Notes
      var rc               = data[i][9]; // J: RC
      var lastcourtdateraw = data[i][15]; // P: Last Court Date

      // 5) Determine the correct template; default to Kai if no match
      var templateId = rcTemplateMap[rc] || rcTemplateMap["Kai"];

      // 6) Format dates as "M/d/yyyy"
      var timeZone = Session.getScriptTimeZone();
      var mandateDate = Utilities.formatDate(new Date(mandateDateRaw), timeZone, "M/d/yyyy");
      var adjournDate = Utilities.formatDate(new Date(adjournDateRaw), timeZone, "M/d/yyyy");
      var lastcourtdate = Utilities.formatDate(new Date(lastcourtdateraw), timeZone, "M/d/yyyy");

      // Create a Date object for adjourn date to build our nested folder structure.
      var adjournDateObj = new Date(adjournDateRaw);
      var yearStr = adjournDateObj.getFullYear().toString();
      var monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
      var monthStr = monthNames[adjournDateObj.getMonth()];
      var monday = getMonday(adjournDateObj);
      var weekFolderName = "Week of " + (monday.getMonth()+1) + "/" + monday.getDate();
      var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var dayFolderName = dayNames[adjournDateObj.getDay()] + " " + ((adjournDateObj.getMonth()+1) + "/" + adjournDateObj.getDate());
      
      // Create the nested folder structure including the Part folder
      var yearFolder = getOrCreateFolder(mainFolder, yearStr);
      var monthFolder = getOrCreateFolder(yearFolder, monthStr);
      var weekFolder = getOrCreateFolder(monthFolder, weekFolderName);
      var dayFolder = getOrCreateFolder(weekFolder, dayFolderName);
      var partFolder = getOrCreateFolder(dayFolder, part); // New level for Part folders

      // 10) Build your file naming convention (e.g., "LastName_F_Part_Compliance Report")
      var nameParts = participantName.trim().split(/\s+/);
      var firstName = nameParts.length > 0 ? nameParts[0] : "Unknown";
      var lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Unknown";
      var firstInitial = firstName.charAt(0);
      var baseName = lastName + "_" + firstInitial + "_" + part + "_Compliance Report";

      // Check for duplicates; skip if already exists in the part folder.
      var existingFiles = partFolder.getFilesByName(baseName);
      if (existingFiles.hasNext()) {
        Logger.log("Skipping duplicate report for " + baseName + " (row " + i + ")");
        processedCount++;
        continue;
      }

      // 8) Copy the template into the part folder
      var tempDocFile = DriveApp.getFileById(templateId).makeCopy("TempDoc", partFolder);
      var tempDocId = tempDocFile.getId();
      var doc = DocumentApp.openById(tempDocId);
      var body = doc.getBody();

      // 9) Replace placeholders in the document
      body.replaceText("\\{\\{Mandate Date\\}\\}", mandateDate);
      body.replaceText("\\{\\{Docket \\#\\}\\}", docket);
      body.replaceText("\\{\\{Participant Name\\}\\}", participantName);
      body.replaceText("\\{\\{Charge\\}\\}", charge);
      body.replaceText("\\{\\{Dispo\\}\\}", dispo);
      
      var mandateText = (mandate == 1) ? "1 session" : mandate + " sessions";
      body.replaceText("\\{\\{Mandate\\}\\}", mandateText);
      
      body.replaceText("\\{\\{Adjourn\\. Date\\}\\}", adjournDate);
      body.replaceText("\\{\\{Part\\}\\}", part);
      body.replaceText("\\{\\{Notes\\}\\}", notes);
      body.replaceText("\\{\\{RC\\}\\}", rc);
      body.replaceText("\\{\\{LastCourtDate\\}\\}", lastcourtdate);

      // 11) Save changes and rename the document
      doc.saveAndClose();
      tempDocFile.setName(baseName); 
      Logger.log("Successfully generated report: " + baseName + " (row " + i + ")");

      processedCount++;
    } catch (e) {
      Logger.log("Error processing row " + i + ": " + e.toString());
    }
    
    // Check elapsed time; if approaching limit, save progress and exit.
    var elapsed = new Date().getTime() - startTime;
    if (elapsed > 280000) {  // roughly 4.66 minutes
      Logger.log("Approaching execution time limit; saving progress at row " + i);
      props.setProperty('currentRowIndex', i + 1);
      return;
    }
  }
  
  // Update progress: if not finished, store the new starting row; otherwise, clear it.
  if (currentRowIndex + processedCount < data.length) {
    props.setProperty('currentRowIndex', currentRowIndex + processedCount);
    Logger.log("Batch completed. Next starting row: " + (currentRowIndex + processedCount));
  } else {
    props.deleteProperty('currentRowIndex');
    Logger.log("All reports processed.");
  }
}

/****************************************************
 * Helper Function: Returns the folder with the given name inside the parent folder,
 * or creates it if it does not exist.
 ****************************************************/
function getOrCreateFolder(parent, folderName) {
  var folders = parent.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parent.createFolder(folderName);
}

/****************************************************
 * Helper Function: Given a date, returns the Monday of that week.
 * If already Monday, returns the same date.
 ****************************************************/
function getMonday(d) {
  var dCopy = new Date(d);
  var day = dCopy.getDay();
  var offset = (day === 0 ? -6 : 1 - day); // Sunday case: adjust backward 6 days
  return new Date(dCopy.getFullYear(), dCopy.getMonth(), dCopy.getDate() + offset);
}

/****************************************************
 * Reorganize old flat day folders (named like "4-10-2025") into the new nested structure.
 * Also reorganize the previous structure (without Part folders) to the new structure.
 ****************************************************/
function reorganizeOldFolders(mainFolder) {
  // First, handle the legacy flat folders
  var oldFolderIterator = mainFolder.getFolders();
  var oldFolderRegex = /^\d{1,2}-\d{1,2}-\d{4}$/;  // e.g., "4-10-2025"
  
  while (oldFolderIterator.hasNext()) {
    var oldFolder = oldFolderIterator.next();
    var folderName = oldFolder.getName();
    if (oldFolderRegex.test(folderName)) {
      // Parse the folder name into a Date object (month-day-year)
      var parts = folderName.split("-");
      var month = parseInt(parts[0], 10) - 1;
      var day = parseInt(parts[1], 10);
      var year = parseInt(parts[2], 10);
      var oldDate = new Date(year, month, day);
      
      reorganizeFolderContents(mainFolder, oldFolder, oldDate);
    }
  }
  
  // Now, handle the previous organizational structure (Year -> Month -> Week -> Day) without Part level
  reorganizePreviousStructure(mainFolder);
}

/****************************************************
 * Helper function to reorganize files from old folder structure.
 ****************************************************/
function reorganizeFolderContents(mainFolder, oldFolder, oldDate) {
  var yearStr = oldDate.getFullYear().toString();
  var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
  var monthStr = monthNames[oldDate.getMonth()];
  var monday = getMonday(oldDate);
  var weekFolderName = "Week of " + (monday.getMonth()+1) + "/" + monday.getDate();
  var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var dayFolderName = dayNames[oldDate.getDay()] + " " + ((oldDate.getMonth() + 1) + "/" + oldDate.getDate());
  
  var yearFolder = getOrCreateFolder(mainFolder, yearStr);
  var monthFolder = getOrCreateFolder(yearFolder, monthStr);
  var weekFolder = getOrCreateFolder(monthFolder, weekFolderName);
  var dayFolder = getOrCreateFolder(weekFolder, dayFolderName);
  
  // Move all files from the old folder into appropriate Part folders
  var files = oldFolder.getFiles();
  while (files.hasNext()){
    var file = files.next();
    var fileName = file.getName();
    
    // Extract the Part info from the filename (e.g., "LastName_F_ASC_Compliance Report")
    var partMatch = fileName.match(/_([^_]+)_Compliance Report$/);
    var partName = partMatch && partMatch[1] ? partMatch[1] : "Unknown";
    
    // Create a Part folder and move the file there
    var partFolder = getOrCreateFolder(dayFolder, partName);
    
    var existing = partFolder.getFilesByName(fileName);
    if (!existing.hasNext()){
      file.moveTo(partFolder);
      Logger.log("Moved " + fileName + " to folder " + partFolder.getName());
    }
  }
  
  // Trash the old folder if empty
  if (!oldFolder.getFiles().hasNext() && !oldFolder.getFolders().hasNext()){
    oldFolder.setTrashed(true);
    Logger.log("Trashed empty old folder: " + folderName);
  }
}

/****************************************************
 * Handle reorganizing files from the previous structure (without Part folders) 
 * to the new structure with Part folders.
 ****************************************************/
function reorganizePreviousStructure(mainFolder) {
  // Process Year folders
  var yearFolders = mainFolder.getFolders();
  while (yearFolders.hasNext()) {
    var yearFolder = yearFolders.next();
    var yearName = yearFolder.getName();
    
    // Check if this is a year folder (4-digit number)
    if (/^\d{4}$/.test(yearName)) {
      // Process Month folders
      var monthFolders = yearFolder.getFolders();
      while (monthFolders.hasNext()) {
        var monthFolder = monthFolders.next();
        
        // Process Week folders
        var weekFolders = monthFolder.getFolders();
        while (weekFolders.hasNext()) {
          var weekFolder = weekFolders.next();
          
          // Process Day folders
          var dayFolders = weekFolder.getFolders();
          while (dayFolders.hasNext()) {
            var dayFolder = dayFolders.next();
            
            // Process files in each Day folder and move them to appropriate Part folders
            var files = dayFolder.getFiles();
            var movedAnyFiles = false;
            
            while (files.hasNext()) {
              var file = files.next();
              var fileName = file.getName();
              
              // Extract the Part info from the filename
              var partMatch = fileName.match(/_([^_]+)_Compliance Report$/);
              var partName = partMatch && partMatch[1] ? partMatch[1] : "Unknown";
              
              // Create a Part folder and move the file there
              var partFolder = getOrCreateFolder(dayFolder, partName);
              
              var existing = partFolder.getFilesByName(fileName);
              if (!existing.hasNext()) {
                file.moveTo(partFolder);
                movedAnyFiles = true;
                Logger.log("Moved " + fileName + " to folder " + partFolder.getName());
              }
            }
            
            if (movedAnyFiles) {
              Logger.log("Reorganized files in day folder: " + dayFolder.getName());
            }
          }
        }
      }
    }
  }
}

function resetProcessing() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('currentRowIndex');
  Logger.log("Processing reset. Will start from row 1 on next run.");
}