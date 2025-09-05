import { AppPageConfig } from 'next';

declare module '../../app/appointments/[id]/page' {
  const config: AppPageConfig;
  export default config;
}
