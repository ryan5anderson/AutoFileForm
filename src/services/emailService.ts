// @ts-ignore
import emailjs from 'emailjs-com';
import { TemplateParams } from '../types';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_PROD, EMAILJS_TEMPLATE_ID_DEV, EMAILJS_USER_ID } from '../constants';

// Determine which template to use based on environment
const getTemplateId = (): string => {
  const hostname = window.location.hostname;
  
  // Check if we're on localhost or development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
    console.log('Development environment detected, using dev template');
    return EMAILJS_TEMPLATE_ID_DEV;
  }
  
  // Check if we're on the production domain
  if (hostname === 'ohiopylecollege.com' || hostname.includes('ohiopylecollege.com')) {
    console.log('Production environment detected, using prod template');
    return EMAILJS_TEMPLATE_ID_PROD;
  }
  
  // Default to dev template for any other environment (staging, etc.)
  console.log('Unknown environment detected, defaulting to dev template');
  return EMAILJS_TEMPLATE_ID_DEV;
};

export const sendOrderEmail = async (templateParams: TemplateParams): Promise<void> => {
  try {
    const templateId = getTemplateId();
    console.log('Sending email with params:', templateParams);
    console.log('Using template ID:', templateId);

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