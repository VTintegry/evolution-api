export class EvolutionWebhookPayloadDto {
  event?: string;
  instance?: string;
  data?: Record<string, any>;
  destination?: string;
  date_time?: string;
  sender?: string;
  server_url?: string;
  apikey?: string;
}

export class WhatsappWebhookMessageDto {
  id?: string;
  instanceName?: string;
  event?: string;
  sender?: string;
  recipient?: string;
  content?: string;
  messageType?: string;
  messageTimestamp?: number;
  rawPayload?: Record<string, any>;
}
