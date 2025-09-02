import React from 'react';
import {
  Email,
  Visibility,
  VisibilityOff,
  Check,
  Close,
  WarningAmber,
  ArrowBack,
  Menu as MenuIcon,
  LocationOn,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Notifications,
  Add,
  Person,
  Description,
  Medication,
  Article,
  Logout,
  FamilyRestroom,
  MedicalServices,
  CreditCard,
  Assignment,
  SmartToy,
  EventAvailable,
  Science,
  Videocam,
  LocalHospital,
  AccessTime,
  CalendarToday,
  QrCode2,
  Lightbulb,
  WaterDrop,
  Apple,
  Psychology,
  Bedtime,
  Bolt,
  Sanitizer,
  Chair,
  Favorite,
  Home,
  NotificationsOff,
  Vaccines,
  Restaurant,
  Edit,
  Delete,
  ExpandLess,
  Search,
  FilterList,
  Star,
  Cached,
  InsertDriveFile,
  Folder,
  FileUpload,
  Download,
  Share,
  Image,
  AudioFile,
  Autorenew,
  CheckCircle,
  Smartphone,
  AccountBalanceWallet,
  Shield,
  Group,
  Info,
  Call,
  GridView,
} from '@mui/icons-material';

export type IconName =
  | 'email' | 'eye' | 'eye-off' | 'check' | 'x' | 'alert' | 'arrow-left' | 'menu' | 'location' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'notification' | 'plus' | 'user' | 'document' | 'pill' | 'news' | 'logout' | 'pills' | 'family' | 'doctor' | 'health-card' | 'records' | 'robot' | 'appointment' | 'laboratory' | 'video' | 'hospital' | 'clock' | 'calendar' | 'qr-code' | 'lightbulb' | 'water' | 'apple' | 'brain' | 'sleep' | 'activity' | 'hygiene' | 'chair' | 'heart' | 'home' | 'bell' | 'bell-off' | 'pill-off' | 'capsule' | 'bottle-tonic' | 'needle' | 'food' | 'edit' | 'trash' | 'chevron-up' | 'search' | 'filter' | 'star' | 'close' | 'refresh' | 'file' | 'folder' | 'upload' | 'download' | 'share' | 'image' | 'audio' | 'loader' | 'check-circle' | 'credit-card' | 'smartphone' | 'wallet' | 'shield' | 'users' | 'info' | 'phone' | 'grid';

export interface IconProps {
  name: IconName;
  size?: 'extrasmall' | 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'small',
  color = 'currentColor',
  className = '',
}) => {
  // Keep width/height classes for layout consistency if any consumer relies on them,
  // but actual icon rendering size is controlled by MUI's fontSize prop below.
  // Responsive Tailwind text size classes for icons
  const sizeClasses = {
    extrasmall: 'text-[14px] md:text-[16px]', // ~0.875rem mobile, 1rem tablet+
    small: 'text-[18px] md:text-[20px] lg:text-[22px]', // 1.125rem mobile, 1.25rem tablet, 1.375rem desktop
    medium: 'text-[22px] md:text-[24px] lg:text-[28px]', // 1.375rem mobile, 1.5rem tablet, 1.75rem desktop
    large: 'text-[28px] md:text-[32px] lg:text-[36px]', // 1.75rem mobile, 2rem tablet, 2.25rem desktop
  } as const;

  // If className includes custom text size, use that instead of default responsive size
  const hasCustomTextSize = className.includes('text-') || className.includes('text[');
  const iconClasses = hasCustomTextSize ? className : `${sizeClasses[size]} ${className}`;

  // Map to MUI's fontSize prop for actual icon sizing. If consumer passed responsive
  // Tailwind text size classes, inherit to allow breakpoint-based scaling.
  const fontSizeMap: Record<'extrasmall' | 'small' | 'medium' | 'large', 'small' | 'medium' | 'large'> = {
    extrasmall: 'small',
    small: 'small',
    medium: 'medium',
    large: 'large',
  };
  // Ensure size is always a valid key
  const safeSize: 'extrasmall' | 'small' | 'medium' | 'large' =
    size === 'extrasmall' || size === 'small' || size === 'medium' || size === 'large' ? size : 'small';
  const computedFontSize = hasCustomTextSize ? 'inherit' : fontSizeMap[safeSize];

  const iconMap: Partial<Record<IconName, React.ElementType>> = {
    email: Email,
    eye: Visibility,
    'eye-off': VisibilityOff,
    check: Check,
    x: Close,
    alert: WarningAmber,
    'arrow-left': ArrowBack,
    menu: MenuIcon,
    location: LocationOn,
    'chevron-down': ExpandMore,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    notification: Notifications,
    plus: Add,
    user: Person,
    document: Description,
    pill: Medication,
    news: Article,
    logout: Logout,
    pills: Medication,
    family: FamilyRestroom,
    doctor: MedicalServices,
    'health-card': CreditCard,
    records: Assignment,
    robot: SmartToy,
    appointment: EventAvailable,
    laboratory: Science,
    video: Videocam,
    hospital: LocalHospital,
    clock: AccessTime,
    calendar: CalendarToday,
    'qr-code': QrCode2,
    lightbulb: Lightbulb,
    water: WaterDrop,
    apple: Apple,
    brain: Psychology,
    sleep: Bedtime,
    activity: Bolt,
    hygiene: Sanitizer,
    chair: Chair,
    heart: Favorite,
    home: Home,
    bell: Notifications,
    'bell-off': NotificationsOff,
    'pill-off': Medication,
    capsule: Medication,
    'bottle-tonic': Science,
    needle: Vaccines,
    food: Restaurant,
    edit: Edit,
    trash: Delete,
    'chevron-up': ExpandLess,
    search: Search,
    filter: FilterList,
    star: Star,
    close: Close,
    refresh: Cached,
    file: InsertDriveFile,
    folder: Folder,
    upload: FileUpload,
    download: Download,
    share: Share,
    image: Image,
    audio: AudioFile,
    loader: Autorenew,
    'check-circle': CheckCircle,
    'credit-card': CreditCard,
    smartphone: Smartphone,
    wallet: AccountBalanceWallet,
    shield: Shield,
    users: Group,
    info: Info,
    phone: Call,
    grid: GridView,
  };

  const IconEl = iconMap[name];
  if (!IconEl) return null;
  return (
    <IconEl
      className={iconClasses}
      fontSize={computedFontSize}
      htmlColor={color}
    />
  );
};

export default Icon;
