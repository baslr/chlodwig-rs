  var sT_ = d((mJ) => {
    var JmH = KO6(),
      PmH = tR(),
      cg8 = I6(),
      Fg8 = OO6(),
      Ge = qz(),
      DO6 = zj(),
      BV$ = hI(),
      Hl = class H extends PmH.ServiceException {
        constructor(_) {
          super(_);
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      Ug8 = class H extends Hl {
        name = "ExpiredTokenException";
        $fault = "client";
        constructor(_) {
          super({ name: "ExpiredTokenException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      Qg8 = class H extends Hl {
        name = "MalformedPolicyDocumentException";
        $fault = "client";
        constructor(_) {
          super({ name: "MalformedPolicyDocumentException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      lg8 = class H extends Hl {
        name = "PackedPolicyTooLargeException";
        $fault = "client";
        constructor(_) {
          super({ name: "PackedPolicyTooLargeException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      ig8 = class H extends Hl {
        name = "RegionDisabledException";
        $fault = "client";
        constructor(_) {
          super({ name: "RegionDisabledException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      ng8 = class H extends Hl {
        name = "IDPRejectedClaimException";
        $fault = "client";
        constructor(_) {
          super({ name: "IDPRejectedClaimException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      rg8 = class H extends Hl {
        name = "InvalidIdentityTokenException";
        $fault = "client";
        constructor(_) {
          super({ name: "InvalidIdentityTokenException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      og8 = class H extends Hl {
        name = "IDPCommunicationErrorException";
        $fault = "client";
        constructor(_) {
          super({ name: "IDPCommunicationErrorException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      gV$ = "Arn",
      dV$ = "AccessKeyId",
      cV$ = "AssumeRole",
      FV$ = "AssumedRoleId",
      UV$ = "AssumeRoleRequest",
      QV$ = "AssumeRoleResponse",
      jO6 = "AssumedRoleUser",
      lV$ = "AssumeRoleWithWebIdentity",
      iV$ = "AssumeRoleWithWebIdentityRequest",
      nV$ = "AssumeRoleWithWebIdentityResponse",
      rV$ = "Audience",
      MO6 = "Credentials",
      oV$ = "ContextAssertion",
      ag8 = "DurationSeconds",
      aV$ = "Expiration",
      sV$ = "ExternalId",
      tV$ = "ExpiredTokenException",
      eV$ = "IDPCommunicationErrorException",
      HS$ = "IDPRejectedClaimException",
      _S$ = "InvalidIdentityTokenException",
      qS$ = "Key",
      $S$ = "MalformedPolicyDocumentException",
      sg8 = "Policy",
      tg8 = "PolicyArns",
      KS$ = "ProviderArn",
      OS$ = "ProvidedContexts",
      TS$ = "ProvidedContextsListType",
      zS$ = "ProvidedContext",
      AS$ = "PolicyDescriptorType",
      fS$ = "ProviderId",
      eg8 = "PackedPolicySize",
      wS$ = "PackedPolicyTooLargeException",
      YS$ = "Provider",
      Hd8 = "RoleArn",
      DS$ = "RegionDisabledException",
      _d8 = "RoleSessionName",
      jS$ = "SecretAccessKey",
      MS$ = "SubjectFromWebIdentityToken",
      JO6 = "SourceIdentity",
      JS$ = "SerialNumber",
      PS$ = "SessionToken",
      XS$ = "Tags",
      WS$ = "TokenCode",
      GS$ = "TransitiveTagKeys",
      RS$ = "Tag",
      ZS$ = "Value",
      LS$ = "WebIdentityToken",
      kS$ = "arn",
      vS$ = "accessKeySecretType",
      U1H = "awsQueryError",
      Q1H = "client",
      NS$ = "clientTokenType",
      l1H = "error",
      i1H = "httpError",
      n1H = "message",
      hS$ = "policyDescriptorListType",
      qd8 = "smithy.ts.sdk.synthetic.com.amazonaws.sts",
      yS$ = "tagListType",
      AT = "com.amazonaws.sts",
      VS$ = [0, AT, vS$, 8, 0],
      SS$ = [0, AT, NS$, 8, 0],
      $d8 = [3, AT, jO6, 0, [FV$, gV$], [0, 0]],
      ES$ = [
        3,
        AT,
        UV$,
        0,
        [Hd8, _d8, tg8, sg8, ag8, XS$, GS$, sV$, JS$, WS$, JO6, OS$],
        [0, 0, () => Od8, 0, 1, () => iS$, 64, 0, 0, 0, 0, () => lS$],
      ],
      CS$ = [3, AT, QV$, 0, [MO6, jO6, eg8, JO6], [[() => Kd8, 0], () => $d8, 1, 0]],
      bS$ = [3, AT, iV$, 0, [Hd8, _d8, LS$, fS$, tg8, sg8, ag8], [0, 0, [() => SS$, 0], 0, () => Od8, 0, 1]],
      IS$ = [3, AT, nV$, 0, [MO6, MS$, jO6, eg8, YS$, rV$, JO6], [[() => Kd8, 0], 0, () => $d8, 1, 0, 0, 0]],
      Kd8 = [3, AT, MO6, 0, [dV$, jS$, PS$, aV$], [0, [() => VS$, 0], 0, 4]],
      uS$ = [-3, AT, tV$, { [l1H]: Q1H, [i1H]: 400, [U1H]: ["ExpiredTokenException", 400] }, [n1H], [0]];
    Ge.TypeRegistry.for(AT).registerError(uS$, Ug8);
    var xS$ = [-3, AT, eV$, { [l1H]: Q1H, [i1H]: 400, [U1H]: ["IDPCommunicationError", 400] }, [n1H], [0]];
    Ge.TypeRegistry.for(AT).registerError(xS$, og8);
    var mS$ = [-3, AT, HS$, { [l1H]: Q1H, [i1H]: 403, [U1H]: ["IDPRejectedClaim", 403] }, [n1H], [0]];
    Ge.TypeRegistry.for(AT).registerError(mS$, ng8);
    var pS$ = [-3, AT, _S$, { [l1H]: Q1H, [i1H]: 400, [U1H]: ["InvalidIdentityToken", 400] }, [n1H], [0]];
    Ge.TypeRegistry.for(AT).registerError(pS$, rg8);
    var BS$ = [-3, AT, $S$, { [l1H]: Q1H, [i1H]: 400, [U1H]: ["MalformedPolicyDocument", 400] }, [n1H], [0]];
    Ge.TypeRegistry.for(AT).registerError(BS$, Qg8);
    var gS$ = [-3, AT, wS$, { [l1H]: Q1H, [i1H]: 400, [U1H]: ["PackedPolicyTooLarge", 400] }, [n1H], [0]];
    Ge.TypeRegistry.for(AT).registerError(gS$, lg8);
    var dS$ = [3, AT, AS$, 0, [kS$], [0]],
      cS$ = [3, AT, zS$, 0, [KS$, oV$], [0, 0]],
      FS$ = [-3, AT, DS$, { [l1H]: Q1H, [i1H]: 403, [U1H]: ["RegionDisabledException", 403] }, [n1H], [0]];
    Ge.TypeRegistry.for(AT).registerError(FS$, ig8);
    var US$ = [3, AT, RS$, 0, [qS$, ZS$], [0, 0]],
      QS$ = [-3, qd8, "STSServiceException", 0, [], []];
    Ge.TypeRegistry.for(qd8).registerError(QS$, Hl);
    var Od8 = [1, AT, hS$, 0, () => dS$],
      lS$ = [1, AT, TS$, 0, () => cS$],
      iS$ = [1, AT, yS$, 0, () => US$],
      nS$ = [9, AT, cV$, 0, () => ES$, () => CS$],
      rS$ = [9, AT, lV$, 0, () => bS$, () => IS$];
    class oT_ extends PmH.Command.classBuilder()
      .ep(Fg8.commonParams)
      .m(function (H, _, q, $) {
        return [cg8.getEndpointPlugin(q, H.getEndpointParameterInstructions())];
      })
      .s("AWSSecurityTokenServiceV20110615", "AssumeRole", {})
      .n("STSClient", "AssumeRoleCommand")
      .sc(nS$)
      .build() {}
    class aT_ extends PmH.Command.classBuilder()
      .ep(Fg8.commonParams)
      .m(function (H, _, q, $) {
        return [cg8.getEndpointPlugin(q, H.getEndpointParameterInstructions())];
      })
      .s("AWSSecurityTokenServiceV20110615", "AssumeRoleWithWebIdentity", {})
      .n("STSClient", "AssumeRoleWithWebIdentityCommand")
      .sc(rS$)
      .build() {}
    var oS$ = { AssumeRoleCommand: oT_, AssumeRoleWithWebIdentityCommand: aT_ };
    class PO6 extends JmH.STSClient {}
    PmH.createAggregatedClient(oS$, PO6);
    var Td8 = (H) => {
        if (typeof H?.Arn === "string") {
          let _ = H.Arn.split(":");
          if (_.length > 4 && _[4] !== "") return _[4];
        }
        return;
      },
      zd8 = async (H, _, q, $ = {}) => {
        let K = typeof H === "function" ? await H() : H,
          O = typeof _ === "function" ? await _() : _,
          T = await BV$.stsRegionDefaultResolver($)();
        return (
          q?.debug?.(
            "@aws-sdk/client-sts::resolveRegion",
            "accepting first of:",
            `${K} (credential provider clientConfig)`,
            `${O} (contextual client)`,
            `${T} (STS default: AWS_REGION, profile region, or us-east-1)`,
          ),
          K ?? O ?? T
        );
      },
      aS$ = (H, _) => {
        let q, $;
        return async (K, O) => {
          if ((($ = K), !q)) {
            let {
                logger: w = H?.parentClientConfig?.logger,
                profile: Y = H?.parentClientConfig?.profile,
                region: D,
                requestHandler: j = H?.parentClientConfig?.requestHandler,
                credentialProviderLogger: M,
                userAgentAppId: J = H?.parentClientConfig?.userAgentAppId,
              } = H,
              P = await zd8(D, H?.parentClientConfig?.region, M, { logger: w, profile: Y }),
              X = !Ad8(j);
            q = new _({
              ...H,
              userAgentAppId: J,
              profile: Y,
              credentialDefaultProvider: () => async () => $,
              region: P,
              requestHandler: X ? j : void 0,
              logger: w,
            });
          }
          let { Credentials: T, AssumedRoleUser: z } = await q.send(new oT_(O));
          if (!T || !T.AccessKeyId || !T.SecretAccessKey)
            throw Error(`Invalid response from STS.assumeRole call with role ${O.RoleArn}`);
          let A = Td8(z),
            f = {
              accessKeyId: T.AccessKeyId,
              secretAccessKey: T.SecretAccessKey,
              sessionToken: T.SessionToken,
              expiration: T.Expiration,
              ...(T.CredentialScope && { credentialScope: T.CredentialScope }),
              ...(A && { accountId: A }),
            };
          return DO6.setCredentialFeature(f, "CREDENTIALS_STS_ASSUME_ROLE", "i"), f;
        };
      },
      sS$ = (H, _) => {
        let q;
        return async ($) => {
          if (!q) {
            let {
                logger: A = H?.parentClientConfig?.logger,
                profile: f = H?.parentClientConfig?.profile,
                region: w,
                requestHandler: Y = H?.parentClientConfig?.requestHandler,
                credentialProviderLogger: D,
                userAgentAppId: j = H?.parentClientConfig?.userAgentAppId,
              } = H,
              M = await zd8(w, H?.parentClientConfig?.region, D, { logger: A, profile: f }),
              J = !Ad8(Y);
            q = new _({ ...H, userAgentAppId: j, profile: f, region: M, requestHandler: J ? Y : void 0, logger: A });
          }
          let { Credentials: K, AssumedRoleUser: O } = await q.send(new aT_($));
          if (!K || !K.AccessKeyId || !K.SecretAccessKey)
            throw Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${$.RoleArn}`);
          let T = Td8(O),
            z = {
              accessKeyId: K.AccessKeyId,
              secretAccessKey: K.SecretAccessKey,
              sessionToken: K.SessionToken,
              expiration: K.Expiration,
              ...(K.CredentialScope && { credentialScope: K.CredentialScope }),
              ...(T && { accountId: T }),
            };
          if (T) DO6.setCredentialFeature(z, "RESOLVED_ACCOUNT_ID", "T");
          return DO6.setCredentialFeature(z, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k"), z;
        };
      },
      Ad8 = (H) => {
        return H?.metadata?.handlerProtocol === "h2";
      },
      fd8 = (H, _) => {
        if (!_) return H;
        else
          return class extends H {
            constructor($) {
              super($);
              for (let K of _) this.middlewareStack.use(K);
            }
          };
      },
      wd8 = (H = {}, _) => aS$(H, fd8(JmH.STSClient, _)),
      Yd8 = (H = {}, _) => sS$(H, fd8(JmH.STSClient, _)),
      tS$ = (H) => (_) => H({ roleAssumer: wd8(_), roleAssumerWithWebIdentity: Yd8(_), ..._ });
    Object.defineProperty(mJ, "$Command", {
      enumerable: !0,
      get: function () {
        return PmH.Command;
      },
    });
    mJ.AssumeRoleCommand = oT_;
    mJ.AssumeRoleWithWebIdentityCommand = aT_;
    mJ.ExpiredTokenException = Ug8;
    mJ.IDPCommunicationErrorException = og8;
    mJ.IDPRejectedClaimException = ng8;
    mJ.InvalidIdentityTokenException = rg8;
    mJ.MalformedPolicyDocumentException = Qg8;
    mJ.PackedPolicyTooLargeException = lg8;
    mJ.RegionDisabledException = ig8;
    mJ.STS = PO6;
    mJ.STSServiceException = Hl;
    mJ.decorateDefaultCredentialProvider = tS$;
    mJ.getDefaultRoleAssumer = wd8;
    mJ.getDefaultRoleAssumerWithWebIdentity = Yd8;
    Object.keys(JmH).forEach(function (H) {
      if (H !== "default" && !Object.prototype.hasOwnProperty.call(mJ, H))
        Object.defineProperty(mJ, H, {
          enumerable: !0,
          get: function () {
            return JmH[H];
          },
        });
    });
  });
