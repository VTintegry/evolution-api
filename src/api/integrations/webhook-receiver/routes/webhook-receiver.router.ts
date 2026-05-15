import { Logger } from '@config/logger.config';
import { Router } from 'express';

import { WebhookReceiverController } from '../controllers/webhook-receiver.controller';

const logger = new Logger('WebhookReceiverRouter');

export function buildWebhookReceiverRouter(controller: WebhookReceiverController): Router {
  const router = Router();

  /**
   * POST /webhook
   * Public endpoint — no auth guard required so the Evolution API can POST freely.
   * Receives WhatsApp event payloads from the Evolution API and persists them.
   */
  router.post('/', async (req, res) => {
    logger.verbose({
      local: 'WebhookReceiverRouter',
      message: 'Incoming POST /webhook',
      event: req.body?.event,
      instance: req.body?.instance,
    });

    return controller.receive(req, res);
  });

  return router;
}
