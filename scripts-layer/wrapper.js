"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const resource_detector_aws_1 = require("@opentelemetry/resource-detector-aws");
const resources_1 = require("@opentelemetry/resources");
const instrumentation_aws_sdk_1 = require("@opentelemetry/instrumentation-aws-sdk");
const instrumentation_aws_lambda_1 = require("@opentelemetry/instrumentation-aws-lambda");
const api_1 = require("@opentelemetry/api");
const core_1 = require("@opentelemetry/core");
// import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
function defaultConfigureInstrumentations() {
    // Use require statements for instrumentation to avoid having to have transitive dependencies on all the typescript
    // definitions.
    const { DnsInstrumentation } = require("@opentelemetry/instrumentation-dns");
    const { ExpressInstrumentation, } = require("@opentelemetry/instrumentation-express");
    const { GraphQLInstrumentation, } = require("@opentelemetry/instrumentation-graphql");
    const { GrpcInstrumentation, } = require("@opentelemetry/instrumentation-grpc");
    const { HapiInstrumentation, } = require("@opentelemetry/instrumentation-hapi");
    const { HttpInstrumentation, } = require("@opentelemetry/instrumentation-http");
    const { IORedisInstrumentation, } = require("@opentelemetry/instrumentation-ioredis");
    const { KoaInstrumentation } = require("@opentelemetry/instrumentation-koa");
    const { MongoDBInstrumentation, } = require("@opentelemetry/instrumentation-mongodb");
    const { MySQLInstrumentation, } = require("@opentelemetry/instrumentation-mysql");
    const { NetInstrumentation } = require("@opentelemetry/instrumentation-net");
    const { PgInstrumentation } = require("@opentelemetry/instrumentation-pg");
    const { RedisInstrumentation, } = require("@opentelemetry/instrumentation-redis");
    return [
        new DnsInstrumentation(),
        new ExpressInstrumentation(),
        new GraphQLInstrumentation(),
        new GrpcInstrumentation(),
        new HapiInstrumentation(),
        new HttpInstrumentation(),
        new IORedisInstrumentation(),
        new KoaInstrumentation(),
        new MongoDBInstrumentation(),
        new MySQLInstrumentation(),
        new NetInstrumentation(),
        new PgInstrumentation(),
        new RedisInstrumentation(),
    ];
}
console.log("Registering OpenTelemetry");
const instrumentations = [
    new instrumentation_aws_sdk_1.AwsInstrumentation({
        suppressInternalInstrumentation: true,
    }),
    new instrumentation_aws_lambda_1.AwsLambdaInstrumentation(typeof configureLambdaInstrumentation === "function"
        ? configureLambdaInstrumentation({})
        : {}),
    ...(typeof configureInstrumentations === "function"
        ? configureInstrumentations
        : defaultConfigureInstrumentations)(),
];
// configure lambda logging
const logLevel = (0, core_1.getEnv)().OTEL_LOG_LEVEL;
api_1.diag.setLogger(new api_1.DiagConsoleLogger(), logLevel);
// Register instrumentations synchronously to ensure code is patched even before provider is ready.
(0, instrumentation_1.registerInstrumentations)({
    instrumentations,
});
async function initializeProvider() {
    const resource = (0, resources_1.detectResourcesSync)({
        detectors: [resource_detector_aws_1.awsLambdaDetector, resources_1.envDetector, resources_1.processDetector],
    });
    let config = {
        resource,
    };
    if (typeof configureTracer === "function") {
        config = configureTracer(config);
    }
    const tracerProvider = new sdk_trace_node_1.NodeTracerProvider(config);
    if (typeof configureTracerProvider === "function") {
        configureTracerProvider(tracerProvider);
    }
    else {
        // defaults
        tracerProvider.addSpanProcessor(new sdk_trace_base_1.BatchSpanProcessor(new sdk_trace_base_1.ConsoleSpanExporter()));
    }
    // logging for debug
    if (logLevel === api_1.DiagLogLevel.DEBUG) {
        tracerProvider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(new sdk_trace_base_1.ConsoleSpanExporter()));
    }
    let sdkRegistrationConfig = {};
    if (typeof configureSdkRegistration === "function") {
        sdkRegistrationConfig = configureSdkRegistration(sdkRegistrationConfig);
    }
    tracerProvider.register(sdkRegistrationConfig);
    // Configure default meter provider (doesn't export metrics)
    let meterConfig = {
        resource,
    };
    if (typeof configureMeter === "function") {
        meterConfig = configureMeter(meterConfig);
    }
    const meterProvider = new sdk_metrics_1.MeterProvider(meterConfig);
    if (typeof configureMeterProvider === "function") {
        configureMeterProvider(meterProvider);
    }
    // Re-register instrumentation with initialized provider. Patched code will see the update.
    (0, instrumentation_1.registerInstrumentations)({
        instrumentations,
        tracerProvider,
        meterProvider,
    });
}
initializeProvider();
//# sourceMappingURL=wrapper.js.map