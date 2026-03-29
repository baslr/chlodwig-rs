  var Rg8 = d((UT_) => {
    Object.defineProperty(UT_, "__esModule", { value: !0 });
    UT_.ruleSet = void 0;
    var wg8 = "required",
      t1 = "type",
      YO = "fn",
      DO = "argv",
      We = "ref",
      eB8 = !1,
      TO6 = !0,
      Xe = "booleanEquals",
      JX = "stringEquals",
      Yg8 = "sigv4",
      Dg8 = "sts",
      jg8 = "us-east-1",
      Mw = "endpoint",
      Hg8 = "https://sts.{Region}.{PartitionResult#dnsSuffix}",
      jB = "tree",
      RJH = "error",
      AO6 = "getAttr",
      _g8 = { [wg8]: !1, [t1]: "string" },
      zO6 = { [wg8]: !0, default: !1, [t1]: "boolean" },
      Mg8 = { [We]: "Endpoint" },
      qg8 = { [YO]: "isSet", [DO]: [{ [We]: "Region" }] },
      PX = { [We]: "Region" },
      $g8 = { [YO]: "aws.partition", [DO]: [PX], assign: "PartitionResult" },
      Jg8 = { [We]: "UseFIPS" },
      Pg8 = { [We]: "UseDualStack" },
      b0 = {
        url: "https://sts.amazonaws.com",
        properties: { authSchemes: [{ name: Yg8, signingName: Dg8, signingRegion: jg8 }] },
        headers: {},
      },
      Nh = {},
      Kg8 = { conditions: [{ [YO]: JX, [DO]: [PX, "aws-global"] }], [Mw]: b0, [t1]: Mw },
      Xg8 = { [YO]: Xe, [DO]: [Jg8, !0] },
      Wg8 = { [YO]: Xe, [DO]: [Pg8, !0] },
      Og8 = { [YO]: AO6, [DO]: [{ [We]: "PartitionResult" }, "supportsFIPS"] },
      Gg8 = { [We]: "PartitionResult" },
      Tg8 = { [YO]: Xe, [DO]: [!0, { [YO]: AO6, [DO]: [Gg8, "supportsDualStack"] }] },
      zg8 = [{ [YO]: "isSet", [DO]: [Mg8] }],
      Ag8 = [Xg8],
      fg8 = [Wg8],
      qV$ = {
        version: "1.0",
        parameters: { Region: _g8, UseDualStack: zO6, UseFIPS: zO6, Endpoint: _g8, UseGlobalEndpoint: zO6 },
        rules: [
          {
            conditions: [
              { [YO]: Xe, [DO]: [{ [We]: "UseGlobalEndpoint" }, TO6] },
              { [YO]: "not", [DO]: zg8 },
              qg8,
              $g8,
              { [YO]: Xe, [DO]: [Jg8, eB8] },
              { [YO]: Xe, [DO]: [Pg8, eB8] },
            ],
            rules: [
              { conditions: [{ [YO]: JX, [DO]: [PX, "ap-northeast-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "ap-south-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "ap-southeast-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "ap-southeast-2"] }], endpoint: b0, [t1]: Mw },
              Kg8,
              { conditions: [{ [YO]: JX, [DO]: [PX, "ca-central-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "eu-central-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "eu-north-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "eu-west-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "eu-west-2"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "eu-west-3"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "sa-east-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, jg8] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "us-east-2"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "us-west-1"] }], endpoint: b0, [t1]: Mw },
              { conditions: [{ [YO]: JX, [DO]: [PX, "us-west-2"] }], endpoint: b0, [t1]: Mw },
              {
                endpoint: {
                  url: Hg8,
                  properties: { authSchemes: [{ name: Yg8, signingName: Dg8, signingRegion: "{Region}" }] },
                  headers: Nh,
                },
                [t1]: Mw,
              },
            ],
            [t1]: jB,
          },
          {
            conditions: zg8,
            rules: [
              {
                conditions: Ag8,
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                [t1]: RJH,
              },
              {
                conditions: fg8,
                error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                [t1]: RJH,
              },
              { endpoint: { url: Mg8, properties: Nh, headers: Nh }, [t1]: Mw },
            ],
            [t1]: jB,
          },
          {
            conditions: [qg8],
            rules: [
              {
                conditions: [$g8],
                rules: [
                  {
                    conditions: [Xg8, Wg8],
                    rules: [
                      {
                        conditions: [{ [YO]: Xe, [DO]: [TO6, Og8] }, Tg8],
                        rules: [
                          {
                            endpoint: {
                              url: "https://sts-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: Nh,
                              headers: Nh,
                            },
                            [t1]: Mw,
                          },
                        ],
                        [t1]: jB,
                      },
                      {
                        error: "FIPS and DualStack are enabled, but this partition does not support one or both",
                        [t1]: RJH,
                      },
                    ],
                    [t1]: jB,
                  },
                  {
                    conditions: Ag8,
                    rules: [
                      {
                        conditions: [{ [YO]: Xe, [DO]: [Og8, TO6] }],
                        rules: [
                          {
                            conditions: [{ [YO]: JX, [DO]: [{ [YO]: AO6, [DO]: [Gg8, "name"] }, "aws-us-gov"] }],
                            endpoint: { url: "https://sts.{Region}.amazonaws.com", properties: Nh, headers: Nh },
                            [t1]: Mw,
                          },
                          {
                            endpoint: {
                              url: "https://sts-fips.{Region}.{PartitionResult#dnsSuffix}",
                              properties: Nh,
                              headers: Nh,
                            },
                            [t1]: Mw,
                          },
                        ],
                        [t1]: jB,
                      },
                      { error: "FIPS is enabled but this partition does not support FIPS", [t1]: RJH },
                    ],
                    [t1]: jB,
                  },
                  {
                    conditions: fg8,
                    rules: [
                      {
                        conditions: [Tg8],
                        rules: [
                          {
                            endpoint: {
                              url: "https://sts.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: Nh,
                              headers: Nh,
                            },
                            [t1]: Mw,
                          },
                        ],
                        [t1]: jB,
                      },
                      { error: "DualStack is enabled but this partition does not support DualStack", [t1]: RJH },
                    ],
                    [t1]: jB,
                  },
                  Kg8,
                  { endpoint: { url: Hg8, properties: Nh, headers: Nh }, [t1]: Mw },
                ],
                [t1]: jB,
              },
            ],
            [t1]: jB,
          },
          { error: "Invalid Configuration: Missing Region", [t1]: RJH },
        ],
      };
    UT_.ruleSet = qV$;
  });
