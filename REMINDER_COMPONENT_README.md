# ReminderScreen Component - React Native to Next.js Conversion

This document describes the conversion of the React Native ReminderScreen component to a Next.js web component that maintains the same mobile UI while providing an enhanced desktop experience.

## 🚀 Features

### Mobile View (< 1024px)
- **Identical UI**: Maintains the exact same mobile interface as the original React Native component
- **Touch-friendly**: Optimized for mobile interactions with proper touch targets
- **Bottom Navigation**: Includes the bottom navigation bar for mobile navigation
- **Floating Action Button**: Positioned floating add button for easy access
- **Responsive Cards**: Pill reminder cards that adapt to mobile screen sizes

### Desktop View (≥ 1024px)
- **Grid Layout**: Cards displayed in a responsive grid (1-3 columns based on screen size)
- **Enhanced Header**: Larger header with prominent "Add Reminder" button
- **Improved Spacing**: Better use of desktop screen real estate
- **Hover Effects**: Interactive hover states for better desktop UX
- **No Bottom Navigation**: Desktop doesn't show mobile bottom navigation

## 📁 File Structure

```
src/
├── components/
│   ├── atoms/
│   │   └── ToastMessage.tsx          # Toast notification wrapper
│   └── organisms/
│       └── ReminderScreen.tsx        # Main component
├── services/
│   └── apiService.ts                 # API service with mock data
└── app/
    ├── reminders/
    │   └── page.tsx                  # Reminders page
    └── demo-reminders/
        └── page.tsx                  # Demo page
```

## 🔧 Usage

### Basic Usage
```tsx
import ReminderScreen from '@/components/organisms/ReminderScreen';

export default function RemindersPage() {
  return <ReminderScreen userId="user-123" />;
}
```

### With URL Parameters
```tsx
'use client';
import { useSearchParams } from 'next/navigation';
import ReminderScreen from '@/components/organisms/ReminderScreen';

export default function RemindersPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || 'default-user';
  
  return <ReminderScreen userId={userId} />;
}
```

## 🎨 Styling

The component uses Tailwind CSS with a responsive design approach:

- **Mobile-first**: Base styles target mobile devices
- **Desktop enhancements**: `lg:` prefix for desktop-specific styles
- **Color scheme**: Maintains the blue theme from the original design
- **Animations**: Smooth transitions and hover effects

### Key CSS Classes
- `lg:hidden` - Hide on desktop
- `hidden lg:block` - Show only on desktop
- `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3` - Responsive grid
- `hover:shadow-lg transition-all duration-200` - Interactive effects

## 🔌 API Integration

### Current Implementation
The component uses a mock API service (`src/services/apiService.ts`) that simulates real API calls with promises and timeouts.

### Real API Integration
To connect to a real API, update the functions in `apiService.ts`:

```typescript
// Replace mock implementation with real API calls
export const getNotifications = async (userId: string) => {
  return apiRequest<Notification[]>(`/notifications/${userId}`);
};

export const deleteNotification = async (notificationId: string) => {
  return apiRequest<{ id: string }>(`/notifications/${notificationId}`, {
    method: 'DELETE',
  });
};
```

## 📱 Component Props

### ReminderScreen Props
```typescript
interface ReminderScreenProps {
  userId: string;  // Required: User ID for fetching notifications
}
```

### Notification Data Structure
```typescript
interface Notification {
  _id: string;
  intake: string;
  Time: string[];
  medicines: Medicine[] | Medicine;
  Meal: string;
  startDate: string;
  endDate: string;
  userId: string;
  // ... other optional fields
}
```

## 🎯 Key Differences from React Native

### Replaced Components
| React Native | Next.js Web |
|--------------|-------------|
| `View` | `div` |
| `Text` | `Typography` component |
| `TouchableOpacity` | `button` |
| `ScrollView` | `div` with overflow |
| `SafeAreaView` | `div` with padding |
| `Alert.alert()` | Toast notifications |
| `MaterialCommunityIcons` | Custom `Icon` component |

### Navigation
- **React Native**: `useNavigation()` from React Navigation
- **Next.js**: `useRouter()` from Next.js navigation

### Styling
- **React Native**: StyleSheet and inline styles
- **Next.js**: Tailwind CSS classes

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **View the Component**
   - Navigate to `/demo-reminders` for a demo
   - Navigate to `/reminders?userId=your-user-id` for actual usage

## 🔄 Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Offline support with service workers
- [ ] Advanced filtering and search
- [ ] Bulk operations (delete multiple)
- [ ] Export/import functionality
- [ ] Dark mode support

### Performance Optimizations
- [ ] Virtual scrolling for large lists
- [ ] Image lazy loading
- [ ] Component memoization
- [ ] API response caching

## 🐛 Troubleshooting

### Common Issues

1. **Toast not showing**: Ensure `ToastMessage` component is properly imported
2. **Navigation errors**: Check that routes exist in the app directory
3. **API errors**: Verify the API service configuration
4. **Styling issues**: Ensure Tailwind CSS is properly configured

### Debug Mode
Add this to see component state:
```tsx
{process.env.NODE_ENV === 'development' && (
  <pre>{JSON.stringify({ notifications, loading, toast }, null, 2)}</pre>
)}
```

## 📄 License

This component is part of the Hygo Web App project.
