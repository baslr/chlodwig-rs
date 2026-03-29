    wT();
    R5H();
    G5H();
    PXH();
    vf();
    w5H();
    (ul = require("fs")), (OWq = u(require("path"))); /*! @azure/msal-node v3.8.1 2025-10-29 */
    (KWq = {
      win32: `${process.env.ProgramData}\\AzureConnectedMachineAgent\\Tokens\\`,
      linux: "/var/opt/azcmagent/tokens/",
    }),
      (B44 = {
        win32: `${process.env.ProgramFiles}\\AzureConnectedMachineAgent\\himds.exe`,
        linux: "/opt/azcmagent/bin/himds",
      });
    bHH = class bHH extends Wk {
      constructor(H, _, q, $, K, O) {
        super(H, _, q, $, K);
        this.identityEndpoint = O;
      }
      static getEnvironmentVariables() {
        let H = process.env[e$.IDENTITY_ENDPOINT],
          _ = process.env[e$.IMDS_ENDPOINT];
        if (!H || !_) {
          let q = B44.darwin;
          try {
            ul.accessSync(q, ul.constants.F_OK | ul.constants.R_OK), (H = qWq), (_ = $Wq);
          } catch ($) {}
        }
        return [H, _];
      }
      static tryCreate(H, _, q, $, K, O) {
        let [T, z] = bHH.getEnvironmentVariables();
        if (!T || !z)
          return (
            H.info(
              `[Managed Identity] ${R4.AZURE_ARC} managed identity is unavailable through environment variables because one or both of '${e$.IDENTITY_ENDPOINT}' and '${e$.IMDS_ENDPOINT}' are not defined. ${R4.AZURE_ARC} managed identity is also unavailable through file detection.`,
            ),
            null
          );
        if (z === $Wq)
          H.info(
            `[Managed Identity] ${R4.AZURE_ARC} managed identity is available through file detection. Defaulting to known ${R4.AZURE_ARC} endpoint: ${qWq}. Creating ${R4.AZURE_ARC} managed identity.`,
          );
        else {
          let A = bHH.getValidatedEnvVariableUrlString(e$.IDENTITY_ENDPOINT, T, R4.AZURE_ARC, H);
          A.endsWith("/") && A.slice(0, -1),
            bHH.getValidatedEnvVariableUrlString(e$.IMDS_ENDPOINT, z, R4.AZURE_ARC, H),
            H.info(
              `[Managed Identity] Environment variables validation passed for ${R4.AZURE_ARC} managed identity. Endpoint URI: ${A}. Creating ${R4.AZURE_ARC} managed identity.`,
            );
        }
        if (O.idType !== WY.SYSTEM_ASSIGNED) throw M2(Wj_);
        return new bHH(H, _, q, $, K, T);
      }
      createRequest(H) {
        let _ = new xh(kf.GET, this.identityEndpoint.replace("localhost", "127.0.0.1"));
        return (
          (_.headers[Jk.METADATA_HEADER_NAME] = "true"),
          (_.queryParameters[Xj.API_VERSION] = p44),
          (_.queryParameters[Xj.RESOURCE] = H),
          _
        );
      }
      async getServerTokenResponseAsync(H, _, q, $) {
        let K;
        if (H.status === Q4.UNAUTHORIZED) {
          let O = H.headers["www-authenticate"];
          if (!O) throw M2(Zj_);
          if (!O.includes("Basic realm=")) throw M2(Lj_);
          let T = O.split("Basic realm=")[1];
          if (!KWq.hasOwnProperty("darwin")) throw M2(Xj_);
          let z = KWq.darwin,
            A = OWq.default.basename(T);
          if (!A.endsWith(".key")) throw M2(Mj_);
          if (z + A !== T) throw M2(Jj_);
          let f;
          try {
            f = await ul.statSync(T).size;
          } catch (D) {
            throw M2(XgH);
          }
          if (f > Ljq) throw M2(Pj_);
          let w;
          try {
            w = ul.readFileSync(T, NX.UTF8);
          } catch (D) {
            throw M2(XgH);
          }
          let Y = `Basic ${w}`;
          this.logger.info("[Managed Identity] Adding authorization header to the request."),
            (q.headers[Jk.AUTHORIZATION_HEADER_NAME] = Y);
          try {
            K = await _.sendGetRequestAsync(q.computeUri(), $);
          } catch (D) {
            if (D instanceof l4) throw D;
            else throw T8(Oz.networkError);
          }
        }
        return this.getServerTokenResponse(K || H);
      }
    };
