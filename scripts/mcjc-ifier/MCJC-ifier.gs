function processSheet() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var mandateDate = getMandateDate();
    
    if (!mandateDate) return; // Exit if no date is provided
    
    var mandateDay = new Date(mandateDate).getDay();
    var isWeekend = (mandateDay === 0 || mandateDay === 6);
    
    // Updated header to include "Number of Sessions" in column F
    var mcjcReferrals = [["Mandate Date", "Docket Number", "Name", "Referral Reason", "Other Reasons", "Number of Sessions", "Attorney Listed"]];
    var mjoReferrals = [["Mandate Date", "Docket Number", "Name", "Charge", "", "Number of Sessions"]];
    var emailContent = "";
    
    // Determine user and set corresponding email address
    var userMap = {
      'meredithk@innovatingjustice.org': 'kmeredith@nycourts.gov',
    // ... add other users
    };
    
    var currentUserEmail = Session.getActiveUser().getEmail();
    var userEmail = userMap[currentUserEmail];
    
    var morningOrAfternoon = (new Date().getHours() < 12) ? "Good morning" : "Good afternoon";
    
    for (var i = 2; i < data.length; i++) {
      var arrestPct = data[i][2];
      var topCharge = data[i][4];
      var apyEligible = data[i][9].trim().toLowerCase() === "yes";
      var matchesPrecinct = [10, 13, 14, 17, 18, 20].includes(arrestPct);
      var matchesCharge = topCharge === "PL 220.03";
      
      var isAPYEligible = apyEligible;
      var matchesCriteria = matchesPrecinct || matchesCharge || isWeekend || isAPYEligible;

      if (matchesCriteria) {
        var reasons = [];
        var specificReasons = [];
        
        if (matchesPrecinct) {
          reasons.push("the precinct");
          specificReasons.push("Precinct " + arrestPct);
        }
        if (matchesCharge) {
          reasons.push("the charge");
          specificReasons.push("220.03");
        }
        if (isAPYEligible) {
          reasons.push("APY eligibility");
          specificReasons.push("APY Eligible");
        }
        if (isWeekend) {
          reasons.push("this being a weekend referral");
          specificReasons.push("Weekend");
        }

        var formattedReasons = formatReasons(reasons);
        var referralReason = specificReasons[0] || "";
        var otherReasons = specificReasons.length > 1 ? specificReasons.slice(1).join(", ") : "";
        
        // Filter attorney fields; if all are empty, attorneysListed becomes an empty string
        var attorneyArray = [data[i][6], data[i][7], data[i][8]];
        var attorneysListed = attorneyArray.filter(function(item) {
          return item.toString().trim() !== "";
        }).join(", ");
        
        mcjcReferrals.push([
          mandateDate,
          data[i][1],
          data[i][0],
          referralReason,
          otherReasons,
          data[i][5],
          attorneysListed
        ]);

        var dueToText = "due to " + formattedReasons;
        emailContent += `${morningOrAfternoon},\n\nI am forwarding the following case ${dueToText}.\n\n`;
        emailContent += `${data[i][0]}\n${data[i][1]}\n${data[i][5]} Sessions\n`;
        
        if (attorneysListed) {
          emailContent += `Attorney listed: ${attorneysListed}\n`;
        }
        
        emailContent += specificReasons.join(", ") + `\nMandate Date: ${mandateDate}\n\nBest,\n\n`;
        emailContent += "-----------------------------------------------------\n\n";

      } else {
        mjoReferrals.push([
          mandateDate,
          data[i][1],
          data[i][0],
          data[i][4],
          "",
          data[i][5]
        ]);
      }
    }

    var mcjcCsv = arrayToCsv(mcjcReferrals);
    var mjoCsv = arrayToCsv(mjoReferrals);
    var mcjcBlob = Utilities.newBlob(mcjcCsv, 'text/csv', 'MCJC_Referrals.csv');
    var mjoBlob = Utilities.newBlob(mjoCsv, 'text/csv', 'MJO_Referrals.csv');

    MailApp.sendEmail({
      to: userEmail,
      subject: 'Referrals Report',
      body: emailContent,
      attachments: [mcjcBlob, mjoBlob]
    });

  } catch (e) {
    Logger.log('An error occurred: ' + e.toString());
  }
}

function formatReasons(reasons) {
  if (reasons.length > 1) {
    var lastReason = reasons.pop();
    return reasons.join(", ") + ", and " + lastReason;
  } else {
    return reasons[0];
  }
}

function getMandateDate() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Enter the mandate date (e.g., 7/10/2024):');
  if (response.getSelectedButton() == ui.Button.OK) {
    return response.getResponseText();
  }
  return null;
}

function arrayToCsv(data) {
  return data.map(row => row.map(field => {
    if (typeof field === 'string') {
      let escapedField = field.replace(/"/g, '""');
      if (escapedField.search(/("|,|\n)/g) >= 0) {
        escapedField = `"${escapedField}"`;
      }
      return escapedField;
    } else {
      return field;
    }
  }).join(",")).join("\n");
}