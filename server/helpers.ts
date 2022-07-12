import { Context, Logger } from '@azure/functions';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { createErrorResult, createSuccessResult, Result } from './core';
import { userStore } from './models/store';
import fetch from 'node-fetch';
import * as sgMail from '@sendgrid/mail';

type CheckRequestAuth = (authorization: string | undefined, logger: Logger) => Promise<DecodedIdToken | null>
type CheckBindingDataUserId = (context: Context, userIdent: string) => Promise<Result>
type SendTemplateEmail = (recipientEmail: string, templateId: string, templateData: any, logger: Logger) => Promise<Result>
type SendTestEmail = (recipientEmail: string, logger: Logger) => Promise<Result>

// Set SendGrid variables
const senderEmail = 'volunteer@codeforgoodwm.org';
const mailSendUrl = 'https://api.sendgrid.com/v3/mail/send';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? '';

/**
 * Check HTTP authorization
 * Returns an object of decoded token data or null if unauthorized
 * @param {string} [authorization]
 * @param {Logger} logger
 * @returns {Promise<DecodedIdToken | null>}
 */
export const checkRequestAuth: CheckRequestAuth = (authorization, logger) => {
  return new Promise((resolve, reject) => {
    let token = '';

    // Check header authorization for token
    if (authorization) {
      const parts = authorization.split('Bearer ');
      token = parts[1];
    }

    if (!token) {
      return null;
    }

    // Verify token with Firebase Admin SDK
    getAuth().verifyIdToken(token)
      .then((decoded) => {
        resolve(decoded);
      })
      .catch((error) => {
        logger('Could not verify Firebase token: ', error);
        resolve(null);
      });
  });
};

/**
 * Check binding data userId against requestor identifier
 * Returns a Result with the user data or an error
 * @param {Context} context - Azure function context
 * @param {string} userIdent - the user's identifier from the app's auth system
 * @returns {Promise<Result>}
 */
export const checkBindingDataUserId: CheckBindingDataUserId = async (context: Context, userIdent: string) => {
  // Attempt to acquire user data from userIdent
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found');
  }

  // Acquire user ID from binding data
  const userId = context.bindingData.userId;
  if (!userId) {
    return createErrorResult(400, 'Missing required parameter');
  }

  // Compare; if requestor and userId are not the same, return error
  // IMPORTANT: We're ignoring type here; the _id field is technically an object
  if (userId != user._id) {
    return createErrorResult(403, 'Forbidden');
  }

  return createSuccessResult(200, user);
};

/**
 * Send template email w/SendGrid
 * Returns a Result based on SendGrid's response
 * @param {string} recipientEmail - The email to which the email will be sent
 * @param {string} templateId - A string identifier for the template to be used
 * @param {any} templateData - An object of property/value pairs used by the template
 * @param {Logger} logger - The Azure context.log function
 * @returns {Promise<Result>}
 */
export const sendTemplateEmail: SendTemplateEmail = async (recipientEmail: string, templateId: string, templateData: any, logger: Logger) => {
  // Build request
  const body = JSON.stringify({
    from: {
      email: senderEmail,
    },
    personalizations: [
      {
        to: [
          {
            email: recipientEmail,
          },
        ],
        dynamic_template_data: templateData,
      },
    ],
    template_id: templateId,
  });

  // Send message via SendGrid
  try {
    const response = await fetch(mailSendUrl, {
      method: 'post', 
      body,
      headers: {
        'authorization': `Bearer ${SENDGRID_API_KEY}`,
        'content-type': 'application/json'
      }
    });

    // This service will return 202 ('Accepted') if the request is good
    if (response.statusText !== 'Accepted') {
      throw new Error('Mail submission not accepted by SendGrid.');
    }

    return createSuccessResult(202, {}); // TODO: Should we return data here, or is this enough?
  } catch (error) {
    logger('SendGrid error: ', error);
    return createErrorResult(500, 'Internal error');
  }
};

/**
 * Send test email w/SendGrid
 * Returns a Result based on SendGrid's response
 * @param {string} recipientEmail - The email to which the email will be sent
 * @param {Logger} logger - The Azure context.log function
 * @returns {Promise<Result>}
 */
export const sendTestEmail: SendTestEmail = async (recipientEmail: string, logger: Logger) => {
  // Build message
  const message = {
    to: recipientEmail,
    from: senderEmail,
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

  // Send message via SendGrid
  try {
    sgMail.setApiKey(SENDGRID_API_KEY);
    await sgMail.send(message);

    return createSuccessResult(202, {});
  } catch (error) {
    logger('SendGrid error: ', error);
    return createErrorResult(500, 'Internal error');
  }
};
