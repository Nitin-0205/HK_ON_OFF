# Quick Setup Guide - Local Installation

This setup works entirely within the `mail_auto` folder - no global installations needed!

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies (Local)

```bash
cd mail_auto
npm install
```

This installs clasp locally in the project.

### Step 2: Login to Google Apps Script

```bash
npm run login
```

This will open a browser for Google authentication.

### Step 3: Create New Apps Script Project

```bash
npm run create
```

Or link to existing project:
```bash
npx clasp clone YOUR_SCRIPT_ID
```

### Step 4: Push Your Code

```bash
npm run push
```

### Step 5: Deploy as Web App

1. Open your script in browser:
   ```bash
   npm run open
   ```

2. In Apps Script Editor:
   - Click **Deploy** → **New deployment**
   - Choose type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the **Web App URL**

3. Add Script Properties:
   - Click ⚙️ **Project Settings**
   - Scroll to **Script Properties**
   - Add: `RECIPIENT_EMAIL` = `your-email@example.com`

### Step 6: Get Script ID

The Script ID is now in `.clasp.json`. You can also find it:
- In Apps Script: **Project Settings** → **IDs** → **Script ID**
- Or check `.clasp.json` file

### Step 7: Setup GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these 3 secrets:

| Secret Name | Value | Where to Get |
|-------------|-------|-------------|
| `SCRIPT_ID` | Your script ID | From `.clasp.json` or Apps Script Project Settings |
| `APPS_SCRIPT_WEB_APP_URL` | Web app URL | From deployment (Step 5) |
| `GCP_SERVICE_ACCOUNT_KEY` | Service account JSON | See below ↓ |

### Step 8: Create Service Account (for GitHub Actions)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create new)
3. Enable **Google Apps Script API**
4. Go to **IAM & Admin** → **Service Accounts**
5. Click **Create Service Account**
   - Name: `github-actions`
   - Click **Create and Continue**
6. Click **Keys** → **Add Key** → **Create new key** → **JSON**
7. Download the JSON file
8. Copy the **entire content** of the JSON file
9. Paste it as the value for `GCP_SERVICE_ACCOUNT_KEY` secret in GitHub

### Step 9: Share Script with Service Account

1. Open your Apps Script project
2. Click **Share** button (top right)
3. Add the service account email (from the JSON file: `client_email`)
4. Give **Editor** access

### Step 10: Test Everything

```bash
# Check status
npm run logs

# Push changes
npm run push

# Deploy new version
npm run deploy
```

## 📝 Common Commands

All commands use local installation (no sudo needed):

```bash
npm run setup      # Install dependencies
npm run login      # Login to Google
npm run create     # Create new project
npm run push       # Push code to Apps Script
npm run pull       # Pull code from Apps Script
npm run deploy     # Create new deployment
npm run open       # Open in browser
npm run logs       # View execution logs
npm run status     # Check status
```

## 🔧 Customize Your Automation

### Edit Email Content

Open `Code.gs` and modify the `sendAutomatedEmail()` function:

```javascript
const subject = 'Your Custom Subject';
const body = 'Your custom email content here';
```

### Change Schedule

Edit `.github/workflows/scheduled-email.yml`:

```yaml
schedule:
  - cron: '0 9 * * 1-5'  # Weekdays at 9 AM UTC
```

Common schedules:
- `0 9 * * *` - Every day at 9 AM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1-5` - Weekdays only
- `0 9 1 * *` - First day of month

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Logged in to Google (`npm run login`)
- [ ] `.clasp.json` has correct `scriptId`
- [ ] Code pushed to Apps Script (`npm run push`)
- [ ] Deployed as Web App (got deployment URL)
- [ ] Script Properties set (RECIPIENT_EMAIL)
- [ ] GitHub secrets configured (all 3)
- [ ] Service account has editor access to script
- [ ] GitHub Actions workflow runs successfully

## 🐛 Troubleshooting

### Cannot find clasp command
Use `npx clasp` or `npm run <command>` instead of `clasp` directly.

### Permission denied during npm install
This shouldn't happen with local install. If it does:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Script ID not found
1. Check `.clasp.json` file
2. Verify you're in the `mail_auto` directory
3. Make sure you ran `npm run create` or `npx clasp clone`

### Authentication failed
```bash
# Re-login
npm run login

# Or clear credentials and login again
rm ~/.clasprc.json
npm run login
```

### Web App returns error
1. Make sure deployment is set to "Anyone"
2. Check Script Properties are set
3. View logs: `npm run logs`

## 📚 Next Steps

1. Test locally: `npm run push` and check execution logs
2. Commit and push to GitHub
3. Check GitHub Actions tab to see workflows run
4. Monitor the scheduled runs

## 🎯 Project Structure

```
mail_auto/
├── .github/
│   └── workflows/
│       ├── deploy-apps-script.yml    # Auto-deploy on push
│       ├── run-apps-script.yml       # Scheduled execution
│       └── scheduled-email.yml       # Email automation
├── Code.gs                            # Main Apps Script code
├── appsscript.json                    # Apps Script config
├── .clasp.json                        # Clasp configuration
├── package.json                       # Local dependencies
└── README.md                          # Full documentation
```

Need help? Check `README.md` for detailed information!
