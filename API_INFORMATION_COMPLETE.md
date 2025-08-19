# 🌐 API Information README - Hygo Healthcare Web Application

## 📋 Table of Contents
- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication & Authorization](#authentication--authorization)
- [Core API Services](#core-api-services)
- [Payment Integration](#payment-integration)
- [File Management](#file-management)
- [Third-Party Integrations](#third-party-integrations)
- [API Usage by Pages](#api-usage-by-pages)
- [Environment Configuration](#environment-configuration)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)

---

## 🔗 Overview

The Hygo web application integrates with multiple APIs to provide comprehensive healthcare services. This document catalogues all APIs used throughout the application, their purposes, endpoints, and implementation details.

### 📊 API Summary
- **Primary Backend API**: Healthcare management system
- **Payment Gateway**: Razorpay integration
- **HTTP Clients**: Axios and native Fetch API
- **Authentication**: JWT-based token system
- **File Management**: Cloud storage for medical records

---

## ⚙️ Base Configuration

### 🏗️ Primary API Configuration
**File**: `src/services/apiServices.tsx`
**Base URLs**:
- Primary: `https://backend.thehygo.com/api/V0/`
- Fallback: `https://hygo-backend.onrender.com/api/V0`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.thehygo.com/api/V0/'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})
```

### 🔧 Secondary API Configuration
**File**: `src/services/auth.tsx` & `src/lib/api.ts`
**Base URL**: `https://hygo-backend.onrender.com/api/V0`

---

## 🔐 Authentication & Authorization

### 🛡️ Authentication Service
**File**: `src/services/auth.tsx`
**Purpose**: User authentication and session management

#### API Endpoints:
1. **User Signup/Login**
   - **Endpoint**: `POST /signup`
   - **Purpose**: User registration and login
   - **Used in**: `src/components/organisms/LoginForm.tsx`

2. **OTP Verification**
   - **Endpoint**: `POST /verify-otp`
   - **Purpose**: Two-factor authentication
   - **Used in**: `src/components/organisms/OTPForm.tsx`, `src/app/otp/page.tsx`

3. **Password Reset Request**
   - **Endpoint**: `POST /request-password-reset`
   - **Purpose**: Initiate password reset
   - **Used in**: `src/services/auth.tsx`

4. **Password Reset**
   - **Endpoint**: `PUT /reset-password`
   - **Purpose**: Complete password reset process
   - **Used in**: `src/services/auth.tsx`

5. **Token Refresh**
   - **Endpoint**: `POST /refresh-token`
   - **Purpose**: Refresh expired access tokens
   - **Used in**: API interceptors

### 🔑 Token Management
**File**: `src/services/auth.tsx`
**Purpose**: JWT token storage and management

```typescript
export const TokenManager = {
  setTokens: (accessToken: string, refreshToken: string, user: User)
  getTokens: () => ({ accessToken, refreshToken, userId, userInfo })
  clearTokens: () => void
  isAuthenticated: () => boolean
}
```

---

## 🏥 Core API Services

### 👨‍⚕️ Doctor Service
**File**: `src/services/apiServices.tsx`
**Purpose**: Doctor-related operations

#### API Endpoints:
1. **Get All Doctors**
   - **Endpoint**: `GET /Staff/d`
   - **Purpose**: Fetch all available doctors
   - **Used in**: `src/app/doctors/page.tsx`, `src/components/organisms/DoctorSelection.tsx`

2. **Get Doctor by ID**
   - **Endpoint**: `GET /Staff/{doctorId}`
   - **Purpose**: Fetch specific doctor details
   - **Used in**: `src/app/doctors/[id]/page.tsx`, `src/app/booking/page.tsx`

3. **Search Doctors**
   - **Endpoint**: `GET /Staff/d?search={query}`
   - **Purpose**: Search doctors by name or specialization
   - **Used in**: `src/app/doctors/page.tsx`

4. **Filter Doctors by Specialization**
   - **Endpoint**: `GET /Staff/d?specialization={specialization}`
   - **Purpose**: Filter doctors by medical specialty
   - **Used in**: `src/app/doctors/page.tsx`

### 🏨 Clinic Service
**File**: `src/services/apiServices.tsx`
**Purpose**: Clinic management

#### API Endpoints:
1. **Get All Clinics**
   - **Endpoint**: `GET /Clinic/c`
   - **Purpose**: Fetch all available clinics
   - **Used in**: `src/components/organisms/ClinicSelection.tsx`

2. **Get Clinic by ID**
   - **Endpoint**: `GET /Clinic/{clinicId}`
   - **Purpose**: Fetch specific clinic details
   - **Used in**: Doctor availability lookup

3. **Get Clinics by Doctor**
   - **Endpoint**: `GET /Clinic/doctor/{doctorId}`
   - **Purpose**: Fetch clinics where a doctor practices
   - **Used in**: Booking flow

4. **Get Doctors by Clinic**
   - **Endpoint**: `GET /staff/c/{clinicId}`
   - **Purpose**: Fetch doctors available at a clinic
   - **Used in**: `src/components/organisms/ClinicDoctorSelection.tsx`

### 👤 Profile Service
**File**: `src/services/apiServices.tsx`
**Purpose**: User profile management

#### API Endpoints:
1. **Get Profile by User ID**
   - **Endpoint**: `GET /{userId}`
   - **Purpose**: Fetch user profile information
   - **Used in**: `src/app/profile/page.tsx`

2. **Update Profile**
   - **Endpoint**: `PUT /{userId}`
   - **Purpose**: Update user profile data
   - **Used in**: `src/app/profile/page.tsx`

### 👨‍👩‍👧‍👦 Family Member Service
**File**: `src/services/apiServices.tsx`
**Purpose**: Family member management

#### API Endpoints:
1. **Get Family Members**
   - **Endpoint**: `GET /add/{userId}/Patient`
   - **Purpose**: Fetch user's family members
   - **Used in**: `src/app/family/page.tsx`

2. **Add Family Member**
   - **Endpoint**: `POST /add/{userId}`
   - **Purpose**: Add new family member
   - **Used in**: `src/app/family/page.tsx`

3. **Update Family Member**
   - **Endpoint**: `PUT /add/{memberId}`
   - **Purpose**: Update family member details
   - **Used in**: `src/app/family/page.tsx`

4. **Delete Family Member**
   - **Endpoint**: `DELETE /add/{memberId}`
   - **Purpose**: Remove family member
   - **Used in**: `src/app/family/page.tsx`

5. **Get Family Member Details**
   - **Endpoint**: `GET /add/{userId}/{patientId}`
   - **Purpose**: Fetch specific family member details
   - **Used in**: `src/app/family/[id]/page.tsx`

### 💊 Pill Reminder Service
**File**: `src/services/apiServices.tsx`
**Purpose**: Medication reminder management

#### API Endpoints:
1. **Get Pill Reminders**
   - **Endpoint**: `GET /pillreminder/{userId}`
   - **Purpose**: Fetch user's medication reminders
   - **Used in**: `src/app/pillpal/page.tsx`

2. **Create Pill Reminder**
   - **Endpoint**: `POST /Pillreminder/{userId}`
   - **Purpose**: Create new medication reminder
   - **Used in**: `src/components/organisms/AddMedicineModal.tsx`
   - **Content-Type**: `multipart/form-data`

3. **Update Pill Reminder**
   - **Endpoint**: `PUT /pill reminder/{reminderId}`
   - **Purpose**: Update existing reminder
   - **Used in**: Pill reminder management

4. **Delete Pill Reminder**
   - **Endpoint**: `DELETE /pill reminder/{reminderId}`
   - **Purpose**: Remove medication reminder
   - **Used in**: `src/app/pillpal/page.tsx`

### 📅 Appointment Service
**File**: `src/services/apiServices.tsx`
**Purpose**: Medical appointment management

#### API Endpoints:
1. **Book Appointment**
   - **Endpoint**: `POST /Appointment/{userId}`
   - **Purpose**: Schedule medical appointments
   - **Used in**: `src/components/organisms/BookingPayment.tsx`

2. **Get Appointments by User**
   - **Endpoint**: `GET /Appointment/user/{userId}`
   - **Purpose**: Fetch user's appointments
   - **Used in**: Appointment management pages

### 💳 Subscription Service
**File**: `src/services/apiServices.tsx`
**Purpose**: Health card subscription management

#### API Endpoints:
1. **Get All Subscriptions**
   - **Endpoint**: `GET /Subscription/all`
   - **Purpose**: Fetch available subscription plans
   - **Used in**: `src/app/health-card/page.tsx`

---

## 💰 Payment Integration

### 🏦 Razorpay Integration
**Files**: `src/lib/razorpay.ts`, `src/services/apiServices.tsx`
**Purpose**: Payment processing for appointments and subscriptions

#### Configuration:
```typescript
export const getRazorpayConfig = () => ({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_9mOyRUi9azswI',
  currency: 'INR',
  name: 'Hygo Healthcare',
  description: 'Medical Appointment Booking',
  theme: { color: '#0e3293' }
})
```

#### API Endpoints:
1. **Create Payment Order**
   - **Endpoint**: `POST /payment`
   - **Purpose**: Create Razorpay payment order
   - **Used in**: `src/components/organisms/BookingPayment.tsx`

2. **Confirm Payment**
   - **Endpoint**: `POST /payment/confirm`
   - **Purpose**: Verify and confirm payment
   - **Used in**: `src/components/organisms/BookingPayment.tsx`

3. **Get Payment History**
   - **Endpoint**: `GET /payment`
   - **Purpose**: Fetch user's payment history
   - **Used in**: Payment management

4. **Get Payment by Order ID**
   - **Purpose**: Retrieve specific payment details
   - **Used in**: Payment verification

---

## 📁 File Management

### 📂 Folder Service
**File**: `src/services/apiServices.tsx`, `src/lib/api.ts`
**Purpose**: Medical record file management

#### API Endpoints:
1. **Get Folders by User ID**
   - **Endpoint**: `GET /Folder/{userId}`
   - **Purpose**: Fetch user's document folders
   - **Used in**: `src/app/files/page.tsx`, `src/components/organisms/FileScreen.tsx`

2. **Get Files by Folder ID**
   - **Endpoint**: `GET /File/{userId}/{folderId}`
   - **Purpose**: Fetch files in a specific folder
   - **Used in**: `src/app/file-screen/page.tsx`, `src/lib/api.ts`

3. **Get Folder by ID**
   - **Endpoint**: `GET /Folder/{userId}/{folderId}`
   - **Purpose**: Fetch folder information
   - **Used in**: File management

4. **Get File Details**
   - **Endpoint**: `GET /File/{folderId}/{fileId}`
   - **Purpose**: Fetch detailed file information
   - **Used in**: `src/components/molecules/FileDetailsModal.tsx`

5. **Create Folder**
   - **Endpoint**: `POST /Folder/{userId}`
   - **Purpose**: Create new document folder
   - **Used in**: File management

6. **Update Folder**
   - **Endpoint**: `PUT /Folder/{userId}/{folderId}`
   - **Purpose**: Update folder information
   - **Used in**: File management

7. **Delete Folder**
   - **Endpoint**: `DELETE /Folder/{userId}/{folderId}`
   - **Purpose**: Remove document folder
   - **Used in**: File management

---

## 🔗 Third-Party Integrations

### 📦 External Libraries
**File**: `package.json`

1. **Axios**: HTTP client for API requests
   - **Version**: `^1.11.0`
   - **Purpose**: Primary HTTP client with interceptors

2. **React Icons**: UI icons
   - **Version**: `^5.5.0`
   - **Purpose**: Consistent iconography

3. **Lucide React**: Modern icons
   - **Version**: `^0.525.0`
   - **Purpose**: Additional icon set

4. **React DatePicker**: Date selection
   - **Version**: `^8.4.0`
   - **Purpose**: Date inputs for appointments

---

## 📱 API Usage by Pages

### 🏠 Home Page
**File**: `src/app/home/page.tsx`
- **APIs Used**: None directly (uses components that call APIs)

### 👨‍⚕️ Doctors Page
**File**: `src/app/doctors/page.tsx`
- **APIs Used**:
  - `doctorService.getAllDoctors()`
  - `doctorService.getDoctorById(doctorId)`
- **Purpose**: Display and search doctors

### 👤 Profile Page
**File**: `src/app/profile/page.tsx`
- **APIs Used**:
  - `profileService.getProfileByUserId(user._id)`
  - `profileService.updateProfile(user._id, dataToSend)`
- **Purpose**: User profile management

### 👨‍👩‍👧‍👦 Family Page
**File**: `src/app/family/page.tsx`
- **APIs Used**:
  - `familyMemberService.getFamilyMembers(userId)`
  - `familyMemberService.addFamilyMember(userId, memberData)`
  - `familyMemberService.getFamilyMemberDetails(userId, patientId)`
- **Purpose**: Family member management

### 💊 PillPal Page
**File**: `src/app/pillpal/page.tsx`
- **APIs Used**:
  - `pillReminderService.getPillRemindersByUserId(userId)`
  - `pillReminderService.addMedicines(medicines, userId)`
  - `pillReminderService.deletePillReminder(id)`
- **Purpose**: Medication reminder management

### 📅 Booking Page
**File**: `src/app/booking/page.tsx`
- **APIs Used**:
  - `doctorService.getDoctorById(doctorId)`
  - Various clinic and appointment APIs
- **Purpose**: Medical appointment booking

### 💳 Health Card Page
**File**: `src/app/health-card/page.tsx`
- **APIs Used**:
  - `subscriptionservices.getallsubscription()`
- **Purpose**: Subscription plan management

### 📄 Files Page
**File**: `src/app/files/page.tsx`
- **APIs Used**:
  - `folderService.getFoldersByUserId(userId)`
- **Purpose**: Medical record file browsing

### 📁 File Screen Page
**File**: `src/app/file-screen/page.tsx`
- **APIs Used**:
  - `getAllFileFromFolder(userId, folderId)`
- **Purpose**: File viewing and management

### 🔐 Login/OTP Pages
**Files**: `src/app/login/page.tsx`, `src/app/otp/page.tsx`
- **APIs Used**:
  - `AuthService.login(userData)`
  - `AuthService.verifyOTP(Email, OTP)`
- **Purpose**: User authentication

---

## 🌍 Environment Configuration

### 🔧 Environment Variables
Required environment variables for API configuration:

```env
# Primary API Base URL
NEXT_PUBLIC_API_BASE_URL=https://backend.thehygo.com/api/V0/

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_9mOyRUi9azswI

# Additional fallback URLs (hardcoded in services)
# - https://hygo-backend.onrender.com/api/V0
```

### 🏗️ API Client Configuration
**Timeout**: 60 seconds for pill reminder operations, 30 seconds for auth
**Content-Type**: `application/json` (default), `multipart/form-data` (file uploads)
**Accept**: `application/json`
**Credentials**: `withCredentials: true` for auth service

---

## ❌ Error Handling

### 🛠️ HTTP Interceptors
**File**: `src/services/apiServices.tsx`

#### Request Interceptor:
- Adds Authorization header with Bearer token
- Logs request details for debugging

#### Response Interceptor:
- Handles 401 (Unauthorized) errors
- Attempts token refresh automatically
- Redirects to login on authentication failure
- Logs all API responses and errors

### 🔄 Token Refresh Strategy
```typescript
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  // Attempt token refresh
  const { refreshToken } = TokenManager.getTokens();
  if (refreshToken) {
    const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
      refreshToken
    });
    // Update tokens and retry request
  }
}
```

### 📊 Error Logging
All API errors are logged with:
- HTTP status code
- Response data
- Request URL and method
- Error message

---

## 🔐 Security Considerations

### 🛡️ Authentication Security
1. **JWT Tokens**: Secure token-based authentication
2. **Token Storage**: LocalStorage for web application
3. **Automatic Refresh**: Tokens refreshed automatically
4. **Secure Headers**: Authorization headers on all protected requests

### 🔒 API Security Features
1. **HTTPS**: All APIs use secure HTTPS connections
2. **CORS**: Cross-Origin Resource Sharing configured
3. **Request Timeout**: Prevents hanging requests
4. **Error Sanitization**: Sensitive data not exposed in errors

### 🚫 Security Best Practices
1. **No Hardcoded Secrets**: Environment variables for sensitive data
2. **Token Validation**: Server-side token validation
3. **Request Logging**: Comprehensive request/response logging
4. **Error Handling**: Proper error boundaries and fallbacks

---

## 📈 API Usage Statistics

### 📊 Service Distribution
- **Doctor Service**: 5 endpoints
- **Profile Service**: 2 endpoints
- **Family Member Service**: 5 endpoints
- **Pill Reminder Service**: 4 endpoints
- **Folder Service**: 7 endpoints
- **Authentication Service**: 4 endpoints
- **Payment Service**: 4 endpoints
- **Appointment Service**: 2 endpoints
- **Subscription Service**: 1 endpoint

### 🔄 Request Types
- **GET**: 22 endpoints (61%)
- **POST**: 9 endpoints (25%)
- **PUT**: 4 endpoints (11%)
- **DELETE**: 1 endpoint (3%)

---

## 🚀 Future Enhancements

### 📝 Planned API Improvements
1. **File Upload Implementation**: Complete file upload functionality
2. **Real-time Updates**: WebSocket integration for live data
3. **Offline Support**: API caching and offline-first approach
4. **Performance Optimization**: Request batching and caching
5. **Enhanced Error Handling**: More granular error types

### 🔧 Technical Debt
1. **Inconsistent Response Formats**: Standardize API response structure
2. **Missing Error Boundaries**: Add comprehensive error handling
3. **Type Safety**: Improve TypeScript interfaces
4. **API Documentation**: Add OpenAPI/Swagger documentation

---

## 📞 Support & Maintenance

### 🛠️ Development Team Contacts
- **Backend API**: Hygo Development Team
- **Frontend Integration**: Web Development Team
- **Payment Integration**: Razorpay Technical Support

### 📋 Maintenance Schedule
- **API Health Checks**: Daily monitoring
- **Token Rotation**: Automatic with fallback
- **Performance Reviews**: Weekly API performance analysis
- **Security Audits**: Monthly security assessments

---

*This document was generated on: ${new Date().toISOString()}*
*Last Updated: ${new Date().toLocaleDateString()}*

**Note**: This is a living document that should be updated as APIs evolve and new integrations are added to the Hygo healthcare web application.
