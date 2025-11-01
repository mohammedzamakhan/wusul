import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import walletService from '../services/wallet/wallet.service';
import appleWalletService from '../services/wallet/apple-wallet.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../config/logger';

/**
 * Generate wallet pass for an access pass
 */
export const generateWalletPass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessPassId } = req.params;

    const result = await walletService.generateWalletPass(accessPassId);

    if (result.platform === 'APPLE') {
      // Return PKPass file for Apple Wallet
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="${accessPassId}.pkpass"`);
      res.send(result.data);
    } else if (result.platform === 'GOOGLE') {
      // Return installation URL for Google Wallet
      return successResponse(res, {
        platform: 'GOOGLE',
        installUrl: result.installUrl,
        message: req.t?.('wallet.google_pass_generated') || 'Google Wallet pass generated successfully',
      });
    }
  } catch (error: any) {
    logger.error('Failed to generate wallet pass', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get pass for Apple Wallet web service (for dynamic updates)
 */
export const getApplePass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serialNumber } = req.params;

    const passBuffer = await appleWalletService.getPassForWebService(serialNumber);

    if (!passBuffer) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.send(passBuffer);
  } catch (error: any) {
    logger.error('Failed to get Apple Wallet pass', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Register device for Apple Wallet push notifications
 */
export const registerAppleDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = req.params;
    const { pushToken } = req.body;

    logger.info(`Apple Wallet device registered: ${deviceLibraryIdentifier} for pass ${serialNumber}`);

    // Store device registration in database for push notifications
    // This would typically be stored in a separate table

    res.status(201).json({ success: true });
  } catch (error: any) {
    logger.error('Failed to register Apple Wallet device', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Unregister device from Apple Wallet
 */
export const unregisterAppleDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = req.params;

    logger.info(`Apple Wallet device unregistered: ${deviceLibraryIdentifier} for pass ${serialNumber}`);

    // Remove device registration from database

    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Failed to unregister Apple Wallet device', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get passes associated with a device (Apple Wallet web service)
 */
export const getPassesForDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceLibraryIdentifier, passTypeIdentifier } = req.params;
    const { passesUpdatedSince } = req.query;

    // Query database for passes that need to be updated
    const serialNumbers: string[] = [];

    // For now, return empty list
    if (serialNumbers.length === 0) {
      return res.status(204).send();
    }

    res.json({
      serialNumbers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get passes for device', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Log messages from Apple Wallet
 */
export const logAppleWalletMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { logs } = req.body;

    if (logs && Array.isArray(logs)) {
      logs.forEach((log: string) => {
        logger.info(`Apple Wallet log: ${log}`);
      });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Failed to log Apple Wallet message', error);
    return errorResponse(res, error.message, 500);
  }
};
