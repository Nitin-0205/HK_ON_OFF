// =============================================================================
// HR ONBOARDING/OFFBOARDING CHECKLIST AUTOMATION
// =============================================================================
// This script automates task tracking for employee onboarding and offboarding.
// It sends email reminders, processes "DONE" replies, and updates Google Sheets.
// =============================================================================

// Main function - Run this to do everything at once
function runFullAutomation() {
  Logger.log("=== Starting Full Automation ===");
  
  // Step 1: Send checklist emails for pending tasks
  Logger.log("\n--- Step 1: Sending Checklist Emails ---");
  sendChecklistEmails();
  
  // Step 2: Wait a moment for emails to be sent
  Utilities.sleep(2000); // Wait 2 seconds
  
  // Step 3: Process any DONE replies
  Logger.log("\n--- Step 2: Processing DONE Replies ---");
  processReplies();
  
  Logger.log("\n=== Full Automation Complete ===");
  
  return { status: 'success', message: 'Full automation completed' };
}

function sendChecklistEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var onboardingSheet = ss.getSheetByName("Final Checklist- Onboarding");
  var offboardingSheet = ss.getSheetByName("Final Checklist Offboarding");

  if (onboardingSheet) {
    processSheet(onboardingSheet, "Onboarding");
  } else {
    Logger.log("Warning: 'Final Checklist- Onboarding' sheet not found");
  }
  
  if (offboardingSheet) {
    processSheet(offboardingSheet, "Offboarding");
  } else {
    Logger.log("Warning: 'Final Checklist Offboarding' sheet not found");
  }
}

function processSheet(sheet, checklistType) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var taskIdIndex   = headers.indexOf("Task ID");
  var activityIndex = headers.indexOf("Activity");
  var assignedIndex = headers.indexOf("Assigned To");
  var statusIndex   = headers.indexOf("Status");

  for (var i = 1; i < data.length; i++) {
    var taskId = data[i][taskIdIndex];
    var task = data[i][activityIndex];
    var owner = data[i][assignedIndex];
    var status = data[i][statusIndex];

    if (!task || (status && status.toString().toLowerCase().includes("done"))) continue;

    var subject = checklistType + " Task Pending: " + task + " [TaskID:" + taskId + "]";
    var body = "Hello " + owner + ",\n\n" +
               "You have a pending " + checklistType + " task:\n\n" +
               "Task: " + task + "\n" +
               "Task ID: " + taskId + "\n" +
               "Status: " + (status || "Not Started") + "\n\n" +
               "Reply to this email with the word DONE to mark it complete.\n\n" +
               "Thanks,\nHR Automation Bot";

    try {
      MailApp.sendEmail(owner, subject, body);
      Logger.log("Sent email to " + owner + " for TaskID:" + taskId);
    } catch (e) {
      Logger.log("Error sending email to " + owner + ": " + e.toString());
    }
  }
}


