// === CUSTOM MENU SETUP ===
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 Generate Group Calendars')
    .addItem('Generate Groups Calendar', 'generateGroupsCalendar')
    .addSeparator()
    .addItem('Test API Connection', 'testApiConnection')
    .addToUi();
}

// NOTE: API KEY AND USER ID GO IN SCRIPT PROPERTIES FOR SECURE STORAGE

// === MAIN CALENDAR GENERATION FUNCTION ===
function generateGroupsCalendar() {
  var ui = SpreadsheetApp.getUi();
  
  // Prompt user for month and year
  var result = ui.prompt('Generate Groups Calendar', 
    'Enter the month and year (e.g., "July 2025", "December 2024"):', 
    ui.ButtonSet.OK_CANCEL);
  
  if (result.getSelectedButton() !== ui.Button.OK) {
    return; // User cancelled
  }
  
  var userInput = result.getResponseText().trim();
  
  // Parse the input
  var parsedDate = parseMonthYear(userInput);
  if (!parsedDate) {
    ui.alert('Invalid Format', 
      'Please use the format "Month Year" (e.g., "July 2025", "December 2024")', 
      ui.ButtonSet.OK);
    return;
  }
  
  var monthName = parsedDate.monthName;
  var year = parsedDate.year;
  var monthNum = parsedDate.monthNum;
  var daysInMonth = parsedDate.daysInMonth;
  var monthString = `${year}-${monthNum.toString().padStart(2, '0')}`;
  var sheetName = `${monthName} ${year}`;
  
  // Show confirmation
  var confirmResult = ui.alert('Confirm Generation', 
    `Generate calendar for ${sheetName}?\n\nThis will create/update the "${sheetName}" tab.`, 
    ui.ButtonSet.YES_NO);
  
  if (confirmResult !== ui.Button.YES) {
    return;
  }
  
  generateMonthlyCalendar(sheetName, monthString, daysInMonth, monthName, year);
}

// === MONTH/YEAR PARSING ===
function parseMonthYear(input) {
  // Remove extra whitespace and split
  var parts = input.split(/\s+/);
  
  if (parts.length !== 2) {
    return null;
  }
  
  var monthInput = parts[0].toLowerCase();
  var yearInput = parts[1];
  
  // Validate year
  var year = parseInt(yearInput);
  if (isNaN(year) || year < 2020 || year > 2030) {
    return null;
  }
  
  // Month mapping (supports both full names and abbreviations)
  var monthMap = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12
  };
  
  var monthNum = monthMap[monthInput];
  if (!monthNum) {
    return null;
  }
  
  // Get proper month name (capitalize first letter)
  var monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
  var monthName = monthNames[monthNum];
  
  // Calculate days in month
  var daysInMonth = new Date(year, monthNum, 0).getDate();
  
  return {
    monthName: monthName,
    year: year,
    monthNum: monthNum,
    daysInMonth: daysInMonth
  };
}

// === SHEET MANAGEMENT ===
function getOrCreateSheet(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    // Create the sheet
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log(`Created new sheet: ${sheetName}`);
  } else {
    Logger.log(`Using existing sheet: ${sheetName}`);
  }
  
  return sheet;
}

