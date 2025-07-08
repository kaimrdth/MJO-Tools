function showToolGuide() {
  const html = HtmlService.createHtmlOutput(`
    <ul>
      <li><strong>⬆️ Update Main Sheet Dates</strong>: Syncs new court dates into the master sheet.</li> <br>
      <li><strong>⬇️ Pull Upcoming Dates</strong>: Grabs the latest upcoming court dates from the source tab.</li> <br>
      <li><strong>📩 Generate Emails</strong>: Builds and sends drafted emails by part.</li> <br>
      <li><strong>📝 Generate Reports</strong>: Generates formatted reports into Google Drive.</li> <br>
    </ul>
  `).setWidth(650).setHeight(190);
  
  SpreadsheetApp.getUi().showModalDialog(html, '🧰 Tool Guide');
}