// Check Gmail for replies with DONE
function processReplies() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = [
    {sheet: ss.getSheetByName("Final Checklist- Onboarding"), type: "Onboarding"},
    {sheet: ss.getSheetByName("Final Checklist Offboarding"), type: "Offboarding"}
  ];

  Logger.log("=== Starting processReplies ===");
  
  // Try multiple search patterns to find emails
  var threads = GmailApp.search('TaskID newer_than:7d');
  Logger.log("Found " + threads.length + " threads with TaskID");

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    Logger.log("\n--- Processing thread with " + messages.length + " messages ---");
    
    // Process ALL messages in the thread to find replies with "done"
    messages.forEach(function(msg, index) {
      var subject = msg.getSubject();
      var body = msg.getPlainBody().toLowerCase();
      var from = msg.getFrom();
      
      Logger.log("Message " + (index + 1) + ":");
      Logger.log("  From: " + from);
      Logger.log("  Subject: " + subject);
      Logger.log("  Is Unread: " + msg.isUnread());
      Logger.log("  Contains 'done': " + body.includes("done"));
      
      // Check if this is a reply (not from noreply) and contains "done"
      if (msg.isUnread() && body.includes("done") && from.indexOf("noreply") === -1) {
        Logger.log("  ✓ This is a valid DONE reply!");
        
        // Extract TaskID from subject (handles Re:, Fwd:, etc.)
        var match = subject.match(/\[TaskID:\s*(\d+)\]/i);
        if (match) {
          var taskId = match[1].trim();
          Logger.log("  ✓ Extracted TaskID: " + taskId);
          
          // Try to update in both sheets
          var updated = false;
          sheets.forEach(function(obj) {
            if (updated) return; // Skip if already updated
            
            var sheet = obj.sheet;
            if (!sheet) return;
            
            var data = sheet.getDataRange().getValues();
            var headers = data[0];
            
            var taskIdIndex = headers.indexOf("Task ID");
            var statusIndex = headers.indexOf("Status");
            
            Logger.log("  Searching in " + obj.type + " sheet...");
            Logger.log("  TaskID column index: " + taskIdIndex);
            Logger.log("  Status column index: " + statusIndex);
            
            for (var r = 1; r < data.length; r++) {
              var sheetTaskId = data[r][taskIdIndex].toString().trim();
              Logger.log("    Row " + (r + 1) + " TaskID: '" + sheetTaskId + "' vs '" + taskId + "'");
              
              if (sheetTaskId === taskId) {
                var currentStatus = data[r][statusIndex];
                Logger.log("    ✓ MATCH FOUND! Current status: " + currentStatus);
                
                // Only update if not already marked as done
                if (!currentStatus || !currentStatus.toString().toLowerCase().includes("done")) {
                  sheet.getRange(r + 1, statusIndex + 1).setValue("Done ✅");
                  SpreadsheetApp.flush(); // Force update
                  Logger.log("    ✓✓✓ UPDATED to 'Done ✅'");
                  updated = true;
                  
                  // Send confirmation email
                  var assignedIndex = headers.indexOf("Assigned To");
                  var taskIndex = headers.indexOf("Activity");
                  var owner = data[r][assignedIndex];
                  var taskName = data[r][taskIndex];
                  
                  try {
                    MailApp.sendEmail(
                      owner,
                      "Confirmed: Task Completed - " + taskName,
                      "Hello " + owner + ",\n\n" +
                      "Your task has been marked as complete:\n\n" +
                      "Task: " + taskName + "\n" +
                      "Task ID: " + taskId + "\n" +
                      "Status: Done ✅\n\n" +
                      "Thanks,\nHR Automation Bot"
                    );
                    Logger.log("    ✓ Confirmation email sent");
                  } catch (e) {
                    Logger.log("    ! Error sending confirmation: " + e.toString());
                  }
                } else {
                  Logger.log("    - Already marked as done, skipping");
                }
                break;
              }
            }
          });
          
          if (!updated) {
            Logger.log("  ✗ TaskID " + taskId + " not found in any sheet or already done");
          }
        } else {
          Logger.log("  ✗ No TaskID found in subject");
        }
        
        // Mark message as read to avoid reprocessing
        msg.markRead();
        Logger.log("  ✓ Message marked as read");
      }
    });
  });
  
  Logger.log("\n=== Reply processing complete ===");
}

// Debug function - Run this FIRST to see what emails are being found
function debugEmails() {
  Logger.log("=== Email Debug ===");
  
  // Try multiple search patterns
  var searchPatterns = [
    'subject:TaskID newer_than:7d',
    'subject:"TaskID" newer_than:7d',
    'TaskID newer_than:7d',
    'subject:"Onboarding Task" newer_than:7d',
    'subject:"Offboarding Task" newer_than:7d'
  ];
  
  searchPatterns.forEach(function(pattern) {
    Logger.log("\n--- Testing pattern: " + pattern + " ---");
    var threads = GmailApp.search(pattern);
    Logger.log("Found " + threads.length + " threads");
    
    if (threads.length > 0) {
      threads.slice(0, 2).forEach(function(thread, i) {
        Logger.log("\nThread " + (i + 1) + ":");
        var messages = thread.getMessages();
        messages.forEach(function(msg, j) {
          Logger.log("  Message " + (j + 1) + ":");
          Logger.log("    From: " + msg.getFrom());
          Logger.log("    Subject: " + msg.getSubject());
          Logger.log("    Date: " + msg.getDate());
          Logger.log("    Unread: " + msg.isUnread());
          Logger.log("    Body preview: " + msg.getPlainBody().substring(0, 100));
        });
      });
    }
  });
}

