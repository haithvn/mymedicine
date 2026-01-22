# Google Play Console Setup Guide

## Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "My Medicine" or select existing
3. Enable **Google Play Android Developer API**:
   - Search for "Google Play Android Developer API"
   - Click "Enable"
4. Create Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name: `mymedicine-play-deploy`
   - Click "Create and Continue"
   - Skip role assignment (will be done in Play Console)
   - Click "Done"
5. Create JSON Key:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download and save as `google-play-service-account.json`
   - **IMPORTANT**: Keep this file secure, don't commit to git

## Step 2: Configure Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app:
   - Click "Create app"
   - App name: **myMedicine**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free**
   - Accept declarations
   - Click "Create app"

3. Grant Service Account Access:
   - Go to "Users and permissions" (left sidebar)
   - Click "Invite new users"
   - Email: Copy the service account email from Google Cloud Console
     (format: `mymedicine-play-deploy@PROJECT_ID.iam.gserviceaccount.com`)
   - App permissions: Select "My Medicine" app
   - Permissions:
     - ✅ View app information
     - ✅ Manage production releases
     - ✅ Manage testing track releases
   - Click "Invite user"
   - Click "Send invitation"

## Step 3: Complete Store Listing (Required for first submission)

### App Details
- App name: **myMedicine**
- Short description: Medicine management and reminder app
- Full description: (detailed description of your app)
- App icon: 512x512 PNG (use your app icon)
- Feature graphic: 1024x500 PNG

### Screenshots
- Phone screenshots: At least 2 screenshots (1080x1920 or similar)
- 7-inch tablet: Optional
- 10-inch tablet: Optional

### Categorization
- App category: **Medical**
- Tags: health, medicine, reminder, healthcare

### Contact Details
- Email: Your email
- Phone: Optional
- Website: Optional

### Privacy Policy
- Privacy policy URL: (you need to host a privacy policy)

## Step 4: Content Rating

1. Go to "Content rating" section
2. Fill out questionnaire
3. Submit for rating

## Step 5: App Content

1. Privacy policy: Add URL
2. Ads: Declare if app contains ads
3. Target audience: Select age groups
4. News app: No
5. COVID-19 contact tracing: No
6. Data safety: Fill out data collection info

## Step 6: Build and Submit with EAS

After completing all the above manual steps in Play Console:

```bash
# Navigate to mobile directory
cd mobile

# Build production AAB
eas build --platform android --profile production

# After build completes, submit to Google Play
eas submit --platform android --latest
```

During `eas submit`, you'll be prompted to provide the service account JSON key file path.

## Notes

- First submission MUST go through manual review in Play Console
- Subsequent updates can be automated with EAS Submit
- Keep your service account JSON key secure
- Version code will auto-increment with each build
