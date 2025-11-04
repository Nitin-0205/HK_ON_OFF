# Google Apps Script Email Automation

Automate Google Apps Script deployments and executions using GitHub Actions.

## 🚀 Features

- Automated deployment to Google Apps Script on push
- Scheduled email automation
- Manual trigger support
- Web app integration
- CI/CD pipeline ready

## 📋 Prerequisites

1. **Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable "Google Apps Script API"

2. **Service Account**
   - Create a Service Account in Google Cloud
   - Download the JSON key file
   - Grant necessary permissions

3. **Apps Script Project**
   - Create a new Apps Script project at [script.google.com](https://script.google.com)
   - Note the Script ID (File → Project Properties → Script ID)

## 🔧 Setup Instructions

### Step 1: Install dependencies locally

```bash
cd mail_auto
npm install
```

### Step 2: Login to clasp

```bash
npm run login
```

### Step 3: Create or link Apps Script project

Option A - Create new project:
```bash
npm run create
```

Option B - Link existing project:
```bash
npx clasp clone YOUR_SCRIPT_ID
```

### Step 4: Update .clasp.json

Replace `YOUR_SCRIPT_ID_HERE` with your actual Script ID in `.clasp.json`:

```json
{
  "scriptId": "your-actual-script-id",
  "rootDir": "."
}
```

### Step 5: Deploy as Web App

1. Open your script: `npm run open`
2. Click "Deploy" → "New deployment"
3. Choose type: "Web app"
4. Set access to "Anyone" (or as needed)
5. Click "Deploy"
6. Copy the Web App URL

### Step 6: Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GCP_SERVICE_ACCOUNT_KEY` | Service account JSON key | Download from Google Cloud Console |
| `SCRIPT_ID` | Apps Script project ID | File → Project Properties in Apps Script |
| `APPS_SCRIPT_WEB_APP_URL` | Deployed web app URL | From deployment in Apps Script |

### Step 7: Configure Script Properties

In Apps Script Editor:
1. Go to Project Settings (⚙️)
2. Add Script Properties:
   - `RECIPIENT_EMAIL`: Email address to send to

## 🔄 GitHub Workflows

### 1. Deploy Workflow (`deploy-apps-script.yml`)

Automatically deploys changes when you push to `main`/`master` branch.

**Triggers:**
- Push to main/master branch
- Pull requests
- Manual dispatch

### 2. Run Workflow (`run-apps-script.yml`)

Executes the Apps Script functions on a schedule or manually.

**Triggers:**
- Daily at 9 AM UTC (configurable)
- Manual dispatch with function selection

### 3. Scheduled Email Workflow (`scheduled-email.yml`)

Sends automated emails on a schedule.

**Triggers:**
- Monday to Friday at 9 AM UTC
- Manual dispatch

## 📝 Usage

### Local Development

```bash
# Push changes to Apps Script
npm run push

# Deploy new version
npm run deploy

# View logs
npm run logs

# Open in browser
npm run open
```

### GitHub Actions

#### Trigger Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Deploy Google Apps Script"
3. Click "Run workflow"

#### Trigger Email Automation
1. Go to Actions tab
2. Select "Run Google Apps Script"
3. Click "Run workflow"

## 📧 Email Functions

### `sendAutomatedEmail()`
Sends a basic automated email with HTML content.

### `sendSpreadsheetReport()`
Sends a report based on Google Sheets data (customize as needed).

### `testScript()`
Test function to verify the script is working.

## 🔐 Security Best Practices

1. **Never commit credentials** - Use GitHub Secrets
2. **Limit service account permissions** - Only grant necessary access
3. **Use environment-specific configs** - Separate dev/prod
4. **Rotate credentials regularly** - Update keys periodically
5. **Enable 2FA** - On both Google and GitHub accounts

## 🛠 Customization

### Change Schedule

Edit the cron expression in workflow files:

```yaml
schedule:
  - cron: '0 9 * * 1-5'  # Mon-Fri at 9 AM UTC
```

Cron syntax:
- `0 9 * * *` = Daily at 9 AM
- `0 */6 * * *` = Every 6 hours
- `0 9 * * 1-5` = Weekdays at 9 AM

### Add More Functions

1. Add function to `Code.gs`
2. Update workflow to call it
3. Deploy changes

### Customize Email Content

Edit the `sendAutomatedEmail()` function in `Code.gs`:

```javascript
const subject = 'Your custom subject';
const body = 'Your custom content';
```

## 📊 Monitoring

### Check Execution Logs

**In Apps Script:**
```bash
npm run logs
```

**In GitHub Actions:**
1. Go to Actions tab
2. Click on workflow run
3. View logs

### View Artifacts

GitHub Actions saves response artifacts for 7 days:
1. Go to completed workflow run
2. Scroll to "Artifacts" section
3. Download response JSON

## 🐛 Troubleshooting

### Authentication Issues

```bash
# Re-login to clasp
clasp login

# Check logged-in account
clasp login --status
```

### Script ID Not Found

1. Verify Script ID in `.clasp.json`
2. Check service account has access
3. Ensure Apps Script API is enabled

### Deployment Fails

1. Check GitHub Secrets are set correctly
2. Verify service account JSON format
3. Check Apps Script API quotas

### Email Not Sending

1. Verify `RECIPIENT_EMAIL` in Script Properties
2. Check Gmail sending limits (500/day for consumer accounts)
3. Review execution logs for errors

## 📚 Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [clasp Documentation](https://github.com/google/clasp)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Apps Script API Reference](https://developers.google.com/apps-script/api/reference/rest)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this for your projects.
