  var zB = d((NI) => {
    var rMH = vI(),
      oG$ = YS(),
      xE8 = (H, _ = !1) => {
        if (_) {
          for (let q of H.split(".")) if (!xE8(q)) return !1;
          return !0;
        }
        if (!rMH.isValidHostLabel(H)) return !1;
        if (H.length < 3 || H.length > 63) return !1;
        if (H !== H.toLowerCase()) return !1;
        if (rMH.isIpAddress(H)) return !1;
        return !0;
      },
      uE8 = ":",
      aG$ = "/",
      sG$ = (H) => {
        let _ = H.split(uE8);
        if (_.length < 6) return null;
        let [q, $, K, O, T, ...z] = _;
        if (q !== "arn" || $ === "" || K === "" || z.join(uE8) === "") return null;
        let A = z.map((f) => f.split(aG$)).flat();
        return { partition: $, service: K, region: O, accountId: T, resourceId: A };
      },
      tG$ = [
        {
          id: "aws",
          outputs: {
            dnsSuffix: "amazonaws.com",
            dualStackDnsSuffix: "api.aws",
            implicitGlobalRegion: "us-east-1",
            name: "aws",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
          regions: {
            "af-south-1": { description: "Africa (Cape Town)" },
            "ap-east-1": { description: "Asia Pacific (Hong Kong)" },
            "ap-east-2": { description: "Asia Pacific (Taipei)" },
            "ap-northeast-1": { description: "Asia Pacific (Tokyo)" },
            "ap-northeast-2": { description: "Asia Pacific (Seoul)" },
            "ap-northeast-3": { description: "Asia Pacific (Osaka)" },
            "ap-south-1": { description: "Asia Pacific (Mumbai)" },
            "ap-south-2": { description: "Asia Pacific (Hyderabad)" },
            "ap-southeast-1": { description: "Asia Pacific (Singapore)" },
            "ap-southeast-2": { description: "Asia Pacific (Sydney)" },
            "ap-southeast-3": { description: "Asia Pacific (Jakarta)" },
            "ap-southeast-4": { description: "Asia Pacific (Melbourne)" },
            "ap-southeast-5": { description: "Asia Pacific (Malaysia)" },
            "ap-southeast-6": { description: "Asia Pacific (New Zealand)" },
            "ap-southeast-7": { description: "Asia Pacific (Thailand)" },
            "aws-global": { description: "aws global region" },
            "ca-central-1": { description: "Canada (Central)" },
            "ca-west-1": { description: "Canada West (Calgary)" },
            "eu-central-1": { description: "Europe (Frankfurt)" },
            "eu-central-2": { description: "Europe (Zurich)" },
            "eu-north-1": { description: "Europe (Stockholm)" },
            "eu-south-1": { description: "Europe (Milan)" },
            "eu-south-2": { description: "Europe (Spain)" },
            "eu-west-1": { description: "Europe (Ireland)" },
            "eu-west-2": { description: "Europe (London)" },
            "eu-west-3": { description: "Europe (Paris)" },
            "il-central-1": { description: "Israel (Tel Aviv)" },
            "me-central-1": { description: "Middle East (UAE)" },
            "me-south-1": { description: "Middle East (Bahrain)" },
            "mx-central-1": { description: "Mexico (Central)" },
            "sa-east-1": { description: "South America (Sao Paulo)" },
            "us-east-1": { description: "US East (N. Virginia)" },
            "us-east-2": { description: "US East (Ohio)" },
            "us-west-1": { description: "US West (N. California)" },
            "us-west-2": { description: "US West (Oregon)" },
          },
        },
        {
          id: "aws-cn",
          outputs: {
            dnsSuffix: "amazonaws.com.cn",
            dualStackDnsSuffix: "api.amazonwebservices.com.cn",
            implicitGlobalRegion: "cn-northwest-1",
            name: "aws-cn",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^cn\\-\\w+\\-\\d+$",
          regions: {
            "aws-cn-global": { description: "aws-cn global region" },
            "cn-north-1": { description: "China (Beijing)" },
            "cn-northwest-1": { description: "China (Ningxia)" },
          },
        },
        {
          id: "aws-eusc",
          outputs: {
            dnsSuffix: "amazonaws.eu",
            dualStackDnsSuffix: "api.amazonwebservices.eu",
            implicitGlobalRegion: "eusc-de-east-1",
            name: "aws-eusc",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^eusc\\-(de)\\-\\w+\\-\\d+$",
          regions: { "eusc-de-east-1": { description: "EU (Germany)" } },
        },
        {
          id: "aws-iso",
          outputs: {
            dnsSuffix: "c2s.ic.gov",
            dualStackDnsSuffix: "api.aws.ic.gov",
            implicitGlobalRegion: "us-iso-east-1",
            name: "aws-iso",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^us\\-iso\\-\\w+\\-\\d+$",
          regions: {
            "aws-iso-global": { description: "aws-iso global region" },
            "us-iso-east-1": { description: "US ISO East" },
            "us-iso-west-1": { description: "US ISO WEST" },
          },
        },
        {
          id: "aws-iso-b",
          outputs: {
            dnsSuffix: "sc2s.sgov.gov",
            dualStackDnsSuffix: "api.aws.scloud",
            implicitGlobalRegion: "us-isob-east-1",
            name: "aws-iso-b",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^us\\-isob\\-\\w+\\-\\d+$",
          regions: {
            "aws-iso-b-global": { description: "aws-iso-b global region" },
            "us-isob-east-1": { description: "US ISOB East (Ohio)" },
            "us-isob-west-1": { description: "US ISOB West" },
          },
        },
        {
          id: "aws-iso-e",
          outputs: {
            dnsSuffix: "cloud.adc-e.uk",
            dualStackDnsSuffix: "api.cloud-aws.adc-e.uk",
            implicitGlobalRegion: "eu-isoe-west-1",
            name: "aws-iso-e",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^eu\\-isoe\\-\\w+\\-\\d+$",
          regions: {
            "aws-iso-e-global": { description: "aws-iso-e global region" },
            "eu-isoe-west-1": { description: "EU ISOE West" },
          },
        },
        {
          id: "aws-iso-f",
          outputs: {
            dnsSuffix: "csp.hci.ic.gov",
            dualStackDnsSuffix: "api.aws.hci.ic.gov",
            implicitGlobalRegion: "us-isof-south-1",
            name: "aws-iso-f",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^us\\-isof\\-\\w+\\-\\d+$",
          regions: {
            "aws-iso-f-global": { description: "aws-iso-f global region" },
            "us-isof-east-1": { description: "US ISOF EAST" },
            "us-isof-south-1": { description: "US ISOF SOUTH" },
          },
        },
        {
          id: "aws-us-gov",
          outputs: {
            dnsSuffix: "amazonaws.com",
            dualStackDnsSuffix: "api.aws",
            implicitGlobalRegion: "us-gov-west-1",
            name: "aws-us-gov",
            supportsDualStack: !0,
            supportsFIPS: !0,
          },
          regionRegex: "^us\\-gov\\-\\w+\\-\\d+$",
          regions: {
            "aws-us-gov-global": { description: "aws-us-gov global region" },
            "us-gov-east-1": { description: "AWS GovCloud (US-East)" },
            "us-gov-west-1": { description: "AWS GovCloud (US-West)" },
          },
        },
      ],
      eG$ = "1.1",
      mE8 = { partitions: tG$, version: eG$ },
      pE8 = mE8,
      BE8 = "",
      gE8 = (H) => {
        let { partitions: _ } = pE8;
        for (let $ of _) {
          let { regions: K, outputs: O } = $;
          for (let [T, z] of Object.entries(K)) if (T === H) return { ...O, ...z };
        }
        for (let $ of _) {
          let { regionRegex: K, outputs: O } = $;
          if (new RegExp(K).test(H)) return { ...O };
        }
        let q = _.find(($) => $.id === "aws");
        if (!q)
          throw Error(
            "Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.",
          );
        return { ...q.outputs };
      },
      dE8 = (H, _ = "") => {
        (pE8 = H), (BE8 = _);
      },
      HR$ = () => {
        dE8(mE8, "");
      },
      _R$ = () => BE8,
      cE8 = { isVirtualHostableS3Bucket: xE8, parseArn: sG$, partition: gE8 };
    rMH.customEndpointFunctions.aws = cE8;
    var qR$ = (H) => {
        if (typeof H.endpointProvider !== "function")
          throw Error("@aws-sdk/util-endpoint - endpointProvider and endpoint missing in config for this client.");
        let { endpoint: _ } = H;
        if (_ === void 0)
          H.endpoint = async () => {
            return FE8(
              H.endpointProvider(
                {
                  Region: typeof H.region === "function" ? await H.region() : H.region,
                  UseDualStack:
                    typeof H.useDualstackEndpoint === "function"
                      ? await H.useDualstackEndpoint()
                      : H.useDualstackEndpoint,
                  UseFIPS: typeof H.useFipsEndpoint === "function" ? await H.useFipsEndpoint() : H.useFipsEndpoint,
                  Endpoint: void 0,
                },
                { logger: H.logger },
              ),
            );
          };
        return H;
      },
      FE8 = (H) => oG$.parseUrl(H.url);
    Object.defineProperty(NI, "EndpointError", {
      enumerable: !0,
      get: function () {
        return rMH.EndpointError;
      },
    });
    Object.defineProperty(NI, "isIpAddress", {
      enumerable: !0,
      get: function () {
        return rMH.isIpAddress;
      },
    });
    Object.defineProperty(NI, "resolveEndpoint", {
      enumerable: !0,
      get: function () {
        return rMH.resolveEndpoint;
      },
    });
    NI.awsEndpointFunctions = cE8;
    NI.getUserAgentPrefix = _R$;
    NI.partition = gE8;
    NI.resolveDefaultAwsRegionalEndpointsConfig = qR$;
    NI.setPartitionInfo = dE8;
    NI.toEndpointV1 = FE8;
    NI.useDefaultPartitionInfo = HR$;
  });
