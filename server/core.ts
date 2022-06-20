import { Context, HttpRequest, Logger } from "@azure/functions";

export function getUserIdent(req: HttpRequest): string {
  // Retrieve client info from request header
  const header = req.headers['x-ms-client-principal'];
  // The header is encoded in Base64, so we need to convert it
  const encoded = Buffer.from(header, 'base64');
  // Convert from Base64 to ascii
  const decoded = encoded.toString('ascii');
  // Convert to a JSON object and return the userId
  return JSON.parse(decoded).userId;
}

/**
 * Tries to retrieve the user from the current request header
 * @param req The current request 
 * @param context Status code is 401 if unauthenticated
 */
export function tryGetUserIdent(req: HttpRequest, context: Context): { userIdent: string | null, status: number } {
  let userId = null;
  let status = 200;

  try {
    userId = getUserIdent(req);
    // If no current user, return unauthorized
    if(!userId) {
      context.log.error('No user ID present')
      status = 401;
    }
  } catch (ex) {
    context.log.error(ex)
    // Error, return unauthorized
    status = 401;
  }

  return { userIdent: userId, status };
}

export interface Result {
  body: any,
  status: number
}