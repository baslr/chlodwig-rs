  var Pc7 = d((GK, Jc7) => {
    var ny = Yx_();
    Jc7.exports = GK = ny.descriptor = ny.Root.fromJSON(Gl6()).lookup(".google.protobuf");
    var {
      Namespace: wc7,
      Root: GsH,
      Enum: nr,
      Type: cc,
      Field: A7H,
      MapField: Oh1,
      OneOf: Dx_,
      Service: RsH,
      Method: jx_,
    } = ny;
    GsH.fromDescriptor = function (_) {
      if (typeof _.length === "number") _ = GK.FileDescriptorSet.decode(_);
      var q = new GsH();
      if (_.file) {
        var $, K;
        for (var O = 0, T; O < _.file.length; ++O) {
          if (((K = q), ($ = _.file[O]).package && $.package.length)) K = q.define($.package);
          var z = Jh1($);
          if ($.name && $.name.length) q.files.push((K.filename = $.name));
          if ($.messageType) for (T = 0; T < $.messageType.length; ++T) K.add(cc.fromDescriptor($.messageType[T], z));
          if ($.enumType) for (T = 0; T < $.enumType.length; ++T) K.add(nr.fromDescriptor($.enumType[T], z));
          if ($.extension) for (T = 0; T < $.extension.length; ++T) K.add(A7H.fromDescriptor($.extension[T], z));
          if ($.service) for (T = 0; T < $.service.length; ++T) K.add(RsH.fromDescriptor($.service[T], z));
          var A = ZNH($.options, GK.FileOptions);
          if (A) {
            var f = Object.keys(A);
            for (T = 0; T < f.length; ++T) K.setOption(f[T], A[f[T]]);
          }
        }
      }
      return q.resolveAll();
    };
    GsH.prototype.toDescriptor = function (_) {
      var q = GK.FileDescriptorSet.create();
      return Yc7(this, q.file, _), q;
    };
    function Yc7(H, _, q) {
      var $ = GK.FileDescriptorProto.create({
        name: H.filename || (H.fullName.substring(1).replace(/\./g, "_") || "root") + ".proto",
      });
      if ((Ph1(q, $), !(H instanceof GsH))) $.package = H.fullName.substring(1);
      for (var K = 0, O; K < H.nestedArray.length; ++K)
        if ((O = H._nestedArray[K]) instanceof cc) $.messageType.push(O.toDescriptor(q));
        else if (O instanceof nr) $.enumType.push(O.toDescriptor());
        else if (O instanceof A7H) $.extension.push(O.toDescriptor(q));
        else if (O instanceof RsH) $.service.push(O.toDescriptor());
        else if (O instanceof wc7) Yc7(O, _, q);
      if (
        (($.options = LNH(H.options, GK.FileOptions)),
        $.messageType.length + $.enumType.length + $.extension.length + $.service.length)
      )
        _.push($);
    }
    var Th1 = 0;
    cc.fromDescriptor = function (_, q, $) {
      if (typeof _.length === "number") _ = GK.DescriptorProto.decode(_);
      var K = new cc(_.name.length ? _.name : "Type" + Th1++, ZNH(_.options, GK.MessageOptions)),
        O;
      if (!$) K._edition = q;
      if (_.oneofDecl) for (O = 0; O < _.oneofDecl.length; ++O) K.add(Dx_.fromDescriptor(_.oneofDecl[O]));
      if (_.field)
        for (O = 0; O < _.field.length; ++O) {
          var T = A7H.fromDescriptor(_.field[O], q, !0);
          if ((K.add(T), _.field[O].hasOwnProperty("oneofIndex"))) K.oneofsArray[_.field[O].oneofIndex].add(T);
        }
      if (_.extension) for (O = 0; O < _.extension.length; ++O) K.add(A7H.fromDescriptor(_.extension[O], q, !0));
      if (_.nestedType) {
        for (O = 0; O < _.nestedType.length; ++O)
          if (
            (K.add(cc.fromDescriptor(_.nestedType[O], q, !0)),
            _.nestedType[O].options && _.nestedType[O].options.mapEntry)
          )
            K.setOption("map_entry", !0);
      }
      if (_.enumType) for (O = 0; O < _.enumType.length; ++O) K.add(nr.fromDescriptor(_.enumType[O], q, !0));
      if (_.extensionRange && _.extensionRange.length) {
        K.extensions = [];
        for (O = 0; O < _.extensionRange.length; ++O)
          K.extensions.push([_.extensionRange[O].start, _.extensionRange[O].end]);
      }
      if ((_.reservedRange && _.reservedRange.length) || (_.reservedName && _.reservedName.length)) {
        if (((K.reserved = []), _.reservedRange))
          for (O = 0; O < _.reservedRange.length; ++O)
            K.reserved.push([_.reservedRange[O].start, _.reservedRange[O].end]);
        if (_.reservedName) for (O = 0; O < _.reservedName.length; ++O) K.reserved.push(_.reservedName[O]);
      }
      return K;
    };
    cc.prototype.toDescriptor = function (_) {
      var q = GK.DescriptorProto.create({ name: this.name }),
        $;
      for ($ = 0; $ < this.fieldsArray.length; ++$) {
        var K;
        if ((q.field.push((K = this._fieldsArray[$].toDescriptor(_))), this._fieldsArray[$] instanceof Oh1)) {
          var O = Rl6(this._fieldsArray[$].keyType, this._fieldsArray[$].resolvedKeyType, !1),
            T = Rl6(this._fieldsArray[$].type, this._fieldsArray[$].resolvedType, !1),
            z =
              T === 11 || T === 14
                ? (this._fieldsArray[$].resolvedType && Mc7(this.parent, this._fieldsArray[$].resolvedType)) ||
                  this._fieldsArray[$].type
                : void 0;
          q.nestedType.push(
            GK.DescriptorProto.create({
              name: K.typeName,
              field: [
                GK.FieldDescriptorProto.create({ name: "key", number: 1, label: 1, type: O }),
                GK.FieldDescriptorProto.create({ name: "value", number: 2, label: 1, type: T, typeName: z }),
              ],
              options: GK.MessageOptions.create({ mapEntry: !0 }),
            }),
          );
        }
      }
      for ($ = 0; $ < this.oneofsArray.length; ++$) q.oneofDecl.push(this._oneofsArray[$].toDescriptor());
      for ($ = 0; $ < this.nestedArray.length; ++$)
        if (this._nestedArray[$] instanceof A7H) q.field.push(this._nestedArray[$].toDescriptor(_));
        else if (this._nestedArray[$] instanceof cc) q.nestedType.push(this._nestedArray[$].toDescriptor(_));
        else if (this._nestedArray[$] instanceof nr) q.enumType.push(this._nestedArray[$].toDescriptor());
      if (this.extensions)
        for ($ = 0; $ < this.extensions.length; ++$)
          q.extensionRange.push(
            GK.DescriptorProto.ExtensionRange.create({ start: this.extensions[$][0], end: this.extensions[$][1] }),
          );
      if (this.reserved)
        for ($ = 0; $ < this.reserved.length; ++$)
          if (typeof this.reserved[$] === "string") q.reservedName.push(this.reserved[$]);
          else
            q.reservedRange.push(
              GK.DescriptorProto.ReservedRange.create({ start: this.reserved[$][0], end: this.reserved[$][1] }),
            );
      return (q.options = LNH(this.options, GK.MessageOptions)), q;
    };
    var zh1 = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/;
    A7H.fromDescriptor = function (_, q, $) {
      if (typeof _.length === "number") _ = GK.DescriptorProto.decode(_);
      if (typeof _.number !== "number") throw Error("missing field id");
      var K;
      if (_.typeName && _.typeName.length) K = _.typeName;
      else K = Dh1(_.type);
      var O;
      switch (_.label) {
        case 1:
          O = void 0;
          break;
        case 2:
          O = "required";
          break;
        case 3:
          O = "repeated";
          break;
        default:
          throw Error("illegal label: " + _.label);
      }
      var T = _.extendee;
      if (_.extendee !== void 0) T = T.length ? T : void 0;
      var z = new A7H(_.name.length ? _.name : "field" + _.number, _.number, K, O, T);
      if (!$) z._edition = q;
      if (((z.options = ZNH(_.options, GK.FieldOptions)), _.proto3_optional)) z.options.proto3_optional = !0;
      if (_.defaultValue && _.defaultValue.length) {
        var A = _.defaultValue;
        switch (A) {
          case "true":
          case "TRUE":
            A = !0;
            break;
          case "false":
          case "FALSE":
            A = !1;
            break;
          default:
            var f = zh1.exec(A);
            if (f) A = parseInt(A);
            break;
        }
        z.setOption("default", A);
      }
      if (jh1(_.type)) {
        if (q === "proto3") {
          if (_.options && !_.options.packed) z.setOption("packed", !1);
        } else if ((!q || q === "proto2") && _.options && _.options.packed) z.setOption("packed", !0);
      }
      return z;
    };
    A7H.prototype.toDescriptor = function (_) {
      var q = GK.FieldDescriptorProto.create({ name: this.name, number: this.id });
      if (this.map) (q.type = 11), (q.typeName = ny.util.ucFirst(this.name)), (q.label = 3);
      else {
        switch ((q.type = Rl6(this.type, this.resolve().resolvedType, this.delimited))) {
          case 10:
          case 11:
          case 14:
            q.typeName = this.resolvedType ? Mc7(this.parent, this.resolvedType) : this.type;
            break;
        }
        if (this.rule === "repeated") q.label = 3;
        else if (this.required && _ === "proto2") q.label = 2;
        else q.label = 1;
      }
      if (((q.extendee = this.extensionField ? this.extensionField.parent.fullName : this.extend), this.partOf)) {
        if ((q.oneofIndex = this.parent.oneofsArray.indexOf(this.partOf)) < 0) throw Error("missing oneof");
      }
      if (this.options) {
        if (((q.options = LNH(this.options, GK.FieldOptions)), this.options.default != null))
          q.defaultValue = String(this.options.default);
        if (this.options.proto3_optional) q.proto3_optional = !0;
      }
      if (_ === "proto3") {
        if (!this.packed) (q.options || (q.options = GK.FieldOptions.create())).packed = !1;
      } else if ((!_ || _ === "proto2") && this.packed)
        (q.options || (q.options = GK.FieldOptions.create())).packed = !0;
      return q;
    };
    var Ah1 = 0;
    nr.fromDescriptor = function (_, q, $) {
      if (typeof _.length === "number") _ = GK.EnumDescriptorProto.decode(_);
      var K = {};
      if (_.value)
        for (var O = 0; O < _.value.length; ++O) {
          var T = _.value[O].name,
            z = _.value[O].number || 0;
          K[T && T.length ? T : "NAME" + z] = z;
        }
      var A = new nr(_.name && _.name.length ? _.name : "Enum" + Ah1++, K, ZNH(_.options, GK.EnumOptions));
      if (!$) A._edition = q;
      return A;
    };
    nr.prototype.toDescriptor = function () {
      var _ = [];
      for (var q = 0, $ = Object.keys(this.values); q < $.length; ++q)
        _.push(GK.EnumValueDescriptorProto.create({ name: $[q], number: this.values[$[q]] }));
      return GK.EnumDescriptorProto.create({ name: this.name, value: _, options: LNH(this.options, GK.EnumOptions) });
    };
    var fh1 = 0;
    Dx_.fromDescriptor = function (_) {
      if (typeof _.length === "number") _ = GK.OneofDescriptorProto.decode(_);
      return new Dx_(_.name && _.name.length ? _.name : "oneof" + fh1++);
    };
    Dx_.prototype.toDescriptor = function () {
      return GK.OneofDescriptorProto.create({ name: this.name });
    };
    var wh1 = 0;
    RsH.fromDescriptor = function (_, q, $) {
      if (typeof _.length === "number") _ = GK.ServiceDescriptorProto.decode(_);
      var K = new RsH(_.name && _.name.length ? _.name : "Service" + wh1++, ZNH(_.options, GK.ServiceOptions));
      if (!$) K._edition = q;
      if (_.method) for (var O = 0; O < _.method.length; ++O) K.add(jx_.fromDescriptor(_.method[O]));
      return K;
    };
    RsH.prototype.toDescriptor = function () {
      var _ = [];
      for (var q = 0; q < this.methodsArray.length; ++q) _.push(this._methodsArray[q].toDescriptor());
      return GK.ServiceDescriptorProto.create({
        name: this.name,
        method: _,
        options: LNH(this.options, GK.ServiceOptions),
      });
    };
    var Yh1 = 0;
    jx_.fromDescriptor = function (_) {
      if (typeof _.length === "number") _ = GK.MethodDescriptorProto.decode(_);
      return new jx_(
        _.name && _.name.length ? _.name : "Method" + Yh1++,
        "rpc",
        _.inputType,
        _.outputType,
        Boolean(_.clientStreaming),
        Boolean(_.serverStreaming),
        ZNH(_.options, GK.MethodOptions),
      );
    };
    jx_.prototype.toDescriptor = function () {
      return GK.MethodDescriptorProto.create({
        name: this.name,
        inputType: this.resolvedRequestType ? this.resolvedRequestType.fullName : this.requestType,
        outputType: this.resolvedResponseType ? this.resolvedResponseType.fullName : this.responseType,
        clientStreaming: this.requestStream,
        serverStreaming: this.responseStream,
        options: LNH(this.options, GK.MethodOptions),
      });
    };
    function Dh1(H) {
      switch (H) {
        case 1:
          return "double";
        case 2:
          return "float";
        case 3:
          return "int64";
        case 4:
          return "uint64";
        case 5:
          return "int32";
        case 6:
          return "fixed64";
        case 7:
          return "fixed32";
        case 8:
          return "bool";
        case 9:
          return "string";
        case 12:
          return "bytes";
        case 13:
          return "uint32";
        case 15:
          return "sfixed32";
        case 16:
          return "sfixed64";
        case 17:
          return "sint32";
        case 18:
          return "sint64";
      }
      throw Error("illegal type: " + H);
    }
    function jh1(H) {
      switch (H) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
          return !0;
      }
      return !1;
    }
    function Rl6(H, _, q) {
      switch (H) {
        case "double":
          return 1;
        case "float":
          return 2;
        case "int64":
          return 3;
        case "uint64":
          return 4;
        case "int32":
          return 5;
        case "fixed64":
          return 6;
        case "fixed32":
          return 7;
        case "bool":
          return 8;
        case "string":
          return 9;
        case "bytes":
          return 12;
        case "uint32":
          return 13;
        case "sfixed32":
          return 15;
        case "sfixed64":
          return 16;
        case "sint32":
          return 17;
        case "sint64":
          return 18;
      }
      if (_ instanceof nr) return 14;
      if (_ instanceof cc) return q ? 10 : 11;
      throw Error("illegal type: " + H);
    }
    function Dc7(H, _) {
      var q = {};
      for (var $ = 0, K, O; $ < _.fieldsArray.length; ++$) {
        if ((O = (K = _._fieldsArray[$]).name) === "uninterpretedOption") continue;
        if (!Object.prototype.hasOwnProperty.call(H, O)) continue;
        var T = Mh1(O);
        if (K.resolvedType instanceof cc) q[T] = Dc7(H[O], K.resolvedType);
        else if (K.resolvedType instanceof nr) q[T] = K.resolvedType.valuesById[H[O]];
        else q[T] = H[O];
      }
      return q;
    }
    function ZNH(H, _) {
      if (!H) return;
      return Dc7(_.toObject(H), _);
    }
    function jc7(H, _) {
      var q = {},
        $ = Object.keys(H);
      for (var K = 0; K < $.length; ++K) {
        var O = $[K],
          T = ny.util.camelCase(O);
        if (!Object.prototype.hasOwnProperty.call(_.fields, T)) continue;
        var z = _.fields[T];
        if (z.resolvedType instanceof cc) q[T] = jc7(H[O], z.resolvedType);
        else q[T] = H[O];
        if (z.repeated && !Array.isArray(q[T])) q[T] = [q[T]];
      }
      return q;
    }
    function LNH(H, _) {
      if (!H) return;
      return _.fromObject(jc7(H, _));
    }
    function Mc7(H, _) {
      var q = H.fullName.split("."),
        $ = _.fullName.split("."),
        K = 0,
        O = 0,
        T = $.length - 1;
      if (!(H instanceof GsH) && _ instanceof wc7)
        while (K < q.length && O < T && q[K] === $[O]) {
          var z = _.lookup(q[K++], !0);
          if (z !== null && z !== _) break;
          ++O;
        }
      else for (; K < q.length && O < T && q[K] === $[O]; ++K, ++O);
      return $.slice(O).join(".");
    }
    function Mh1(H) {
      return (
        H.substring(0, 1) +
        H.substring(1).replace(/([A-Z])(?=[a-z]|$)/g, function (_, q) {
          return "_" + q.toLowerCase();
        })
      );
    }
    function Jh1(H) {
      if (H.syntax === "editions")
        switch (H.edition) {
          case GK.Edition.EDITION_2023:
            return "2023";
          default:
            throw Error("Unsupported edition " + H.edition);
        }
      if (H.syntax === "proto3") return "proto3";
      return "proto2";
    }
    function Ph1(H, _) {
      if (!H) return;
      if (H === "proto2" || H === "proto3") _.syntax = H;
      else
        switch (((_.syntax = "editions"), H)) {
          case "2023":
            _.edition = GK.Edition.EDITION_2023;
            break;
          default:
            throw Error("Unsupported edition " + H);
        }
    }
  });
