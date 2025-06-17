import './instrumentation.js';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typedefs';
import { resolvers } from './schema/resolvers';
import { logger } from './utils/logger.js';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3666;

async function startServer() {
  const app = express();
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      // Custom error formatting
      return {
        message: error.message,
        path: error.path,
      };
    },
  });
  
  await server.start();
  
  // Apply Apollo middleware to Express
  server.applyMiddleware({ app, path: '/graphql' });
  
  // Basic health check endpoint
  app.get('/', (req, res) => {
    res.send({ message: 'GraphQL API is running. Use /graphql endpoint to access the GraphQL playground.' });
  });
  
  app.listen(port, host, () => {
    logger.info(`Server started and ready at http://${host}:${port}`);
    logger.info(`GraphQL endpoint available at http://${host}:${port}${server.graphqlPath}`);
  });
}

startServer().catch((err) => {
  logger.error({ err }, 'Failed to start server');
});