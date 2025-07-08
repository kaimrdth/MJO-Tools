// This is a custom menu that allows for running specific functions including a Tool Tips guide
function onOpen(){
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🛠️ Compliance Tools')
    .addItem('⬆️ Update Main Sheet Dates','updateMainSheetDates')
    .addItem('⬇️ Pull Upcoming Dates','copyUpcomingCourtDates')
    .addItem('📩 Generate Emails','sendComplianceReports')
    .addItem('📝 Generate Reports','generateComplianceReports')
    .addItem('📂 Jump to Reports','openThisWeekFolder')
    .addSeparator()
    .addItem('🧰 Tool Tips', 'showToolGuide')
    .addToUi();
} 