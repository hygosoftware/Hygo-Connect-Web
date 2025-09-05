import { useEffect } from 'react';

export function useCloseSidebarOnNavigation({
  isSidebarExpanded,
  setIsSidebarExpanded,
  navigationItems
}: {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  navigationItems: { onPress: () => void }[];
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktopOrTablet = () => window.innerWidth >= 768; // md breakpoint
    navigationItems.forEach((item) => {
      const originalOnPress = item.onPress;
      item.onPress = () => {
        if (isDesktopOrTablet() && isSidebarExpanded) {
          setIsSidebarExpanded(false);
        }
        originalOnPress();
      };
    });
     
  }, [isSidebarExpanded, setIsSidebarExpanded, navigationItems]);
}
