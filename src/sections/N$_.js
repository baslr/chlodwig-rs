    rU();
    st_();
    R4H = class R4H extends Promise {
      constructor(H, _, q = v$_) {
        super(($) => {
          $(null);
        });
        (this.responsePromise = _), (this.parseResponse = q), WbH.set(this, void 0), _7(this, WbH, H, "f");
      }
      _thenUnwrap(H) {
        return new R4H(V6(this, WbH, "f"), this.responsePromise, async (_, q) =>
          at_(H(await this.parseResponse(_, q), q), q.response),
        );
      }
      asResponse() {
        return this.responsePromise.then((H) => H.response);
      }
      async withResponse() {
        let [H, _] = await Promise.all([this.parse(), this.asResponse()]);
        return { data: H, response: _, request_id: _.headers.get("request-id") };
      }
      parse() {
        if (!this.parsedPromise)
          this.parsedPromise = this.responsePromise.then((H) => this.parseResponse(V6(this, WbH, "f"), H));
        return this.parsedPromise;
      }
      then(H, _) {
        return this.parse().then(H, _);
      }
      catch(H) {
        return this.parse().catch(H);
      }
      finally(H) {
        return this.parse().finally(H);
      }
    };
    WbH = new WeakMap();
