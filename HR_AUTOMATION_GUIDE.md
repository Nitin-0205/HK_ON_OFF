# HR Onboarding/Offboarding Automation Guide

## 📋 What This Does

This automation manages employee onboarding and offboarding checklists in Google Sheets:

1. **Sends email reminders** for pending tasks to assigned employees
2. **Processes "DONE" replies** and automatically updates the Google Sheet
3. **Sends confirmation emails** when tasks are marked complete
4. **Sends overdue reminders** for tasks past their due date

## 📊 Required Google Sheets Structure

Your spreadsheet must have these sheets with these exact columns:

### Sheet 1: `Final Checklist- Onboarding`
| Task ID | Activity | Assigned To | Status | Due Date |
|---------|----------|-------------|--------|----------|
| 1001 | Setup laptop | tech@company.com | | 2025-11-05 |
| 1002 | Create email | it@company.com | Done ✅ | 2025-11-04 |

### Sheet 2: `Final Checklist Offboarding`
| Task ID | Activity | Assigned To | Status | Due Date |
|---------|----------|-------------|--------|----------|
| 2001 | Collect laptop | tech@company.com | | 2025-11-10 |
| 2002 | Disable accounts | it@company.com | | 2025-11-12 |

**Important:**
- Column names must match exactly (case-sensitive)
- Task ID should be unique numbers
- Assigned To should be valid email addresses
- Status will be automatically set to "Done ✅" when replies received

## 🚀 Setup Steps

### 1. Prepare Your Google Sheet

1. Create a new Google Spreadsheet or use existing one
2. Create two sheets with exact names above
3. Add the required columns
4. Fill in your tasks with unique Task IDs

### 2. Bind Script to Your Spreadsheet

```bash
# In terminal, from mail_auto folder
npm run login
```

Then create bound script:
```bash
# Option 1: Create new bound script
npx clasp create --type sheets --title "HR Checklist Automation"

# Option 2: Or clone existing
npx clasp clone YOUR_SCRIPT_ID
```

### 3. Link to Your Spreadsheet

If you created a standalone project, you need to bind it:

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Note the Script ID from Project Settings
4. Or create directly from the sheet

**Better approach:** Create the script directly from your spreadsheet:
1. Open your Google Spreadsheet
2. **Extensions** → **Apps Script**
3. Delete the default code
4. Copy all code from `Code.gs` and paste it
5. Save the project
6. Get the Script ID from **Project Settings** → **IDs**

### 4. Test the Functions

In Apps Script Editor:

```javascript
// Test 1: Check if sheets are accessible
debugSheetTaskIds()

// Test 2: Send test emails (will send to all pending tasks)
sendChecklistEmails()

// Test 3: Check Gmail for replies
debugEmails()

// Test 4: Process replies
processReplies()

// Full automation
runFullAutomation()
```

### 5. Set Up Triggers (Automated Scheduling)

In Apps Script Editor:
1. Click ⏰ **Triggers** (clock icon on left)
2. Click **+ Add Trigger**

**Recommended Triggers:**

| Function | Event | Time |
|----------|-------|------|
| `runFullAutomation()` | Time-driven | Every day at 9 AM |
| `sendReminders()` | Time-driven | Every day at 8 AM |
| `processReplies()` | Time-driven | Every hour |

Example trigger setup:
- Choose function: `runFullAutomation`
- Event source: `Time-driven`
- Type: `Day timer`
- Time of day: `9am to 10am`

### 6. Deploy as Web App (for GitHub Actions)

1. Click **Deploy** → **New deployment**
2. Click ⚙️ **Settings** icon next to "Select type"
3. Choose **Web app**
4. Configure:
   - Description: "HR Automation v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. Copy the **Web App URL**

### 7. Update GitHub Secrets

Add to your GitHub repository secrets:

```
SCRIPT_ID = your_script_id_here
APPS_SCRIPT_WEB_APP_URL = https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## 📧 How It Works

### Email Flow

1. **Task Assignment Email**
   ```
   Subject: Onboarding Task Pending: Setup laptop [TaskID:1001]
   
   You have a pending task...
   Reply with DONE to mark complete.
   ```

2. **Employee Reply**
   ```
   From: tech@company.com
   Subject: Re: Onboarding Task Pending: Setup laptop [TaskID:1001]
   
   DONE
   ```

3. **Confirmation Email**
   ```
   Subject: Confirmed: Task Completed - Setup laptop
   
   Your task has been marked as complete...
   Status: Done ✅
   ```

### Automation Cycle

```
[9 AM Daily]
    ↓
Send Checklist Emails → All pending tasks get emails
    ↓
[Every Hour]
    ↓
Process Replies → Check Gmail for "DONE" replies
    ↓
Update Sheet → Mark tasks as "Done ✅"
    ↓
