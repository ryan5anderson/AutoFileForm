// Import environment configuration
import { emailjsConfig } from '../config/env';

// Individual exports for cleaner imports
export const EMAILJS_SERVICE_ID = emailjsConfig.serviceId;
export const EMAILJS_TEMPLATE_ID_PROD = emailjsConfig.templateIdProd;
export const EMAILJS_TEMPLATE_ID_DEV = emailjsConfig.templateIdDev;
export const EMAILJS_USER_ID = emailjsConfig.userId;
export const PROVIDER_EMAIL = emailjsConfig.providerEmail;

// college data is now in config/colleges/ 