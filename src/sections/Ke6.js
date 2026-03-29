    xH_ = class xH_ {
      returned;
      queue = [];
      readResolve;
      readReject;
      isDone = !1;
      hasError;
      started = !1;
      constructor(H) {
        this.returned = H;
      }
      [Symbol.asyncIterator]() {
        if (this.started) throw Error("Stream can only be iterated once");
        return (this.started = !0), this;
      }
      next() {
        if (this.queue.length > 0) return Promise.resolve({ done: !1, value: this.queue.shift() });
        if (this.isDone) return Promise.resolve({ done: !0, value: void 0 });
        if (this.hasError) return Promise.reject(this.hasError);
        return new Promise((H, _) => {
          (this.readResolve = H), (this.readReject = _);
        });
      }
      enqueue(H) {
        if (this.readResolve) {
          let _ = this.readResolve;
          (this.readResolve = void 0), (this.readReject = void 0), _({ done: !1, value: H });
        } else this.queue.push(H);
      }
      done() {
        if (((this.isDone = !0), this.readResolve)) {
          let H = this.readResolve;
          (this.readResolve = void 0), (this.readReject = void 0), H({ done: !0, value: void 0 });
        }
      }
      error(H) {
        if (((this.hasError = H), this.readReject)) {
          let _ = this.readReject;
          (this.readResolve = void 0), (this.readReject = void 0), _(H);
        }
      }
      return() {
        if (((this.isDone = !0), this.returned)) this.returned();
        return Promise.resolve({ done: !0, value: void 0 });
      }
    };
