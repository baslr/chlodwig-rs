#!/usr/bin/env bun
/**
 * Split cli_formatted.js by extracting large d() modules.
 *
 * Uses line-based detection on formatted source:
 *  - Module start: line matching /^\s*var\s+(\w+)\s*=\s*d\(/
 *  - Module end:   line matching /^\s*\}\);$/ at same indent level
 *
 * Each extracted file contains the full `var XXX = d(...)` statement.
 * The split bundle evals the file to re-create the var in scope.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FORMATTED = path.join(ROOT, "src", "cli_formatted.js");
const OUT = path.join(ROOT, "src", "cli_split.js");

const THRESHOLD = 3 * 1024; // 3 KB

const content = fs.readFileSync(FORMATTED, "utf8");
const lines = content.split("\n");
console.log(`Read: ${(content.length / 1e6).toFixed(1)} MB, ${lines.length} lines\n`);

// --- Find d() modules by line scanning ---
const startRe = /^(\s*)var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*d\(/;
const modules = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(startRe);
  if (!m) continue;

  const indent = m[1];
  const name = m[2];
  const startLine = i;

  // Find closing `});` at same indent level
  const closePattern = `${indent}});`;
  let endLine = -1;

  for (let j = i + 1; j < lines.length; j++) {
    // Exact match: the line is exactly "  });" (same indent + "});")
    if (lines[j] === closePattern || lines[j] === closePattern + "\n") {
      endLine = j;
      break;
    }
  }

  if (endLine === -1) continue;

  // Calculate size (chars, including newlines)
  let size = 0;
  for (let j = startLine; j <= endLine; j++) {
    size += lines[j].length + 1; // +1 for newline
  }

  const lineCount = endLine - startLine + 1;
  modules.push({ name, startLine, endLine, size, lineCount, indent });

  // Skip past this module
  i = endLine;
}

console.log(`Found ${modules.length} d() modules\n`);

// --- Filter big ones ---
const big = modules.filter(m => m.size >= THRESHOLD);
big.sort((a, b) => b.size - a.size);

// --- Categorize ---
function categorize(mod) {
  // Sample broader: first 80 lines for better heuristics
  const sample = lines.slice(mod.startLine, Math.min(mod.startLine + 80, mod.endLine)).join("\n");
  // Also check whole module content for definitive keywords
  const full = lines.slice(mod.startLine, mod.endLine + 1).join("\n");

  // === HIGHLIGHT.JS ===
  if (sample.includes("$pattern") || sample.includes("COMMENT(") || (sample.includes("className") && sample.includes("begin")))
    if (sample.includes(".exports") || sample.includes("keywords") || sample.includes("variants"))
      return "vendor/hljs";
  if (sample.includes("highlightElement") || sample.includes("registerLanguage")) return "vendor/hljs";
  if (full.includes("DECISION_BLOCK_") || full.includes("MONITOR_BLOCK_") || full.includes("NOTICE_BLOCK_")) return "vendor/hljs";
  if (full.includes("AbsoluteCorrelation") || full.includes("AccuracyGoal")) return "vendor/hljs";
  if (full.includes("\u0432\u0435\u0431\u043A\u043B\u0438\u0435\u043D\u0442") || full.includes("\u043D\u0430\u043A\u043B\u0438\u0435\u043D\u0442\u0435")) return "vendor/hljs";
  if (sample.includes("\u0410-\u042F") || sample.includes("\u0434\u0430\u043B\u0435\u0435")) return "vendor/hljs";
  if (full.includes("$pattern") && full.includes("keywords")) return "vendor/hljs";
  // hljs: language keywords — "while","finally","function","return","void","else","break","catch" pattern
  if (sample.includes('"while"') && sample.includes('"finally"') && sample.includes('"void"') && sample.includes('"break"')) return "vendor/hljs";
  // hljs: Processing, setup draw
  if (sample.includes("Gaussian") && sample.includes("FloatDict")) return "vendor/hljs";
  // hljs: CSS properties list
  if (full.includes('"align-content"') && full.includes('"animation-delay"') && full.includes('"border-radius"')) return "vendor/hljs";
  // hljs: C# keywords
  if (full.includes('"breakpoint"') && full.includes('"byref"') && full.includes('"changecompany"')) return "vendor/hljs";
  // hljs: Steam API / game-related constants
  if (full.includes("AcceptedForGameRankedByAcceptanceDate") || full.includes("CreatedByFollowedUsersRankedByPublicationDate")) return "vendor/hljs";

  // === AWS SDK / @smithy ===
  if (sample.includes("CredentialsProvider") || sample.includes("@aws-sdk") || sample.includes("Bedrock")) return "vendor/aws";
  if (sample.includes("NodeDeprecationWarning") && sample.includes("AWS SDK")) return "vendor/aws";
  if (sample.includes("@smithy/core") || sample.includes("smithy.ts.sdk")) return "vendor/aws";
  if (sample.includes("AuthSchemeProvider") && sample.includes("UseFIPS")) return "vendor/aws";
  if (sample.includes("DualStack") && sample.includes("UseFIPS") && sample.includes("Region")) return "vendor/aws";
  if (sample.includes("PartitionResult") && sample.includes("UseFIPS")) return "vendor/aws";
  if (sample.includes("PartitionResult") && sample.includes("UseDualStack")) return "vendor/aws";
  if (sample.includes("sigv4") && (sample.includes("us-east-1") || sample.includes("Region"))) return "vendor/aws";
  if (sample.includes("X-Amz-Algorithm") || sample.includes("X-Amz-Credential")) return "vendor/aws";
  if (sample.includes("aws4_request") || sample.includes("x-amz-date")) return "vendor/aws";
  if (sample.includes("AwsSdkSigV") || sample.includes("aws.auth#sigv4")) return "vendor/aws";
  if (sample.includes("AWS_PROFILE") || sample.includes("AWS_CONFIG_FILE")) return "vendor/aws";
  if (sample.includes("amazonaws.com") || sample.includes("api.aws")) return "vendor/aws";
  if (sample.includes("AwsCrc") || sample.includes("RawSha")) return "vendor/aws";
  if (sample.includes("MergedTraits") && sample.includes("Middleware") && sample.includes("SensitiveInformation")) return "vendor/aws";
  if (sample.includes("HttpAuthScheme") && sample.includes("IdentityProvider")) return "vendor/aws";
  if (sample.includes("ExpiredTokenException") || sample.includes("PackedPolicyTooLargeException")) return "vendor/aws";
  if (sample.includes("NoOpLogger") && sample.includes("SmithyContext")) return "vendor/aws";
  if (sample.includes("EventStream") && sample.includes("EventBody")) return "vendor/aws";
  if (sample.includes("ADAPTIVE") && sample.includes("STANDARD") && sample.includes("TokenBucket")) return "vendor/aws";
  if (sample.includes("RetryTokens") && sample.includes("MaxAttempts")) return "vendor/aws";
  if (sample.includes("BodyLength") && sample.includes("DefaultsModeConfig")) return "vendor/aws";
  if (sample.includes("ByType") && sample.includes("HttpHandler") && sample.includes("HttpClientConfig")) return "vendor/aws";
  if (sample.includes("ClockSkewError") || sample.includes("SkewCorrected")) return "vendor/aws";
  if (sample.includes("ArrayBlobAdapter") && sample.includes("PayloadCodec")) return "vendor/aws";
  if (sample.includes("BlobSchema") && sample.includes("SmithyContext")) return "vendor/aws";

  // === gRPC ===
  if (sample.includes("LogVerbosity") || sample.includes("ChannelCredentials") || sample.includes("grpc")) return "vendor/grpc";
  if (sample.includes("ClientDuplexStreamImpl") || sample.includes("ServerDuplexStreamImpl")) return "vendor/grpc";
  if (sample.includes("SubchannelAddress") || sample.includes("LoadBalancerName")) return "vendor/grpc";
  if (sample.includes("InterceptingCall") || sample.includes("InterceptorConfigurationError")) return "vendor/grpc";
  if (sample.includes("ChannelImplementation") || sample.includes("FactoryOverride")) return "vendor/grpc";
  if (sample.includes("StreamDecoder") && sample.includes("MESSAGE")) return "vendor/grpc";
  if (sample.includes("ConnectionError") && sample.includes("CancellationStrategy") && sample.includes("MessageConnection")) return "vendor/grpc";

  // === Protobuf ===
  if (sample.includes("protobuf") || sample.includes("FieldDescriptorProto")) return "vendor/proto";
  if (sample.includes("H.proto") && sample.includes("AnyValue")) return "vendor/proto";
  if (sample.includes("ReflectionObject") && sample.includes("PACKED")) return "vendor/proto";
  if (sample.includes("proto3") && (sample.includes("Edition") || sample.includes("Enum"))) return "vendor/proto";
  if (sample.includes("Namespace") && sample.includes("nestedArray") && sample.includes("RecursiveResolve")) return "vendor/proto";
  if (sample.includes("FieldsById") && sample.includes("Reserved")) return "vendor/proto";
  if (sample.includes("LongBits") && (sample.includes("ToHash") || sample.includes("ByteBuffer"))) return "vendor/proto";
  if (sample.includes("__isLong__") && sample.includes("WebAssembly")) return "vendor/proto";
  if (sample.includes("IdempotencyLevel") && sample.includes("FileDescriptorSet")) return "vendor/proto";
  if (sample.includes("Service") && sample.includes("RecursiveFeatureResolution") && sample.includes("methods")) return "vendor/proto";
  if (sample.includes('"switch(d%s){"') || full.includes('"case%j:"')) return "vendor/proto";

  // === Zod ===
  if (sample.includes("_zod") || sample.includes("ZodError")) return "vendor/zod";

  // === Crypto / PKI / TLS (node-forge) ===
  if (sample.includes("ssh-") || sample.includes("cipher") || sample.includes("ECDH")) return "vendor/crypto";
  if (sample.includes("f$.pki") || sample.includes("f$.asn1") || sample.includes("forge")) return "vendor/crypto";
  if (sample.includes("hmac") && sample.includes("createBuffer")) return "vendor/crypto";
  if (sample.includes("BigInteger") && (sample.includes("KeyOid") || sample.includes("PrivateKey"))) return "vendor/crypto";
  if (sample.includes("PKCS7") || sample.includes("PKCS#7") || sample.includes("ContentInfo")) return "vendor/crypto";
  if (sample.includes("AlgorithmIdentifier") && sample.includes("EncryptedPrivateKeyInfo")) return "vendor/crypto";
  if (sample.includes("RSAPrivateKey") || sample.includes("PrivateKeyInfo")) return "vendor/crypto";
  if (sample.includes("CERTIFICATE") && sample.includes("DEK-Info")) return "vendor/crypto";
  if (sample.includes("OID") && full.includes("rsaEncryption")) return "vendor/crypto";
  if (sample.includes("saltLength") && sample.includes("ByteBuffer")) return "vendor/crypto";
  if (sample.includes("sha256") || sample.includes("SHA-384") || sample.includes("SHA-512")) return "vendor/crypto";
  if (sample.includes("sha1") && (sample.includes("Derived") || sample.includes("PureJavaScript"))) return "vendor/crypto";
  if (sample.includes("BigInteger") && sample.includes("Microsoft Internet Explorer")) return "vendor/crypto";
  if (sample.includes("HS256") && sample.includes("RS256") && sample.includes("KeyObject")) return "vendor/crypto";
  if (sample.includes("HS256") && sample.includes("RS256") && sample.includes("InsecureKeySizes")) return "vendor/crypto";
  if (sample.includes("BITSTRING") && sample.includes("SEQUENCE") && sample.includes("UNIVERSAL")) return "vendor/crypto";

  // === AJV (JSON Schema validation) ===
  if (sample.includes("ajv") || (sample.includes("$ref") && sample.includes("schema"))) return "vendor/ajv";
  if (sample.includes("KeywordCxt") && sample.includes("ValidateCode")) return "vendor/ajv";
  if (sample.includes("SchemaTypes") && sample.includes("JSONType")) return "vendor/ajv";
  if (sample.includes("KeywordCode") && sample.includes("ValidationError")) return "vendor/ajv";
  if (sample.includes("AdditionalProperties") || (sample.includes("KeywordCxt") && sample.includes("CodeGen"))) return "vendor/ajv";
  if (sample.includes("ValueScope") && sample.includes("CodeGen")) return "vendor/ajv";
  if (sample.includes("EsmExportName") && sample.includes("CodeGen")) return "vendor/ajv";
  if (sample.includes("regexpCode") && sample.includes("ValueScope")) return "vendor/ajv";
  if (sample.includes("format") && sample.includes("date-time") && sample.includes("uri-reference") && sample.includes("json-pointer")) return "vendor/ajv";

  // === React / React DOM (Ink uses React) ===
  if (sample.includes("Minified React error") || sample.includes("react.element")) return "vendor/react";
  if (sample.includes("react.transitional.element") || sample.includes("react.portal")) return "vendor/react";

  // === HTML parser (parse5) ===
  if (sample.includes("TAG_NAMES") || sample.includes("NAMESPACES") || sample.includes("IN_BODY_MODE")) return "vendor/parse5";
  if (sample.includes("DTD") && sample.includes("HTML")) return "vendor/parse5";
  if (sample.includes("TreeAdapter") || (sample.includes("DOCUMENT") && sample.includes("DocumentFragment") && sample.includes("QUIRKS"))) return "vendor/parse5";
  if (sample.includes("noncharacter-in-input-stream") || sample.includes("eof-before-tag-name")) return "vendor/parse5";
  if (sample.includes("NoahArkCondition") || sample.includes("ActiveFormattingElements")) return "vendor/parse5";
  if (sample.includes("OverriddenMethods") && sample.includes("Tracker") && sample.includes("StartTagToken")) return "vendor/parse5";

  // === HTML entities ===
  if (full.includes("Acirc") && full.includes("acirc")) return "vendor/entities";
  if (full.includes("CirclePlus") || (full.includes("59, 1,") && full.length > 40000)) return "vendor/entities";
  if (sample.match(/^\s+\d+:\s+\d+,$/m)) return "vendor/entities";

  // === XML parser (fast-xml-parser) ===
  if (sample.includes("XMLBuilder") || sample.includes("XMLParser") || sample.includes("XMLValidator")) return "vendor/xml";

  // === XML / DOM ===
  if (sample.includes("DOMImplementation") && sample.includes("XMLReader")) return "vendor/dom";
  if (sample.includes("DOMParser") && sample.includes("plist")) return "vendor/dom";
  if (sample.includes("#document") && sample.includes("DocumentFragment") && sample.includes("ElementsByTagName")) return "vendor/dom";
  if (sample.includes("ApiWritable") && sample.includes("CustomEvent") && sample.includes("UIEvent")) return "vendor/dom";
  if (sample.includes("INDEX_SIZE_ERR") || sample.includes("HIERARCHY_REQUEST_ERR")) return "vendor/dom";
  if (sample.includes("DOMString") && sample.includes("HIERARCHY") && sample.includes("INVALID")) return "vendor/dom";
  if (sample.includes("HierarchyRequestError") && sample.includes("MATHML")) return "vendor/dom";
  if (sample.includes("NodeIterator") && sample.includes("FILTER") && sample.includes("ToShow")) return "vendor/dom";
  if (sample.includes("ACCEPT") && sample.includes("REJECT") && sample.includes("Sibling") && sample.includes("ToShow")) return "vendor/dom";
  if (sample.includes("ChildNodes") && sample.includes("DOCUMENT") && sample.includes("ELEMENT") && sample.includes("FRAGMENT")) return "vendor/dom";
  if (sample.includes("CharacterAfterDoctypeSystemIdentifier")) return "vendor/dom";
  if (sample.includes("ClosingOfEmptyComment") || sample.includes("DoctypeIdentifier")) return "vendor/dom";

  // === Google Auth (google-auth-library) ===
  if (sample.includes("GoogleAuth") || sample.includes("GoogleToken")) return "vendor/gauth";
  if (sample.includes("JWTAccess") || sample.includes("JWTAccessWithScope")) return "vendor/gauth";
  if (sample.includes("GCP") && sample.includes("Metadata") && sample.includes("computeMetadata")) return "vendor/gauth";
  if (sample.includes("BaseExternalAccountClient") && sample.includes("EXTERNAL")) return "vendor/gauth";
  if (sample.includes("AwsClient") && sample.includes("DownscopedClient")) return "vendor/gauth";
  if (sample.includes("Impersonated") && sample.includes("IMPERSONATED")) return "vendor/gauth";
  if (sample.includes("AuthClient") && sample.includes("CodeChallengeMethod")) return "vendor/gauth";
  if (sample.includes("ExternalAccountAuthorizedUserClient")) return "vendor/gauth";
  if (sample.includes("ClientSecretPost") && sample.includes("ClientSecretBasic")) return "vendor/gauth";
  if (sample.includes("ExecutableError") && sample.includes("EXECUTABLES")) return "vendor/gauth";
  if (sample.includes("AccessBoundary") && sample.includes("DownscopedAccessToken")) return "vendor/gauth";
  if (sample.includes("OAuthClientAuthHandler") || sample.includes("ClientAuthenticationOptions")) return "vendor/gauth";
  if (sample.includes("GaxiosError") && sample.includes("ErrorRedactor")) return "vendor/gauth";
  if (sample.includes("authorized_user") && sample.includes("refresh_token")) return "vendor/gauth";
  if (sample.includes("AwsRequestSigner") && sample.includes("x-amz-date") && sample.includes("HMAC")) return "vendor/gauth";

  // === OpenTelemetry ===
  if (sample.includes("OTEL_EXPORTER") || sample.includes("AggregationTemporality")) return "vendor/otel";
  if (sample.includes("ExportResultCode") && sample.includes("HrTime")) return "vendor/otel";
  if (sample.includes("SpanContext") && sample.includes("ExportTraceServiceRequest")) return "vendor/otel";
  if (sample.includes("DiagConsoleLogger") || sample.includes("ProxyTracer")) return "vendor/otel";
  if (sample.includes("ExportMetricsServiceRequest") || sample.includes("InstrumentationScope")) return "vendor/otel";
  if (sample.includes("PrometheusSerializer") && sample.includes("Histogram")) return "vendor/otel";
  if (sample.includes("MetricReader") && sample.includes("PROMETHEUS")) return "vendor/otel";
  if (sample.includes("ExponentialHistogram") && sample.includes("Aggregator")) return "vendor/otel";
  if (sample.includes("HistogramAccumulation") && sample.includes("Aggregator")) return "vendor/otel";
  if (sample.includes("DefaultAggregation") && sample.includes("InstrumentType")) return "vendor/otel";
  if (sample.includes("DeltaTemporalitySelector") || sample.includes("CumulativeTemporalitySelector")) return "vendor/otel";
  if (sample.includes("Resource") && sample.includes("FromDetectedResource") && sample.includes("AttributesPending")) return "vendor/otel";
  if (sample.includes("ASPNETCORE") || sample.includes("CLOUDPLATFORMVALUES") || sample.includes("DYNAMODB")) return "vendor/otel";
  if (sample.includes("OTLP") && (sample.includes("GRPC") || sample.includes("ENDPOINT"))) return "vendor/otel";

  // === Sharp (image processing) ===
  if (sample.includes("Fuller") && sample.includes("Lovell")) return "vendor/sharp";
  if (sample.includes("@img/sharp")) return "vendor/sharp";
  if (sample.includes("sharp") && sample.includes("0.34")) return "vendor/sharp";
  if (sample.includes("COLORTYPE") && sample.includes("GRAYSCALE")) return "vendor/sharp";
  if (sample.includes("Deflate") && sample.includes("COLORTYPE")) return "vendor/sharp";
  if (sample.includes("Inflate") && sample.includes("Palette") && sample.includes("Transparency")) return "vendor/sharp";
  if (sample.includes("IHDR") && sample.includes("Signature")) return "vendor/sharp";
  if (sample.includes("Ran out of data") && sample.includes("unrecognised depth")) return "vendor/sharp";
  if (sample.includes("FloatBE") && sample.includes("FloatLE") && mod.size > 5000) return "vendor/sharp";
  if (sample.includes("EncodedBits") && sample.includes("Positions")) return "vendor/sharp";
  if (sample.includes("QR") && sample.includes("ALPHANUMERIC") && sample.includes("NUMERIC")) return "vendor/sharp";
  if (sample.includes("ScalarIndent") || sample.includes("FilterLine") && sample.includes("FilterType")) return "vendor/sharp";
  if (sample.includes("DataSize") && sample.includes("StreamLike")) return "vendor/sharp";
  if (sample.includes("NonGlibcLinuxSync") && sample.includes("darwin-arm64")) return "vendor/sharp";

  // === YAML (yaml library) ===
  if (sample.includes("YAMLParseError") || sample.includes("YAMLWarning")) return "vendor/yaml";
  if (sample.includes("YAMLMap") || sample.includes("YAMLSeq")) return "vendor/yaml";
  if (sample.includes("FOLDED") && sample.includes("LITERAL") && sample.includes("Scalar")) return "vendor/yaml";
  if (sample.includes("tag:yaml.org")) return "vendor/yaml";
  if (sample.includes("INDENT") && sample.includes("Indent") && sample.includes("Newline") && sample.includes("ANCHOR")) return "vendor/yaml";
  if (sample.includes("Directives") && sample.includes("SourceTokens") && sample.includes("Schema")) return "vendor/yaml";
  if (sample.includes("%YAML") && sample.includes("%TAG")) return "vendor/yaml";
  if (sample.includes("ChompKeep") && sample.includes("Indent")) return "vendor/yaml";
  if (sample.includes("QuotedAsJSON") && sample.includes("ContentWidth")) return "vendor/yaml";
  if (sample.includes("MISSING_CHAR") && sample.includes("TAB_AS_INDENT")) return "vendor/yaml";
  if (sample.includes("block-map") && sample.includes("flow sequence")) return "vendor/yaml";
  if (sample.includes("block-seq") && sample.includes("IMPLICIT") && sample.includes("EmptyNode")) return "vendor/yaml";

  // === Commander.js (CLI framework) ===
  if (sample.includes("CommanderError") && sample.includes("Command")) return "vendor/commander";
  if (sample.includes("HelpCommand") && sample.includes("GlobalOptions") && sample.includes("Subcommands")) return "vendor/commander";
  if (sample.includes("InvalidArgumentError") && sample.includes("OptionMandatory")) return "vendor/commander";

  // === Semver ===
  if (sample.includes("SemVer") && sample.includes("Prerelease") && sample.includes("Invalid major version")) return "vendor/semver";
  if (sample.includes("HYPHENRANGE") && sample.includes("SemVer")) return "vendor/semver";
  if (sample.includes("NUMERICIDENTIFIER") && sample.includes("PRERELEASELOOSE") && sample.includes("MAINVERSION")) return "vendor/semver";
  if (sample.includes(">=0.0.0-0") && sample.includes("Prerelease")) return "vendor/semver";

  // === LSP (Language Server Protocol, vscode-languageserver) ===
  if (sample.includes("AbstractMessageReader") || sample.includes("AbstractMessageWriter")) return "vendor/lsp";
  if (sample.includes("MessageConnection") && sample.includes("CancellationStrategy")) return "vendor/lsp";
  if (sample.includes("IPCMessageReader") || sample.includes("PortMessageReader")) return "vendor/lsp";
  if (sample.includes("ConnectionError") && sample.includes("MessageStrategy")) return "vendor/lsp";
  if (sample.includes("ErrorCodes") && sample.includes("NotificationType") && sample.includes("MessageReadError")) return "vendor/lsp";

  // === Color conversion (color-convert, ansi-styles) ===
  if (sample.includes('"cmyk"') && sample.includes('"keyword"') && sample.includes('"ansi256"') && sample.includes('"channels"')) return "vendor/color";
  if (sample.includes('"ansi"') && sample.includes('"ansi256"') && sample.includes('"ansi16m"')) return "vendor/color";
  if (sample.includes('"ansi16"') && sample.includes('"ansi"') && mod.size < 5000) return "vendor/color";
  if (sample.includes("[30m") && sample.includes("[31m") && sample.includes("[37m")) return "vendor/color";
  if (sample.includes("#0000CC") && sample.includes("#0000FF")) return "vendor/color";
  if (sample.includes("Colors") && sample.includes("[3") && sample.includes("[0m")) return "vendor/color";
  if (sample.includes("enabled") && sample.includes("Colors") && mod.size < 5000) return "vendor/color";

  // === XSS / sanitization ===
  if (sample.includes("FilterCSS") && sample.includes("IgnoreTag")) return "vendor/xss";
  if (sample.includes("DefaultWhiteList") && sample.includes("FilterCSS")) return "vendor/xss";
  if (sample.includes("cssFilter") && sample.includes("onIgnoreTagAttr")) return "vendor/xss";
  if (sample.includes("ParsedText") && sample.includes("Styles") && sample.includes("!important")) return "vendor/xss";

  // === fs-extra / graceful-fs ===
  if (sample.includes("EEXIST") && sample.includes("ENOTEMPTY") && sample.includes("rmdir")) return "vendor/fs";
  if (sample.includes("graceful-fs") || sample.includes("GRACEFUL")) return "vendor/fs";
  if (sample.includes("clobber") && sample.includes("overwrite") && sample.includes("copy")) return "vendor/fs";
  if (sample.includes("ENOENT") && sample.includes("move") && sample.includes("ChangingCase")) return "vendor/fs";
  if (sample.includes("ECOMPROMISED") && sample.includes("ELOCKED")) return "vendor/fs";
  if (sample.includes("PLATFORM") && sample.includes("SYMLINK") && sample.includes("O_SYMLINK")) return "vendor/fs";

  // === HTTP / networking ===
  if (sample.includes("ECONNRESET") && sample.includes("ETIMEDOUT") && sample.includes("http")) return "vendor/http";
  if (sample.includes("https-proxy-agent") || sample.includes("HttpsProxyAgent")) return "vendor/http";
  if (sample.includes("http-proxy-agent") || sample.includes("HttpProxyAgent")) return "vendor/http";
  if (sample.includes("AgentBaseInternalState") && sample.includes("SecureEndpoint")) return "vendor/http";
  if (sample.includes("BodyBuffers") && sample.includes("REDIRECTS") && sample.includes("NativeResponse")) return "vendor/http";

  // === node-ignore (gitignore pattern matching) ===
  if (sample.includes("node-ignore")) return "vendor/ignore";
  if (sample.includes("ANCHORED") && sample.includes("GLOBAL") && sample.includes("REPLACEMENTS") && sample.includes("BACKREF")) return "vendor/ignore";

  // === Minimatch / glob patterns ===
  if (sample.includes("Globstar") && sample.includes("BRACKET") && sample.includes("EXCLAMATION")) return "vendor/glob";
  if (sample.includes("picomatch") || (sample.includes("PosixSlashes") && sample.includes("RegExp"))) return "vendor/glob";

  // === tslib (TypeScript helpers) ===
  if (sample.includes('"AS IS"') && sample.includes("tslib") && sample.includes("Corporation")) return "vendor/tslib";

  // === flora-colossus / electron deps ===
  if (sample.includes("flora-colossus") || sample.includes("NativeModuleType")) return "vendor/electron";

  // === es-abstract / get-intrinsics ===
  if (sample.includes("GetIntrinsic") || sample.includes("AggregateError") && sample.includes("%Array%") && sample.includes("%ArrayBuffer%")) return "vendor/es";
  if (sample.includes("StackTrace") && sample.includes("bootstrap_node") && sample.includes("internals")) return "vendor/es";
  if (sample.includes("[object Arguments]") && sample.includes("[object GeneratorFunction]")) return "vendor/es";
  if (sample.includes("\\ud800-\\udfff") && sample.includes("\\u0300-\\u036f")) return "vendor/es";
  if (sample.includes("BigNumber") && sample.includes("GroupSeparator") && mod.size > 30000) return "vendor/es";

  // === EventEmitter ===
  if (sample.includes("EventEmitter") && sample.includes("MaxListeners") && mod.size < 5000) return "vendor/events";
  if (sample.includes("EventListener") && sample.includes("Target") && sample.includes("mouseover")) return "vendor/events";

  // === misc utility (uri, qs, etc) ===
  if (sample.includes("AuthorityBased") && sample.includes("Hierarchical") && sample.includes("Encode")) return "vendor/uri";
  if (sample.includes("DotSegments") && sample.includes("ComponentEncoding")) return "vendor/uri";

  // === JWT / jose ===
  if (sample.includes("HS256") && sample.includes("RS256") && sample.includes("ES256") && sample.includes("KeyObject")) return "vendor/jwt";
  if (sample.includes("HS256") && sample.includes("RS256") && sample.includes("InsecureKeySizes")) return "vendor/jwt";

  // === xmlbuilder2 / xmldom ===
  if (sample.includes("LegalChar") && sample.includes("LegalName") && sample.includes("Validation")) return "vendor/xmlbuilder";
  if (sample.includes("DocType") && sample.includes("Entity") && sample.includes("Missing")) return "vendor/xmlbuilder";
  if (sample.includes("DocType") && sample.includes("TypeInfo") && sample.includes("Missing")) return "vendor/xmlbuilder";
  if (sample.includes("ClosingCommentTag") && sample.includes("PLAINTEXT")) return "vendor/xmlbuilder";
  if (sample.includes("Attribute") && sample.includes("ELEMENT") && sample.includes("NamespaceURI") && sample.includes("NoahArkCondition")) return "vendor/xmlbuilder";
  if (sample.includes("CloseTag") && sample.includes("DOCTYPE") && sample.includes("InsideTag")) return "vendor/xmlbuilder";
  if (sample.includes("?xml") && sample.includes("DataCallback") && sample.includes("Options")) return "vendor/xmlbuilder";

  // === Claude Code core (tool definitions, agent logic, etc) ===
  if (sample.includes("CLAUDE") || sample.includes("Committing") && sample.includes("DELEGATION") && sample.includes("Discussing")) return "core";

  // === libc detection ===
  if (sample.includes("glibc") && sample.includes("musl") && sample.includes("ld-musl-")) return "vendor/libc";

  // === LRU Cache ===
  if (sample.includes("LRUCache") && sample.includes("LinkedMap")) return "vendor/lru";

  // === more parse5 / HTML DTD ===
  if (sample.includes("-//ietf//dtd html") || sample.includes("DOCUMENT") && full.includes("-//ietf//dtd html")) return "vendor/parse5";
  if (sample.includes("ByLName") && sample.includes("ByQName") && sample.includes("NAMESPACE")) return "vendor/parse5";
  if (sample.includes("ASCIIUpperCase") && sample.includes("ByLName")) return "vendor/parse5";

  // === more proto / protobuf ===
  if (sample.includes('"proto2"') && sample.includes("CommentMode")) return "vendor/proto";
  if (sample.includes("LongBits") && sample.includes("Buffer")) return "vendor/proto";
  if (full.includes('"switch(%s){"') || full.includes('"case%j:"')) return "vendor/proto";
  if (sample.includes("Properties") && full.includes('"duplicate id "')) return "vendor/proto";
  if (sample.includes("StringValue") && sample.includes("Properties") && mod.size < 4000) return "vendor/proto";

  // === more gRPC ===
  if (sample.includes("DEADLINE") && sample.includes("Deadline exceeded")) return "vendor/grpc";
  if (sample.includes("ServiceConfig") && sample.includes("RetryThrottling")) return "vendor/grpc";
  if (sample.includes("DebugBackend") && sample.includes("LogSeverity")) return "vendor/grpc";

  // === more AWS ===
  if (sample.includes("AWS_LAMBDA") && sample.includes("TRACE_ID")) return "vendor/aws";
  if (sample.includes("Bucket") && sample.includes("CredentialScope") && sample.includes("DisableMRAP")) return "vendor/aws";
  if (sample.includes("smithy-protocol") && sample.includes("rpc-v2-cbor")) return "vendor/aws";
  if (sample.includes("AbortError") && sample.includes("TimeoutError") && sample.includes("Provider")) return "vendor/aws";
  if (sample.includes("EndpointError") && sample.includes("hostname") && sample.includes("endpoints")) return "vendor/aws";

  // === more Google Auth ===
  if (sample.includes("DefaultAwsSecurityCredentialsSupplier") && sample.includes("x-aws-ec2-metadata-token")) return "vendor/gauth";
  if (sample.includes("https") && sample.includes("__esModule") && full.includes("GOOGLE_API_USE_CLIENT_CERTIFICATE")) return "vendor/gauth";

  // === more otel ===
  if (sample.includes("PrometheusSerializer") && sample.includes("DataPointType")) return "vendor/otel";
  if (sample.includes("Bucket") && sample.includes("Buckets") && mod.size < 5000) return "vendor/otel";

  // === more ajv ===
  if (sample.includes("KeywordCxt") && sample.includes("FunctionCode")) return "vendor/ajv";
  if (sample.includes("SchemaPath") && sample.includes("Formats") && sample.includes("fDef")) return "vendor/ajv";
  if (sample.includes("__esModule") && sample.includes("func") && sample.includes("MissingProp") && sample.includes("PropertyInData")) return "vendor/ajv";

  // === more crypto / forge ===
  if (sample.includes("sha1") && sample.includes("MessageLength") && sample.includes("Buffer")) return "vendor/crypto";
  if (sample.includes("md5") && sample.includes("MessageLength") && sample.includes("Buffer")) return "vendor/crypto";
  if (sample.includes("RSAES-OAEP")) return "vendor/crypto";

  // === more yaml ===
  if (sample.includes("scalar") && sample.includes("single-quoted-scalar") && sample.includes("double-quoted-scalar")) return "vendor/yaml";
  if (sample.includes("Collection") && sample.includes("REMOVE") && sample.includes("break visit")) return "vendor/yaml";
  if (sample.includes("process") && sample.includes("space") && sample.includes("scalar") && sample.includes("alias")) return "vendor/yaml";

  // === more lsp ===
  if (sample.includes("AbstractMessageBuffer") && sample.includes("ReadHeaders")) return "vendor/lsp";
  if (sample.includes("AbstractMessageBuffer") && sample.includes("TextDecoder") && sample.includes("Disposable")) return "vendor/lsp";

  // === more dom / htmlparser2 ===
  if (sample.includes("DocumentPosition") && sample.includes("Sibling")) return "vendor/dom";
  if (sample.includes("Attribute") && sample.includes("ELEMENT") && sample.includes("LowerCase") && full.includes('"use-credentials"')) return "vendor/dom";
  if (sample.includes("Attribute") && sample.includes("unsigned long") && sample.includes("LowerCase")) return "vendor/dom";

  // === more xmlbuilder / sax ===
  if (sample.includes("NAMESPACE") && sample.includes("Builder") && sample.includes("entity not found:")) return "vendor/xmlbuilder";
  if (sample.includes("CDATA") && sample.includes("?xml") && sample.includes("DOCTYPE")) return "vendor/xmlbuilder";
  if (sample.includes("Cannot insert elements at root level")) return "vendor/xmlbuilder";

  // === multipart / form-data ===
  if (sample.includes("PartHeader") && sample.includes("PartFooter") && sample.includes("Retriever")) return "vendor/http";
  if (sample.includes("Stream") && sample.includes("Nq8") && sample.includes("drain")) return "vendor/http";

  // === retry ===
  if (sample.includes("RetryOperation") && sample.includes("Timeouts")) return "vendor/retry";

  // === glob / minimatch (DiH patterns) ===
  if (sample.includes("(?=.)") && sample.includes("[^/]") && sample.includes("\\.{1,2}")) return "vendor/glob";
  if (full.includes("ANCHORED") && full.includes("LITERAL") && full.includes("REPLACEMENTS")) return "vendor/glob";

  // === shell-quote (Csq) ===
  if (full.includes('"\\|\\|"') && full.includes('"\\&\\&"') && full.includes('"\\|\\&"')) return "vendor/shell";

  // === tslib catch-all ===
  if (sample.includes("tslib") && sample.includes("exports") && sample.includes("__esModule")) return "vendor/tslib";
  if (sample.includes("__esModule") && full.includes("__createBinding") && full.includes("__exportStar") && mod.size > 15000) return "vendor/tslib";

  // === Long.js / protobuf Long ===
  if (sample.includes("__isLong__")) return "vendor/proto";

  // === BigNumber ===
  if (sample.includes("BigNumber") && sample.includes("GroupSeparator")) return "vendor/es";
  if (sample.includes("BigNumber") && sample.includes("CodeAt") && sample.includes("Finite")) return "vendor/es";

  // === lodash utilities ===
  if (sample.includes("\\ud800-\\udfff") && sample.includes("[object Symbol]")) return "vendor/lodash";

  // === QR code ===
  if (sample.includes("ALPHANUMERIC") && sample.includes("KanjiModeEnabled")) return "vendor/qr";
  if (sample.includes("PenaltyN") && sample.includes("PATTERN")) return "vendor/qr";
  if (sample.includes("EncodedBits")) return "vendor/qr";

  // === png.js ===
  if (sample.includes("FilterLine") && sample.includes("FilterType") && sample.includes("ImagePasses")) return "vendor/sharp";
  if (sample.includes("gamma") && sample.includes("parsed") && sample.includes("metadata")) return "vendor/sharp";

  // === debug (log levels) ===
  if (sample.includes('"none"') && sample.includes('"error"') && sample.includes('"warning"') && sample.includes('"debug"') && sample.includes('"verbose"')) return "vendor/log";

  // === misc uri ===
  if (sample.includes("AuthorityBased") && sample.includes("Encode") && sample.includes("Absolute")) return "vendor/uri";

  // === emoji regex ===
  if (full.includes("\\uD83C\\uDFF4\\uDB40")) return "vendor/emoji";

  // === color-string ===
  if (sample.includes("transparent") && sample.includes("Math.round") && sample.includes("rgba(")) return "vendor/color";

  // === more hljs (C# keywords rz7) ===
  if (sample.includes('"bool"') && sample.includes('"byte"') && sample.includes('"decimal"') && sample.includes('"delegate"')) return "vendor/hljs";

  // === picomatch/braces (i17) ===
  if (sample.includes("REPLACEMENTS") && sample.includes("SPECIAL") && sample.includes("Expected a string")) return "vendor/glob";

  // === base64/encoding ===
  if (sample.includes("Decode") && sample.includes("Encode") && sample.includes("number") && mod.size < 4000) return "vendor/encoding";

  return "chunks";
}

// --- Clean dirs ---
const allDirs = [
  "vendor/hljs", "vendor/aws", "vendor/grpc", "vendor/proto", "vendor/zod",
  "vendor/crypto", "vendor/ajv", "vendor/react", "vendor/parse5", "vendor/entities",
  "vendor/xml", "vendor/dom", "vendor/gauth", "vendor/otel", "vendor/sharp",
  "vendor/yaml", "vendor/commander", "vendor/semver", "vendor/lsp", "vendor/color",
  "vendor/xss", "vendor/fs", "vendor/http", "vendor/ignore", "vendor/glob",
  "vendor/tslib", "vendor/electron", "vendor/es", "vendor/events", "vendor/uri",
  "vendor/jwt", "vendor/xmlbuilder", "vendor/libc", "vendor/lru", "vendor/retry",
  "vendor/shell", "vendor/lodash", "vendor/qr", "vendor/log", "vendor/emoji",
  "vendor/encoding",
  "vendor", "chunks", "core"
];
for (const d of allDirs) {
  fs.rmSync(path.join(ROOT, "src", d), { recursive: true, force: true });
}

// --- Extract ---
const extractions = [];
const cats = {};

for (const mod of big) {
  const cat = categorize(mod);
  const outDir = path.join(ROOT, "src", cat);
  fs.mkdirSync(outDir, { recursive: true });

  const code = lines.slice(mod.startLine, mod.endLine + 1).join("\n");
  fs.writeFileSync(path.join(outDir, `${mod.name}.js`), code + "\n");

  extractions.push({ ...mod, cat });
  if (!cats[cat]) cats[cat] = { count: 0, size: 0 };
  cats[cat].count++;
  cats[cat].size += mod.size;
}

// --- Summary ---
let totalSize = 0;
console.log(`Extracted ${extractions.length} modules > ${THRESHOLD / 1024} KB:\n`);
for (const [cat, info] of Object.entries(cats).sort((a, b) => b[1].size - a[1].size)) {
  console.log(`  ${cat.padEnd(18)} ${String(info.count).padStart(3)} modules  ${(info.size / 1024).toFixed(0).padStart(7)} KB`);
  totalSize += info.size;
}
console.log(`  ${"TOTAL".padEnd(18)} ${String(extractions.length).padStart(3)} modules  ${(totalSize / 1024).toFixed(0).padStart(7)} KB  (${(totalSize / content.length * 100).toFixed(0)}% of source)\n`);

// --- Build cli_split.js ---
// Sort by line number
extractions.sort((a, b) => a.startLine - b.startLine);

// Check no overlaps
for (let i = 1; i < extractions.length; i++) {
  if (extractions[i].startLine <= extractions[i - 1].endLine) {
    console.error(`OVERLAP: ${extractions[i - 1].name}(L${extractions[i-1].startLine}-${extractions[i-1].endLine}) and ${extractions[i].name}(L${extractions[i].startLine}-${extractions[i].endLine})`);
    process.exit(1);
  }
}

const newLines = [];
let skip = -1;

for (let i = 0; i < lines.length; i++) {
  if (i <= skip) continue;

  const ext = extractions.find(e => e.startLine === i);
  if (ext) {
    newLines.push(`${ext.indent}/* [${ext.cat}/${ext.name}] */ eval(require("fs").readFileSync(require("path").resolve(__dirname, "${ext.cat}/${ext.name}.js"), "utf8"));`);
    skip = ext.endLine;
  } else {
    newLines.push(lines[i]);
  }
}

const result = newLines.join("\n");
fs.writeFileSync(OUT, result);

console.log(`Wrote src/cli_split.js:`);
console.log(`  Size:  ${(result.length / 1e6).toFixed(1)} MB (was ${(content.length / 1e6).toFixed(1)} MB, -${((content.length - result.length) / 1e6).toFixed(1)} MB)`);
console.log(`  Lines: ${newLines.length.toLocaleString()} (was ${lines.length.toLocaleString()}, -${(lines.length - newLines.length).toLocaleString()})`);

// --- List extracted files ---
console.log(`\nFiles created:`);
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory()) walk(path.join(dir, f.name));
    else {
      const rel = path.relative(ROOT, path.join(dir, f.name));
      const sz = fs.statSync(path.join(dir, f.name)).size;
      console.log(`  ${rel.padEnd(45)} ${(sz / 1024).toFixed(0).padStart(6)} KB`);
    }
  }
};
for (const d of ["src/vendor", "src/chunks"]) {
  const p = path.join(ROOT, d);
  if (fs.existsSync(p)) walk(p);
}
