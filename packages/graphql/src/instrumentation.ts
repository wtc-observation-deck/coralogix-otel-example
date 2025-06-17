// Load environment variables from .env file first
import * as dotenv from 'dotenv';
dotenv.config();

// Instrumentation Providers that we care about.
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node';

// OpenTelemetry instrumentation for our GraphQL server
import * as opentelemetry from '@opentelemetry/sdk-node';

// Traces
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Logs
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

// Metrics
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

// Samplers
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { CoralogixTransactionSampler } from '@coralogix/opentelemetry';


import { IncomingMessage } from 'http';
import pino from 'pino';
import { emptyResource } from '@opentelemetry/resources';

// Create a logger
const logger = pino({ level: process.env.LOG_LEVEL });

const OLTP_EXPORTER_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

// Configure the OTLP exporter to send to Coralogix Stockholm endpoint
const traceExporter = new OTLPTraceExporter({
  url: `${OLTP_EXPORTER_ENDPOINT}/v1/traces`,
});

const logExporter = new OTLPLogExporter({
  url: `${OLTP_EXPORTER_ENDPOINT}/v1/logs`,
});

const metricExporter = new OTLPMetricExporter({
  url: `${OLTP_EXPORTER_ENDPOINT}/v1/metrics`,
  concurrencyLimit: 1
});

// Create and configure the OpenTelemetry SDK
const sdk = new opentelemetry.NodeSDK({
  resource: emptyResource(),
  traceExporter,
  // Process Spans
  spanProcessors: [new SimpleSpanProcessor(traceExporter)],  
  // Process Logs
  logRecordProcessors: [new SimpleLogRecordProcessor(logExporter)],
  
  // Set sampling to 100%
  sampler: new CoralogixTransactionSampler(new AlwaysOnSampler()),
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter
  }),
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (request) => {
        return request.method === 'OPTIONS';
      },
      requestHook: (span, request) => {        
        if (request instanceof IncomingMessage) {
          // This is so we can display the operation name in the Coralogix UI
          const transactionName = request.headers['x-operation-name'] ?? 'unknown';
          span.setAttribute('operationName', transactionName);
        }
      }
    }),
    new ExpressInstrumentation(),    
    new PinoInstrumentation(),
    new UndiciInstrumentation(),
    new RuntimeNodeInstrumentation({

    }),
    new GraphQLInstrumentation({
      // Depth limit to prevent overly complex queries from generating too many spans
      depth: 3,
      // Capture variables passed to GraphQL resolvers
      mergeItems: true,
      // Enable all instrumentations for maximum visibility
      allowValues: true,
      ignoreTrivialResolveSpans: true,
      ignoreResolveSpans: true,      
    })
  ],
});

// Initialize the SDK
const initSdk = (): void => {
  try {
    sdk.start();
    logger.info(`Sending telemetry data to: ${OLTP_EXPORTER_ENDPOINT}`);
  } catch (error: unknown) {
    logger.error('Error initializing OpenTelemetry instrumentation:', error);
  }
};

initSdk();

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    logger.info('OpenTelemetry SDK shut down successfully');
  } catch (error: unknown) {
    logger.error('Error shutting down OpenTelemetry SDK', error);
  } finally {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  try {
    await sdk.shutdown();
    logger.info('OpenTelemetry SDK shut down successfully');
  } catch (error: unknown) {
    logger.error('Error shutting down OpenTelemetry SDK', error);
  } finally {
    process.exit(0);
  }
});
