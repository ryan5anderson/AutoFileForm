// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import emailjs from 'emailjs-com';

import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_PROD, EMAILJS_TEMPLATE_ID_DEV, EMAILJS_USER_ID } from '../constants';
import { TemplateParams } from '../types';

// Determine which template to use based on environment
const getTemplateId = (): string => {
  const hostname = window.location.hostname;
  
  // Check if we're on localhost or development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
    return EMAILJS_TEMPLATE_ID_DEV;
  }
  
  // Check if we're on the production domain
  if (hostname === 'ohiopylecollege.com' || hostname.includes('ohiopylecollege.com')) {
    return EMAILJS_TEMPLATE_ID_PROD;
  }
  
  // Default to dev template for any other environment (staging, etc.)
  return EMAILJS_TEMPLATE_ID_DEV;
};

export const sendOrderEmail = async (templateParams: TemplateParams): Promise<void> => {
  try {
    const templateId = getTemplateId();

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_USER_ID
    );
  } catch (err) {
    console.error('EmailJS error:', err);
    throw new Error('Failed to send email. Please check your EmailJS configuration and try again.');
  }
}; 