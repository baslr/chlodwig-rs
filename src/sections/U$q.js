    (C$q = { ["required"]: !1, type: "string" }),
      (b$q = { ["required"]: !0, default: !1, type: "boolean" }),
      (I$q = { ["ref"]: "Endpoint" }),
      (g$q = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseFIPS" }, !0] }),
      (d$q = { ["fn"]: "booleanEquals", ["argv"]: [{ ["ref"]: "UseDualStack" }, !0] }),
      (Dj = {}),
      (GpH = { ["ref"]: "Region" }),
      (u$q = { ["fn"]: "getAttr", ["argv"]: [{ ["ref"]: "PartitionResult" }, "supportsFIPS"] }),
      (c$q = { ["ref"]: "PartitionResult" }),
      (x$q = { ["fn"]: "booleanEquals", ["argv"]: [!0, { ["fn"]: "getAttr", ["argv"]: [c$q, "supportsDualStack"] }] }),
      (m$q = [g$q]),
      (p$q = [d$q]),
      (B$q = [GpH]),
      (Qn$ = {
        version: "1.0",
        parameters: { Region: C$q, UseDualStack: b$q, UseFIPS: b$q, Endpoint: C$q },
        rules: [
          {
            conditions: [{ ["fn"]: "isSet", ["argv"]: [I$q] }],
            rules: [
              {
                conditions: m$q,
                error: "Invalid Configuration: FIPS and custom endpoint are not supported",
                type: "error",
              },
              {
                conditions: p$q,
                error: "Invalid Configuration: Dualstack and custom endpoint are not supported",
                type: "error",
              },
              { endpoint: { url: I$q, properties: Dj, headers: Dj }, type: "endpoint" },
            ],
            type: "tree",
          },
          {
            conditions: [{ ["fn"]: "isSet", ["argv"]: B$q }],
            rules: [
              {
                conditions: [{ ["fn"]: "aws.partition", ["argv"]: B$q, assign: "PartitionResult" }],
                rules: [
                  {
                    conditions: [g$q, d$q],
                    rules: [
                      {
                        conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [!0, u$q] }, x$q],
                        rules: [
                          {
                            conditions: [{ ["fn"]: "stringEquals", ["argv"]: [GpH, "us-east-1"] }],
                            endpoint: {
                              url: "https://cognito-identity-fips.us-east-1.amazonaws.com",
                              properties: Dj,
                              headers: Dj,
                            },
                            type: "endpoint",
                          },
                          {
                            conditions: [{ ["fn"]: "stringEquals", ["argv"]: [GpH, "us-east-2"] }],
                            endpoint: {
                              url: "https://cognito-identity-fips.us-east-2.amazonaws.com",
                              properties: Dj,
                              headers: Dj,
                            },
                            type: "endpoint",
                          },
                          {
                            conditions: [{ ["fn"]: "stringEquals", ["argv"]: [GpH, "us-west-1"] }],
                            endpoint: {
                              url: "https://cognito-identity-fips.us-west-1.amazonaws.com",
                              properties: Dj,
                              headers: Dj,
                            },
                            type: "endpoint",
                          },
                          {
                            conditions: [{ ["fn"]: "stringEquals", ["argv"]: [GpH, "us-west-2"] }],
                            endpoint: {
                              url: "https://cognito-identity-fips.us-west-2.amazonaws.com",
                              properties: Dj,
                              headers: Dj,
                            },
                            type: "endpoint",
                          },
                          {
                            endpoint: {
                              url: "https://cognito-identity-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: Dj,
                              headers: Dj,
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
                    conditions: m$q,
                    rules: [
                      {
                        conditions: [{ ["fn"]: "booleanEquals", ["argv"]: [u$q, !0] }],
                        rules: [
                          {
                            endpoint: {
                              url: "https://cognito-identity-fips.{Region}.{PartitionResult#dnsSuffix}",
                              properties: Dj,
                              headers: Dj,
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
                    conditions: p$q,
                    rules: [
                      {
                        conditions: [x$q],
                        rules: [
                          {
                            conditions: [
                              {
                                ["fn"]: "stringEquals",
                                ["argv"]: ["aws", { ["fn"]: "getAttr", ["argv"]: [c$q, "name"] }],
                              },
                            ],
                            endpoint: {
                              url: "https://cognito-identity.{Region}.amazonaws.com",
                              properties: Dj,
                              headers: Dj,
                            },
                            type: "endpoint",
                          },
                          {
                            endpoint: {
                              url: "https://cognito-identity.{Region}.{PartitionResult#dualStackDnsSuffix}",
                              properties: Dj,
                              headers: Dj,
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
                      url: "https://cognito-identity.{Region}.{PartitionResult#dnsSuffix}",
                      properties: Dj,
                      headers: Dj,
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
      (F$q = Qn$);
