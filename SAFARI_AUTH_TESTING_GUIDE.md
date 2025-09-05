# Safari Authentication Testing Guide

## Overview
This guide helps you test the Safari-compatible authentication fixes implemented for your Hygo Connect PWA.

## Quick Test Commands

Open browser console and run these commands to debug authentication:

```javascript
// Get comprehensive debug information
await hygoAuthDebug.getDebugInfo()

// Log debug info to console
await hygoAuthDebug.logDebugInfo()

// Test authentication flow
await hygoAuthDebug.testAuthFlow()

// Clear all auth data (for testing)
hygoAuthDebug.clearAllAuthData()

// Simulate login (for testing)
hygoAuthDebug.simulateLogin()
```

## Step-by-Step Testing Process

### 1. Desktop Safari Testing

1. **Open Safari** on macOS
2. **Navigate** to your deployed app
3. **Open Developer Tools** (Develop menu → Show Web Inspector)
4. **Login** to your app normally
5. **Check console** for Safari compatibility logs:
   ```
   🍎 Safari detected, compatibility fixes applied
   ✅ Tokens stored successfully with Safari compatibility
   ```
6. **Test persistence**:
   - Refresh the page
   - Close and reopen Safari
   - Check if you remain logged in

### 2. iOS Safari Testing

1. **Open Safari** on iPhone/iPad
2. **Navigate** to your app
3. **Login** normally
4. **Test scenarios**:
   - Switch to another app and back
   - Lock/unlock device
   - Close Safari tab and reopen
   - Open in new tab

### 3. iOS PWA Testing (Critical)

1. **Install PWA**:
   - Open app in Safari
   - Tap Share button
   - Select "Add to Home Screen"
   - Tap "Add"

2. **Test PWA Authentication**:
   - Open PWA from home screen
   - Login normally
   - **Critical**: Close PWA completely (swipe up and swipe away)
   - Reopen PWA from home screen
   - Verify you're still logged in

3. **Test edge cases**:
   - Switch between PWA and Safari version
   - Test with low memory conditions
   - Test with airplane mode on/off

### 4. Private Browsing Testing

1. **Enable Private Browsing** in Safari
2. **Navigate** to your app
3. **Login** (should work with sessionStorage fallback)
4. **Check console** for warnings:
   ```
   🔒 Private browsing detected - storage may be limited
   localStorage unavailable, using sessionStorage as fallback
   ```

## Expected Behavior

### ✅ Working Correctly
- Login persists after page refresh
- Login persists after closing/reopening PWA
- No "user not authenticated" errors after successful login
- Console shows Safari compatibility messages
- Authentication works in private browsing mode

### ❌ Issues to Watch For
- "User not authenticated" after login
- Tokens disappearing after PWA restart
- Console errors about storage failures
- Infinite login loops

## Debugging Failed Tests

### If authentication still fails in Safari:

1. **Check storage health**:
   ```javascript
   await hygoAuthDebug.getDebugInfo()
   ```

2. **Look for these issues**:
   - `storage.healthy: false`
   - `browser.isPrivateBrowsing: true`
   - Missing tokens in authentication object

3. **Common fixes**:
   - Ensure cookies are enabled
   - Check if Intelligent Tracking Prevention is blocking storage
   - Verify app is served over HTTPS
   - Test with "Prevent Cross-Site Tracking" disabled

### If PWA installation fails:

1. **Check manifest**:
   - Verify manifest.json is accessible
   - Check all required PWA criteria are met
   - Ensure icons are properly sized

2. **Safari PWA requirements**:
   - Must be served over HTTPS
   - Must have valid manifest.json
   - Must have proper icons
   - Must be accessed multiple times

## Advanced Debugging

### Enable verbose logging:
```javascript
// In browser console
localStorage.setItem('hygo_debug', 'true')
```

### Check specific storage mechanisms:
```javascript
// Test localStorage
hygoAuthDebug.checkStorageType('localStorage')

// Test sessionStorage  
hygoAuthDebug.checkStorageType('sessionStorage')
```

### Monitor storage events:
```javascript
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key, e.newValue)
})
```

## Performance Impact

The Safari compatibility layer adds minimal overhead:
- ~2KB additional JavaScript
- Fallback storage checks only run when needed
- Memory storage is cleared on page reload

## Browser Support Matrix

| Browser | localStorage | sessionStorage | Memory Fallback | PWA Support |
|---------|-------------|----------------|-----------------|-------------|
| Chrome | ✅ | ✅ | ✅ | ✅ |
| Safari Desktop | ✅ | ✅ | ✅ | ✅ |
| Safari iOS | ✅ | ✅ | ✅ | ✅ |
| Safari Private | ❌ | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting Common Issues

### Issue: "Storage issue: Storage read/write mismatch"
**Solution**: Clear browser data and try again

### Issue: Tokens disappear in PWA mode
**Solution**: Verify HTTPS and check console for ITP warnings

### Issue: Private browsing shows storage errors
**Expected**: This is normal, fallback mechanisms should work

### Issue: Authentication works in Safari but not PWA
**Solution**: Check PWA scope and start_url in manifest.json

## Production Deployment Checklist

- [ ] App served over HTTPS
- [ ] Manifest.json accessible and valid
- [ ] Icons properly sized and accessible
- [ ] Safari compatibility provider initialized
- [ ] Debug utilities removed from production build
- [ ] Authentication tested on actual iOS devices
- [ ] PWA installation tested on multiple devices

## Support

If authentication still fails after following this guide:
1. Collect debug information using `hygoAuthDebug.getDebugInfo()`
2. Test on multiple Safari versions
3. Check for any custom security policies
4. Verify backend CORS configuration for Safari
