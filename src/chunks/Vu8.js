  var Vu8 = d((fT_) => {
    Object.defineProperty(fT_, "__esModule", { value: !0 });
    fT_.ruleSet = void 0;
    var vu8 = "required",
      XS = "fn",
      WS = "argv",
      zJH = "ref",
      Mu8 = !0,
      Ju8 = "isSet",
      TmH = "booleanEquals",
      OJH = "error",
      TJH = "endpoint",
      aQ = "tree",
      k36 = "PartitionResult",
      v36 = "getAttr",
      Pu8 = { [vu8]: !1, type: "string" },
      Xu8 = { [vu8]: !0, default: !1, type: "boolean" },
      Wu8 = { [zJH]: "Endpoint" },
      Nu8 = { [XS]: TmH, [WS]: [{ [zJH]: "UseFIPS" }, !0] },
      hu8 = { [XS]: TmH, [WS]: [{ [zJH]: "UseDualStack" }, !0] },
      PS = {},
      Gu8 = { [XS]: v36, [WS]: [{ [zJH]: k36 }, "supportsFIPS"] },
      yu8 = { [zJH]: k36 },
      Ru8 = { [XS]: TmH, [WS]: [!0, { [XS]: v36, [WS]: [yu8, "supportsDualStack"] }] },
      Zu8 = [Nu8],
      Lu8 = [hu8],
      ku8 = [{ [zJH]: "Region" }],
      ON$ = {
        version: "1.0",
        parameters: { Region: Pu8, UseDualStack: Xu8, UseFIPS: Xu8, Endpoint: Pu8 },
        rules: [
          {
            conditions: [{ [XS]: Ju8, [WS]: [Wu8] }],
            rules: [
              {
                conditions: Zu8,
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                type: OJH,
              },
              {
                conditions: Lu8,
                error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                type: OJH,
              },
              { endpoint: { url: Wu8, properties: PS, headers: PS }, type: TJH },
            ],
            type: aQ,
          },
          {
            conditions: [{ [XS]: Ju8, [WS]: ku8 }],
            rules: [
              {
                conditions: [{ [XS]: "aws.partition", [WS]: ku8, assign: k36 }],
                rules: [
                  {
                    conditions: [Nu8, hu8],
                    rules: [
                      {
                        conditions: [{ [XS]: TmH, [WS]: [Mu8, Gu8] }, Ru8],
                        rules: [
                          {
                            endpoint: {
                              url: "https://oidc-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: PS,
                              headers: PS,
                            },
                            type: TJH,
                          },
                        ],
                        type: aQ,
                      },
                      {
                        error: "FIPS and DualStack are enabled, but this partition does not support one or both",
                        type: OJH,
                      },
                    ],
                    type: aQ,
                  },
                  {
                    conditions: Zu8,
                    rules: [
                      {
                        conditions: [{ [XS]: TmH, [WS]: [Gu8, Mu8] }],
                        rules: [
                          {
                            conditions: [
                              { [XS]: "stringEquals", [WS]: [{ [XS]: v36, [WS]: [yu8, "name"] }, "aws-us-gov"] },
                            ],
                            endpoint: { url: "https://oidc.{Region}.amazonaws.com", properties: PS, headers: PS },
                            type: TJH,
                          },
                          {
                            endpoint: {
                              url: "https://oidc-fips.{Region}.{PartitionResult#dnsSuffix}",
                              properties: PS,
                              headers: PS,
                            },
                            type: TJH,
                          },
                        ],
                        type: aQ,
                      },
                      { error: "FIPS is enabled but this partition does not support FIPS", type: OJH },
                    ],
                    type: aQ,
                  },
                  {
                    conditions: Lu8,
                    rules: [
                      {
                        conditions: [Ru8],
                        rules: [
                          {
                            endpoint: {
                              url: "https://oidc.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: PS,
                              headers: PS,
                            },
                            type: TJH,
                          },
                        ],
                        type: aQ,
                      },
                      { error: "DualStack is enabled but this partition does not support DualStack", type: OJH },
                    ],
                    type: aQ,
                  },
                  {
                    endpoint: { url: "https://oidc.{Region}.{PartitionResult#dnsSuffix}", properties: PS, headers: PS },
                    type: TJH,
                  },
                ],
                type: aQ,
              },
            ],
            type: aQ,
          },
          { error: "Invalid Configuration: Missing Region", type: OJH },
        ],
      };
    fT_.ruleSet = ON$;
  });
