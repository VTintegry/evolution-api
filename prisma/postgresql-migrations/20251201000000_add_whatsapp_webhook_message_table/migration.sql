-- CreateTable
CREATE TABLE "WhatsappWebhookMessage" (
    "id" TEXT NOT NULL,
    "instanceName" VARCHAR(255) NOT NULL,
    "event" VARCHAR(100) NOT NULL,
    "sender" VARCHAR(100),
    "recipient" VARCHAR(100),
    "content" TEXT,
    "messageType" VARCHAR(100),
    "messageTimestamp" INTEGER,
    "messageId" VARCHAR(255),
    "rawPayload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappWebhookMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsappWebhookMessage_instanceName_idx" ON "WhatsappWebhookMessage"("instanceName");

-- CreateIndex
CREATE INDEX "WhatsappWebhookMessage_event_idx" ON "WhatsappWebhookMessage"("event");

-- CreateIndex
CREATE INDEX "WhatsappWebhookMessage_sender_idx" ON "WhatsappWebhookMessage"("sender");

-- CreateIndex
CREATE INDEX "WhatsappWebhookMessage_receivedAt_idx" ON "WhatsappWebhookMessage"("receivedAt");
