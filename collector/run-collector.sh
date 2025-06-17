#!/bin/bash

# Run OpenTelemetry Collector using Docker
# This script runs the OpenTelemetry Collector with a custom configuration

# Set the collector image
COLLECTOR_IMAGE="otel/opentelemetry-collector-contrib:latest"

# Set the config file path
CONFIG_PATH="$(pwd)/otel-collector.yml"

# Create a logs directory if it doesn't exist
mkdir -p "$(pwd)/logs"

echo "Starting OpenTelemetry Collector with configuration from $CONFIG_PATH"


## THIS IS HERE JUST TO STOP LEAKING THE CREDS - ASK DARREN for the CORALOGIX KEY.
source .env

# Run the collector
# Port mappings:
# - 4317: OTLP gRPC receiver
# - 4318: OTLP HTTP receiver
# - 8888: Metrics endpoint
# - 8889: Health check endpoint
# - 13133: Health check endpoint
docker run --rm \
  --name otel-collector \
  -p 4318:4318 \
  -p 8888:8888 \
  -p 8889:8889 \
  -p 13133:13133 \
  -v "${CONFIG_PATH}:/etc/otel-collector-config.yaml" \
  -v "$(pwd)/logs:/logs" \
  -e CORALOGIX_PRIVATE_KEY=$CORALOGIX_PRIVATE_KEY \
  -e CORALOGIX_DOMAIN=$CORALOGIX_DOMAIN \
  -e CORALOGIX_APPLICATION_NAME=$CORALOGIX_APPLICATION_NAME \
  -e CORALOGIX_SUBSYSTEM_NAME=$CORALOGIX_SUBSYSTEM_NAME \
  -e CORALOGIX_TIMEOUT=$CORALOGIX_TIMEOUT \
  --network host \
  ${COLLECTOR_IMAGE} \
  --config=/etc/otel-collector-config.yaml

echo "OpenTelemetry Collector stopped"
