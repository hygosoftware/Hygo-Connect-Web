import { PageConfig } from 'next';

declare module '../../app/appointments/[id]/page' {
  const config: PageConfig;
  export default config;
}
