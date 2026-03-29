    Q36();
    uT_ = class uT_ extends eQ {
      name = "InvalidRequestException";
      $fault = "client";
      constructor(H) {
        super({ name: "InvalidRequestException", $fault: "client", ...H });
        Object.setPrototypeOf(this, uT_.prototype);
      }
    };
    xT_ = class xT_ extends eQ {
      name = "ResourceNotFoundException";
      $fault = "client";
      constructor(H) {
        super({ name: "ResourceNotFoundException", $fault: "client", ...H });
        Object.setPrototypeOf(this, xT_.prototype);
      }
    };
    mT_ = class mT_ extends eQ {
      name = "TooManyRequestsException";
      $fault = "client";
      constructor(H) {
        super({ name: "TooManyRequestsException", $fault: "client", ...H });
        Object.setPrototypeOf(this, mT_.prototype);
      }
    };
    pT_ = class pT_ extends eQ {
      name = "UnauthorizedException";
      $fault = "client";
      constructor(H) {
        super({ name: "UnauthorizedException", $fault: "client", ...H });
        Object.setPrototypeOf(this, pT_.prototype);
      }
    };
