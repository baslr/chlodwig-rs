    (JQ8 = { ["required"]: !1, type: "string" }),
      (PQ8 = { ["required"]: !0, default: !1, type: "boolean" }),
      (XQ8 = { ["ref"]: "Endpoint" }),
      (kQ8 = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseFIPS" }, !0] }),
      (vQ8 = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseDualStack" }, !0] }),
      (MB = {}),
      (WQ8 = { ["fn"]: "getAttr", ["argv"]: [{ ["ref"]: "PartitionResult" }, "supportsFIPS"] }),
      (GQ8 = {
        ["fn"]: "booleanEquals",
        ["argv"]: [!0, { ["fn"]: "getAttr", ["argv"]: [{ ["ref"]: "PartitionResult" }, "supportsDualStack"] }],
      }),
      (RQ8 = [kQ8]),
      (ZQ8 = [vQ8]),
      (LQ8 = [{ ["ref"]: "Region" }]),
      (BC$ = {
        version: "1.0",
        parameters: { Region: JQ8, UseDualStack: PQ8, UseFIPS: PQ8, Endpoint: JQ8 },
        rules: [
          {
            conditions: [{ ["fn"]: "isSet", ["argv"]: [XQ8] }],
            rules: [
              {
                conditions: RQ8,
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                type: "error",
              },
              {
                rules: [
                  {
                    conditions: ZQ8,
                    error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                    type: "error",
                  },
                  { endpoint: { url: XQ8, properties: MB, headers: MB }, type: "endpoint" },
                ],
                type: "tree",
              },
            ],
            type: "tree",
          },
          {
            rules: [
              {
                conditions: [{ ["fn"]: "isSet", ["argv"]: LQ8 }],
                rules: [
                  {
                    conditions: [{ ["fn"]: "aws.partition", ["argv"]: LQ8, assign: "PartitionResult" }],
                    rules: [
                      {
                        conditions: [kQ8, vQ8],
                        rules: [
                          {
                            conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [!0, WQ8] }, GQ8],
                            rules: [
                              {
                                rules: [
                                  {
                                    endpoint: {
                                      url: "https://bedrock-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                                      properties: MB,
                                      headers: MB,
                                    },
                                    type: "endpoint",
                                  },
                                ],
                                type: "tree",
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
                        conditions: RQ8,
                        rules: [
                          {
                            conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [WQ8, !0] }],
                            rules: [
                              {
                                rules: [
                                  {
                                    endpoint: {
                                      url: "https://bedrock-fips.{Region}.{PartitionResult#dnsSuffix}",
                                      properties: MB,
                                      headers: MB,
                                    },
                                    type: "endpoint",
                                  },
                                ],
                                type: "tree",
                              },
                            ],
                            type: "tree",
                          },
                          { error: "FIPS is enabled but this partition does not support FIPS", type: "error" },
                        ],
                        type: "tree",
                      },
                      {
                        conditions: ZQ8,
                        rules: [
                          {
                            conditions: [GQ8],
                            rules: [
                              {
                                rules: [
                                  {
                                    endpoint: {
                                      url: "https://bedrock.{Region}.{PartitionResult#dualStackDnsSuffix}",
                                      properties: MB,
                                      headers: MB,
                                    },
                                    type: "endpoint",
                                  },
                                ],
                                type: "tree",
                              },
                            ],
                            type: "tree",
                          },
                          {
                            error: "DualStack is enabled but this partition does not support DualStack",
                            type: "error",
                          },
                        ],
                        type: "tree",
                      },
                      {
                        rules: [
                          {
                            endpoint: {
                              url: "https://bedrock.{Region}.{PartitionResult#dnsSuffix}",
                              properties: MB,
                              headers: MB,
                            },
                            type: "endpoint",
                          },
                        ],
                        type: "tree",
                      },
                    ],
                    type: "tree",
                  },
                ],
                type: "tree",
              },
              { error: "Invalid Configuration: Missing Region", type: "error" },
            ],
            type: "tree",
          },
        ],
      }),
      (NQ8 = BC$);
