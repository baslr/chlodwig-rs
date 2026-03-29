    rU();
    W0();
    st_();
    N$_();
    G4H();
    tt_ = class tt_ {
      constructor(H, _, q, $) {
        h$_.set(this, void 0), _7(this, h$_, H, "f"), (this.options = $), (this.response = _), (this.body = q);
      }
      hasNextPage() {
        if (!this.getPaginatedItems().length) return !1;
        return this.nextPageRequestOptions() != null;
      }
      async getNextPage() {
        let H = this.nextPageRequestOptions();
        if (!H) throw new q7("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
        return await V6(this, h$_, "f").requestAPIList(this.constructor, H);
      }
      async *iterPages() {
        let H = this;
        yield H;
        while (H.hasNextPage()) (H = await H.getNextPage()), yield H;
      }
      async *[((h$_ = new WeakMap()), Symbol.asyncIterator)]() {
        for await (let H of this.iterPages()) for (let _ of H.getPaginatedItems()) yield _;
      }
    };
    y$_ = class y$_ extends R4H {
      constructor(H, _, q) {
        super(H, _, async ($, K) => new q($, K.response, await v$_($, K), K.options));
      }
      async *[Symbol.asyncIterator]() {
        let H = await this;
        for await (let _ of H) yield _;
      }
    };
    KI = class KI extends tt_ {
      constructor(H, _, q, $) {
        super(H, _, q, $);
        (this.data = q.data || []),
          (this.has_more = q.has_more || !1),
          (this.first_id = q.first_id || null),
          (this.last_id = q.last_id || null);
      }
      getPaginatedItems() {
        return this.data ?? [];
      }
      hasNextPage() {
        if (this.has_more === !1) return !1;
        return super.hasNextPage();
      }
      nextPageRequestOptions() {
        if (this.options.query?.before_id) {
          let _ = this.first_id;
          if (!_) return null;
          return { ...this.options, query: { ...W$_(this.options.query), before_id: _ } };
        }
        let H = this.last_id;
        if (!H) return null;
        return { ...this.options, query: { ...W$_(this.options.query), after_id: H } };
      }
    };
    GbH = class GbH extends tt_ {
      constructor(H, _, q, $) {
        super(H, _, q, $);
        (this.data = q.data || []), (this.has_more = q.has_more || !1), (this.next_page = q.next_page || null);
      }
      getPaginatedItems() {
        return this.data ?? [];
      }
      hasNextPage() {
        if (this.has_more === !1) return !1;
        return super.hasNextPage();
      }
      nextPageRequestOptions() {
        let H = this.next_page;
        if (!H) return null;
        return { ...this.options, query: { ...W$_(this.options.query), page: H } };
      }
    };