// === MAIN CALENDAR GENERATION LOGIC ===
function generateMonthlyCalendar(sheetName, monthString, daysInMonth, monthName, year) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Show progress to user
  SpreadsheetApp.getActiveSpreadsheet().toast('Fetching class data from Acuity...', 'Generating Calendar', 10);

  // Access the lookup sheet
  var groupLookupSheet = spreadsheet.getSheetByName("Group Lookup Table");
  
  if (!groupLookupSheet) {
    SpreadsheetApp.getUi().alert('Error: "Group Lookup Table" sheet not found.');
    return;
  }
  
  // Get or create the calendar sheet
  var calendarSheet = getOrCreateSheet(sheetName);

  // Get the data from "Group Lookup Table" sheet
  var groupData = groupLookupSheet.getDataRange().getValues();
  
  // Build a mapping of Group -> {Appointment Type ID, Facilitator}
  var groupToAppointmentTypeId = {};
  for (var i = 1; i < groupData.length; i++) {
    var group = groupData[i][0];
    var appointmentTypeId = groupData[i][1];
    var facilitator = groupData[i][2]; // Column C
    if (group && appointmentTypeId) {
      groupToAppointmentTypeId[group] = {
        appointmentTypeId: appointmentTypeId.toString(),
        facilitator: facilitator || 'TBD'
      };
    }
  }

  if (Object.keys(groupToAppointmentTypeId).length === 0) {
    SpreadsheetApp.getUi().alert('No group data found in "Group Lookup Table" sheet.');
    return;
  }

  // Retrieve Acuity API credentials
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('ACUITY_API_KEY');
  var acuityUserId = scriptProperties.getProperty('ACUITY_USER_ID');

  if (!apiKey || !acuityUserId) {
    SpreadsheetApp.getUi().alert('Error: Acuity API credentials not set in script properties.\n\nPlease run "Test API Connection" first.');
    return;
  }

  // Fetch all classes for the month
  var allClassesData = fetchClassesForMonth(groupToAppointmentTypeId, monthString, apiKey, acuityUserId);
  
  if (allClassesData.length === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast('No classes found for this month.', 'Calendar Generated', 3);
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Found ${allClassesData.length} classes. Building calendar...`, 'Processing', 5);
  }

  // Build the calendar layout
  buildCalendarLayout(calendarSheet, allClassesData, monthString, daysInMonth, monthName, year);
  
  // Switch to the generated sheet
  spreadsheet.setActiveSheet(calendarSheet);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(`${sheetName} calendar generated successfully!`, 'Complete', 3);
}

// === DATA FETCHING ===
function fetchClassesForMonth(groupToAppointmentTypeId, monthString, apiKey, acuityUserId) {
  var allClassesData = [];

  // Loop through each group and fetch their classes
  for (var group in groupToAppointmentTypeId) {
    var appointmentTypeId = groupToAppointmentTypeId[group].appointmentTypeId;
    
    var url = `https://acuityscheduling.com/api/v1/availability/classes?appointmentTypeID=${appointmentTypeId}&month=${monthString}`;
    var authString = Utilities.base64Encode(`${acuityUserId}:${apiKey}`);
    var options = {
      'headers': {'Authorization': 'Basic ' + authString},
      'method': 'get',
      'muteHttpExceptions': true
    };

    try {
      var response = UrlFetchApp.fetch(url, options);
      if (response.getResponseCode() === 200) {
        var classes = JSON.parse(response.getContentText());
        
        for (var c = 0; c < classes.length; c++) {
          var classItem = classes[c];
          classItem.groupName = group;
          classItem.facilitator = groupToAppointmentTypeId[group].facilitator;
          allClassesData.push(classItem);
        }
        
        Logger.log(`Fetched ${classes.length} classes for group: ${group}`);
      } else {
        Logger.log(`Failed to fetch classes for group ${group}. Response Code: ${response.getResponseCode()}`);
      }
    } catch (e) {
      Logger.log(`Error fetching classes for group ${group}: ${e}`);
    }
    
    Utilities.sleep(300); // Be nice to the API
  }

  return allClassesData;
}

