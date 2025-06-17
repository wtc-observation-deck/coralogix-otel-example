/**
 * Basket service functions for handling basket operations
 */
import { createContextLogger } from '../utils/logger.js';
import { addSpanAttributes } from '../utils/attributes.js';
import { setTimeout } from 'node:timers/promises';

// Create a logger for the basket service
const logger = createContextLogger('service:basket');

/**
 * Add an item to the basket
 * @param sku - Stock keeping unit of the item
 * @param basketId - ID of the basket
 * @param userId - ID of the user
 * @returns Promise resolving to success status and message
 */
export const addToBasket = async (
  sku: string,
  basketId: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  logger.info({ sku, basketId, userId }, 'Adding item to basket');

  addSpanAttributes({
    sku,
    basketId,
    userId
  });  

  try {
    // Simulate an external call.
    logger.debug('Making external service call');
    const response = await fetch('https://www.google.co.uk', {
      method: 'GET',
    });

    if (!response.ok) {
      logger.error({ status: response.status }, 'External service error');
      throw new Error('External service error');
    }
    logger.debug('External service call successful');
  } catch (error) {
    logger.error({ error }, 'Failed to make external service call');
    throw error;
  }

  // Generate a random sleep time between 0 and 3000ms
  const sleepTime = Math.floor(Math.random() * 3001);
  logger.debug({ sleepTime }, 'Simulating processing delay');

  await setTimeout(sleepTime);

  // Randomly generate success or error responses
  const random = Math.random();

  if (random < 0.3) {
    // 30% chance of insufficient stock error
    const message = `Insufficient stock for SKU ${sku} in basket ${basketId} for user ${userId} (delay: ${sleepTime}ms)`;
    logger.warn({ sku, basketId, userId, sleepTime }, message);

    return {
      success: false,
      message,
    };

  } else if (random < 0.5) {
    // 20% chance of server error
    logger.error({ sku, basketId, userId }, 'Server error occurred');

    throw new Error('Server error');
  }

  // 50% chance of success
  const message = `Successfully added SKU ${sku} to basket ${basketId} for user ${userId} (delay: ${sleepTime}ms)`;
  logger.info({ sku, basketId, userId, sleepTime }, 'Item added to basket successfully');

  return {
    success: true,
    message,
  };
};
