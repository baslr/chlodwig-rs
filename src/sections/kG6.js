    Hi = {
      fromJSON(H) {
        return {
          account_id: LG6(H.account_id) ? globalThis.Number(H.account_id) : 0,
          organization_uuid: LG6(H.organization_uuid) ? globalThis.String(H.organization_uuid) : "",
          account_uuid: LG6(H.account_uuid) ? globalThis.String(H.account_uuid) : "",
        };
      },
      toJSON(H) {
        let _ = {};
        if (H.account_id !== void 0) _.account_id = Math.round(H.account_id);
        if (H.organization_uuid !== void 0) _.organization_uuid = H.organization_uuid;
        if (H.account_uuid !== void 0) _.account_uuid = H.account_uuid;
        return _;
      },
      create(H) {
        return Hi.fromPartial(H ?? {});
      },
      fromPartial(H) {
        let _ = EY4();
        return (
          (_.account_id = H.account_id ?? 0),
          (_.organization_uuid = H.organization_uuid ?? ""),
          (_.account_uuid = H.account_uuid ?? ""),
          _
        );
      },
    };
