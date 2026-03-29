    (up8 = { ["required"]: !1, type: "string" }),
      (xp8 = { ["required"]: !0, default: !1, type: "boolean" }),
      (mp8 = { ["ref"]: "Endpoint" }),
      (Fp8 = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseFIPS" }, !0] }),
      (Up8 = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseDualStack" }, !0] }),
      (RS = {}),
      (pp8 = { ["fn"]: "getAttr", ["argv"]: [{ ["ref"]: "PartitionResult" }, "supportsFIPS"] }),
      (Qp8 = { ["ref"]: "PartitionResult" }),
      (Bp8 = { ["fn"]: "booleanEquals", ["argv"]: [!0, { ["fn"]: "getAttr", ["argv"]: [Qp8, "supportsDualStack"] }] }),
      (gp8 = [Fp8]),
      (dp8 = [Up8]),
      (cp8 = [{ ["ref"]: "Region" }]),
      (ky$ = {
        version: "1.0",
        parameters: { Region: up8, UseDualStack: xp8, UseFIPS: xp8, Endpoint: up8 },
        rules: [
          {
            conditions: [{ ["fn"]: "isSet", ["argv"]: [mp8] }],
            rules: [
              {
                conditions: gp8,
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                type: "error",
              },
              {
                conditions: dp8,
                error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                type: "error",
              },
              { endpoint: { url: mp8, properties: RS, headers: RS }, type: "endpoint" },
            ],
            type: "tree",
          },
          {
            conditions: [{ ["fn"]: "isSet", ["argv"]: cp8 }],
            rules: [
              {
                conditions: [{ ["fn"]: "aws.partition", ["argv"]: cp8, assign: "PartitionResult" }],
                rules: [
                  {
                    conditions: [Fp8, Up8],
                    rules: [
                      {
                        conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [!0, pp8] }, Bp8],
                        rules: [
                          {
                            endpoint: {
                              url: "https://portal.sso-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: RS,
                              headers: RS,
                            },
                            type: "endpoint",
                          },
                        ],
                        type: "tree",
                      },
                      {
                        error: "FIPS and DualStack are enabled, but this partition does not support one or both",
                        type: "error",
                      },
                    ],
                    type: "tree",
                  },
                  {
                    conditions: gp8,
                    rules: [
                      {
                        conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [pp8, !0] }],
                        rules: [
                          {
                            conditions: [
                              {
                                ["fn"]: "stringEquals",
                                ["argv"]: [{ ["fn"]: "getAttr", ["argv"]: [Qp8, "name"] }, "aws-us-gov"],
                              },
                            ],
                            endpoint: { url: "https://portal.sso.{Region}.amazonaws.com", properties: RS, headers: RS },
                            type: "endpoint",
                          },
                          {
                            endpoint: {
                              url: "https://portal.sso-fips.{Region}.{PartitionResult#dnsSuffix}",
                              properties: RS,
                              headers: RS,
                            },
                            type: "endpoint",
                          },
                        ],
                        type: "tree",
                      },
                      { error: "FIPS is enabled but this partition does not support FIPS", type: "error" },
                    ],
                    type: "tree",
                  },
                  {
                    conditions: dp8,
                    rules: [
                      {
                        conditions: [Bp8],
                        rules: [
                          {
                            endpoint: {
                              url: "https://portal.sso.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: RS,
                              headers: RS,
                            },
                            type: "endpoint",
                          },
                        ],
                        type: "tree",
                      },
                      { error: "DualStack is enabled but this partition does not support DualStack", type: "error" },
                    ],
                    type: "tree",
                  },
                  {
                    endpoint: {
                      url: "https://portal.sso.{Region}.{PartitionResult#dnsSuffix}",
                      properties: RS,
                      headers: RS,
                    },
                    type: "endpoint",
                  },
                ],
                type: "tree",
              },
            ],
            type: "tree",
          },
          { error: "Invalid Configuration: Missing Region", type: "error" },
        ],
      }),
      (lp8 = ky$);
