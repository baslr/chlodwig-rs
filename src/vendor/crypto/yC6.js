  var yC6 = d((Ai3, q$7) => {
    var g8 = XK();
    Kx();
    LRH();
    kk_();
    sOH();
    ZC6();
    pE();
    hRH();
    F3();
    var dk_ = function (H, _, q, $) {
        var K = g8.util.createBuffer(),
          O = H.length >> 1,
          T = O + (H.length & 1),
          z = H.substr(0, T),
          A = H.substr(O, T),
          f = g8.util.createBuffer(),
          w = g8.hmac.create();
        q = _ + q;
        var Y = Math.ceil($ / 16),
          D = Math.ceil($ / 20);
        w.start("MD5", z);
        var j = g8.util.createBuffer();
        f.putBytes(q);
        for (var M = 0; M < Y; ++M)
          w.start(null, null),
            w.update(f.getBytes()),
            f.putBuffer(w.digest()),
            w.start(null, null),
            w.update(f.bytes() + q),
            j.putBuffer(w.digest());
        w.start("SHA1", A);
        var J = g8.util.createBuffer();
        f.clear(), f.putBytes(q);
        for (var M = 0; M < D; ++M)
          w.start(null, null),
            w.update(f.getBytes()),
            f.putBuffer(w.digest()),
            w.start(null, null),
            w.update(f.bytes() + q),
            J.putBuffer(w.digest());
        return K.putBytes(g8.util.xorBytes(j.getBytes(), J.getBytes(), $)), K;
      },
      _U4 = function (H, _, q) {
        var $ = g8.hmac.create();
        $.start("SHA1", H);
        var K = g8.util.createBuffer();
        return (
          K.putInt32(_[0]),
          K.putInt32(_[1]),
          K.putByte(q.type),
          K.putByte(q.version.major),
          K.putByte(q.version.minor),
          K.putInt16(q.length),
          K.putBytes(q.fragment.bytes()),
          $.update(K.getBytes()),
          $.digest().getBytes()
        );
      },
      qU4 = function (H, _, q) {
        var $ = !1;
        try {
          var K = H.deflate(_.fragment.getBytes());
          (_.fragment = g8.util.createBuffer(K)), (_.length = K.length), ($ = !0);
        } catch (O) {}
        return $;
      },
      $U4 = function (H, _, q) {
        var $ = !1;
        try {
          var K = H.inflate(_.fragment.getBytes());
          (_.fragment = g8.util.createBuffer(K)), (_.length = K.length), ($ = !0);
        } catch (O) {}
        return $;
      },
      wy = function (H, _) {
        var q = 0;
        switch (_) {
          case 1:
            q = H.getByte();
            break;
          case 2:
            q = H.getInt16();
            break;
          case 3:
            q = H.getInt24();
            break;
          case 4:
            q = H.getInt32();
            break;
        }
        return g8.util.createBuffer(H.getBytes(q));
      },
      cE = function (H, _, q) {
        H.putInt(q.length(), _ << 3), H.putBuffer(q);
      },
      O_ = {};
    O_.Versions = { TLS_1_0: { major: 3, minor: 1 }, TLS_1_1: { major: 3, minor: 2 }, TLS_1_2: { major: 3, minor: 3 } };
    O_.SupportedVersions = [O_.Versions.TLS_1_1, O_.Versions.TLS_1_0];
    O_.Version = O_.SupportedVersions[0];
    O_.MaxFragment = 15360;
    O_.ConnectionEnd = { server: 0, client: 1 };
    O_.PRFAlgorithm = { tls_prf_sha256: 0 };
    O_.BulkCipherAlgorithm = { none: null, rc4: 0, des3: 1, aes: 2 };
    O_.CipherType = { stream: 0, block: 1, aead: 2 };
    O_.MACAlgorithm = { none: null, hmac_md5: 0, hmac_sha1: 1, hmac_sha256: 2, hmac_sha384: 3, hmac_sha512: 4 };
    O_.CompressionMethod = { none: 0, deflate: 1 };
    O_.ContentType = { change_cipher_spec: 20, alert: 21, handshake: 22, application_data: 23, heartbeat: 24 };
    O_.HandshakeType = {
      hello_request: 0,
      client_hello: 1,
      server_hello: 2,
      certificate: 11,
      server_key_exchange: 12,
      certificate_request: 13,
      server_hello_done: 14,
      certificate_verify: 15,
      client_key_exchange: 16,
      finished: 20,
    };
    O_.Alert = {};
    O_.Alert.Level = { warning: 1, fatal: 2 };
    O_.Alert.Description = {
      close_notify: 0,
      unexpected_message: 10,
      bad_record_mac: 20,
      decryption_failed: 21,
      record_overflow: 22,
      decompression_failure: 30,
      handshake_failure: 40,
      bad_certificate: 42,
      unsupported_certificate: 43,
      certificate_revoked: 44,
      certificate_expired: 45,
      certificate_unknown: 46,
      illegal_parameter: 47,
      unknown_ca: 48,
      access_denied: 49,
      decode_error: 50,
      decrypt_error: 51,
      export_restriction: 60,
      protocol_version: 70,
      insufficient_security: 71,
      internal_error: 80,
      user_canceled: 90,
      no_renegotiation: 100,
    };
    O_.HeartbeatMessageType = { heartbeat_request: 1, heartbeat_response: 2 };
    O_.CipherSuites = {};
    O_.getCipherSuite = function (H) {
      var _ = null;
      for (var q in O_.CipherSuites) {
        var $ = O_.CipherSuites[q];
        if ($.id[0] === H.charCodeAt(0) && $.id[1] === H.charCodeAt(1)) {
          _ = $;
          break;
        }
      }
      return _;
    };
    O_.handleUnexpected = function (H, _) {
      var q = !H.open && H.entity === O_.ConnectionEnd.client;
      if (!q)
        H.error(H, {
          message: "Unexpected message. Received TLS record out of order.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.unexpected_message },
        });
    };
    O_.handleHelloRequest = function (H, _, q) {
      if (!H.handshaking && H.handshakes > 0)
        O_.queue(
          H,
          O_.createAlert(H, { level: O_.Alert.Level.warning, description: O_.Alert.Description.no_renegotiation }),
        ),
          O_.flush(H);
      H.process();
    };
    O_.parseHelloMessage = function (H, _, q) {
      var $ = null,
        K = H.entity === O_.ConnectionEnd.client;
      if (q < 38)
        H.error(H, {
          message: K
            ? "Invalid ServerHello message. Message too short."
            : "Invalid ClientHello message. Message too short.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.illegal_parameter },
        });
      else {
        var O = _.fragment,
          T = O.length();
        if (
          (($ = {
            version: { major: O.getByte(), minor: O.getByte() },
            random: g8.util.createBuffer(O.getBytes(32)),
            session_id: wy(O, 1),
            extensions: [],
          }),
          K)
        )
          ($.cipher_suite = O.getBytes(2)), ($.compression_method = O.getByte());
        else ($.cipher_suites = wy(O, 2)), ($.compression_methods = wy(O, 1));
        if (((T = q - (T - O.length())), T > 0)) {
          var z = wy(O, 2);
          while (z.length() > 0) $.extensions.push({ type: [z.getByte(), z.getByte()], data: wy(z, 2) });
          if (!K)
            for (var A = 0; A < $.extensions.length; ++A) {
              var f = $.extensions[A];
              if (f.type[0] === 0 && f.type[1] === 0) {
                var w = wy(f.data, 2);
                while (w.length() > 0) {
                  var Y = w.getByte();
                  if (Y !== 0) break;
                  H.session.extensions.server_name.serverNameList.push(wy(w, 2).getBytes());
                }
              }
            }
        }
        if (H.session.version) {
          if ($.version.major !== H.session.version.major || $.version.minor !== H.session.version.minor)
            return H.error(H, {
              message: "TLS version change is disallowed during renegotiation.",
              send: !0,
              alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.protocol_version },
            });
        }
        if (K) H.session.cipherSuite = O_.getCipherSuite($.cipher_suite);
        else {
          var D = g8.util.createBuffer($.cipher_suites.bytes());
          while (D.length() > 0)
            if (((H.session.cipherSuite = O_.getCipherSuite(D.getBytes(2))), H.session.cipherSuite !== null)) break;
        }
        if (H.session.cipherSuite === null)
          return H.error(H, {
            message: "No cipher suites in common.",
            send: !0,
            alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.handshake_failure },
            cipherSuite: g8.util.bytesToHex($.cipher_suite),
          });
        if (K) H.session.compressionMethod = $.compression_method;
        else H.session.compressionMethod = O_.CompressionMethod.none;
      }
      return $;
    };
    O_.createSecurityParameters = function (H, _) {
      var q = H.entity === O_.ConnectionEnd.client,
        $ = _.random.bytes(),
        K = q ? H.session.sp.client_random : $,
        O = q ? $ : O_.createRandom().getBytes();
      H.session.sp = {
        entity: H.entity,
        prf_algorithm: O_.PRFAlgorithm.tls_prf_sha256,
        bulk_cipher_algorithm: null,
        cipher_type: null,
        enc_key_length: null,
        block_length: null,
        fixed_iv_length: null,
        record_iv_length: null,
        mac_algorithm: null,
        mac_length: null,
        mac_key_length: null,
        compression_algorithm: H.session.compressionMethod,
        pre_master_secret: null,
        master_secret: null,
        client_random: K,
        server_random: O,
      };
    };
    O_.handleServerHello = function (H, _, q) {
      var $ = O_.parseHelloMessage(H, _, q);
      if (H.fail) return;
      if ($.version.minor <= H.version.minor) H.version.minor = $.version.minor;
      else
        return H.error(H, {
          message: "Incompatible TLS version.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.protocol_version },
        });
      H.session.version = H.version;
      var K = $.session_id.bytes();
      if (K.length > 0 && K === H.session.id)
        (H.expect = s97), (H.session.resuming = !0), (H.session.sp.server_random = $.random.bytes());
      else (H.expect = OU4), (H.session.resuming = !1), O_.createSecurityParameters(H, $);
      (H.session.id = K), H.process();
    };
    O_.handleClientHello = function (H, _, q) {
      var $ = O_.parseHelloMessage(H, _, q);
      if (H.fail) return;
      var K = $.session_id.bytes(),
        O = null;
      if (H.sessionCache) {
        if (((O = H.sessionCache.getSession(K)), O === null)) K = "";
        else if (O.version.major !== $.version.major || O.version.minor > $.version.minor) (O = null), (K = "");
      }
      if (K.length === 0) K = g8.random.getBytes(32);
      if (((H.session.id = K), (H.session.clientHelloVersion = $.version), (H.session.sp = {}), O))
        (H.version = H.session.version = O.version), (H.session.sp = O.sp);
      else {
        var T;
        for (var z = 1; z < O_.SupportedVersions.length; ++z)
          if (((T = O_.SupportedVersions[z]), T.minor <= $.version.minor)) break;
        (H.version = { major: T.major, minor: T.minor }), (H.session.version = H.version);
      }
      if (O !== null) (H.expect = NC6), (H.session.resuming = !0), (H.session.sp.client_random = $.random.bytes());
      else (H.expect = H.verifyClient !== !1 ? DU4 : vC6), (H.session.resuming = !1), O_.createSecurityParameters(H, $);
      if (
        ((H.open = !0),
        O_.queue(H, O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createServerHello(H) })),
        H.session.resuming)
      )
        O_.queue(H, O_.createRecord(H, { type: O_.ContentType.change_cipher_spec, data: O_.createChangeCipherSpec() })),
          (H.state.pending = O_.createConnectionState(H)),
          (H.state.current.write = H.state.pending.write),
          O_.queue(H, O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createFinished(H) }));
      else if (
        (O_.queue(H, O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createCertificate(H) })), !H.fail)
      ) {
        if (
          (O_.queue(H, O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createServerKeyExchange(H) })),
          H.verifyClient !== !1)
        )
          O_.queue(H, O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createCertificateRequest(H) }));
        O_.queue(H, O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createServerHelloDone(H) }));
      }
      O_.flush(H), H.process();
    };
    O_.handleCertificate = function (H, _, q) {
      if (q < 3)
        return H.error(H, {
          message: "Invalid Certificate message. Message too short.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.illegal_parameter },
        });
      var $ = _.fragment,
        K = { certificate_list: wy($, 3) },
        O,
        T,
        z = [];
      try {
        while (K.certificate_list.length() > 0)
          (O = wy(K.certificate_list, 3)), (T = g8.asn1.fromDer(O)), (O = g8.pki.certificateFromAsn1(T, !0)), z.push(O);
      } catch (f) {
        return H.error(H, {
          message: "Could not parse certificate list.",
          cause: f,
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.bad_certificate },
        });
      }
      var A = H.entity === O_.ConnectionEnd.client;
      if ((A || H.verifyClient === !0) && z.length === 0)
        H.error(H, {
          message: A ? "No server certificate provided." : "No client certificate provided.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.illegal_parameter },
        });
      else if (z.length === 0) H.expect = A ? o97 : vC6;
      else {
        if (A) H.session.serverCertificate = z[0];
        else H.session.clientCertificate = z[0];
        if (O_.verifyCertificateChain(H, z)) H.expect = A ? o97 : vC6;
      }
      H.process();
    };
    O_.handleServerKeyExchange = function (H, _, q) {
      if (q > 0)
        return H.error(H, {
          message: "Invalid key parameters. Only RSA is supported.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.unsupported_certificate },
        });
      (H.expect = TU4), H.process();
    };
    O_.handleClientKeyExchange = function (H, _, q) {
      if (q < 48)
        return H.error(H, {
          message: "Invalid key parameters. Only RSA is supported.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.unsupported_certificate },
        });
      var $ = _.fragment,
        K = { enc_pre_master_secret: wy($, 2).getBytes() },
        O = null;
      if (H.getPrivateKey)
        try {
          (O = H.getPrivateKey(H, H.session.serverCertificate)), (O = g8.pki.privateKeyFromPem(O));
        } catch (A) {
          H.error(H, {
            message: "Could not get private key.",
            cause: A,
            send: !0,
            alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.internal_error },
          });
        }
      if (O === null)
        return H.error(H, {
          message: "No private key set.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.internal_error },
        });
      try {
        var T = H.session.sp;
        T.pre_master_secret = O.decrypt(K.enc_pre_master_secret);
        var z = H.session.clientHelloVersion;
        if (z.major !== T.pre_master_secret.charCodeAt(0) || z.minor !== T.pre_master_secret.charCodeAt(1))
          throw Error("TLS version rollback attack detected.");
      } catch (A) {
        T.pre_master_secret = g8.random.getBytes(48);
      }
      if (((H.expect = NC6), H.session.clientCertificate !== null)) H.expect = jU4;
      H.process();
    };
    O_.handleCertificateRequest = function (H, _, q) {
      if (q < 3)
        return H.error(H, {
          message: "Invalid CertificateRequest. Message too short.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.illegal_parameter },
        });
      var $ = _.fragment,
        K = { certificate_types: wy($, 1), certificate_authorities: wy($, 2) };
      (H.session.certificateRequest = K), (H.expect = zU4), H.process();
    };
    O_.handleCertificateVerify = function (H, _, q) {
      if (q < 2)
        return H.error(H, {
          message: "Invalid CertificateVerify. Message too short.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.illegal_parameter },
        });
      var $ = _.fragment;
      $.read -= 4;
      var K = $.bytes();
      $.read += 4;
      var O = { signature: wy($, 2).getBytes() },
        T = g8.util.createBuffer();
      T.putBuffer(H.session.md5.digest()), T.putBuffer(H.session.sha1.digest()), (T = T.getBytes());
      try {
        var z = H.session.clientCertificate;
        if (!z.publicKey.verify(T, O.signature, "NONE")) throw Error("CertificateVerify signature does not match.");
        H.session.md5.update(K), H.session.sha1.update(K);
      } catch (A) {
        return H.error(H, {
          message: "Bad signature in CertificateVerify.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.handshake_failure },
        });
      }
      (H.expect = NC6), H.process();
    };
    O_.handleServerHelloDone = function (H, _, q) {
      if (q > 0)
        return H.error(H, {
          message: "Invalid ServerHelloDone message. Invalid length.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.record_overflow },
        });
      if (H.serverCertificate === null) {
        var $ = {
            message: "No server certificate provided. Not enough security.",
            send: !0,
            alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.insufficient_security },
          },
          K = 0,
          O = H.verify(H, $.alert.description, K, []);
        if (O !== !0) {
          if (O || O === 0) {
            if (typeof O === "object" && !g8.util.isArray(O)) {
              if (O.message) $.message = O.message;
              if (O.alert) $.alert.description = O.alert;
            } else if (typeof O === "number") $.alert.description = O;
          }
          return H.error(H, $);
        }
      }
      if (H.session.certificateRequest !== null)
        (_ = O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createCertificate(H) })), O_.queue(H, _);
      (_ = O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createClientKeyExchange(H) })),
        O_.queue(H, _),
        (H.expect = wU4);
      var T = function (z, A) {
        if (z.session.certificateRequest !== null && z.session.clientCertificate !== null)
          O_.queue(z, O_.createRecord(z, { type: O_.ContentType.handshake, data: O_.createCertificateVerify(z, A) }));
        O_.queue(z, O_.createRecord(z, { type: O_.ContentType.change_cipher_spec, data: O_.createChangeCipherSpec() })),
          (z.state.pending = O_.createConnectionState(z)),
          (z.state.current.write = z.state.pending.write),
          O_.queue(z, O_.createRecord(z, { type: O_.ContentType.handshake, data: O_.createFinished(z) })),
          (z.expect = s97),
          O_.flush(z),
          z.process();
      };
      if (H.session.certificateRequest === null || H.session.clientCertificate === null) return T(H, null);
      O_.getClientSignature(H, T);
    };
    O_.handleChangeCipherSpec = function (H, _) {
      if (_.fragment.getByte() !== 1)
        return H.error(H, {
          message: "Invalid ChangeCipherSpec message received.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.illegal_parameter },
        });
      var q = H.entity === O_.ConnectionEnd.client;
      if ((H.session.resuming && q) || (!H.session.resuming && !q)) H.state.pending = O_.createConnectionState(H);
      if (((H.state.current.read = H.state.pending.read), (!H.session.resuming && q) || (H.session.resuming && !q)))
        H.state.pending = null;
      (H.expect = q ? AU4 : MU4), H.process();
    };
    O_.handleFinished = function (H, _, q) {
      var $ = _.fragment;
      $.read -= 4;
      var K = $.bytes();
      $.read += 4;
      var O = _.fragment.getBytes();
      ($ = g8.util.createBuffer()), $.putBuffer(H.session.md5.digest()), $.putBuffer(H.session.sha1.digest());
      var T = H.entity === O_.ConnectionEnd.client,
        z = T ? "server finished" : "client finished",
        A = H.session.sp,
        f = 12,
        w = dk_;
      if ((($ = w(A.master_secret, z, $.getBytes(), f)), $.getBytes() !== O))
        return H.error(H, {
          message: "Invalid verify_data in Finished message.",
          send: !0,
          alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.decrypt_error },
        });
      if ((H.session.md5.update(K), H.session.sha1.update(K), (H.session.resuming && T) || (!H.session.resuming && !T)))
        O_.queue(H, O_.createRecord(H, { type: O_.ContentType.change_cipher_spec, data: O_.createChangeCipherSpec() })),
          (H.state.current.write = H.state.pending.write),
          (H.state.pending = null),
          O_.queue(H, O_.createRecord(H, { type: O_.ContentType.handshake, data: O_.createFinished(H) }));
      (H.expect = T ? fU4 : JU4),
        (H.handshaking = !1),
        ++H.handshakes,
        (H.peerCertificate = T ? H.session.serverCertificate : H.session.clientCertificate),
        O_.flush(H),
        (H.isConnected = !0),
        H.connected(H),
        H.process();
    };
    O_.handleAlert = function (H, _) {
      var q = _.fragment,
        $ = { level: q.getByte(), description: q.getByte() },
        K;
      switch ($.description) {
        case O_.Alert.Description.close_notify:
          K = "Connection closed.";
          break;
        case O_.Alert.Description.unexpected_message:
          K = "Unexpected message.";
          break;
        case O_.Alert.Description.bad_record_mac:
          K = "Bad record MAC.";
          break;
        case O_.Alert.Description.decryption_failed:
          K = "Decryption failed.";
          break;
        case O_.Alert.Description.record_overflow:
          K = "Record overflow.";
          break;
        case O_.Alert.Description.decompression_failure:
          K = "Decompression failed.";
          break;
        case O_.Alert.Description.handshake_failure:
          K = "Handshake failure.";
          break;
        case O_.Alert.Description.bad_certificate:
          K = "Bad certificate.";
          break;
        case O_.Alert.Description.unsupported_certificate:
          K = "Unsupported certificate.";
          break;
        case O_.Alert.Description.certificate_revoked:
          K = "Certificate revoked.";
          break;
        case O_.Alert.Description.certificate_expired:
          K = "Certificate expired.";
          break;
        case O_.Alert.Description.certificate_unknown:
          K = "Certificate unknown.";
          break;
        case O_.Alert.Description.illegal_parameter:
          K = "Illegal parameter.";
          break;
        case O_.Alert.Description.unknown_ca:
          K = "Unknown certificate authority.";
          break;
        case O_.Alert.Description.access_denied:
          K = "Access denied.";
          break;
        case O_.Alert.Description.decode_error:
          K = "Decode error.";
          break;
        case O_.Alert.Description.decrypt_error:
          K = "Decrypt error.";
          break;
        case O_.Alert.Description.export_restriction:
          K = "Export restriction.";
          break;
        case O_.Alert.Description.protocol_version:
          K = "Unsupported protocol version.";
          break;
        case O_.Alert.Description.insufficient_security:
          K = "Insufficient security.";
          break;
        case O_.Alert.Description.internal_error:
          K = "Internal error.";
          break;
        case O_.Alert.Description.user_canceled:
          K = "User canceled.";
          break;
        case O_.Alert.Description.no_renegotiation:
          K = "Renegotiation not supported.";
          break;
        default:
          K = "Unknown error.";
          break;
      }
      if ($.description === O_.Alert.Description.close_notify) return H.close();
      H.error(H, {
        message: K,
        send: !1,
        origin: H.entity === O_.ConnectionEnd.client ? "server" : "client",
        alert: $,
      }),
        H.process();
    };
    O_.handleHandshake = function (H, _) {
      var q = _.fragment,
        $ = q.getByte(),
        K = q.getInt24();
      if (K > q.length()) return (H.fragmented = _), (_.fragment = g8.util.createBuffer()), (q.read -= 4), H.process();
      (H.fragmented = null), (q.read -= 4);
      var O = q.bytes(K + 4);
      if (((q.read += 4), $ in gk_[H.entity][H.expect])) {
        if (H.entity === O_.ConnectionEnd.server && !H.open && !H.fail)
          (H.handshaking = !0),
            (H.session = {
              version: null,
              extensions: { server_name: { serverNameList: [] } },
              cipherSuite: null,
              compressionMethod: null,
              serverCertificate: null,
              clientCertificate: null,
              md5: g8.md.md5.create(),
              sha1: g8.md.sha1.create(),
            });
        if (
          $ !== O_.HandshakeType.hello_request &&
          $ !== O_.HandshakeType.certificate_verify &&
          $ !== O_.HandshakeType.finished
        )
          H.session.md5.update(O), H.session.sha1.update(O);
        gk_[H.entity][H.expect][$](H, _, K);
      } else O_.handleUnexpected(H, _);
    };
    O_.handleApplicationData = function (H, _) {
      H.data.putBuffer(_.fragment), H.dataReady(H), H.process();
    };
    O_.handleHeartbeat = function (H, _) {
      var q = _.fragment,
        $ = q.getByte(),
        K = q.getInt16(),
        O = q.getBytes(K);
      if ($ === O_.HeartbeatMessageType.heartbeat_request) {
        if (H.handshaking || K > O.length) return H.process();
        O_.queue(
          H,
          O_.createRecord(H, {
            type: O_.ContentType.heartbeat,
            data: O_.createHeartbeat(O_.HeartbeatMessageType.heartbeat_response, O),
          }),
        ),
          O_.flush(H);
      } else if ($ === O_.HeartbeatMessageType.heartbeat_response) {
        if (O !== H.expectedHeartbeatPayload) return H.process();
        if (H.heartbeatReceived) H.heartbeatReceived(H, g8.util.createBuffer(O));
      }
      H.process();
    };
    var KU4 = 0,
      OU4 = 1,
      o97 = 2,
      TU4 = 3,
      zU4 = 4,
      s97 = 5,
      AU4 = 6,
      fU4 = 7,
      wU4 = 8,
      YU4 = 0,
      DU4 = 1,
      vC6 = 2,
      jU4 = 3,
      NC6 = 4,
      MU4 = 5,
      JU4 = 6,
      q_ = O_.handleUnexpected,
      t97 = O_.handleChangeCipherSpec,
      nX = O_.handleAlert,
      mZ = O_.handleHandshake,
      e97 = O_.handleApplicationData,
      rX = O_.handleHeartbeat,
      hC6 = [];
    hC6[O_.ConnectionEnd.client] = [
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, q_, rX],
      [t97, nX, q_, q_, rX],
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, e97, rX],
      [q_, nX, mZ, q_, rX],
    ];
    hC6[O_.ConnectionEnd.server] = [
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, q_, rX],
      [t97, nX, q_, q_, rX],
      [q_, nX, mZ, q_, rX],
      [q_, nX, mZ, e97, rX],
      [q_, nX, mZ, q_, rX],
    ];
    var {
        handleHelloRequest: U6H,
        handleServerHello: PU4,
        handleCertificate: H$7,
        handleServerKeyExchange: a97,
        handleCertificateRequest: LC6,
        handleServerHelloDone: Bk_,
        handleFinished: _$7,
      } = O_,
      gk_ = [];
    gk_[O_.ConnectionEnd.client] = [
      [q_, q_, PU4, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, H$7, a97, LC6, Bk_, q_, q_, q_, q_, q_, q_],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, a97, LC6, Bk_, q_, q_, q_, q_, q_, q_],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, LC6, Bk_, q_, q_, q_, q_, q_, q_],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, Bk_, q_, q_, q_, q_, q_, q_],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, _$7],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
      [U6H, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
    ];
    var { handleClientHello: XU4, handleClientKeyExchange: WU4, handleCertificateVerify: GU4 } = O_;
    gk_[O_.ConnectionEnd.server] = [
      [q_, XU4, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
      [q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, H$7, q_, q_, q_, q_, q_, q_, q_, q_, q_],
      [q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, WU4, q_, q_, q_, q_],
      [q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, GU4, q_, q_, q_, q_, q_],
      [q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
      [q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, _$7],
      [q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
      [q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_, q_],
    ];
    O_.generateKeys = function (H, _) {
      var q = dk_,
        $ = _.client_random + _.server_random;
      if (!H.session.resuming)
        (_.master_secret = q(_.pre_master_secret, "master secret", $, 48).bytes()), (_.pre_master_secret = null);
      $ = _.server_random + _.client_random;
      var K = 2 * _.mac_key_length + 2 * _.enc_key_length,
        O = H.version.major === O_.Versions.TLS_1_0.major && H.version.minor === O_.Versions.TLS_1_0.minor;
      if (O) K += 2 * _.fixed_iv_length;
      var T = q(_.master_secret, "key expansion", $, K),
        z = {
          client_write_MAC_key: T.getBytes(_.mac_key_length),
          server_write_MAC_key: T.getBytes(_.mac_key_length),
          client_write_key: T.getBytes(_.enc_key_length),
          server_write_key: T.getBytes(_.enc_key_length),
        };
      if (O) (z.client_write_IV = T.getBytes(_.fixed_iv_length)), (z.server_write_IV = T.getBytes(_.fixed_iv_length));
      return z;
    };
    O_.createConnectionState = function (H) {
      var _ = H.entity === O_.ConnectionEnd.client,
        q = function () {
          var O = {
            sequenceNumber: [0, 0],
            macKey: null,
            macLength: 0,
            macFunction: null,
            cipherState: null,
            cipherFunction: function (T) {
              return !0;
            },
            compressionState: null,
            compressFunction: function (T) {
              return !0;
            },
            updateSequenceNumber: function () {
              if (O.sequenceNumber[1] === 4294967295) (O.sequenceNumber[1] = 0), ++O.sequenceNumber[0];
              else ++O.sequenceNumber[1];
            },
          };
          return O;
        },
        $ = { read: q(), write: q() };
      if (
        (($.read.update = function (O, T) {
          if (!$.read.cipherFunction(T, $.read))
            O.error(O, {
              message: "Could not decrypt record or bad MAC.",
              send: !0,
              alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.bad_record_mac },
            });
          else if (!$.read.compressFunction(O, T, $.read))
            O.error(O, {
              message: "Could not decompress record.",
              send: !0,
              alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.decompression_failure },
            });
          return !O.fail;
        }),
        ($.write.update = function (O, T) {
          if (!$.write.compressFunction(O, T, $.write))
            O.error(O, {
              message: "Could not compress record.",
              send: !1,
              alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.internal_error },
            });
          else if (!$.write.cipherFunction(T, $.write))
            O.error(O, {
              message: "Could not encrypt record.",
              send: !1,
              alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.internal_error },
            });
          return !O.fail;
        }),
        H.session)
      ) {
        var K = H.session.sp;
        switch (
          (H.session.cipherSuite.initSecurityParameters(K),
          (K.keys = O_.generateKeys(H, K)),
          ($.read.macKey = _ ? K.keys.server_write_MAC_key : K.keys.client_write_MAC_key),
          ($.write.macKey = _ ? K.keys.client_write_MAC_key : K.keys.server_write_MAC_key),
          H.session.cipherSuite.initConnectionState($, H, K),
          K.compression_algorithm)
        ) {
          case O_.CompressionMethod.none:
            break;
          case O_.CompressionMethod.deflate:
            ($.read.compressFunction = $U4), ($.write.compressFunction = qU4);
            break;
          default:
            throw Error("Unsupported compression algorithm.");
        }
      }
      return $;
    };
    O_.createRandom = function () {
      var H = new Date(),
        _ = +H + H.getTimezoneOffset() * 60000,
        q = g8.util.createBuffer();
      return q.putInt32(_), q.putBytes(g8.random.getBytes(28)), q;
    };
    O_.createRecord = function (H, _) {
      if (!_.data) return null;
      var q = {
        type: _.type,
        version: { major: H.version.major, minor: H.version.minor },
        length: _.data.length(),
        fragment: _.data,
      };
      return q;
    };
    O_.createAlert = function (H, _) {
      var q = g8.util.createBuffer();
      return q.putByte(_.level), q.putByte(_.description), O_.createRecord(H, { type: O_.ContentType.alert, data: q });
    };
    O_.createClientHello = function (H) {
      H.session.clientHelloVersion = { major: H.version.major, minor: H.version.minor };
      var _ = g8.util.createBuffer();
      for (var q = 0; q < H.cipherSuites.length; ++q) {
        var $ = H.cipherSuites[q];
        _.putByte($.id[0]), _.putByte($.id[1]);
      }
      var K = _.length(),
        O = g8.util.createBuffer();
      O.putByte(O_.CompressionMethod.none);
      var T = O.length(),
        z = g8.util.createBuffer();
      if (H.virtualHost) {
        var A = g8.util.createBuffer();
        A.putByte(0), A.putByte(0);
        var f = g8.util.createBuffer();
        f.putByte(0), cE(f, 2, g8.util.createBuffer(H.virtualHost));
        var w = g8.util.createBuffer();
        cE(w, 2, f), cE(A, 2, w), z.putBuffer(A);
      }
      var Y = z.length();
      if (Y > 0) Y += 2;
      var D = H.session.id,
        j = D.length + 1 + 2 + 4 + 28 + 2 + K + 1 + T + Y,
        M = g8.util.createBuffer();
      if (
        (M.putByte(O_.HandshakeType.client_hello),
        M.putInt24(j),
        M.putByte(H.version.major),
        M.putByte(H.version.minor),
        M.putBytes(H.session.sp.client_random),
        cE(M, 1, g8.util.createBuffer(D)),
        cE(M, 2, _),
        cE(M, 1, O),
        Y > 0)
      )
        cE(M, 2, z);
      return M;
    };
    O_.createServerHello = function (H) {
      var _ = H.session.id,
        q = _.length + 1 + 2 + 4 + 28 + 2 + 1,
        $ = g8.util.createBuffer();
      return (
        $.putByte(O_.HandshakeType.server_hello),
        $.putInt24(q),
        $.putByte(H.version.major),
        $.putByte(H.version.minor),
        $.putBytes(H.session.sp.server_random),
        cE($, 1, g8.util.createBuffer(_)),
        $.putByte(H.session.cipherSuite.id[0]),
        $.putByte(H.session.cipherSuite.id[1]),
        $.putByte(H.session.compressionMethod),
        $
      );
    };
    O_.createCertificate = function (H) {
      var _ = H.entity === O_.ConnectionEnd.client,
        q = null;
      if (H.getCertificate) {
        var $;
        if (_) $ = H.session.certificateRequest;
        else $ = H.session.extensions.server_name.serverNameList;
        q = H.getCertificate(H, $);
      }
      var K = g8.util.createBuffer();
      if (q !== null)
        try {
          if (!g8.util.isArray(q)) q = [q];
          var O = null;
          for (var T = 0; T < q.length; ++T) {
            var z = g8.pem.decode(q[T])[0];
            if (z.type !== "CERTIFICATE" && z.type !== "X509 CERTIFICATE" && z.type !== "TRUSTED CERTIFICATE") {
              var A = Error(
                'Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".',
              );
              throw ((A.headerType = z.type), A);
            }
            if (z.procType && z.procType.type === "ENCRYPTED")
              throw Error("Could not convert certificate from PEM; PEM is encrypted.");
            var f = g8.util.createBuffer(z.body);
            if (O === null) O = g8.asn1.fromDer(f.bytes(), !1);
            var w = g8.util.createBuffer();
            cE(w, 3, f), K.putBuffer(w);
          }
          if (((q = g8.pki.certificateFromAsn1(O)), _)) H.session.clientCertificate = q;
          else H.session.serverCertificate = q;
        } catch (j) {
          return H.error(H, {
            message: "Could not send certificate list.",
            cause: j,
            send: !0,
            alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.bad_certificate },
          });
        }
      var Y = 3 + K.length(),
        D = g8.util.createBuffer();
      return D.putByte(O_.HandshakeType.certificate), D.putInt24(Y), cE(D, 3, K), D;
    };
    O_.createClientKeyExchange = function (H) {
      var _ = g8.util.createBuffer();
      _.putByte(H.session.clientHelloVersion.major),
        _.putByte(H.session.clientHelloVersion.minor),
        _.putBytes(g8.random.getBytes(46));
      var q = H.session.sp;
      q.pre_master_secret = _.getBytes();
      var $ = H.session.serverCertificate.publicKey;
      _ = $.encrypt(q.pre_master_secret);
      var K = _.length + 2,
        O = g8.util.createBuffer();
      return O.putByte(O_.HandshakeType.client_key_exchange), O.putInt24(K), O.putInt16(_.length), O.putBytes(_), O;
    };
    O_.createServerKeyExchange = function (H) {
      var _ = 0,
        q = g8.util.createBuffer();
      if (_ > 0) q.putByte(O_.HandshakeType.server_key_exchange), q.putInt24(_);
      return q;
    };
    O_.getClientSignature = function (H, _) {
      var q = g8.util.createBuffer();
      q.putBuffer(H.session.md5.digest()),
        q.putBuffer(H.session.sha1.digest()),
        (q = q.getBytes()),
        (H.getSignature =
          H.getSignature ||
          function ($, K, O) {
            var T = null;
            if ($.getPrivateKey)
              try {
                (T = $.getPrivateKey($, $.session.clientCertificate)), (T = g8.pki.privateKeyFromPem(T));
              } catch (z) {
                $.error($, {
                  message: "Could not get private key.",
                  cause: z,
                  send: !0,
                  alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.internal_error },
                });
              }
            if (T === null)
              $.error($, {
                message: "No private key set.",
                send: !0,
                alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.internal_error },
              });
            else K = T.sign(K, null);
            O($, K);
          }),
        H.getSignature(H, q, _);
    };
    O_.createCertificateVerify = function (H, _) {
      var q = _.length + 2,
        $ = g8.util.createBuffer();
      return $.putByte(O_.HandshakeType.certificate_verify), $.putInt24(q), $.putInt16(_.length), $.putBytes(_), $;
    };
    O_.createCertificateRequest = function (H) {
      var _ = g8.util.createBuffer();
      _.putByte(1);
      var q = g8.util.createBuffer();
      for (var $ in H.caStore.certs) {
        var K = H.caStore.certs[$],
          O = g8.pki.distinguishedNameToAsn1(K.subject),
          T = g8.asn1.toDer(O);
        q.putInt16(T.length()), q.putBuffer(T);
      }
      var z = 1 + _.length() + 2 + q.length(),
        A = g8.util.createBuffer();
      return A.putByte(O_.HandshakeType.certificate_request), A.putInt24(z), cE(A, 1, _), cE(A, 2, q), A;
    };
    O_.createServerHelloDone = function (H) {
      var _ = g8.util.createBuffer();
      return _.putByte(O_.HandshakeType.server_hello_done), _.putInt24(0), _;
    };
    O_.createChangeCipherSpec = function () {
      var H = g8.util.createBuffer();
      return H.putByte(1), H;
    };
    O_.createFinished = function (H) {
      var _ = g8.util.createBuffer();
      _.putBuffer(H.session.md5.digest()), _.putBuffer(H.session.sha1.digest());
      var q = H.entity === O_.ConnectionEnd.client,
        $ = H.session.sp,
        K = 12,
        O = dk_,
        T = q ? "client finished" : "server finished";
      _ = O($.master_secret, T, _.getBytes(), K);
      var z = g8.util.createBuffer();
      return z.putByte(O_.HandshakeType.finished), z.putInt24(_.length()), z.putBuffer(_), z;
    };
    O_.createHeartbeat = function (H, _, q) {
      if (typeof q > "u") q = _.length;
      var $ = g8.util.createBuffer();
      $.putByte(H), $.putInt16(q), $.putBytes(_);
      var K = $.length(),
        O = Math.max(16, K - q - 3);
      return $.putBytes(g8.random.getBytes(O)), $;
    };
    O_.queue = function (H, _) {
      if (!_) return;
      if (_.fragment.length() === 0) {
        if (
          _.type === O_.ContentType.handshake ||
          _.type === O_.ContentType.alert ||
          _.type === O_.ContentType.change_cipher_spec
        )
          return;
      }
      if (_.type === O_.ContentType.handshake) {
        var q = _.fragment.bytes();
        H.session.md5.update(q), H.session.sha1.update(q), (q = null);
      }
      var $;
      if (_.fragment.length() <= O_.MaxFragment) $ = [_];
      else {
        $ = [];
        var K = _.fragment.bytes();
        while (K.length > O_.MaxFragment)
          $.push(O_.createRecord(H, { type: _.type, data: g8.util.createBuffer(K.slice(0, O_.MaxFragment)) })),
            (K = K.slice(O_.MaxFragment));
        if (K.length > 0) $.push(O_.createRecord(H, { type: _.type, data: g8.util.createBuffer(K) }));
      }
      for (var O = 0; O < $.length && !H.fail; ++O) {
        var T = $[O],
          z = H.state.current.write;
        if (z.update(H, T)) H.records.push(T);
      }
    };
    O_.flush = function (H) {
      for (var _ = 0; _ < H.records.length; ++_) {
        var q = H.records[_];
        H.tlsData.putByte(q.type),
          H.tlsData.putByte(q.version.major),
          H.tlsData.putByte(q.version.minor),
          H.tlsData.putInt16(q.fragment.length()),
          H.tlsData.putBuffer(H.records[_].fragment);
      }
      return (H.records = []), H.tlsDataReady(H);
    };
    var kC6 = function (H) {
        switch (H) {
          case !0:
            return !0;
          case g8.pki.certificateError.bad_certificate:
            return O_.Alert.Description.bad_certificate;
          case g8.pki.certificateError.unsupported_certificate:
            return O_.Alert.Description.unsupported_certificate;
          case g8.pki.certificateError.certificate_revoked:
            return O_.Alert.Description.certificate_revoked;
          case g8.pki.certificateError.certificate_expired:
            return O_.Alert.Description.certificate_expired;
          case g8.pki.certificateError.certificate_unknown:
            return O_.Alert.Description.certificate_unknown;
          case g8.pki.certificateError.unknown_ca:
            return O_.Alert.Description.unknown_ca;
          default:
            return O_.Alert.Description.bad_certificate;
        }
      },
      RU4 = function (H) {
        switch (H) {
          case !0:
            return !0;
          case O_.Alert.Description.bad_certificate:
            return g8.pki.certificateError.bad_certificate;
          case O_.Alert.Description.unsupported_certificate:
            return g8.pki.certificateError.unsupported_certificate;
          case O_.Alert.Description.certificate_revoked:
            return g8.pki.certificateError.certificate_revoked;
          case O_.Alert.Description.certificate_expired:
            return g8.pki.certificateError.certificate_expired;
          case O_.Alert.Description.certificate_unknown:
            return g8.pki.certificateError.certificate_unknown;
          case O_.Alert.Description.unknown_ca:
            return g8.pki.certificateError.unknown_ca;
          default:
            return g8.pki.certificateError.bad_certificate;
        }
      };
    O_.verifyCertificateChain = function (H, _) {
      try {
        var q = {};
        for (var $ in H.verifyOptions) q[$] = H.verifyOptions[$];
        (q.verify = function (O, T, z) {
          var A = kC6(O),
            f = H.verify(H, O, T, z);
          if (f !== !0) {
            if (typeof f === "object" && !g8.util.isArray(f)) {
              var w = Error("The application rejected the certificate.");
              if (
                ((w.send = !0),
                (w.alert = { level: O_.Alert.Level.fatal, description: O_.Alert.Description.bad_certificate }),
                f.message)
              )
                w.message = f.message;
              if (f.alert) w.alert.description = f.alert;
              throw w;
            }
            if (f !== O) f = RU4(f);
          }
          return f;
        }),
          g8.pki.verifyCertificateChain(H.caStore, _, q);
      } catch (O) {
        var K = O;
        if (typeof K !== "object" || g8.util.isArray(K))
          K = { send: !0, alert: { level: O_.Alert.Level.fatal, description: kC6(O) } };
        if (!("send" in K)) K.send = !0;
        if (!("alert" in K)) K.alert = { level: O_.Alert.Level.fatal, description: kC6(K.error) };
        H.error(H, K);
      }
      return !H.fail;
    };
    O_.createSessionCache = function (H, _) {
      var q = null;
      if (H && H.getSession && H.setSession && H.order) q = H;
      else {
        (q = {}), (q.cache = H || {}), (q.capacity = Math.max(_ || 100, 1)), (q.order = []);
        for (var $ in H)
          if (q.order.length <= _) q.order.push($);
          else delete H[$];
        (q.getSession = function (K) {
          var O = null,
            T = null;
          if (K) T = g8.util.bytesToHex(K);
          else if (q.order.length > 0) T = q.order[0];
          if (T !== null && T in q.cache) {
            (O = q.cache[T]), delete q.cache[T];
            for (var z in q.order)
              if (q.order[z] === T) {
                q.order.splice(z, 1);
                break;
              }
          }
          return O;
        }),
          (q.setSession = function (K, O) {
            if (q.order.length === q.capacity) {
              var T = q.order.shift();
              delete q.cache[T];
            }
            var T = g8.util.bytesToHex(K);
            q.order.push(T), (q.cache[T] = O);
          });
      }
      return q;
    };
    O_.createConnection = function (H) {
      var _ = null;
      if (H.caStore)
        if (g8.util.isArray(H.caStore)) _ = g8.pki.createCaStore(H.caStore);
        else _ = H.caStore;
      else _ = g8.pki.createCaStore();
      var q = H.cipherSuites || null;
      if (q === null) {
        q = [];
        for (var $ in O_.CipherSuites) q.push(O_.CipherSuites[$]);
      }
      var K = H.server ? O_.ConnectionEnd.server : O_.ConnectionEnd.client,
        O = H.sessionCache ? O_.createSessionCache(H.sessionCache) : null,
        T = {
          version: { major: O_.Version.major, minor: O_.Version.minor },
          entity: K,
          sessionId: H.sessionId,
          caStore: _,
          sessionCache: O,
          cipherSuites: q,
          connected: H.connected,
          virtualHost: H.virtualHost || null,
          verifyClient: H.verifyClient || !1,
          verify:
            H.verify ||
            function (w, Y, D, j) {
              return Y;
            },
          verifyOptions: H.verifyOptions || {},
          getCertificate: H.getCertificate || null,
          getPrivateKey: H.getPrivateKey || null,
          getSignature: H.getSignature || null,
          input: g8.util.createBuffer(),
          tlsData: g8.util.createBuffer(),
          data: g8.util.createBuffer(),
          tlsDataReady: H.tlsDataReady,
          dataReady: H.dataReady,
          heartbeatReceived: H.heartbeatReceived,
          closed: H.closed,
          error: function (w, Y) {
            if (((Y.origin = Y.origin || (w.entity === O_.ConnectionEnd.client ? "client" : "server")), Y.send))
              O_.queue(w, O_.createAlert(w, Y.alert)), O_.flush(w);
            var D = Y.fatal !== !1;
            if (D) w.fail = !0;
            if ((H.error(w, Y), D)) w.close(!1);
          },
          deflate: H.deflate || null,
          inflate: H.inflate || null,
        };
      (T.reset = function (w) {
        (T.version = { major: O_.Version.major, minor: O_.Version.minor }),
          (T.record = null),
          (T.session = null),
          (T.peerCertificate = null),
          (T.state = { pending: null, current: null }),
          (T.expect = T.entity === O_.ConnectionEnd.client ? KU4 : YU4),
          (T.fragmented = null),
          (T.records = []),
          (T.open = !1),
          (T.handshakes = 0),
          (T.handshaking = !1),
          (T.isConnected = !1),
          (T.fail = !(w || typeof w > "u")),
          T.input.clear(),
          T.tlsData.clear(),
          T.data.clear(),
          (T.state.current = O_.createConnectionState(T));
      }),
        T.reset();
      var z = function (w, Y) {
          var D = Y.type - O_.ContentType.change_cipher_spec,
            j = hC6[w.entity][w.expect];
          if (D in j) j[D](w, Y);
          else O_.handleUnexpected(w, Y);
        },
        A = function (w) {
          var Y = 0,
            D = w.input,
            j = D.length();
          if (j < 5) Y = 5 - j;
          else {
            w.record = {
              type: D.getByte(),
              version: { major: D.getByte(), minor: D.getByte() },
              length: D.getInt16(),
              fragment: g8.util.createBuffer(),
              ready: !1,
            };
            var M = w.record.version.major === w.version.major;
            if (M && w.session && w.session.version) M = w.record.version.minor === w.version.minor;
            if (!M)
              w.error(w, {
                message: "Incompatible TLS version.",
                send: !0,
                alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.protocol_version },
              });
          }
          return Y;
        },
        f = function (w) {
          var Y = 0,
            D = w.input,
            j = D.length();
          if (j < w.record.length) Y = w.record.length - j;
          else {
            w.record.fragment.putBytes(D.getBytes(w.record.length)), D.compact();
            var M = w.state.current.read;
            if (M.update(w, w.record)) {
              if (w.fragmented !== null)
                if (w.fragmented.type === w.record.type)
                  w.fragmented.fragment.putBuffer(w.record.fragment), (w.record = w.fragmented);
                else
                  w.error(w, {
                    message: "Invalid fragmented record.",
                    send: !0,
                    alert: { level: O_.Alert.Level.fatal, description: O_.Alert.Description.unexpected_message },
                  });
              w.record.ready = !0;
            }
          }
          return Y;
        };
      return (
        (T.handshake = function (w) {
          if (T.entity !== O_.ConnectionEnd.client)
            T.error(T, { message: "Cannot initiate handshake as a server.", fatal: !1 });
          else if (T.handshaking) T.error(T, { message: "Handshake already in progress.", fatal: !1 });
          else {
            if (T.fail && !T.open && T.handshakes === 0) T.fail = !1;
            (T.handshaking = !0), (w = w || "");
            var Y = null;
            if (w.length > 0) {
              if (T.sessionCache) Y = T.sessionCache.getSession(w);
              if (Y === null) w = "";
            }
            if (w.length === 0 && T.sessionCache) {
              if (((Y = T.sessionCache.getSession()), Y !== null)) w = Y.id;
            }
            if (
              ((T.session = {
                id: w,
                version: null,
                cipherSuite: null,
                compressionMethod: null,
                serverCertificate: null,
                certificateRequest: null,
                clientCertificate: null,
                sp: {},
                md5: g8.md.md5.create(),
                sha1: g8.md.sha1.create(),
              }),
              Y)
            )
              (T.version = Y.version), (T.session.sp = Y.sp);
            (T.session.sp.client_random = O_.createRandom().getBytes()),
              (T.open = !0),
              O_.queue(T, O_.createRecord(T, { type: O_.ContentType.handshake, data: O_.createClientHello(T) })),
              O_.flush(T);
          }
        }),
        (T.process = function (w) {
          var Y = 0;
          if (w) T.input.putBytes(w);
          if (!T.fail) {
            if (T.record !== null && T.record.ready && T.record.fragment.isEmpty()) T.record = null;
            if (T.record === null) Y = A(T);
            if (!T.fail && T.record !== null && !T.record.ready) Y = f(T);
            if (!T.fail && T.record !== null && T.record.ready) z(T, T.record);
          }
          return Y;
        }),
        (T.prepare = function (w) {
          return (
            O_.queue(T, O_.createRecord(T, { type: O_.ContentType.application_data, data: g8.util.createBuffer(w) })),
            O_.flush(T)
          );
        }),
        (T.prepareHeartbeatRequest = function (w, Y) {
          if (w instanceof g8.util.ByteBuffer) w = w.bytes();
          if (typeof Y > "u") Y = w.length;
          return (
            (T.expectedHeartbeatPayload = w),
            O_.queue(
              T,
              O_.createRecord(T, {
                type: O_.ContentType.heartbeat,
                data: O_.createHeartbeat(O_.HeartbeatMessageType.heartbeat_request, w, Y),
              }),
            ),
            O_.flush(T)
          );
        }),
        (T.close = function (w) {
          if (!T.fail && T.sessionCache && T.session) {
            var Y = { id: T.session.id, version: T.session.version, sp: T.session.sp };
            (Y.sp.keys = null), T.sessionCache.setSession(Y.id, Y);
          }
          if (T.open) {
            if (((T.open = !1), T.input.clear(), T.isConnected || T.handshaking))
              (T.isConnected = T.handshaking = !1),
                O_.queue(
                  T,
                  O_.createAlert(T, { level: O_.Alert.Level.warning, description: O_.Alert.Description.close_notify }),
                ),
                O_.flush(T);
            T.closed(T);
          }
          T.reset(w);
        }),
        T
      );
    };
    q$7.exports = g8.tls = g8.tls || {};
    for (plH in O_) if (typeof O_[plH] !== "function") g8.tls[plH] = O_[plH];
    var plH;
    g8.tls.prf_tls1 = dk_;
    g8.tls.hmac_sha1 = _U4;
    g8.tls.createSessionCache = O_.createSessionCache;
    g8.tls.createConnection = O_.createConnection;
  });