// === CALENDAR LAYOUT BUILDER ===
function buildCalendarLayout(sheet, classesData, monthString, daysInMonth, monthName, year) {
  // Clear the sheet
  sheet.clear();
  
  // Title
  sheet.getRange(1, 1).setValue(`${monthName} ${year} - Group Classes Calendar`);
  sheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  sheet.getRange(1, 1, 1, 7).merge();
  
  // Subtitle with generation timestamp
  var timestamp = Utilities.formatDate(new Date(), "America/New_York", "MMMM dd, yyyy 'at' h:mm a");
  sheet.getRange(2, 1).setValue(`Generated on ${timestamp}`);
  sheet.getRange(2, 1).setFontSize(10).setFontStyle('italic');
  sheet.getRange(2, 1, 1, 7).merge();
  
  // Day headers
  var dayHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  sheet.getRange(4, 1, 1, 7).setValues([dayHeaders]);
  sheet.getRange(4, 1, 1, 7).setFontWeight('bold').setBackground('#e6f3ff');
  
  // Organize classes by date
  var classesByDate = organizeClassesByDate(classesData);
  
  // Calculate calendar layout
  var firstDay = new Date(year, parseInt(monthString.split('-')[1]) - 1, 1);
  var startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  var currentRow = 5;
  var currentCol = startingDayOfWeek + 1; // +1 because sheets are 1-indexed
  
  // Set up column widths
  for (var col = 1; col <= 7; col++) {
    sheet.setColumnWidth(col, 150);
  }
  
  // Fill in the calendar
  for (var day = 1; day <= daysInMonth; day++) {
    var dateKey = `${year}-${monthString.split('-')[1]}-${day.toString().padStart(2, '0')}`;
    var dayClasses = classesByDate[dateKey] || [];
    
    // Build the cell content
    var cellData = buildDayCellContent(day, dayClasses);
    
    // Set the cell value
    var cellRange = sheet.getRange(currentRow, currentCol);
    cellRange.setValue(cellData.content);
    
    // Format the cell with colors
    formatDayCell(cellRange, dayClasses.length > 0, cellData.classes);
    
    // Move to next position
    currentCol++;
    if (currentCol > 7) {
      currentCol = 1;
      currentRow++;
    }
  }
  
  // Auto-resize rows to fit content
  sheet.autoResizeRows(5, currentRow - 4);
}

function organizeClassesByDate(classesData) {
  var classesByDate = {};
  
  for (var i = 0; i < classesData.length; i++) {
    var classItem = classesData[i];
    var datetime = new Date(classItem.time);
    var dateKey = Utilities.formatDate(datetime, "America/New_York", "yyyy-MM-dd");
    
    if (!classesByDate[dateKey]) {
      classesByDate[dateKey] = [];
    }
    
    classesByDate[dateKey].push({
      name: classItem.name || classItem.groupName,
      time: Utilities.formatDate(datetime, "America/New_York", "h:mm a"),
      available: classItem.slotsAvailable || 0,
      total: classItem.slots || 0,
      groupName: classItem.groupName,
      facilitator: classItem.facilitator || 'TBD'
    });
  }
  
  // Sort classes within each day by time
  for (var date in classesByDate) {
    classesByDate[date].sort(function(a, b) {
      return a.time.localeCompare(b.time);
    });
  }
  
  return classesByDate;
}

function buildDayCellContent(day, dayClasses) {
  var content = day.toString();
  
  if (dayClasses.length > 0) {
    content += '\n';
    for (var i = 0; i < dayClasses.length; i++) {
      var classInfo = dayClasses[i];
      content += '\n' + classInfo.name;
      content += '\n' + classInfo.time;
      content += '\n' + classInfo.facilitator;
      content += '\n(' + classInfo.available + '/' + classInfo.total + ')';
      
      if (i < dayClasses.length - 1) {
        content += '\n';
      }
    }
  }
  
  return {
    content: content,
    classes: dayClasses
  };
}

