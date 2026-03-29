    (Msq = u(require("net"))),
      (Psq = u(require("net"))),
      (Jsq = ((H) => {
        return (H[(H.connect = 1)] = "connect"), (H[(H.bind = 2)] = "bind"), (H[(H.udp = 3)] = "udp"), H;
      })(Jsq || {})),
      (GV6 = ((H) => {
        return (
          (H[(H.REQUEST_GRANTED = 0)] = "REQUEST_GRANTED"),
          (H[(H.GENERAL_FAILURE = 1)] = "GENERAL_FAILURE"),
          (H[(H.CONNECTION_NOT_ALLOWED = 2)] = "CONNECTION_NOT_ALLOWED"),
          (H[(H.NETWORK_UNREACHABLE = 3)] = "NETWORK_UNREACHABLE"),
          (H[(H.HOST_UNREACHABLE = 4)] = "HOST_UNREACHABLE"),
          (H[(H.CONNECTION_REFUSED = 5)] = "CONNECTION_REFUSED"),
          (H[(H.TTL_EXPIRED = 6)] = "TTL_EXPIRED"),
          (H[(H.COMMAND_NOT_SUPPORTED = 7)] = "COMMAND_NOT_SUPPORTED"),
          (H[(H.ADDRESS_TYPE_NOT_SUPPORTED = 8)] = "ADDRESS_TYPE_NOT_SUPPORTED"),
          H
        );
      })(GV6 || {}));
