# Firestore Security Rules Deployment Guide

## Overview
This document explains how to deploy the Firestore security rules that enforce creator-only project deletion.

## Security Rules Summary

### Projects Collection
- **Read**: Any authenticated user
- **Create**: Authenticated user (must set themselves as creator)
- **Update**: Project members only
- **Delete**: **Project creator only** ✅

### Tasks Collection
- **Read/Write**: Any authenticated user (project-level access control handled in app logic)

### Users Collection
- **Read**: Any authenticated user
- **Write**: Own user document only

## Deployment Steps

### Option 1: Firebase Console (Recommended)

1. **Navigate to Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `mini-jira-kanban-board`

2. **Open Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file in this project
   - Copy the entire content
   - Paste it into the Firebase Console rules editor

4. **Publish Rules**
   - Click the "Publish" button
   - Wait for confirmation message

### Option 2: Firebase CLI

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done)
   ```bash
   firebase init firestore
   ```
   - Select your project
   - Accept default file names

4. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Testing the Rules

### Test 1: Creator Can Delete
1. Login as User A
2. Create a project
3. Click the trash icon on your project
4. Confirm deletion
5. ✅ Project should be deleted successfully

### Test 2: Non-Creator Cannot Delete
1. Login as User A and create a project
2. Share project with User B (they enter access code)
3. Logout and login as User B
4. Navigate to Projects page
5. ✅ Trash icon should NOT be visible on User A's project
6. (If you try to delete via API) ❌ Should get "Missing or insufficient permissions" error

### Test 3: Member Can Update
1. Login as User B (member of User A's project)
2. Access the project
3. Create/edit tasks
4. ✅ Should work successfully

## Key Security Rule

The critical rule for creator-only deletion:

```javascript
// Allow delete ONLY if user is the creator
allow delete: if request.auth != null 
              && request.auth.uid == resource.data.createdById;
```

This ensures that even if someone bypasses the UI and tries to call the Firestore API directly, they cannot delete a project unless they are the creator.

## Troubleshooting

### Error: "Missing or insufficient permissions"
- **Cause**: User is trying to delete a project they didn't create
- **Solution**: This is expected behavior. Only creators can delete projects.

### Rules Not Taking Effect
- **Solution**: Wait 1-2 minutes after publishing rules for them to propagate
- **Solution**: Clear browser cache and reload the app

### Can't Delete Own Project
- **Check**: Ensure `createdById` field exists in the project document
- **Check**: Ensure `createdById` matches your current user's UID
- **Check**: Verify you're logged in with the correct account

## Verification

After deploying, verify the rules are active:

1. Go to Firebase Console → Firestore Database → Rules
2. Check the "Last published" timestamp
3. Verify the rules match the content in `firestore.rules`

## Additional Security Considerations

1. **Access Codes**: Currently stored in plain text. Consider hashing for production.
2. **Task Deletion**: Currently any authenticated user can delete tasks. Consider restricting to task creator or project creator.
3. **Rate Limiting**: Consider implementing rate limiting for create operations.
4. **Data Validation**: Add field validation rules to ensure data integrity.

## Next Steps

- [ ] Deploy rules to Firebase
- [ ] Test creator deletion (should work)
- [ ] Test non-creator deletion (should fail)
- [ ] Monitor Firestore usage and security events
- [ ] Consider implementing more granular task permissions
