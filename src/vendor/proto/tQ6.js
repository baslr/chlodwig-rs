  var tQ6 = d((BgO, Nd7) => {
    Nd7.exports = AN1;
    var TN1 = Am(),
      aQ6 = RP();
    function gC(H, _) {
      return (
        H.name +
        ": " +
        _ +
        (H.repeated && _ !== "array" ? "[]" : H.map && _ !== "object" ? "{k:" + H.keyType + "}" : "") +
        " expected"
      );
    }
    function sQ6(H, _, q, $) {
      if (_.resolvedType)
        if (_.resolvedType instanceof TN1) {
          H("switch(%s){", $)("default:")("return%j", gC(_, "enum value"));
          for (var K = Object.keys(_.resolvedType.values), O = 0; O < K.length; ++O)
            H("case %i:", _.resolvedType.values[K[O]]);
          H("break")("}");
        } else H("{")("var e=types[%i].verify(%s);", q, $)("if(e)")("return%j+e", _.name + ".")("}");
      else
        switch (_.type) {
          case "int32":
          case "uint32":
          case "sint32":
          case "fixed32":
          case "sfixed32":
            H("if(!util.isInteger(%s))", $)("return%j", gC(_, "integer"));
            break;
          case "int64":
          case "uint64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            H(
              "if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))",
              $,
              $,
              $,
              $,
            )("return%j", gC(_, "integer|Long"));
            break;
          case "float":
          case "double":
            H('if(typeof %s!=="number")', $)("return%j", gC(_, "number"));
            break;
          case "bool":
            H('if(typeof %s!=="boolean")', $)("return%j", gC(_, "boolean"));
            break;
          case "string":
            H("if(!util.isString(%s))", $)("return%j", gC(_, "string"));
            break;
          case "bytes":
            H('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))', $, $, $)("return%j", gC(_, "buffer"));
            break;
        }
      return H;
    }
    function zN1(H, _, q) {
      switch (_.keyType) {
        case "int32":
        case "uint32":
        case "sint32":
        case "fixed32":
        case "sfixed32":
          H("if(!util.key32Re.test(%s))", q)("return%j", gC(_, "integer key"));
          break;
        case "int64":
        case "uint64":
        case "sint64":
        case "fixed64":
        case "sfixed64":
          H("if(!util.key64Re.test(%s))", q)("return%j", gC(_, "integer|Long key"));
          break;
        case "bool":
          H("if(!util.key2Re.test(%s))", q)("return%j", gC(_, "boolean key"));
          break;
      }
      return H;
    }
    function AN1(H) {
      var _ = aQ6.codegen(["m"], H.name + "$verify")('if(typeof m!=="object"||m===null)')(
          "return%j",
          "object expected",
        ),
        q = H.oneofsArray,
        $ = {};
      if (q.length) _("var p={}");
      for (var K = 0; K < H.fieldsArray.length; ++K) {
        var O = H._fieldsArray[K].resolve(),
          T = "m" + aQ6.safeProp(O.name);
        if (O.optional) _("if(%s!=null&&m.hasOwnProperty(%j)){", T, O.name);
        if (O.map)
          _("if(!util.isObject(%s))", T)("return%j", gC(O, "object"))("var k=Object.keys(%s)", T)(
            "for(var i=0;i<k.length;++i){",
          ),
            zN1(_, O, "k[i]"),
            sQ6(_, O, K, T + "[k[i]]")("}");
        else if (O.repeated)
          _("if(!Array.isArray(%s))", T)("return%j", gC(O, "array"))("for(var i=0;i<%s.length;++i){", T),
            sQ6(_, O, K, T + "[i]")("}");
        else {
          if (O.partOf) {
            var z = aQ6.safeProp(O.partOf.name);
            if ($[O.partOf.name] === 1) _("if(p%s===1)", z)("return%j", O.partOf.name + ": multiple values");
            ($[O.partOf.name] = 1), _("p%s=1", z);
          }
          sQ6(_, O, K, T);
        }
        if (O.optional) _("}");
      }
      return _("return null");
    }
  });
