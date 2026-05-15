import { Logger } from '@config/logger.config';
import { Request, Response } from 'express';

import { EvolutionWebhookPayloadDto } from '../dto/webhook-receiver.dto';
import { WebhookReceiverService } from '../services/webhook-receiver.service';

export class WebhookReceiverController {
  private readonly logger = new Logger('WebhookReceiverController');

  constructor(private readonly webhookReceiverService: WebhookReceiverService) {}

  /**
   * POST /webhook
   * Receives an Evolution API webhook payload, validates it, persists it,
   * and returns 200 OK with a summary of the saved record.
   */
  public async receive(req: Request, res: Response): Promise<Response> {
    const payload = req.body as EvolutionWebhookPayloadDto;

    // Validate payload
    const errors = this.webhookReceiverService.validate(payload);
    if (errors.length > 0) {
      this.logger.warn({
        local: 'WebhookReceiverController.receive',
        message: 'Invalid webhook payload',
        errors,
        body: payload,
      });
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        response: { message: errors },
      });
    }

    try {
      const result = await this.webhookReceiverService.process(payload);

      return res.status(200).json({
        status: 200,
        message: 'Webhook received and processed successfully',
        data: result,
      });
    } catch (error) {
      this.logger.error({
        local: 'WebhookReceiverController.receive',
        message: `Failed to process webhook: ${error?.message}`,
        event: payload?.event,
        instance: payload?.instance,
        stack: error?.stack,
      });

      return res.status(500).json({
        status: 500,
        error: 'Internal Server Error',
        response: { message: 'Failed to process webhook payload' },
      });
    }
  }
}
