import { Attributes, trace } from '@opentelemetry/api';
import pino from 'pino';

const logger = pino();

const IS_OTEL_ENABLED = true;

export const addSpanAttributes = (attributes: Attributes) => {

    const span = trace.getActiveSpan();    

    // You might want to add a check to see if OTEL is enabled
    if (IS_OTEL_ENABLED) {
        if (!span) {
            logger.warn('No active span found')
            return;
        }
        span.setAttributes(attributes)
    }
}