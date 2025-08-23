// Type definitions for service worker

interface ServiceWorkerRegistration {
  readonly sync: SyncManager;
  readonly pushManager: PushManager;
  readonly showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  getNotifications: (filter?: { tag?: string }) => Promise<Notification[]>;
}

declare const self: ServiceWorkerGlobalScope;

declare global {
  interface Window {
    __WB_MANIFEST: string[];
    workbox: any;
  }

  interface SyncManager {
    getTags(): Promise<string[]>;
    register(tag: string): Promise<void>;
  }

  interface PushManager {
    getSubscription(): Promise<PushSubscription | null>;
    permissionState(options?: { userVisibleOnly?: boolean }): Promise<PermissionState>;
    subscribe(options: PushSubscriptionOptions): Promise<PushSubscription>;
  }

  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: string[];
    skipWaiting(): Promise<void>;
    clients: {
      claim(): Promise<void>;
      matchAll(options?: { includeUncontrolled?: boolean; type?: string }): Promise<ReadonlyArray<Client>>;
    };
    registration: ServiceWorkerRegistration;
  }
}
