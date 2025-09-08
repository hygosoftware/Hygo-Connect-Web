
# Icon Usage Inventory

Last updated: 2025-09-02 13:17 IST

This document catalogs all icon usages across the project by source type: centralized Icon component, direct lucide-react imports, inline SVGs, and external SVG files.

## Centralized Icon component

- Component file: `src/components/atoms/Icon.tsx`
- Provides a typed `IconName` union and inline SVGs.
- Note: The `wallet` icon is present and used in the app.

### Usages of <Icon name=...>

- `src/contexts/ToastContext.tsx`
  - Icons: `check-circle`, `alert`, `info`, `close`

- `src/components/organisms/PillPalDesktop.tsx`
  - Icons: `plus`, `bell`, `pills`, `x`

- `src/components/organisms/PillPal.tsx`
  - Icons: `bell`, `activity`, `bell-off`, `pill-off`, `plus`, `edit`, `trash`, `food`, `pill`, `clock`

- `src/components/organisms/FamilyMemberUI.tsx`
  - Icons (dynamic): `member?.id === 'self' ? 'user' : 'family'`
  - Icons (dynamic): `viewMode === 'grid' ? 'menu' : 'home'`

- `src/components/organisms/BookingReview.tsx`
  - Icons (dynamic): `state.* ? 'check' : 'x'`

- `src/components/organisms/BookingPayment.tsx`
  - Icons (dynamic): `state.* ? 'check' : 'x'`

- `src/components/molecules/FileItem.tsx`
  - Icons (dynamic): `fileIcon` from `getFileIcon(fileType)`

- `src/components/molecules/ToastNotification.tsx`
  - Icons (dynamic via `typeIcons[type]`): `alert`, `x`, `check`, `info`

- `src/components/atoms/Input.tsx`
  - Icons (dynamic): `leftIcon`

- `src/app/home/page.tsx`
  - Icons (dynamic via `featureItems[].iconName`): confirmed values include `pills`, `family`, `doctor`, `health-card`, `records`, `appointment`

- `src/components/molecules/CashConfirmationModal.tsx`
  - Icons: `wallet`

- `src/components/molecules/PaymentMethodCard.tsx`
  - Icons (dynamic): `method.icon` (IconName)

### Dynamic mappings that affect <Icon>

- `src/lib/api.ts` → `getFileIcon(fileType)`
  - image/* → `image`
  - contains: pdf | word | excel | spreadsheet | powerpoint | presentation → `document`
  - video/* → `video`
  - audio/* → `audio`
  - default → `file`

- `src/contexts/ToastContext.tsx` and `src/components/molecules/ToastNotification.tsx`
  - Toast type → `alert` | `x` | `check` | `info`

- `src/app/home/page.tsx`
  - `featureItems[].iconName` feeds `<Icon name={...}>` in the feature grid.

## Direct lucide-react imports

- `src/app/profile/page.tsx`
  - Icons: User, Mail, Phone, Calendar, Heart, Activity, Edit3, Save, X, Camera, Ruler, Weight, Stethoscope, AlertCircle, CheckCircle2, Plus, Trash2, Check

- `src/components/molecules/ProfileSummaryCard.tsx`
  - Icons: User, Mail, Phone, MapPin, Calendar, Heart, Edit3, Eye

- `src/components/organisms/DoctorsListUI.tsx`
  - Icons: Search, Filter, MapPin, Star, Clock, Users, X, Stethoscope, Building2, RefreshCw, AlertCircle

- `src/components/organisms/AddMedicineModal.tsx`
  - Icons: Plus, X, Trash2, Upload, FileText, Clock, Calendar, Pill, AlertCircle, ChevronDown, Camera, Sun, Moon, Sunset

- `src/components/organisms/ProfileCompletionWizard.tsx`
  - Icons: CheckCircle2, ArrowRight, ArrowLeft, X, User, Heart, Phone, Shield, Award

- `src/components/organisms/ProfileSettings.tsx`
  - Icons: Settings, Bell, Shield, Palette, Globe, Moon, Sun, Volume2, VolumeX, Smartphone, Mail, MessageSquare

## Inline SVGs in code (not via Icon or lucide)

- `src/components/atoms/SideBar.tsx`
  - Navigation icons inline for: `home`, `records`, `document`, `pills`, `user`
  - Inline logout icon (desktop and mobile)

- `src/components/molecules/PaymentMethodCard.tsx`
  - Inline checkmark SVG inside custom radio indicator

- `src/components/molecules/CashConfirmationModal.tsx`
  - Inline spinner SVG for loading state

## External SVG files and references

- Public SVGs in `public/`:
  - `file.svg`, `globe.svg`, `next.svg`, `window.svg`, `vercel.svg` (plus PWA assets)

- References in code:
  - `'/placeholder.svg'` via `next/image` in:
    - `src/components/molecules/ProfileSummaryCard.tsx`
    - `src/app/profile/page.tsx`

- Potential issue:
  - `public/placeholder.svg` was not found during listing — consider adding or updating references.

## Recommendations

- Prefer the centralized `Icon` component for consistency; migrate inline SVGs where feasible.
- Review `lucide-react` usage for overlap with `Icon` icons to reduce bundle size and unify theming.
- Remove unused public SVG assets or add `placeholder.svg` if intended.

## Appendix

- Full list of supported `IconName` values is defined in `src/components/atoms/Icon.tsx`.
