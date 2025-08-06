# Profile API Implementation

## Overview
This document describes the implementation of the get profile API with the endpoint `base_url/userId` for the Hygo web application.

## Implementation Details

### 1. API Service (`src/services/apiServices.tsx`)

#### New Profile Service
Added a new `profileService` with the following methods:

- **`getProfileByUserId(userId: string)`**: Fetches user profile data
  - **Endpoint**: `GET {base_url}/{userId}`
  - **Returns**: `ProfileData | null`

- **`updateProfile(userId: string, profileData: UpdateProfileRequest)`**: Updates user profile
  - **Endpoint**: `PUT {base_url}/{userId}`
  - **Returns**: `ProfileData | null`

#### API Configuration
- **Base URL**: `https://hygo-backend.onrender.com/api/V0`
- **Authentication**: Bearer token automatically included via axios interceptor
- **Error Handling**: Comprehensive error logging and fallback mechanisms

#### Data Types
```typescript
interface ProfileData {
  _id: string;
  FullName: string;
  Email: string;
  MobileNumber?: string | object | array; // Handles complex phone number structures
  AlternativeNumber?: string | object | array;
  Gender?: string;
  Age?: string | number;
  DateOfBirth?: string;
  Country?: string;
  State?: string;
  City?: string;
  Address?: string;
  Height?: string | number;
  Weight?: string | number;
  BloodGroup?: string;
  ChronicDiseases?: string[];
  Allergies?: string[];
  profilePhoto?: string | null;
  UserType?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### 2. Profile Page Integration (`src/app/profile/page.tsx`)

#### Key Changes
1. **API Integration**: Replaced localStorage-based profile loading with real API calls
2. **Data Transformation**: Added helper functions to handle complex API response formats
3. **Phone Number Handling**: Implemented extraction logic for phone numbers that may come as objects or arrays
4. **Error Handling**: Added fallback to authentication data when API fails

#### Phone Number Extraction
```typescript
const extractPhoneNumber = (phoneData: any): string => {
  if (!phoneData) return "";
  if (typeof phoneData === 'string') return phoneData;
  if (Array.isArray(phoneData) && phoneData.length > 0) {
    return phoneData[0].number || phoneData[0].toString();
  }
  if (typeof phoneData === 'object' && phoneData.number) {
    return phoneData.number;
  }
  return "";
};
```

#### Loading Flow
1. Check authentication status
2. Attempt to fetch profile data from API using `profileService.getProfileByUserId(user._id)`
3. Transform API response to match UI expectations
4. Fallback to basic authentication data if API fails
5. Handle loading states and error scenarios

#### Save Flow
1. Prepare update data from form state
2. Call `profileService.updateProfile(user._id, updateData)`
3. Update local state with API response
4. Fallback to localStorage on error

### 3. Test Page (`src/app/test-profile-api/page.tsx`)

Created a dedicated test page to verify API integration:
- **URL**: `/test-profile-api`
- **Features**:
  - Test get profile API
  - Test update profile API
  - Display API responses
  - Show error messages
  - Display current user information

## API Endpoints

### Get Profile
- **Method**: GET
- **URL**: `{base_url}/{userId}`
- **Example**: `https://hygo-backend.onrender.com/api/V0/60f7b3b3b3b3b3b3b3b3b3b3`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response**: ProfileData object

### Update Profile
- **Method**: PUT
- **URL**: `{base_url}/{userId}`
- **Example**: `https://hygo-backend.onrender.com/api/V0/60f7b3b3b3b3b3b3b3b3b3b3`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Body**: UpdateProfileRequest object
- **Response**: Updated ProfileData object

## Error Handling

### API Service Level
- Network errors are logged with full details
- Authentication errors trigger token refresh mechanism
- API response errors are logged and handled gracefully
- Returns `null` for failed GET requests
- Throws errors for failed PUT requests to allow caller handling

### UI Level
- Fallback to authentication data when API fails
- Fallback to localStorage for save operations on API failure
- Loading states during API calls
- Error logging to console for debugging

## Testing

### Manual Testing
1. Navigate to `/test-profile-api` (requires authentication)
2. Click "Test Get Profile" to test the GET endpoint
3. Click "Test Update Profile" to test the PUT endpoint
4. Check browser console for detailed API logs
5. Verify responses in the test page UI

### Profile Page Testing
1. Navigate to `/profile` (requires authentication)
2. Verify profile data loads from API
3. Edit profile information
4. Save changes and verify API update call
5. Check browser console for API call logs

## Future Enhancements

1. **Image Upload**: Add profile photo upload functionality
2. **Validation**: Implement form validation for profile updates
3. **Optimistic Updates**: Update UI immediately before API call
4. **Caching**: Implement profile data caching
5. **Real-time Updates**: Add WebSocket support for real-time profile updates

## Troubleshooting

### Common Issues
1. **Phone Number Rendering Error**: Fixed by implementing phone number extraction logic
2. **Authentication Required**: Ensure user is logged in before accessing profile APIs
3. **API Response Format**: Handle both wrapped and direct response formats
4. **Type Mismatches**: Convert numeric fields to strings for UI compatibility

### Debug Information
- All API calls are logged to browser console with 🌐 prefix
- Successful responses logged with ✅ prefix
- Errors logged with ❌ prefix
- Check Network tab in browser dev tools for actual HTTP requests
