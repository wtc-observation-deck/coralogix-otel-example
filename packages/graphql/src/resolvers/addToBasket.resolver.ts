
import { addToBasket } from "../services/basket-service";
import { createContextLogger } from "../utils/logger.js";

const logger = createContextLogger('resolver:addToBasket');

export const addToBasketResolver = async (
    _: unknown,
    { sku, basketId, userId }: { sku: string; basketId: string; userId: string }
): Promise<{ success: boolean; message: string }> => {
    logger.info({ sku, basketId, userId }, 'Processing addToBasket resolver');
    try {
        // Call the basket service function
        const result = await addToBasket(sku, basketId, userId);
        if (!result.success) {
            logger.warn({ sku, basketId, userId, message: result.message }, 'Basket operation unsuccessful');
        } else {
            logger.info({ sku, basketId, userId }, 'Successfully added item to basket');
        }
        return result;
    } catch (error) {
        logger.error({ sku, basketId, userId, error }, 'Error in addToBasket resolver');
        throw error;
    }
};