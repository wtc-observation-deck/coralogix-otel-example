
import { createContextLogger } from "../utils/logger.js";

const logger = createContextLogger('resolver:echo');    

export const echoResolver = (_: unknown, { message }: { message: string }): string => {
    logger.info({ message }, 'Processing echo resolver');
    return message;
  };