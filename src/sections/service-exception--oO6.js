    ye = class ye extends Error {
      $fault;
      $response;
      $retryable;
      $metadata;
      constructor(H) {
        super(H.message);
        Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype),
          (this.name = H.name),
          (this.$fault = H.$fault),
          (this.$metadata = H.$metadata);
      }
      static isInstance(H) {
        if (!H) return !1;
        let _ = H;
        return (
          ye.prototype.isPrototypeOf(_) ||
          (Boolean(_.$fault) && Boolean(_.$metadata) && (_.$fault === "client" || _.$fault === "server"))
        );
      }
      static [Symbol.hasInstance](H) {
        if (!H) return !1;
        let _ = H;
        if (this === ye) return ye.isInstance(H);
        if (ye.isInstance(H)) {
          if (_.name && this.name) return this.prototype.isPrototypeOf(H) || _.name === this.name;
          return this.prototype.isPrototypeOf(H);
        }
        return !1;
      }
    };
