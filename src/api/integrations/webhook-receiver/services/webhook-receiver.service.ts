import { PrismaRepository } from '@api/repository/repository.service';
import { Logger } from '@config/logger.config';

import { EvolutionWebhookPayloadDto } from '../dto/webhook-receiver.dto';

export class WebhookReceiverService {
  private readonly logger = new Logger('WebhookReceiverService');

  constructor(private readonly prismaRepository: PrismaRepository) {}

  /**
   * Validates that the incoming payload has the minimum required fields.
   * Returns an array of validation error messages (empty if valid).
   */
  public validate(payload: EvolutionWebhookPayloadDto): string[] {
    const errors: string[] = [];

    if (!payload || typeof payload !== 'object') {
      errors.push('Payload must be a JSON object');
      return errors;
    }

    if (!payload.event) {
      errors.push('Missing required field: event');
    }

    if (!payload.instance) {
      errors.push('Missing required field: instance');
    }

    return errors;
  }

  /**
   * Extracts the relevant message fields from the Evolution API webhook payload.
   * The payload structure varies by event type; this handles the most common cases.
   */
  private extractMessageFields(payload: EvolutionWebhookPayloadDto): {
    sender: string | null;
    recipient: string | null;
    content: string | null;
    messageType: string | null;
    messageTimestamp: number | null;
    messageId: string | null;
  } {
    const data = payload.data ?? {};

    // key.remoteJid is the remote party (sender for incoming, recipient for outgoing)
    const key = data.key ?? {};
    const fromMe: boolean = key.fromMe === true;
    const remoteJid: string | null = key.remoteJid ?? null;
    const instanceOwner: string | null = payload.sender ?? null;

    const sender = fromMe ? instanceOwner : remoteJid;
    const recipient = fromMe ? remoteJid : instanceOwner;

    // Extract text content from the most common message types
    const message = data.message ?? {};
    const content: string | null =
      message.conversation ??
      message.extendedTextMessage?.text ??
      message.imageMessage?.caption ??
      message.videoMessage?.caption ??
      message.documentMessage?.caption ??
      null;

    const messageType: string | null = data.messageType ?? null;
    const messageTimestamp: number | null =
      typeof data.messageTimestamp === 'number' ? data.messageTimestamp : null;
    const messageId: string | null = key.id ?? null;

    return { sender, recipient, content, messageType, messageTimestamp, messageId };
  }

  /**
   * Processes the incoming Evolution API webhook payload:
   * extracts fields, persists to the database, and logs the result.
   */
  public async process(payload: EvolutionWebhookPayloadDto): Promise<{
    id: string;
    instanceName: string;
    event: string;
    sender: string | null;
    recipient: string | null;
    content: string | null;
    messageType: string | null;
    messageTimestamp: number | null;
    receivedAt: Date;
  }> {
    const { sender, recipient, content, messageType, messageTimestamp, messageId } =
      this.extractMessageFields(payload);

    let saved: any;

    try {
      saved = await this.prismaRepository.whatsappWebhookMessage.create({
        data: {
          instanceName: payload.instance,
          event: payload.event,
          sender,
          recipient,
          content,
          messageType,
          messageTimestamp,
          messageId,
          rawPayload: payload as any,
        },
      });
    } catch (dbError) {
      this.logger.error({
        local: 'WebhookReceiverService.process',
        message: `Database error while saving webhook message: ${dbError?.message}`,
        event: payload.event,
        instance: payload.instance,
        stack: dbError?.stack,
      });
      throw dbError;
    }

    this.logger.log({
      local: 'WebhookReceiverService.process',
      message: 'WhatsApp webhook message received and saved',
      id: saved.id,
      event: saved.event,
      instance: saved.instanceName,
      sender: saved.sender,
      recipient: saved.recipient,
      messageType: saved.messageType,
      messageTimestamp: saved.messageTimestamp,
      receivedAt: saved.receivedAt,
    });

    return {
      id: saved.id,
      instanceName: saved.instanceName,
      event: saved.event,
      sender: saved.sender,
      recipient: saved.recipient,
      content: saved.content,
      messageType: saved.messageType,
      messageTimestamp: saved.messageTimestamp,
      receivedAt: saved.receivedAt,
    };
  }
}
