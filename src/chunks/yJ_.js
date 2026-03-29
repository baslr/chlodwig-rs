  var yJ_ = d((UXH) => {
    Object.defineProperty(UXH, "__esModule", { value: !0 });
    UXH.PluggableAuthClient = UXH.ExecutableError = void 0;
    var LO4 = FHH(),
      kO4 = OW6(),
      vO4 = eRq();
    class AW6 extends Error {
      constructor(H, _) {
        super(`The executable failed with exit code: ${_} and error message: ${H}.`);
        (this.code = _), Object.setPrototypeOf(this, new.target.prototype);
      }
    }
    UXH.ExecutableError = AW6;
    var NO4 = 30000,
      HZq = 5000,
      _Zq = 120000,
      hO4 = "GOOGLE_EXTERNAL_ACCOUNT_ALLOW_EXECUTABLES",
      qZq = 1;
    class $Zq extends LO4.BaseExternalAccountClient {
      constructor(H, _) {
        super(H, _);
        if (!H.credential_source.executable) throw Error('No valid Pluggable Auth "credential_source" provided.');
        if (((this.command = H.credential_source.executable.command), !this.command))
          throw Error('No valid Pluggable Auth "credential_source" provided.');
        if (H.credential_source.executable.timeout_millis === void 0) this.timeoutMillis = NO4;
        else if (
          ((this.timeoutMillis = H.credential_source.executable.timeout_millis),
          this.timeoutMillis < HZq || this.timeoutMillis > _Zq)
        )
          throw Error(`Timeout must be between ${HZq} and ${_Zq} milliseconds.`);
        (this.outputFile = H.credential_source.executable.output_file),
          (this.handler = new vO4.PluggableAuthHandler({
            command: this.command,
            timeoutMillis: this.timeoutMillis,
            outputFile: this.outputFile,
          })),
          (this.credentialSourceType = "executable");
      }
      async retrieveSubjectToken() {
        if (process.env[hO4] !== "1")
          throw Error(
            "Pluggable Auth executables need to be explicitly allowed to run by setting the GOOGLE_EXTERNAL_ACCOUNT_ALLOW_EXECUTABLES environment Variable to 1.",
          );
        let H = void 0;
        if (this.outputFile) H = await this.handler.retrieveCachedResponse();
        if (!H) {
          let _ = new Map();
          if (
            (_.set("GOOGLE_EXTERNAL_ACCOUNT_AUDIENCE", this.audience),
            _.set("GOOGLE_EXTERNAL_ACCOUNT_TOKEN_TYPE", this.subjectTokenType),
            _.set("GOOGLE_EXTERNAL_ACCOUNT_INTERACTIVE", "0"),
            this.outputFile)
          )
            _.set("GOOGLE_EXTERNAL_ACCOUNT_OUTPUT_FILE", this.outputFile);
          let q = this.getServiceAccountEmail();
          if (q) _.set("GOOGLE_EXTERNAL_ACCOUNT_IMPERSONATED_EMAIL", q);
          H = await this.handler.retrieveResponseFromExecutable(_);
        }
        if (H.version > qZq)
          throw Error(`Version of executable is not currently supported, maximum supported version is ${qZq}.`);
        if (!H.success) throw new AW6(H.errorMessage, H.errorCode);
        if (this.outputFile) {
          if (!H.expirationTime)
            throw new kO4.InvalidExpirationTimeFieldError(
              "The executable response must contain the `expiration_time` field for successful responses when an output_file has been specified in the configuration.",
            );
        }
        if (H.isExpired()) throw Error("Executable response is expired.");
        return H.subjectToken;
      }
    }
    UXH.PluggableAuthClient = $Zq;
  });
