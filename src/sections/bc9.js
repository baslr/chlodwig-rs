    Z9();
    Tt();
    W8();
    SOH();
    s$();
    y6();
    H_();
    Rj();
    N_();
    lK();
    ykK = pH(() =>
      t9.object({
        client_data: t9.record(t9.unknown()).nullish(),
        additional_model_options: t9
          .array(
            t9
              .object({ model: t9.string(), name: t9.string(), description: t9.string() })
              .transform(({ model: H, name: _, description: q }) => ({ value: H, label: _, description: q })),
          )
          .nullish(),
      }),
    );