function formatDayCell(range, hasClasses, dayClasses) {
  range.setVerticalAlignment('top');
  range.setWrap(true);
  range.setHorizontalAlignment('left');
  
  
  // Start building rich text
  var cellText = range.getValue().toString();
  var richTextBuilder = SpreadsheetApp.newRichTextValue().setText(cellText);
  
  // Make the day number bold (first line)
  var firstLineEnd = cellText.indexOf('\n');
  if (firstLineEnd === -1) firstLineEnd = cellText.length;
  richTextBuilder.setTextStyle(0, firstLineEnd, SpreadsheetApp.newTextStyle().setBold(true).build());
  
  // Apply colors to class names if there are classes
  if (hasClasses && dayClasses) {
    var currentPos = firstLineEnd + 1; // Start after day number and first newline
    
    for (var i = 0; i < dayClasses.length; i++) {
      var classInfo = dayClasses[i];
      
      // Skip the empty line after day number
      currentPos = cellText.indexOf('\n', currentPos) + 1;
      
      // Find the class name position
      var classNameStart = currentPos;
      var classNameEnd = classNameStart + classInfo.name.length;
      
      // Get color for this class
      var classColor = getClassColor(classInfo.groupName);
      
      // Apply color to class name
      richTextBuilder.setTextStyle(classNameStart, classNameEnd, 
        SpreadsheetApp.newTextStyle()
          .setForegroundColor(classColor)
          .setBold(true)
          .build());
      
      // Move past this class's content (class name + time + facilitator + slots + potential separator)
      currentPos = classNameEnd;
      currentPos = cellText.indexOf('\n', currentPos) + 1; // Skip time line
      currentPos = cellText.indexOf('\n', currentPos) + 1; // Skip facilitator line
      currentPos = cellText.indexOf('\n', currentPos) + 1; // Skip slots line
      
      // Skip separator line if not the last class
      if (i < dayClasses.length - 1) {
        currentPos = cellText.indexOf('\n', currentPos) + 1;
      }
    }
  }
  
  range.setRichTextValue(richTextBuilder.build());
}

// === COLOR ASSIGNMENT FOR CLASSES ===
function getClassColor(groupName) {
  // Define a color palette for different class types
  var colorMap = {
    'NYPL': '#1f77b4',                    // Professional blue
    'Universal DAP': '#ff7f0e',           // Orange
    'Spanish DAP': '#2ca02c',             // Green  
    'Community Building Circle': '#d62728', // Red
    'Spanish CBC': '#9467bd',             // Purple
    'Harm Reduction': '#8c564b',          // Brown
    'Financial Management': '#e377c2',     // Pink
    'Healthy Relationships': '#7f7f7f',   // Gray
    'Community Leaders': '#828319',       // Olive
    'Tools for New Thinking': '#17becf',  // Cyan
    'Spanish TNT': '#ff9896',             // Light red
    'Five Senses': '#98df8a',             // Light green
    'Healthy Living': '#c5b0d5'           // Light purple
  };
  
  // Return the color for this group, or default black if not found
  return colorMap[groupName] || '#000000';
}

// === UTILITY FUNCTIONS ===
function testApiConnection() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('ACUITY_API_KEY');
  var acuityUserId = scriptProperties.getProperty('ACUITY_USER_ID');
  
  if (!apiKey || !acuityUserId) {
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt('API Setup Required', 
      'Please enter your Acuity User ID:', 
      ui.ButtonSet.OK_CANCEL);
    
    if (result.getSelectedButton() == ui.Button.OK) {
      var userId = result.getResponseText();
      var apiResult = ui.prompt('API Setup Required', 
        'Please enter your Acuity API Key:', 
        ui.ButtonSet.OK_CANCEL);
      
      if (apiResult.getSelectedButton() == ui.Button.OK) {
        var apiKeyInput = apiResult.getResponseText();
        
        // Save the credentials
        scriptProperties.setProperties({
          'ACUITY_API_KEY': apiKeyInput,
          'ACUITY_USER_ID': userId
        });
        
        ui.alert('Success!', 'API credentials saved successfully.', ui.ButtonSet.OK);
      }
    }
    return;
  }
  
  // Test the connection
  try {
    var url = 'https://acuityscheduling.com/api/v1/me';
    var authString = Utilities.base64Encode(`${acuityUserId}:${apiKey}`);
    var options = {
      'headers': {'Authorization': 'Basic ' + authString},
      'method': 'get',
      'muteHttpExceptions': true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      SpreadsheetApp.getUi().alert('Success!', 
        `API connection successful!\nConnected to: ${data.name || 'Your Acuity Account'}`, 
        SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('Error', 
        `API connection failed. Response code: ${response.getResponseCode()}`, 
        SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error', 
      `API connection failed: ${e.toString()}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}