function sendComplianceReports() {
  try {
    var userMap = {
      'meredithk@innovatingjustice.org': 'kmeredith@nycourts.gov', // References the gmail you're signed in on to know which email to send the drafts to
      'OTHER_STAFF_GMAIL.org': 'OTHER_STAFF_EMAIL@nycourts.gov',
    };

    var activeUser = Session.getActiveUser().getEmail();
    var recipient = userMap[activeUser];
    if (!recipient) {
      Logger.log('No recipient mapped for user: ' + activeUser);
      return;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Upcoming Dates');
    if (!sheet) {
      Logger.log("Sheet 'Upcoming Dates' not found.");
      return;
    }

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      Logger.log("No data found (or only header).");
      return;
    }

    function parseDate(value) {
      if (value instanceof Date) return value;
      var parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    function isSameDay(d1, d2) {
      return d1 && d2 && d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    var today = new Date();
    var nextWeekday = new Date(today);
    nextWeekday.setDate(today.getDate() + 1);
    while (nextWeekday.getDay() === 6 || nextWeekday.getDay() === 0) {
      nextWeekday.setDate(nextWeekday.getDate() + 1);
    }

    var groups = {};
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var adjournDate = parseDate(row[6]);
      if (!adjournDate || !isSameDay(adjournDate, nextWeekday)) continue;

      var partRaw = row[7] ? row[7].toString() : "Unknown";
      var normalizedPart = partRaw.replace(/-W$/, '');

      if (!groups[normalizedPart]) groups[normalizedPart] = [];
      groups[normalizedPart].push(row);
    }

    var subjectDate = Utilities.formatDate(nextWeekday, Session.getScriptTimeZone(), "MM/dd/yyyy");

    for (var part in groups) {
      var rows = groups[part];
      var subject = "MJO Compliance " + subjectDate + ": Part " + part;

      var emailBody = "Good morning,\n\nPlease find the attached compliance reports for the following cases:\n\n";
      rows.forEach(function(r) {
        emailBody += (r[2] || "Unknown Name") + " (" + (r[1] || "Unknown Docket") + ")\n";
      });
      emailBody += "\nBest,\n";

      try {
        if (!recipient || recipient.trim() === "") {
          Logger.log("Error: No valid recipient for email.");
          continue;
        }

        Logger.log("Sending email to: " + recipient + " | Subject: " + subject);
        Logger.log("Email Body: \n" + emailBody);

        GmailApp.sendEmail(recipient, subject, emailBody);
        Logger.log("✅ Email sent successfully to " + recipient);

      } catch (e) {
        Logger.log("❌ Failed to send email to " + recipient + " for Part " + part + ": " + e.message);
      }
    }

    Logger.log("📩 Emails processed for parts: " + Object.keys(groups).join(", "));

  } catch (error) {
    Logger.log("🚨 Unexpected error: " + error.message);
  }
}