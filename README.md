# Coralogix OpenTelemetry GraphQL Demo

This repository contains a minimal demonstration of how to instrument a Node.js (Apollo) GraphQL API with OpenTelemetry and ship logs, traces, and metrics to **Coralogix**.  
The project is managed with **NX** and built in **TypeScript**.  Runtime logging is handled by **Pino** with a dedicated Coralogix transport.

---

## Features

* **GraphQL API** – Simple `echo` query and `addToBasket` mutation built with Apollo Server.
* **Structured Logging** – Pino logger pre-configured with Coralogix application & subsystem names.
* **Distributed Tracing** – OpenTelemetry SDK exports traces through a local OpenTelemetry Collector that forwards the data to Coralogix.
* **NX monorepo** – Easily scale to multiple services/packages while sharing TypeScript configuration.

---

## Prerequisites

| Tool | Version |
| ---- | ------- |
| Node.js | ≥ 18.x |
| Yarn | ≥ 1.22 |
| Coralogix private key | (from your Coralogix account) |

---

## Quick-start

```bash
# 1. Clone the repository
$ git clone <your-fork-or-clone-url>
$ cd coralogix

# 2. Install dependencies
$ yarn install

# 3. Configure the OpenTelemetry Collector
$ cp collector/.env.sample collector/.env
# ➜ open collector/.env and set:
#    CORALOGIX_PRIVATE_KEY=<your-private-key>
#    CORALOGIX_DOMAIN=<your-domain>
#    CORALOGIX_APPLICATION_NAME=<your-application-name>
#    CORALOGIX_SUBSYSTEM_NAME=<your-subsystem-name>
#    CORALOGIX_TIMEOUT=<your-timeout>

# 4. In one terminal, start the Collector (runs on port localhost:4318)
$ ./collector/run-collector.s

# 5. Configure the GraphQL API
$ cp packages/graphql/.env.sample packages/graphql/.env
# ➜ open packages/graphql/.env and make any changes you want to.

# 6. In another terminal, run the GraphQL API (http://localhost:3666/graphql)
$ yarn nx serve graphql

# 7. In another terminal, exercise the API and generate telemetry
$ ./scripts/invoke.sh [-h for help]
```

### What happens?
1. The script sends an query to the `addToBasket` mutation.
2. The service logs structured messages via Pino.
3. OpenTelemetry exports traces to the local Collector.
4. The Collector forwards everything to Coralogix – open the Coralogix UI to explore your logs, traces, and metrics.

---

## Project layout

```
.
├── collector/             # OpenTelemetry Collector config & helper script
├── packages/graphql/      # GraphQL API source (Apollo Server)
├── scripts/               # Helper shell scripts (invoke, otel_logs, ...)
└── README.md
```