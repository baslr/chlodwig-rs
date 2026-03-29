    (iH7 = require("module")), (Qx4 = iH7.createRequire("/"));
    try {
      pL_ = Qx4("worker_threads").Worker;
    } catch (H) {}
    (ix4 = pL_
      ? function (H, _, q, $, K) {
          var O = !1,
            T = new pL_(H + lx4, { eval: !0 })
              .on("error", function (z) {
                return K(z, null);
              })
              .on("message", function (z) {
                return K(null, z);
              })
              .on("exit", function (z) {
                if (z && !O) K(Error("exited with code " + z), null);
              });
          return (
            T.postMessage(q, $),
            (T.terminate = function () {
              return (O = !0), pL_.prototype.terminate.call(T);
            }),
            T
          );
        }
      : function (H, _, q, $, K) {
          setImmediate(function () {
            return K(
              Error(
                "async operations unsupported - update to Node 12+ (or Node 10-11 with the --experimental-worker CLI flag)",
              ),
              null,
            );
          });
          var O = function () {};
          return { terminate: O, postMessage: O };
        }),
      (F1 = Uint8Array),
      (CZ = Uint16Array),
      (OlH = Int32Array),
      (KRH = new F1([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0])),
      (ORH = new F1([
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0,
      ])),
      (qlH = new F1([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])),
      (rH7 = nH7(KRH, 2)),
      (QS6 = rH7.b),
      (cL_ = rH7.r);
    (QS6[28] = 258), (cL_[258] = 28);
    (oH7 = nH7(ORH, 0)), (aH7 = oH7.b), (xS6 = oH7.r), ($lH = new CZ(32768));
    for (K5 = 0; K5 < 32768; ++K5)
      (Ug = ((K5 & 43690) >> 1) | ((K5 & 21845) << 1)),
        (Ug = ((Ug & 52428) >> 2) | ((Ug & 13107) << 2)),
        (Ug = ((Ug & 61680) >> 4) | ((Ug & 3855) << 4)),
        ($lH[K5] = (((Ug & 65280) >> 8) | ((Ug & 255) << 8)) >> 1);
    Tn = new F1(288);
    for (K5 = 0; K5 < 144; ++K5) Tn[K5] = 8;
    for (K5 = 144; K5 < 256; ++K5) Tn[K5] = 9;
    for (K5 = 256; K5 < 280; ++K5) Tn[K5] = 7;
    for (K5 = 280; K5 < 288; ++K5) Tn[K5] = 8;
    qRH = new F1(32);
    for (K5 = 0; K5 < 32; ++K5) qRH[K5] = 5;
    (sH7 = CE(Tn, 9, 0)),
      (tH7 = CE(Tn, 9, 1)),
      (eH7 = CE(qRH, 5, 0)),
      (H_7 = CE(qRH, 5, 1)),
      (nx4 = {
        UnexpectedEOF: 0,
        InvalidBlockType: 1,
        InvalidLengthLiteral: 2,
        InvalidDistance: 3,
        StreamFinished: 4,
        NoStreamHandler: 5,
        InvalidHeader: 6,
        NoCallback: 7,
        InvalidUTF8: 8,
        ExtraFieldTooLong: 9,
        InvalidDate: 10,
        FilenameTooLong: 11,
        StreamFinishing: 12,
        InvalidZipData: 13,
        UnknownCompressionMethod: 14,
      }),
      (__7 = [
        "unexpected EOF",
        "invalid block type",
        "invalid length/literal",
        "invalid distance",
        "stream finished",
        "no stream handler",
        ,
        "no callback",
        "invalid UTF-8 data",
        "extra field too long",
        "date not in range 1980-2099",
        "filename too long",
        "stream finishing",
        "invalid zip data",
      ]),
      (q_7 = new OlH([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632])),
      (W6H = new F1(0)),
      (K_7 = (function () {
        var H = new Int32Array(256);
        for (var _ = 0; _ < 256; ++_) {
          var q = _,
            $ = 9;
          while (--$) q = (q & 1 && -306674912) ^ (q >>> 1);
          H[_] = q;
        }
        return H;
      })()),
      (mL_ = []);
    (IE = (function () {
      function H(_, q) {
        if (typeof _ == "function") (q = _), (_ = {});
        if (
          ((this.ondata = q),
          (this.o = _ || {}),
          (this.s = { l: 0, i: 32768, w: 32768, z: 32768 }),
          (this.b = new F1(98304)),
          this.o.dictionary)
        ) {
          var $ = this.o.dictionary.subarray(-32768);
          this.b.set($, 32768 - $.length), (this.s.i = 32768 - $.length);
        }
      }
      return (
        (H.prototype.p = function (_, q) {
          this.ondata(QOH(_, this.o, 0, 0, this.s), q);
        }),
        (H.prototype.push = function (_, q) {
          if (!this.ondata) m9(5);
          if (this.s.l) m9(4);
          var $ = _.length + this.s.z;
          if ($ > this.b.length) {
            if ($ > 2 * this.b.length - 32768) {
              var K = new F1($ & -32768);
              K.set(this.b.subarray(0, this.s.z)), (this.b = K);
            }
            var O = this.b.length - this.s.z;
            this.b.set(_.subarray(0, O), this.s.z),
              (this.s.z = this.b.length),
              this.p(this.b, !1),
              this.b.set(this.b.subarray(-32768)),
              this.b.set(_.subarray(O), 32768),
              (this.s.z = _.length - O + 32768),
              (this.s.i = 32766),
              (this.s.w = 32768);
          } else this.b.set(_, this.s.z), (this.s.z += _.length);
          if (((this.s.l = q & 1), this.s.z > this.s.w + 8191 || q))
            this.p(this.b, q || !1), (this.s.w = this.s.i), (this.s.i -= 2);
        }),
        (H.prototype.flush = function () {
          if (!this.ondata) m9(5);
          if (this.s.l) m9(4);
          this.p(this.b, !1), (this.s.w = this.s.i), (this.s.i -= 2);
        }),
        H
      );
    })()),
      (Y_7 = (function () {
        function H(_, q) {
          YRH(
            [
              fRH,
              function () {
                return [uE, IE];
              },
            ],
            this,
            lOH.call(this, _, q),
            function ($) {
              var K = new IE($.data);
              onmessage = uE(K);
            },
            6,
            1,
          );
        }
        return H;
      })());
    (Uk = (function () {
      function H(_, q) {
        if (typeof _ == "function") (q = _), (_ = {});
        this.ondata = q;
        var $ = _ && _.dictionary && _.dictionary.subarray(-32768);
        if (((this.s = { i: 0, b: $ ? $.length : 0 }), (this.o = new F1(32768)), (this.p = new F1(0)), $))
          this.o.set($);
      }
      return (
        (H.prototype.e = function (_) {
          if (!this.ondata) m9(5);
          if (this.d) m9(4);
          if (!this.p.length) this.p = _;
          else if (_.length) {
            var q = new F1(this.p.length + _.length);
            q.set(this.p), q.set(_, this.p.length), (this.p = q);
          }
        }),
        (H.prototype.c = function (_) {
          this.s.i = +(this.d = _ || !1);
          var q = this.s.b,
            $ = TlH(this.p, this.s, this.o);
          this.ondata(bE($, q, this.s.b), this.d),
            (this.o = bE($, this.s.b - 32768)),
            (this.s.b = this.o.length),
            (this.p = bE(this.p, (this.s.p / 8) | 0)),
            (this.s.p &= 7);
        }),
        (H.prototype.push = function (_, q) {
          this.e(_), this.c(q);
        }),
        H
      );
    })()),
      (tS6 = (function () {
        function H(_, q) {
          YRH(
            [
              ARH,
              function () {
                return [uE, Uk];
              },
            ],
            this,
            lOH.call(this, _, q),
            function ($) {
              var K = new Uk($.data);
              onmessage = uE(K);
            },
            7,
            0,
          );
        }
        return H;
      })());
    (BS6 = (function () {
      function H(_, q) {
        (this.c = zRH()), (this.l = 0), (this.v = 1), IE.call(this, _, q);
      }
      return (
        (H.prototype.push = function (_, q) {
          this.c.p(_), (this.l += _.length), IE.prototype.push.call(this, _, q);
        }),
        (H.prototype.p = function (_, q) {
          var $ = QOH(_, this.o, this.v && oS6(this.o), q && 8, this.s);
          if (this.v) nS6($, this.o), (this.v = 0);
          if (q) mO($, $.length - 8, this.c.d()), mO($, $.length - 4, this.l);
          this.ondata($, q);
        }),
        (H.prototype.flush = function () {
          IE.prototype.flush.call(this);
        }),
        H
      );
    })()),
      (ox4 = (function () {
        function H(_, q) {
          YRH(
            [
              fRH,
              T_7,
              function () {
                return [uE, IE, BS6];
              },
            ],
            this,
            lOH.call(this, _, q),
            function ($) {
              var K = new BS6($.data);
              onmessage = uE(K);
            },
            8,
            1,
          );
        }
        return H;
      })());
    (UL_ = (function () {
      function H(_, q) {
        (this.v = 1), (this.r = 0), Uk.call(this, _, q);
      }
      return (
        (H.prototype.push = function (_, q) {
          if ((Uk.prototype.e.call(this, _), (this.r += _.length), this.v)) {
            var $ = this.p.subarray(this.v - 1),
              K = $.length > 3 ? rS6($) : 4;
            if (K > $.length) {
              if (!q) return;
            } else if (this.v > 1 && this.onmember) this.onmember(this.r - $.length);
            (this.p = $.subarray(K)), (this.v = 0);
          }
          if ((Uk.prototype.c.call(this, q), this.s.f && !this.s.l && !q))
            (this.v = TRH(this.s.p) + 9), (this.s = { i: 0 }), (this.o = new F1(0)), this.push(new F1(0), q);
        }),
        H
      );
    })()),
      (j_7 = (function () {
        function H(_, q) {
          var $ = this;
          YRH(
            [
              ARH,
              z_7,
              function () {
                return [uE, Uk, UL_];
              },
            ],
            this,
            lOH.call(this, _, q),
            function (K) {
              var O = new UL_(K.data);
              (O.onmember = function (T) {
                return postMessage(T);
              }),
                (onmessage = uE(O));
            },
            9,
            0,
            function (K) {
              return $.onmember && $.onmember(K);
            },
          );
        }
        return H;
      })());
    (dS6 = (function () {
      function H(_, q) {
        (this.c = rL_()), (this.v = 1), IE.call(this, _, q);
      }
      return (
        (H.prototype.push = function (_, q) {
          this.c.p(_), IE.prototype.push.call(this, _, q);
        }),
        (H.prototype.p = function (_, q) {
          var $ = QOH(_, this.o, this.v && (this.o.dictionary ? 6 : 2), q && 4, this.s);
          if (this.v) aS6($, this.o), (this.v = 0);
          if (q) mO($, $.length - 4, this.c.d());
          this.ondata($, q);
        }),
        (H.prototype.flush = function () {
          IE.prototype.flush.call(this);
        }),
        H
      );
    })()),
      (sx4 = (function () {
        function H(_, q) {
          YRH(
            [
              fRH,
              A_7,
              function () {
                return [uE, IE, dS6];
              },
            ],
            this,
            lOH.call(this, _, q),
            function ($) {
              var K = new dS6($.data);
              onmessage = uE(K);
            },
            10,
            1,
          );
        }
        return H;
      })());
    (lL_ = (function () {
      function H(_, q) {
        Uk.call(this, _, q), (this.v = _ && _.dictionary ? 2 : 1);
      }
      return (
        (H.prototype.push = function (_, q) {
          if ((Uk.prototype.e.call(this, _), this.v)) {
            if (this.p.length < 6 && !q) return;
            (this.p = this.p.subarray(sS6(this.p, this.v - 1))), (this.v = 0);
          }
          if (q) {
            if (this.p.length < 4) m9(6, "invalid zlib data");
            this.p = this.p.subarray(0, -4);
          }
          Uk.prototype.c.call(this, q);
        }),
        H
      );
    })()),
      (J_7 = (function () {
        function H(_, q) {
          YRH(
            [
              ARH,
              f_7,
              function () {
                return [uE, Uk, lL_];
              },
            ],
            this,
            lOH.call(this, _, q),
            function ($) {
              var K = new lL_($.data);
              onmessage = uE(K);
            },
            11,
            0,
          );
        }
        return H;
      })());
    (FS6 = (function () {
      function H(_, q) {
        (this.o = lOH.call(this, _, q) || {}), (this.G = UL_), (this.I = Uk), (this.Z = lL_);
      }
      return (
        (H.prototype.i = function () {
          var _ = this;
          this.s.ondata = function (q, $) {
            _.ondata(q, $);
          };
        }),
        (H.prototype.push = function (_, q) {
          if (!this.ondata) m9(5);
          if (!this.s) {
            if (this.p && this.p.length) {
              var $ = new F1(this.p.length + _.length);
              $.set(this.p), $.set(_, this.p.length);
            } else this.p = _;
            if (this.p.length > 2)
              (this.s =
                this.p[0] == 31 && this.p[1] == 139 && this.p[2] == 8
                  ? new this.G(this.o)
                  : (this.p[0] & 15) != 8 || this.p[0] >> 4 > 7 || ((this.p[0] << 8) | this.p[1]) % 31
                    ? new this.I(this.o)
                    : new this.Z(this.o)),
                this.i(),
                this.s.push(this.p, q),
                (this.p = null);
          } else this.s.push(_, q);
        }),
        H
      );
    })()),
      (ex4 = (function () {
        function H(_, q) {
          FS6.call(this, _, q), (this.queuedSize = 0), (this.G = j_7), (this.I = tS6), (this.Z = J_7);
        }
        return (
          (H.prototype.i = function () {
            var _ = this;
            (this.s.ondata = function (q, $, K) {
              _.ondata(q, $, K);
            }),
              (this.s.ondrain = function (q) {
                if (((_.queuedSize -= q), _.ondrain)) _.ondrain(q);
              });
          }),
          (H.prototype.push = function (_, q) {
            (this.queuedSize += _.length), FS6.prototype.push.call(this, _, q);
          }),
          H
        );
      })());
    (lH7 = typeof TextEncoder < "u" && new TextEncoder()), (US6 = typeof TextDecoder < "u" && new TextDecoder());
    try {
      US6.decode(W6H, { stream: !0 }), (X_7 = 1);
    } catch (H) {}
    (qm4 = (function () {
      function H(_) {
        if (((this.ondata = _), X_7)) this.t = new TextDecoder();
        else this.p = W6H;
      }
      return (
        (H.prototype.push = function (_, q) {
          if (!this.ondata) m9(5);
          if (((q = !!q), this.t)) {
            if ((this.ondata(this.t.decode(_, { stream: !0 }), q), q)) {
              if (this.t.decode().length) m9(8);
              this.t = null;
            }
            return;
          }
          if (!this.p) m9(4);
          var $ = new F1(this.p.length + _.length);
          $.set(this.p), $.set(_, this.p.length);
          var K = W_7($),
            O = K.s,
            T = K.r;
          if (q) {
            if (T.length) m9(8);
            this.p = null;
          } else this.p = T;
          this.ondata(O, q);
        }),
        H
      );
    })()),
      ($m4 = (function () {
        function H(_) {
          this.ondata = _;
        }
        return (
          (H.prototype.push = function (_, q) {
            if (!this.ondata) m9(5);
            if (this.d) m9(4);
            this.ondata(R6H(_), (this.d = q || !1));
          }),
          H
        );
      })());
    (KlH = (function () {
      function H(_) {
        (this.filename = _), (this.c = zRH()), (this.size = 0), (this.compression = 0);
      }
      return (
        (H.prototype.process = function (_, q) {
          this.ondata(null, _, q);
        }),
        (H.prototype.push = function (_, q) {
          if (!this.ondata) m9(5);
          if ((this.c.p(_), (this.size += _.length), q)) this.crc = this.c.d();
          this.process(_, q || !1);
        }),
        H
      );
    })()),
      (Km4 = (function () {
        function H(_, q) {
          var $ = this;
          if (!q) q = {};
          KlH.call(this, _),
            (this.d = new IE(q, function (K, O) {
              $.ondata(null, K, O);
            })),
            (this.compression = 8),
            (this.flag = G_7(q.level));
        }
        return (
          (H.prototype.process = function (_, q) {
            try {
              this.d.push(_, q);
            } catch ($) {
              this.ondata($, null, q);
            }
          }),
          (H.prototype.push = function (_, q) {
            KlH.prototype.push.call(this, _, q);
          }),
          H
        );
      })()),
      (Om4 = (function () {
        function H(_, q) {
          var $ = this;
          if (!q) q = {};
          KlH.call(this, _),
            (this.d = new Y_7(q, function (K, O, T) {
              $.ondata(K, O, T);
            })),
            (this.compression = 8),
            (this.flag = G_7(q.level)),
            (this.terminate = this.d.terminate);
        }
        return (
          (H.prototype.process = function (_, q) {
            this.d.push(_, q);
          }),
          (H.prototype.push = function (_, q) {
            KlH.prototype.push.call(this, _, q);
          }),
          H
        );
      })()),
      (Tm4 = (function () {
        function H(_) {
          (this.ondata = _), (this.u = []), (this.d = 1);
        }
        return (
          (H.prototype.add = function (_) {
            var q = this;
            if (!this.ondata) m9(5);
            if (this.d & 2) this.ondata(m9(4 + (this.d & 1) * 8, 0, 1), null, !1);
            else {
              var $ = R6H(_.filename),
                K = $.length,
                O = _.comment,
                T = O && R6H(O),
                z = K != _.filename.length || (T && O.length != T.length),
                A = K + G6H(_.extra) + 30;
              if (K > 65535) this.ondata(m9(11, 0, 1), null, !1);
              var f = new F1(A);
              $RH(f, 0, _, $, z, -1);
              var w = [f],
                Y = function () {
                  for (var P = 0, X = w; P < X.length; P++) {
                    var R = X[P];
                    q.ondata(null, R, !1);
                  }
                  w = [];
                },
                D = this.d;
              this.d = 0;
              var j = this.u.length,
                M = zlH(_, {
                  f: $,
                  u: z,
                  o: T,
                  t: function () {
                    if (_.terminate) _.terminate();
                  },
                  r: function () {
                    if ((Y(), D)) {
                      var P = q.u[j + 1];
                      if (P) P.r();
                      else q.d = 1;
                    }
                    D = 1;
                  },
                }),
                J = 0;
              (_.ondata = function (P, X, R) {
                if (P) q.ondata(P, X, R), q.terminate();
                else if (((J += X.length), w.push(X), R)) {
                  var W = new F1(16);
                  if (
                    (mO(W, 0, 134695760),
                    mO(W, 4, _.crc),
                    mO(W, 8, J),
                    mO(W, 12, _.size),
                    w.push(W),
                    (M.c = J),
                    (M.b = A + J + 16),
                    (M.crc = _.crc),
                    (M.size = _.size),
                    D)
                  )
                    M.r();
                  D = 1;
                } else if (D) Y();
              }),
                this.u.push(M);
            }
          }),
          (H.prototype.end = function () {
            var _ = this;
            if (this.d & 2) {
              this.ondata(m9(4 + (this.d & 1) * 8, 0, 1), null, !0);
              return;
            }
            if (this.d) this.e();
            else
              this.u.push({
                r: function () {
                  if (!(_.d & 1)) return;
                  _.u.splice(-1, 1), _.e();
                },
                t: function () {},
              });
            this.d = 3;
          }),
          (H.prototype.e = function () {
            var _ = 0,
              q = 0,
              $ = 0;
            for (var K = 0, O = this.u; K < O.length; K++) {
              var T = O[K];
              $ += 46 + T.f.length + G6H(T.extra) + (T.o ? T.o.length : 0);
            }
            var z = new F1($ + 22);
            for (var A = 0, f = this.u; A < f.length; A++) {
              var T = f[A];
              $RH(z, _, T, T.f, T.u, -T.c - 2, q, T.o),
                (_ += 46 + T.f.length + G6H(T.extra) + (T.o ? T.o.length : 0)),
                (q += T.b);
            }
            qE6(z, _, this.u.length, $, q), this.ondata(null, z, !0), (this.d = 2);
          }),
          (H.prototype.terminate = function () {
            for (var _ = 0, q = this.u; _ < q.length; _++) {
              var $ = q[_];
              $.t();
            }
            this.d = 2;
          }),
          H
        );
      })());
    (k_7 = (function () {
      function H() {}
      return (
        (H.prototype.push = function (_, q) {
          this.ondata(null, _, q);
        }),
        (H.compression = 0),
        H
      );
    })()),
      (Am4 = (function () {
        function H() {
          var _ = this;
          this.i = new Uk(function (q, $) {
            _.ondata(null, q, $);
          });
        }
        return (
          (H.prototype.push = function (_, q) {
            try {
              this.i.push(_, q);
            } catch ($) {
              this.ondata($, null, q);
            }
          }),
          (H.compression = 8),
          H
        );
      })()),
      (fm4 = (function () {
        function H(_, q) {
          var $ = this;
          if (q < 320000)
            this.i = new Uk(function (K, O) {
              $.ondata(null, K, O);
            });
          else
            (this.i = new tS6(function (K, O, T) {
              $.ondata(K, O, T);
            })),
              (this.terminate = this.i.terminate);
        }
        return (
          (H.prototype.push = function (_, q) {
            if (this.i.terminate) _ = bE(_, 0);
            this.i.push(_, q);
          }),
          (H.compression = 8),
          H
        );
      })()),
      (wm4 = (function () {
        function H(_) {
          (this.onfile = _), (this.k = []), (this.o = { 0: k_7 }), (this.p = W6H);
        }
        return (
          (H.prototype.push = function (_, q) {
            var $ = this;
            if (!this.onfile) m9(5);
            if (!this.p) m9(4);
            if (this.c > 0) {
              var K = Math.min(this.c, _.length),
                O = _.subarray(0, K);
              if (((this.c -= K), this.d)) this.d.push(O, !this.c);
              else this.k[0].push(O);
              if (((_ = _.subarray(K)), _.length)) return this.push(_, q);
            } else {
              var T = 0,
                z = 0,
                A = void 0,
                f = void 0;
              if (!this.p.length) f = _;
              else if (!_.length) f = this.p;
              else (f = new F1(this.p.length + _.length)), f.set(this.p), f.set(_, this.p.length);
              var w = f.length,
                Y = this.c,
                D = Y && this.d,
                j = function () {
                  var X,
                    R = W2(f, z);
                  if (R == 67324752) {
                    (T = 1), (A = z), (M.d = null), (M.c = 0);
                    var W = EZ(f, z + 6),
                      Z = EZ(f, z + 8),
                      k = W & 2048,
                      v = W & 8,
                      y = EZ(f, z + 26),
                      E = EZ(f, z + 28);
                    if (w > z + 30 + y + E) {
                      var S = [];
                      M.k.unshift(S), (T = 2);
                      var x = W2(f, z + 18),
                        I = W2(f, z + 22),
                        B = _E6(f.subarray(z + 30, (z += 30 + y)), !k);
                      if (x == 4294967295) (X = v ? [-2] : L_7(f, z)), (x = X[0]), (I = X[1]);
                      else if (v) x = -1;
                      (z += E), (M.c = x);
                      var p,
                        C = {
                          name: B,
                          compression: Z,
                          start: function () {
                            if (!C.ondata) m9(5);
                            if (!x) C.ondata(null, W6H, !0);
                            else {
                              var g = $.o[Z];
                              if (!g) C.ondata(m9(14, "unknown compression type " + Z, 1), null, !1);
                              (p = x < 0 ? new g(B) : new g(B, x, I)),
                                (p.ondata = function (_H, HH, e) {
                                  C.ondata(_H, HH, e);
                                });
                              for (var c = 0, U = S; c < U.length; c++) {
                                var i = U[c];
                                p.push(i, !1);
                              }
                              if ($.k[0] == S && $.c) $.d = p;
                              else p.push(W6H, !0);
                            }
                          },
                          terminate: function () {
                            if (p && p.terminate) p.terminate();
                          },
                        };
                      if (x >= 0) (C.size = x), (C.originalSize = I);
                      M.onfile(C);
                    }
                    return "break";
                  } else if (Y) {
                    if (R == 134695760) return (A = z += 12 + (Y == -2 && 8)), (T = 3), (M.c = 0), "break";
                    else if (R == 33639248) return (A = z -= 4), (T = 3), (M.c = 0), "break";
                  }
                },
                M = this;
              for (; z < w - 4; ++z) {
                var J = j();
                if (J === "break") break;
              }
              if (((this.p = W6H), Y < 0)) {
                var P = T
                  ? f.subarray(0, A - 12 - (Y == -2 && 8) - (W2(f, A - 16) == 134695760 && 4))
                  : f.subarray(0, z);
                if (D) D.push(P, !!T);
                else this.k[+(T == 2)].push(P);
              }
              if (T & 2) return this.push(f.subarray(z), q);
              this.p = f.subarray(z);
            }
            if (q) {
              if (this.c) m9(13);
              this.p = null;
            }
          }),
          (H.prototype.register = function (_) {
            this.o[_.compression] = _;
          }),
          H
        );
      })()),
      (nL_ =
        typeof queueMicrotask == "function"
          ? queueMicrotask
          : typeof setTimeout == "function"
            ? setTimeout
            : function (H) {
                H();
              });
