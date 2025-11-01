import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyPayloadSignature, encodePayload } from '../utils/auth';
import { sendUnauthorized } from '../utils/response';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Dual Authentication Middleware
 * Implements AccessGrid-style authentication with:
 * 1. X-ACCT-ID header for account identification
 * 2. X-PAYLOAD-SIG header for payload signature verification
 */
export async function authenticateRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract headers
    const accountId = req.headers['x-acct-id'] as string;
    const payloadSignature = req.headers['x-payload-sig'] as string;

    // Check if headers are present
    if (!accountId || !payloadSignature) {
      logger.warn('Missing authentication headers');
      sendUnauthorized(res, 'Missing authentication headers');
      return;
    }

    // Find account by account ID
    const account = await prisma.account.findUnique({
      where: { accountId },
      select: {
        id: true,
        accountId: true,
        sharedSecret: true,
        isActive: true,
        tier: true,
      },
    });

    if (!account) {
      logger.warn({ accountId }, 'Account not found');
      sendUnauthorized(res, 'Invalid account ID');
      return;
    }

    if (!account.isActive) {
      logger.warn({ accountId }, 'Account is inactive');
      sendUnauthorized(res, 'Account is inactive');
      return;
    }

    // Prepare payload for signature verification
    let payload: string;

    if (req.method === 'GET') {
      // For GET requests, use the sig_payload query parameter
      const sigPayload = req.query.sig_payload as string;
      if (!sigPayload) {
        logger.warn('Missing sig_payload for GET request');
        sendUnauthorized(res, 'Missing signature payload');
        return;
      }
      payload = Buffer.from(sigPayload).toString('base64');
    } else if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      // For POST/PATCH/PUT requests, use the request body
      if (!req.body || Object.keys(req.body).length === 0) {
        // If no body, use default payload with ID from URL params
        const defaultPayload = {
          id: req.params.id || req.params.card_id || req.params.template_id || '0',
        };
        payload = encodePayload(defaultPayload);
      } else {
        payload = encodePayload(req.body);
      }
    } else {
      // For other methods, use default payload
      const defaultPayload = {
        id: req.params.id || req.params.card_id || req.params.template_id || '0',
      };
      payload = encodePayload(defaultPayload);
    }

    // Verify signature
    const isValidSignature = verifyPayloadSignature(
      account.sharedSecret,
      payload,
      payloadSignature
    );

    if (!isValidSignature) {
      logger.warn({ accountId }, 'Invalid payload signature');
      sendUnauthorized(res, 'Invalid signature');
      return;
    }

    // Attach account to request
    req.account = {
      id: account.id,
      accountId: account.accountId,
      tier: account.tier,
    };

    logger.debug({ accountId: account.accountId }, 'Request authenticated');
    next();
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    sendUnauthorized(res, 'Authentication failed');
  }
}

/**
 * Middleware to check if account is enterprise tier
 */
export function requireEnterprise(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.account) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.account.tier !== 'ENTERPRISE') {
    sendUnauthorized(res, 'Enterprise tier required');
    return;
  }

  next();
}