Send Confirmation → Email employee confirmation
```

## 🔧 Available Functions

### Main Functions

| Function | Purpose | Run Frequency |
|----------|---------|---------------|
| `runFullAutomation()` | Sends emails + processes replies | Daily |
| `sendChecklistEmails()` | Only send pending task emails | As needed |
| `processReplies()` | Only check for DONE replies | Hourly |
| `sendReminders()` | Send overdue task reminders | Daily |

### Debug Functions

| Function | Purpose |
|----------|---------|
| `debugEmails()` | Check what emails Gmail finds |
| `debugSheetTaskIds()` | Check TaskID format in sheet |
| `testScript()` | Verify script is working |

## 🎯 Testing Workflow

### Test Locally First

1. **Test sheet access:**
   ```javascript
   debugSheetTaskIds()
   ```
   Check logs to ensure Task IDs are found

2. **Send test email to yourself:**
   - Add a task with your email
   - Run: `sendChecklistEmails()`
   - Check your inbox

3. **Test reply processing:**
   - Reply to that email with "DONE"
   - Run: `debugEmails()` to see if it finds the email
   - Run: `processReplies()` to mark it complete
   - Check sheet for "Done ✅"

4. **Full test:**
   ```javascript
   runFullAutomation()
   ```

### Test GitHub Actions

1. Push code to GitHub
2. Go to **Actions** tab
3. Run **"Deploy Google Apps Script"** workflow
4. Then run **"Run Google Apps Script"** workflow
5. Check execution logs

## ⚙️ Customization

### Change Email Template

Edit in `processSheet()` function:

```javascript
var subject = checklistType + " Task Pending: " + task + " [TaskID:" + taskId + "]";
var body = "Hello " + owner + ",\n\n" +
           "Custom message here...\n\n" +
           "Task: " + task + "\n" +
           "Task ID: " + taskId + "\n\n" +
           "Reply DONE to complete.\n\n" +
           "Thanks,\nYour Custom Name";
```

### Change Web App Actions

The web app supports URL parameters:

```bash
# Send emails only
curl "YOUR_WEB_APP_URL?action=sendEmails"

# Process replies only
curl "YOUR_WEB_APP_URL?action=processReplies"

# Send reminders
curl "YOUR_WEB_APP_URL?action=sendReminders"

# Full automation (default)
curl "YOUR_WEB_APP_URL"
```

### Add More Sheet Columns

If you add columns like "Priority" or "Department", access them like:

```javascript
var priorityIndex = headers.indexOf("Priority");
var priority = data[i][priorityIndex];
```

## 🐛 Troubleshooting

### "Sheet not found" error
- Check sheet names match exactly: `Final Checklist- Onboarding` and `Final Checklist Offboarding`
- Make sure script is bound to correct spreadsheet

### Emails not sending
- Check email addresses are valid
- Verify MailApp quota (500 emails/day for personal accounts)
- Check spam folder

### Replies not being processed
1. Run `debugEmails()` to see if Gmail finds the emails
2. Check subject line contains `[TaskID:####]`
3. Make sure replies contain the word "done" (case-insensitive)
4. Verify email is unread

### Task not updating
1. Run `debugSheetTaskIds()` to check TaskID format
2. Ensure TaskID in email matches sheet exactly
3. Check Status column exists and is spelled correctly
4. Make sure task isn't already marked as done

### Permission errors
- Authorize the script when first running
- Make sure you have edit access to the spreadsheet
- Check Gmail access is granted

## 📊 Monitoring

### Check Execution Logs

**In Apps Script:**
1. View → Logs
2. Or run: `npm run logs` (from terminal)

**In GitHub Actions:**
- Go to Actions tab
- Click on workflow run
- View logs

### Monitor Triggers

In Apps Script:
1. Click ⏰ Triggers
2. View execution history
3. Check for errors

## 🔒 Security Notes

- Never share your Script ID publicly in emails
- Keep GitHub secrets private
- Service account needs editor access to sheet only
- Web app access set to "Anyone" allows GitHub Actions to trigger it
- Emails are sent from your Google account

## 📈 Scaling Tips

### For Multiple Teams
- Create separate sheets for each team
- Add team identifier to TaskID (e.g., IT-1001, HR-2001)
- Modify code to process additional sheets

### For Large Organizations
- Split into multiple spreadsheets
- Use Google Workspace Admin to increase email quotas
- Consider batching emails to avoid quota limits

### For Complex Workflows
- Add approval steps
- Track completion timestamps
- Generate weekly reports
- Add Slack notifications

## 🎉 You're All Set!

Your HR automation is ready to:
- ✅ Send daily task reminders
- ✅ Process employee replies automatically
- ✅ Update Google Sheets in real-time
- ✅ Send confirmation emails
- ✅ Remind about overdue tasks
- ✅ Run via GitHub Actions

**Next:** Set up the triggers and let it run! 🚀
