    l36();
    Q36();
    (JJH = u(qz(), 1)),
      (BT_ = [0, "com.amazonaws.sso", "AccessTokenType", 8, 0]),
      (Ny$ = [0, "com.amazonaws.sso", "SecretAccessKeyType", 8, 0]),
      (hy$ = [0, "com.amazonaws.sso", "SessionTokenType", 8, 0]),
      (yy$ = [3, "com.amazonaws.sso", "AccountInfo", 0, ["accountId", "accountName", "emailAddress"], [0, 0, 0]]),
      (Vy$ = [
        3,
        "com.amazonaws.sso",
        "GetRoleCredentialsRequest",
        0,
        ["roleName", "accountId", "accessToken"],
        [
          [0, { ["httpQuery"]: "role_name" }],
          [0, { ["httpQuery"]: "account_id" }],
          [() => BT_, { ["httpHeader"]: "x-amz-sso_bearer_token" }],
        ],
      ]),
      (Sy$ = [3, "com.amazonaws.sso", "GetRoleCredentialsResponse", 0, ["roleCredentials"], [[() => py$, 0]]]),
      (Ey$ = [
        -3,
        "com.amazonaws.sso",
        "InvalidRequestException",
        { ["error"]: "client", ["httpError"]: 400 },
        ["message"],
        [0],
      ]);
    JJH.TypeRegistry.for("com.amazonaws.sso").registerError(Ey$, uT_);
    (Cy$ = [
      3,
      "com.amazonaws.sso",
      "ListAccountRolesRequest",
      0,
      ["nextToken", "maxResults", "accessToken", "accountId"],
      [
        [0, { ["httpQuery"]: "next_token" }],
        [1, { ["httpQuery"]: "max_result" }],
        [() => BT_, { ["httpHeader"]: "x-amz-sso_bearer_token" }],
        [0, { ["httpQuery"]: "account_id" }],
      ],
    ]),
      (by$ = [3, "com.amazonaws.sso", "ListAccountRolesResponse", 0, ["nextToken", "roleList"], [0, () => Qy$]]),
      (Iy$ = [
        3,
        "com.amazonaws.sso",
        "ListAccountsRequest",
        0,
        ["nextToken", "maxResults", "accessToken"],
        [
          [0, { ["httpQuery"]: "next_token" }],
          [1, { ["httpQuery"]: "max_result" }],
          [() => BT_, { ["httpHeader"]: "x-amz-sso_bearer_token" }],
        ],
      ]),
      (uy$ = [3, "com.amazonaws.sso", "ListAccountsResponse", 0, ["nextToken", "accountList"], [0, () => Uy$]]),
      (xy$ = [
        3,
        "com.amazonaws.sso",
        "LogoutRequest",
        0,
        ["accessToken"],
        [[() => BT_, { ["httpHeader"]: "x-amz-sso_bearer_token" }]],
      ]),
      (my$ = [
        -3,
        "com.amazonaws.sso",
        "ResourceNotFoundException",
        { ["error"]: "client", ["httpError"]: 404 },
        ["message"],
        [0],
      ]);
    JJH.TypeRegistry.for("com.amazonaws.sso").registerError(my$, xT_);
    (py$ = [
      3,
      "com.amazonaws.sso",
      "RoleCredentials",
      0,
      ["accessKeyId", "secretAccessKey", "sessionToken", "expiration"],
      [0, [() => Ny$, 0], [() => hy$, 0], 1],
    ]),
      (By$ = [3, "com.amazonaws.sso", "RoleInfo", 0, ["roleName", "accountId"], [0, 0]]),
      (gy$ = [
        -3,
        "com.amazonaws.sso",
        "TooManyRequestsException",
        { ["error"]: "client", ["httpError"]: 429 },
        ["message"],
        [0],
      ]);
    JJH.TypeRegistry.for("com.amazonaws.sso").registerError(gy$, mT_);
    dy$ = [
      -3,
      "com.amazonaws.sso",
      "UnauthorizedException",
      { ["error"]: "client", ["httpError"]: 401 },
      ["message"],
      [0],
    ];
    JJH.TypeRegistry.for("com.amazonaws.sso").registerError(dy$, pT_);
    Fy$ = [-3, "smithy.ts.sdk.synthetic.com.amazonaws.sso", "SSOServiceException", 0, [], []];
    JJH.TypeRegistry.for("smithy.ts.sdk.synthetic.com.amazonaws.sso").registerError(Fy$, eQ);
    (Uy$ = [1, "com.amazonaws.sso", "AccountListType", 0, () => yy$]),
      (Qy$ = [1, "com.amazonaws.sso", "RoleListType", 0, () => By$]),
      (NB8 = [
        9,
        "com.amazonaws.sso",
        "GetRoleCredentials",
        { ["http"]: ["GET", "/federation/credentials", 200] },
        () => Vy$,
        () => Sy$,
      ]),
      (hB8 = [
        9,
        "com.amazonaws.sso",
        "ListAccountRoles",
        { ["http"]: ["GET", "/assignment/roles", 200] },
        () => Cy$,
        () => by$,
      ]),
      (yB8 = [
        9,
        "com.amazonaws.sso",
        "ListAccounts",
        { ["http"]: ["GET", "/assignment/accounts", 200] },
        () => Iy$,
        () => uy$,
      ]),
      (VB8 = [9, "com.amazonaws.sso", "Logout", { ["http"]: ["POST", "/logout", 200] }, () => xy$, () => cy$]);
