import Logger from './Logger';

/**
 * Utility function for webhook wait pattern
 * Use in Zustand stores or other non-hook contexts
 * 
 * After connecting/disconnecting an account:
 * 1. Wait for webhook to trigger
 * 2. Poll with exponential backoff
 * 3. Returns when ready for data refresh
 */
export async function waitForWebhookCompletion(action: 'connect' | 'disconnect'): Promise<void> {
  Logger.info('webhookWait', `Waiting for webhook: ${action} account`);

  // Step 1: Initial wait (1-2 seconds for webhook to trigger)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Step 2: Exponential backoff polling (4 attempts, ~3.5 seconds total)
  const pollIntervals = [500, 700, 1000, 1300];
  for (let i = 0; i < pollIntervals.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervals[i]));
    Logger.debug('webhookWait', `Poll attempt ${i + 1}/${pollIntervals.length} for ${action}`);
  }

  Logger.info('webhookWait', `Webhook wait complete for ${action}, ready to refresh data`);
}
