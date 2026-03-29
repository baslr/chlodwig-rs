    QMH = class QMH extends Error {
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
          QMH.prototype.isPrototypeOf(_) ||
          (Boolean(_.$fault) && Boolean(_.$metadata) && (_.$fault === "client" || _.$fault === "server"))
        );
      }
      static [Symbol.hasInstance](H) {
        if (!H) return !1;
        let _ = H;
        if (this === QMH) return QMH.isInstance(H);
        if (QMH.isInstance(H)) {
          if (_.name && this.name) return this.prototype.isPrototypeOf(H) || _.name === this.name;
          return this.prototype.isPrototypeOf(H);
        }
        return !1;
      }
    };
