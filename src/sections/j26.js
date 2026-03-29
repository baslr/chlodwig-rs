    w26();
    uwq();
    rpH();
    ms$ = new VB();
    Yk = class Yk extends Error {
      constructor(H, _ = {}) {
        super(H);
        (this.name = "RestError"),
          (this.code = _.code),
          (this.statusCode = _.statusCode),
          Object.defineProperty(this, "request", { value: _.request, enumerable: !1 }),
          Object.defineProperty(this, "response", { value: _.response, enumerable: !1 }),
          Object.defineProperty(this, Iwq, {
            value: () => {
              return `RestError: ${this.message} 
 ${ms$.sanitize(Object.assign(Object.assign({}, this), { request: this.request, response: this.response }))}`;
            },
            enumerable: !1,
          }),
          Object.setPrototypeOf(this, Yk.prototype);
      }
    };
    Yk.REQUEST_SEND_ERROR = "REQUEST_SEND_ERROR";
    Yk.PARSE_ERROR = "PARSE_ERROR";
