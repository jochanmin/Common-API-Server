import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  host: process.env.APP_HOST,
  version: process.env.npm_package_version,
  port: process.env.APP_PORT,
  backendDomain: process.env.BACKEND_DOMAIN,
  frontendDomain: process.env.FRONTEND_DOMAIN,
}));
