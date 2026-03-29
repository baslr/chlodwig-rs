    rz6();
    JA6();
    pJ();
    NS();
    xI();
    K_q = u(I6(), 1);
    Jw_ = class Jw_ extends (
      Jw.classBuilder()
        .ep(Yj)
        .m(function (H, _, q, $) {
          return [
            K_q.getEndpointPlugin(q, H.getEndpointParameterInstructions()),
            Wa8(q),
            qs8(q, { headerPrefix: "x-amz-bedrock-" }),
          ];
        })
        .s("AmazonBedrockFrontendService", "InvokeModelWithBidirectionalStream", {
          eventStream: { input: !0, output: !0 },
        })
        .n("BedrockRuntimeClient", "InvokeModelWithBidirectionalStreamCommand")
        .sc(rHq)
        .build()
    ) {};
