import prisma from '../config/database';
import { WebhookEventType } from '../types';
import { createCloudEvent } from '../utils/cloudevents';
import logger from '../config/logger';
import config from '../config';

class WebhookService {
  /**
   * Send webhook to all configured endpoints for an event
   */
  async sendWebhook(
    accountId: string,
    eventType: WebhookEventType,
    data: Record<string, any>
  ) {
    try {
      // Find all active webhooks for this account that listen to this event
      const webhooks = await prisma.webhook.findMany({
        where: {
          accountId,
          isActive: true,
          events: {
            has: eventType,
          },
        },
      });

      if (webhooks.length === 0) {
        logger.debug({ eventType }, 'No webhooks configured for event');
        return;
      }

      // Create CloudEvent
      const cloudEvent = createCloudEvent(eventType, data);

      // Send to all webhooks
      const deliveryPromises = webhooks.map((webhook) =>
        this.deliverWebhook(webhook.id, webhook.url, webhook.secret, cloudEvent, eventType)
      );

      await Promise.allSettled(deliveryPromises);
    } catch (error) {
      logger.error({ error, eventType }, 'Failed to send webhook');
      // Don't throw - we don't want to fail the main operation if webhook fails
    }
  }

  /**
   * Deliver webhook to a specific endpoint
   */
  private async deliverWebhook(
    webhookId: string,
    url: string,
    secret: string,
    cloudEvent: any,
    eventType: string
  ) {
    try {
      // Create delivery record
      const delivery = await prisma.webhookDelivery.create({
        data: {
          webhookId,
          eventType,
          payload: cloudEvent as any,
          attempts: 0,
        },
      });

      // Attempt delivery
      await this.attemptDelivery(delivery.id, url, secret, cloudEvent);
    } catch (error) {
      logger.error({ error, webhookId, url }, 'Failed to create webhook delivery');
    }
  }

  /**
   * Attempt to deliver a webhook
   */
  private async attemptDelivery(
    deliveryId: string,
    url: string,
    secret: string,
    cloudEvent: any
  ) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/cloudevents+json',
          'User-Agent': 'Wusul-Webhooks/1.0',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify(cloudEvent),
      });

      // Update delivery record
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          responseStatus: response.status,
          responseBody: await response.text().catch(() => null),
          ...(response.ok && {
            deliveredAt: new Date(),
          }),
          ...(!response.ok && {
            failedAt: new Date(),
          }),
        },
      });

      if (response.ok) {
        logger.info({ deliveryId, url, status: response.status }, 'Webhook delivered');
      } else {
        logger.warn(
          { deliveryId, url, status: response.status },
          'Webhook delivery failed'
        );
        // Schedule retry if not at max attempts
        await this.scheduleRetry(deliveryId, url, secret, cloudEvent);
      }
    } catch (error) {
      logger.error({ error, deliveryId, url }, 'Webhook delivery error');

      // Update delivery record with error
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          failedAt: new Date(),
        },
      });

      // Schedule retry
      await this.scheduleRetry(deliveryId, url, secret, cloudEvent);
    }
  }

  /**
   * Schedule retry for failed webhook delivery
   */
  private async scheduleRetry(
    deliveryId: string,
    url: string,
    secret: string,
    cloudEvent: any
  ) {
    try {
      const delivery = await prisma.webhookDelivery.findUnique({
        where: { id: deliveryId },
      });

      if (!delivery) {
        return;
      }

      // Check if we should retry
      const maxAttempts = config.webhook.retryAttempts;
      const retryTimeoutHours = config.webhook.retryTimeoutHours;
      const createdAt = new Date(delivery.createdAt);
      const hoursSinceCreation =
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

      if (
        delivery.attempts >= maxAttempts ||
        hoursSinceCreation >= retryTimeoutHours
      ) {
        logger.info({ deliveryId }, 'Webhook delivery abandoned after max retries');
        return;
      }

      // Calculate exponential backoff delay
      const delayMs = Math.min(
        1000 * Math.pow(2, delivery.attempts),
        1000 * 60 * 60
      ); // Max 1 hour

      logger.debug(
        { deliveryId, delayMs, attempts: delivery.attempts },
        'Scheduling webhook retry'
      );

      // In production, you would use a proper job queue (Bull, BullMQ, etc.)
      // For now, we'll use setTimeout (note: this won't survive server restarts)
      setTimeout(() => {
        this.attemptDelivery(deliveryId, url, secret, cloudEvent);
      }, delayMs);
    } catch (error) {
      logger.error({ error, deliveryId }, 'Failed to schedule webhook retry');
    }
  }

  /**
   * Register a new webhook
   */
  async registerWebhook(
    accountId: string,
    url: string,
    events: string[],
    secret: string
  ) {
    try {
      const webhook = await prisma.webhook.create({
        data: {
          accountId,
          url,
          events,
          secret,
          isActive: true,
        },
      });

      logger.info({ webhookId: webhook.id, url }, 'Webhook registered');
      return webhook;
    } catch (error) {
      logger.error({ error, url }, 'Failed to register webhook');
      throw error;
    }
  }

  /**
   * Unregister a webhook
   */
  async unregisterWebhook(accountId: string, webhookId: string) {
    try {
      await prisma.webhook.delete({
        where: {
          id: webhookId,
          accountId,
        },
      });

      logger.info({ webhookId }, 'Webhook unregistered');
    } catch (error) {
      logger.error({ error, webhookId }, 'Failed to unregister webhook');
      throw error;
    }
  }
}

export const webhookService = new WebhookService();
