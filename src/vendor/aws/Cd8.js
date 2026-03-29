  var Cd8 = d((_z_) => {
    Object.defineProperty(_z_, "__esModule", { value: !0 });
    _z_.ruleSet = void 0;
    var Ed8 = "required",
      u0 = "fn",
      x0 = "argv",
      _l = "ref",
      Ld8 = !0,
      kd8 = "isSet",
      r1H = "booleanEquals",
      kJH = "error",
      Ze = "endpoint",
      CI = "tree",
      Hz_ = "PartitionResult",
      ZO6 = "stringEquals",
      vd8 = { [Ed8]: !0, default: !1, type: "boolean" },
      Nd8 = { [Ed8]: !1, type: "string" },
      hd8 = { [_l]: "Endpoint" },
      LO6 = { [u0]: r1H, [x0]: [{ [_l]: "UseFIPS" }, !0] },
      kO6 = { [u0]: r1H, [x0]: [{ [_l]: "UseDualStack" }, !0] },
      I0 = {},
      vO6 = { [u0]: "getAttr", [x0]: [{ [_l]: Hz_ }, "name"] },
      tT_ = { [u0]: r1H, [x0]: [{ [_l]: "UseFIPS" }, !1] },
      eT_ = { [u0]: r1H, [x0]: [{ [_l]: "UseDualStack" }, !1] },
      yd8 = { [u0]: "getAttr", [x0]: [{ [_l]: Hz_ }, "supportsFIPS"] },
      Vd8 = { [u0]: r1H, [x0]: [!0, { [u0]: "getAttr", [x0]: [{ [_l]: Hz_ }, "supportsDualStack"] }] },
      Sd8 = [{ [_l]: "Region" }],
      AE$ = {
        version: "1.0",
        parameters: { UseDualStack: vd8, UseFIPS: vd8, Endpoint: Nd8, Region: Nd8 },
        rules: [
          {
            conditions: [{ [u0]: kd8, [x0]: [hd8] }],
            rules: [
              {
                conditions: [LO6],
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                type: kJH,
              },
              {
                rules: [
                  {
                    conditions: [kO6],
                    error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                    type: kJH,
                  },
                  { endpoint: { url: hd8, properties: I0, headers: I0 }, type: Ze },
                ],
                type: CI,
              },
            ],
            type: CI,
          },
          {
            rules: [
              {
                conditions: [{ [u0]: kd8, [x0]: Sd8 }],
                rules: [
                  {
                    conditions: [{ [u0]: "aws.partition", [x0]: Sd8, assign: Hz_ }],
                    rules: [
                      {
                        conditions: [{ [u0]: ZO6, [x0]: [vO6, "aws"] }, tT_, eT_],
                        endpoint: { url: "https://{Region}.signin.aws.amazon.com", properties: I0, headers: I0 },
                        type: Ze,
                      },
                      {
                        conditions: [{ [u0]: ZO6, [x0]: [vO6, "aws-cn"] }, tT_, eT_],
                        endpoint: { url: "https://{Region}.signin.amazonaws.cn", properties: I0, headers: I0 },
                        type: Ze,
                      },
                      {
                        conditions: [{ [u0]: ZO6, [x0]: [vO6, "aws-us-gov"] }, tT_, eT_],
                        endpoint: { url: "https://{Region}.signin.amazonaws-us-gov.com", properties: I0, headers: I0 },
                        type: Ze,
                      },
                      {
                        conditions: [LO6, kO6],
                        rules: [
                          {
                            conditions: [{ [u0]: r1H, [x0]: [Ld8, yd8] }, Vd8],
                            rules: [
                              {
                                endpoint: {
                                  url: "https://signin-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                                  properties: I0,
                                  headers: I0,
                                },
                                type: Ze,
                              },
                            ],
                            type: CI,
                          },
                          {
                            error: "FIPS and DualStack are enabled, but this partition does not support one or both",
                            type: kJH,
                          },
                        ],
                        type: CI,
                      },
                      {
                        conditions: [LO6, eT_],
                        rules: [
                          {
                            conditions: [{ [u0]: r1H, [x0]: [yd8, Ld8] }],
                            rules: [
                              {
                                endpoint: {
                                  url: "https://signin-fips.{Region}.{PartitionResult#dnsSuffix}",
                                  properties: I0,
                                  headers: I0,
                                },
                                type: Ze,
                              },
                            ],
                            type: CI,
                          },
                          { error: "FIPS is enabled but this partition does not support FIPS", type: kJH },
                        ],
                        type: CI,
                      },
                      {
                        conditions: [tT_, kO6],
                        rules: [
                          {
                            conditions: [Vd8],
                            rules: [
                              {
                                endpoint: {
                                  url: "https://signin.{Region}.{PartitionResult#dualStackDnsSuffix}",
                                  properties: I0,
                                  headers: I0,
                                },
                                type: Ze,
                              },
                            ],
                            type: CI,
                          },
                          { error: "DualStack is enabled but this partition does not support DualStack", type: kJH },
                        ],
                        type: CI,
                      },
                      {
                        endpoint: {
                          url: "https://signin.{Region}.{PartitionResult#dnsSuffix}",
                          properties: I0,
                          headers: I0,
                        },
                        type: Ze,
                      },
                    ],
                    type: CI,
                  },
                ],
                type: CI,
              },
              { error: "Invalid Configuration: Missing Region", type: kJH },
            ],
            type: CI,
          },
        ],
      };
    _z_.ruleSet = AE$;
  });