// Debug function - Check TaskID format in your sheet
function debugSheetTaskIds() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Final Checklist- Onboarding");
  
  if (!sheet) {
    Logger.log("Sheet 'Final Checklist- Onboarding' not found!");
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var taskIdIndex = headers.indexOf("Task ID");
  
  Logger.log("=== Sheet TaskID Debug ===");
  Logger.log("TaskID column index: " + taskIdIndex);
  
  for (var i = 1; i < Math.min(10, data.length); i++) {
    var taskId = data[i][taskIdIndex];
    Logger.log("Row " + (i+1) + " TaskID: '" + taskId + "' | Type: " + typeof taskId + " | Trimmed: '" + taskId.toString().trim() + "'");
  }
}

// Daily reminders for overdue tasks
function sendReminders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var onboardingSheet = ss.getSheetByName("Final Checklist- Onboarding");
  var offboardingSheet = ss.getSheetByName("Final Checklist Offboarding");

  [onboardingSheet, offboardingSheet].forEach(function(sheet) {
    if (!sheet) return;
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var activityIndex = headers.indexOf("Activity");
    var assignedIndex = headers.indexOf("Assigned To");
    var statusIndex   = headers.indexOf("Status");
    var dueIndex      = headers.indexOf("Due Date");
    var taskIdIndex   = headers.indexOf("Task ID");

    for (var i = 1; i < data.length; i++) {
      var task = data[i][activityIndex];
      var owner = data[i][assignedIndex];
      var status = data[i][statusIndex];
      var due = dueIndex > -1 ? data[i][dueIndex] : null;
      var taskId = data[i][taskIdIndex];

      if (!task || (status && status.toString().toLowerCase().includes("done"))) continue;

      if (due && new Date(due) < new Date()) {
        var subject = "Reminder: Task Overdue - " + task + " [TaskID:" + taskId + "]";
        var body = "Hello " + owner + ",\n\n" +
                   "This is a reminder that your task is overdue:\n\n" +
                   "Task: " + task + "\n" +
                   "Task ID: " + taskId + "\n" +
                   "Due Date: " + Utilities.formatDate(new Date(due), Session.getScriptTimeZone(), "MM/dd/yyyy") + "\n\n" +
                   "Please complete it and reply with DONE.\n\n" +
                   "Thanks,\nHR Automation Bot";
        
        try {
          MailApp.sendEmail(owner, subject, body);
          Logger.log("Sent reminder to " + owner + " for overdue TaskID:" + taskId);
        } catch (e) {
          Logger.log("Error sending reminder to " + owner + ": " + e.toString());
        }
      }
    }
  });
}

// =============================================================================
// WEB APP ENDPOINTS (for GitHub Actions integration)
// =============================================================================

/**
 * Web app entry point - triggered by GET requests
 */
function doGet(e) {
  var action = e.parameter.action || 'fullAutomation';
  var result;
  
  try {
    switch(action) {
      case 'sendEmails':
        sendChecklistEmails();
        result = { status: 'success', message: 'Checklist emails sent' };
        break;
      case 'processReplies':
        processReplies();
        result = { status: 'success', message: 'Replies processed' };
        break;
      case 'sendReminders':
        sendReminders();
        result = { status: 'success', message: 'Reminders sent' };
        break;
      default:
        result = runFullAutomation();
    }
  } catch (error) {
    result = { status: 'error', message: error.toString() };
    Logger.log('Error in doGet: ' + error.toString());
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web app entry point - triggered by POST requests
 */
function doPost(e) {
  return doGet(e); // Handle POST same as GET
}

/**
 * Test function to verify script is working
 */
function testScript() {
  Logger.log('Test function executed at: ' + new Date());
  return 'HR Automation Script is working correctly!';
}
// Updated Tue Nov  4 16:33:35 IST 2025
