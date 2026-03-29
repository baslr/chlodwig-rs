    (c8q = { ["required"]: !1, ["type"]: "string" }),
      (bf6 = { ["required"]: !0, default: !1, ["type"]: "boolean" }),
      (a8q = { ["ref"]: "Endpoint" }),
      (F8q = { ["fn"]: "isSet", ["argv"]: [{ ["ref"]: "Region" }] }),
      (WX = { ["ref"]: "Region" }),
      (U8q = { ["fn"]: "aws.partition", ["argv"]: [WX], assign: "PartitionResult" }),
      (s8q = { ["ref"]: "UseFIPS" }),
      (t8q = { ["ref"]: "UseDualStack" }),
      (m0 = {
        url: "https://sts.amazonaws.com",
        properties: { authSchemes: [{ name: "sigv4", signingName: "sts", signingRegion: "us-east-1" }] },
        headers: {},
      }),
      (Sh = {}),
      (Q8q = {
        conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "aws-global"] }],
        ["endpoint"]: m0,
        ["type"]: "endpoint",
      }),
      (e8q = { ["fn"]: "booleanEquals", ["argv"]: [s8q, !0] }),
      (Hqq = { ["fn"]: "booleanEquals", ["argv"]: [t8q, !0] }),
      (l8q = { ["fn"]: "getAttr", ["argv"]: [{ ["ref"]: "PartitionResult" }, "supportsFIPS"] }),
      (_qq = { ["ref"]: "PartitionResult" }),
      (i8q = { ["fn"]: "booleanEquals", ["argv"]: [!0, { ["fn"]: "getAttr", ["argv"]: [_qq, "supportsDualStack"] }] }),
      (n8q = [{ ["fn"]: "isSet", ["argv"]: [a8q] }]),
      (r8q = [e8q]),
      (o8q = [Hqq]),
      (Ii$ = {
        version: "1.0",
        parameters: { Region: c8q, UseDualStack: bf6, UseFIPS: bf6, Endpoint: c8q, UseGlobalEndpoint: bf6 },
        rules: [
          {
            conditions: [
              { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseGlobalEndpoint" }, !0] },
              { ["fn"]: "not", ["argv"]: n8q },
              F8q,
              U8q,
              { ["fn"]: "booleanEquals", ["argv"]: [s8q, !1] },
              { ["fn"]: "booleanEquals", ["argv"]: [t8q, !1] },
            ],
            rules: [
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "ap-northeast-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "ap-south-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "ap-southeast-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "ap-southeast-2"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              Q8q,
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "ca-central-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "eu-central-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "eu-north-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "eu-west-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "eu-west-2"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "eu-west-3"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "sa-east-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "us-east-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "us-east-2"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "us-west-1"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                conditions: [{ ["fn"]: "stringEquals", ["argv"]: [WX, "us-west-2"] }],
                endpoint: m0,
                ["type"]: "endpoint",
              },
              {
                endpoint: {
                  url: "https://sts.{Region}.{PartitionResult#dnsSuffix}",
                  properties: { authSchemes: [{ name: "sigv4", signingName: "sts", signingRegion: "{Region}" }] },
                  headers: Sh,
                },
                ["type"]: "endpoint",
              },
            ],
            ["type"]: "tree",
          },
          {
            conditions: n8q,
            rules: [
              {
                conditions: r8q,
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                ["type"]: "error",
              },
              {
                conditions: o8q,
                error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                ["type"]: "error",
              },
              { endpoint: { url: a8q, properties: Sh, headers: Sh }, ["type"]: "endpoint" },
            ],
            ["type"]: "tree",
          },
          {
            conditions: [F8q],
            rules: [
              {
                conditions: [U8q],
                rules: [
                  {
                    conditions: [e8q, Hqq],
                    rules: [
                      {
                        conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [!0, l8q] }, i8q],
                        rules: [
                          {
                            endpoint: {
                              url: "https://sts-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: Sh,
                              headers: Sh,
                            },
                            ["type"]: "endpoint",
                          },
                        ],
                        ["type"]: "tree",
                      },
                      {
                        error: "FIPS and DualStack are enabled, but this partition does not support one or both",
                        ["type"]: "error",
                      },
                    ],
                    ["type"]: "tree",
                  },
                  {
                    conditions: r8q,
                    rules: [
                      {
                        conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [l8q, !0] }],
                        rules: [
                          {
                            conditions: [
                              {
                                ["fn"]: "stringEquals",
                                ["argv"]: [{ ["fn"]: "getAttr", ["argv"]: [_qq, "name"] }, "aws-us-gov"],
                              },
                            ],
                            endpoint: { url: "https://sts.{Region}.amazonaws.com", properties: Sh, headers: Sh },
                            ["type"]: "endpoint",
                          },
                          {
                            endpoint: {
                              url: "https://sts-fips.{Region}.{PartitionResult#dnsSuffix}",
                              properties: Sh,
                              headers: Sh,
                            },
                            ["type"]: "endpoint",
                          },
                        ],
                        ["type"]: "tree",
                      },
                      { error: "FIPS is enabled but this partition does not support FIPS", ["type"]: "error" },
                    ],
                    ["type"]: "tree",
                  },
                  {
                    conditions: o8q,
                    rules: [
                      {
                        conditions: [i8q],
                        rules: [
                          {
                            endpoint: {
                              url: "https://sts.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: Sh,
                              headers: Sh,
                            },
                            ["type"]: "endpoint",
                          },
                        ],
                        ["type"]: "tree",
                      },
                      {
                        error: "DualStack is enabled but this partition does not support DualStack",
                        ["type"]: "error",
                      },
                    ],
                    ["type"]: "tree",
                  },
                  Q8q,
                  {
                    endpoint: { url: "https://sts.{Region}.{PartitionResult#dnsSuffix}", properties: Sh, headers: Sh },
                    ["type"]: "endpoint",
                  },
                ],
                ["type"]: "tree",
              },
            ],
            ["type"]: "tree",
          },
          { error: "Invalid Configuration: Missing Region", ["type"]: "error" },
        ],
      }),
      (qqq = Ii$);
