    If6();
    lw_();
    (Tk = u(qz(), 1)),
      (xi$ = [0, "com.amazonaws.sts", "accessKeySecretType", 8, 0]),
      (mi$ = [0, "com.amazonaws.sts", "clientTokenType", 8, 0]),
      (pi$ = [0, "com.amazonaws.sts", "SAMLAssertionType", 8, 0]),
      (Bi$ = [0, "com.amazonaws.sts", "tradeInTokenType", 8, 0]),
      (gi$ = [0, "com.amazonaws.sts", "webIdentityTokenType", 8, 0]),
      (uf6 = [3, "com.amazonaws.sts", "AssumedRoleUser", 0, ["AssumedRoleId", "Arn"], [0, 0]]),
      (di$ = [
        3,
        "com.amazonaws.sts",
        "AssumeRoleRequest",
        0,
        [
          "RoleArn",
          "RoleSessionName",
          "PolicyArns",
          "Policy",
          "DurationSeconds",
          "Tags",
          "TransitiveTagKeys",
          "ExternalId",
          "SerialNumber",
          "TokenCode",
          "SourceIdentity",
          "ProvidedContexts",
        ],
        [0, 0, () => iw_, 0, 1, () => xf6, 64, 0, 0, 0, 0, () => vn$],
      ]),
      (ci$ = [
        3,
        "com.amazonaws.sts",
        "AssumeRoleResponse",
        0,
        ["Credentials", "AssumedRoleUser", "PackedPolicySize", "SourceIdentity"],
        [[() => YKH, 0], () => uf6, 1, 0],
      ]),
      (Fi$ = [
        3,
        "com.amazonaws.sts",
        "AssumeRoleWithSAMLRequest",
        0,
        ["RoleArn", "PrincipalArn", "SAMLAssertion", "PolicyArns", "Policy", "DurationSeconds"],
        [0, 0, [() => pi$, 0], () => iw_, 0, 1],
      ]),
      (Ui$ = [
        3,
        "com.amazonaws.sts",
        "AssumeRoleWithSAMLResponse",
        0,
        [
          "Credentials",
          "AssumedRoleUser",
          "PackedPolicySize",
          "Subject",
          "SubjectType",
          "Issuer",
          "Audience",
          "NameQualifier",
          "SourceIdentity",
        ],
        [[() => YKH, 0], () => uf6, 1, 0, 0, 0, 0, 0, 0],
      ]),
      (Qi$ = [
        3,
        "com.amazonaws.sts",
        "AssumeRoleWithWebIdentityRequest",
        0,
        ["RoleArn", "RoleSessionName", "WebIdentityToken", "ProviderId", "PolicyArns", "Policy", "DurationSeconds"],
        [0, 0, [() => mi$, 0], 0, () => iw_, 0, 1],
      ]),
      (li$ = [
        3,
        "com.amazonaws.sts",
        "AssumeRoleWithWebIdentityResponse",
        0,
        [
          "Credentials",
          "SubjectFromWebIdentityToken",
          "AssumedRoleUser",
          "PackedPolicySize",
          "Provider",
          "Audience",
          "SourceIdentity",
        ],
        [[() => YKH, 0], 0, () => uf6, 1, 0, 0, 0],
      ]),
      (ii$ = [
        3,
        "com.amazonaws.sts",
        "AssumeRootRequest",
        0,
        ["TargetPrincipal", "TaskPolicyArn", "DurationSeconds"],
        [0, () => pqq, 1],
      ]),
      (ni$ = [3, "com.amazonaws.sts", "AssumeRootResponse", 0, ["Credentials", "SourceIdentity"], [[() => YKH, 0], 0]]),
      (YKH = [
        3,
        "com.amazonaws.sts",
        "Credentials",
        0,
        ["AccessKeyId", "SecretAccessKey", "SessionToken", "Expiration"],
        [0, [() => xi$, 0], 0, 4],
      ]),
      (ri$ = [3, "com.amazonaws.sts", "DecodeAuthorizationMessageRequest", 0, ["EncodedMessage"], [0]]),
      (oi$ = [3, "com.amazonaws.sts", "DecodeAuthorizationMessageResponse", 0, ["DecodedMessage"], [0]]),
      (ai$ = [
        -3,
        "com.amazonaws.sts",
        "ExpiredTokenException",
        { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["ExpiredTokenException", 400] },
        ["message"],
        [0],
      ]);
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(ai$, TpH);
    si$ = [
      -3,
      "com.amazonaws.sts",
      "ExpiredTradeInTokenException",
      { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["ExpiredTradeInTokenException", 400] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(si$, MpH);
    (ti$ = [3, "com.amazonaws.sts", "FederatedUser", 0, ["FederatedUserId", "Arn"], [0, 0]]),
      (ei$ = [3, "com.amazonaws.sts", "GetAccessKeyInfoRequest", 0, ["AccessKeyId"], [0]]),
      (Hn$ = [3, "com.amazonaws.sts", "GetAccessKeyInfoResponse", 0, ["Account"], [0]]),
      (_n$ = [3, "com.amazonaws.sts", "GetCallerIdentityRequest", 0, [], []]),
      (qn$ = [3, "com.amazonaws.sts", "GetCallerIdentityResponse", 0, ["UserId", "Account", "Arn"], [0, 0, 0]]),
      ($n$ = [3, "com.amazonaws.sts", "GetDelegatedAccessTokenRequest", 0, ["TradeInToken"], [[() => Bi$, 0]]]),
      (Kn$ = [
        3,
        "com.amazonaws.sts",
        "GetDelegatedAccessTokenResponse",
        0,
        ["Credentials", "PackedPolicySize", "AssumedPrincipal"],
        [[() => YKH, 0], 1, 0],
      ]),
      (On$ = [
        3,
        "com.amazonaws.sts",
        "GetFederationTokenRequest",
        0,
        ["Name", "Policy", "PolicyArns", "DurationSeconds", "Tags"],
        [0, 0, () => iw_, 1, () => xf6],
      ]),
      (Tn$ = [
        3,
        "com.amazonaws.sts",
        "GetFederationTokenResponse",
        0,
        ["Credentials", "FederatedUser", "PackedPolicySize"],
        [[() => YKH, 0], () => ti$, 1],
      ]),
      (zn$ = [
        3,
        "com.amazonaws.sts",
        "GetSessionTokenRequest",
        0,
        ["DurationSeconds", "SerialNumber", "TokenCode"],
        [1, 0, 0],
      ]),
      (An$ = [3, "com.amazonaws.sts", "GetSessionTokenResponse", 0, ["Credentials"], [[() => YKH, 0]]]),
      (fn$ = [
        3,
        "com.amazonaws.sts",
        "GetWebIdentityTokenRequest",
        0,
        ["Audience", "DurationSeconds", "SigningAlgorithm", "Tags"],
        [64, 1, 0, () => xf6],
      ]),
      (wn$ = [
        3,
        "com.amazonaws.sts",
        "GetWebIdentityTokenResponse",
        0,
        ["WebIdentityToken", "Expiration"],
        [[() => gi$, 0], 4],
      ]),
      (Yn$ = [
        -3,
        "com.amazonaws.sts",
        "IDPCommunicationErrorException",
        { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["IDPCommunicationError", 400] },
        ["message"],
        [0],
      ]);
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Yn$, DpH);
    Dn$ = [
      -3,
      "com.amazonaws.sts",
      "IDPRejectedClaimException",
      { ["error"]: "client", ["httpError"]: 403, ["awsQueryError"]: ["IDPRejectedClaim", 403] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Dn$, wpH);
    jn$ = [
      -3,
      "com.amazonaws.sts",
      "InvalidAuthorizationMessageException",
      { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["InvalidAuthorizationMessageException", 400] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(jn$, jpH);
    Mn$ = [
      -3,
      "com.amazonaws.sts",
      "InvalidIdentityTokenException",
      { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["InvalidIdentityToken", 400] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Mn$, YpH);
    Jn$ = [
      -3,
      "com.amazonaws.sts",
      "JWTPayloadSizeExceededException",
      { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["JWTPayloadSizeExceededException", 400] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Jn$, JpH);
    Pn$ = [
      -3,
      "com.amazonaws.sts",
      "MalformedPolicyDocumentException",
      { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["MalformedPolicyDocument", 400] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Pn$, zpH);
    Xn$ = [
      -3,
      "com.amazonaws.sts",
      "OutboundWebIdentityFederationDisabledException",
      {
        ["error"]: "client",
        ["httpError"]: 403,
        ["awsQueryError"]: ["OutboundWebIdentityFederationDisabledException", 403],
      },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Xn$, PpH);
    Wn$ = [
      -3,
      "com.amazonaws.sts",
      "PackedPolicyTooLargeException",
      { ["error"]: "client", ["httpError"]: 400, ["awsQueryError"]: ["PackedPolicyTooLarge", 400] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Wn$, ApH);
    (pqq = [3, "com.amazonaws.sts", "PolicyDescriptorType", 0, ["arn"], [0]]),
      (Gn$ = [3, "com.amazonaws.sts", "ProvidedContext", 0, ["ProviderArn", "ContextAssertion"], [0, 0]]),
      (Rn$ = [
        -3,
        "com.amazonaws.sts",
        "RegionDisabledException",
        { ["error"]: "client", ["httpError"]: 403, ["awsQueryError"]: ["RegionDisabledException", 403] },
        ["message"],
        [0],
      ]);
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Rn$, fpH);
    Zn$ = [
      -3,
      "com.amazonaws.sts",
      "SessionDurationEscalationException",
      { ["error"]: "client", ["httpError"]: 403, ["awsQueryError"]: ["SessionDurationEscalationException", 403] },
      ["message"],
      [0],
    ];
    Tk.TypeRegistry.for("com.amazonaws.sts").registerError(Zn$, XpH);
    (Ln$ = [3, "com.amazonaws.sts", "Tag", 0, ["Key", "Value"], [0, 0]]),
      (kn$ = [-3, "smithy.ts.sdk.synthetic.com.amazonaws.sts", "STSServiceException", 0, [], []]);
    Tk.TypeRegistry.for("smithy.ts.sdk.synthetic.com.amazonaws.sts").registerError(kn$, VM);
    (iw_ = [1, "com.amazonaws.sts", "policyDescriptorListType", 0, () => pqq]),
      (vn$ = [1, "com.amazonaws.sts", "ProvidedContextsListType", 0, () => Gn$]),
      (xf6 = [1, "com.amazonaws.sts", "tagListType", 0, () => Ln$]),
      (Bqq = [9, "com.amazonaws.sts", "AssumeRole", 0, () => di$, () => ci$]),
      (gqq = [9, "com.amazonaws.sts", "AssumeRoleWithSAML", 0, () => Fi$, () => Ui$]),
      (dqq = [9, "com.amazonaws.sts", "AssumeRoleWithWebIdentity", 0, () => Qi$, () => li$]),
      (cqq = [9, "com.amazonaws.sts", "AssumeRoot", 0, () => ii$, () => ni$]),
      (Fqq = [9, "com.amazonaws.sts", "DecodeAuthorizationMessage", 0, () => ri$, () => oi$]),
      (Uqq = [9, "com.amazonaws.sts", "GetAccessKeyInfo", 0, () => ei$, () => Hn$]),
      (Qqq = [9, "com.amazonaws.sts", "GetCallerIdentity", 0, () => _n$, () => qn$]),
      (lqq = [9, "com.amazonaws.sts", "GetDelegatedAccessToken", 0, () => $n$, () => Kn$]),
      (iqq = [9, "com.amazonaws.sts", "GetFederationToken", 0, () => On$, () => Tn$]),
      (nqq = [9, "com.amazonaws.sts", "GetSessionToken", 0, () => zn$, () => An$]),
      (rqq = [9, "com.amazonaws.sts", "GetWebIdentityToken", 0, () => fn$, () => wn$]);
