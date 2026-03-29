    (Ee8 = { ["required"]: !1, type: "string" }),
      (Ce8 = { ["required"]: !0, default: !1, type: "boolean" }),
      (be8 = { ["ref"]: "Endpoint" }),
      (Be8 = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseFIPS" }, !0] }),
      (ge8 = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseDualStack" }, !0] }),
      (XB = {}),
      (Ie8 = { ["fn"]: "getAttr", ["argv"]: [{ ["ref"]: "PartitionResult" }, "supportsFIPS"] }),
      (ue8 = {
        ["fn"]: "booleanEquals",
        ["argv"]: [!0, { ["fn"]: "getAttr", ["argv"]: [{ ["ref"]: "PartitionResult" }, "supportsDualStack"] }],
      }),
      (xe8 = [Be8]),
      (me8 = [ge8]),
      (pe8 = [{ ["ref"]: "Region" }]),
      (yF$ = {
        version: "1.0",
        parameters: { Region: Ee8, UseDualStack: Ce8, UseFIPS: Ce8, Endpoint: Ee8 },
        rules: [
          {
            conditions: [{ ["fn"]: "isSet", ["argv"]: [be8] }],
            rules: [
              {
                conditions: xe8,
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                type: "error",
              },
              {
                rules: [
                  {
                    conditions: me8,
                    error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                    type: "error",
                  },
                  { endpoint: { url: be8, properties: XB, headers: XB }, type: "endpoint" },
                ],
                type: "tree",
              },
            ],
            type: "tree",
          },
          {
            rules: [
              {
                conditions: [{ ["fn"]: "isSet", ["argv"]: pe8 }],
                rules: [
                  {
                    conditions: [{ ["fn"]: "aws.partition", ["argv"]: pe8, assign: "PartitionResult" }],
                    rules: [
                      {
                        conditions: [Be8, ge8],
                        rules: [
                          {
                            conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [!0, Ie8] }, ue8],
                            rules: [
                              {
                                rules: [
                                  {
                                    endpoint: {
                                      url: "https://bedrock-runtime-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                                      properties: XB,
                                      headers: XB,
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
                        conditions: xe8,
                        rules: [
                          {
                            conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [Ie8, !0] }],
                            rules: [
                              {
                                rules: [
                                  {
                                    endpoint: {
                                      url: "https://bedrock-runtime-fips.{Region}.{PartitionResult#dnsSuffix}",
                                      properties: XB,
                                      headers: XB,
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
                        conditions: me8,
                        rules: [
                          {
                            conditions: [ue8],
                            rules: [
                              {
                                rules: [
                                  {
                                    endpoint: {
                                      url: "https://bedrock-runtime.{Region}.{PartitionResult#dualStackDnsSuffix}",
                                      properties: XB,
                                      headers: XB,
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
                              url: "https://bedrock-runtime.{Region}.{PartitionResult#dnsSuffix}",
                              properties: XB,
                              headers: XB,
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
      (de8 = yF$);
