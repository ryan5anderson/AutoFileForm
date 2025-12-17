/**
 * Environment configuration with type safety and security
 * Centralizes all environment variable access with proper typing and validation
 * NO FALLBACK VALUES - all secrets must be provided via environment variables
 */

// Environment variable types
interface EnvConfig {
  // EmailJS Configuration
  emailjs: {
    serviceId: string;
    templateIdProd: string;
    templateIdDev: string;
    userId: string;
    providerEmail: string;
  };
  
  // Firebase Configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  
  // Admin Configuration
  admin: {
    password: string;
  };
}

// Required environment variables
const REQUIRED_ENV_VARS = [
  'REACT_APP_EMAILJS_SERVICE_ID',
  'REACT_APP_EMAILJS_TEMPLATE_ID_PROD',
  'REACT_APP_EMAILJS_TEMPLATE_ID_DEV',
  'REACT_APP_EMAILJS_USER_ID',
  'REACT_APP_PROVIDER_EMAIL',
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FIREBASE_MEASUREMENT_ID',
  'REACT_APP_ADMIN_PASSWORD',
] as const;

// Helper function to get environment variable with validation
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set. Please check your .env file.`);
  }
  return value;
}

// Validate all required environment variables at startup
function validateEnvironment(): void {
  const missing: string[] = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    const errorMessage = `
Missing required environment variables:
${missing.map(v => `  - ${v}`).join('\n')}

Please ensure all required variables are set in your .env file.
See .env.example for reference.
    `.trim();
    
    throw new Error(errorMessage);
  }
}

// Validate environment variables at startup
validateEnvironment();

// Create typed environment configuration
export const env: EnvConfig = {
  emailjs: {
    serviceId: getEnvVar('REACT_APP_EMAILJS_SERVICE_ID'),
    templateIdProd: getEnvVar('REACT_APP_EMAILJS_TEMPLATE_ID_PROD'),
    templateIdDev: getEnvVar('REACT_APP_EMAILJS_TEMPLATE_ID_DEV'),
    userId: getEnvVar('REACT_APP_EMAILJS_USER_ID'),
    providerEmail: getEnvVar('REACT_APP_PROVIDER_EMAIL'),
  },
  firebase: {
    apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY'),
    authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('REACT_APP_FIREBASE_APP_ID'),
    measurementId: getEnvVar('REACT_APP_FIREBASE_MEASUREMENT_ID'),
  },
  admin: {
    password: getEnvVar('REACT_APP_ADMIN_PASSWORD'),
  },
};

// Export individual configs for convenience
export const emailjsConfig = env.emailjs;
export const firebaseConfig = env.firebase;
export const adminConfig = env.admin;

// Export types for use in other files
export type { EnvConfig };
