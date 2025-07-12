// @ts-ignore
import emailjs from 'emailjs-com';
import { TemplateParams } from '../types';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID } from '../constants';

export const sendOrderEmail = async (templateParams: TemplateParams): Promise<void> => {
  try {
    console.log('Sending email with params:', templateParams);

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
    
    alert('Order receipt sent to provider');
  } catch (err) {
    console.error('EmailJS error:', err);
    throw new Error('Failed to send email. Please check your EmailJS configuration and try again.');
  }
}; 