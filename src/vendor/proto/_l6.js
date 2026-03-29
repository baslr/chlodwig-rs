  var _l6 = d((yd7) => {
    var hd7 = yd7,
      DsH = Am(),
      Bc = RP();
    function eQ6(H, _, q, $) {
      var K = !1;
      if (_.resolvedType)
        if (_.resolvedType instanceof DsH) {
          H("switch(d%s){", $);
          for (var O = _.resolvedType.values, T = Object.keys(O), z = 0; z < T.length; ++z) {
            if (O[T[z]] === _.typeDefault && !K) {
              if ((H("default:")('if(typeof(d%s)==="number"){m%s=d%s;break}', $, $, $), !_.repeated)) H("break");
              K = !0;
            }
            H("case%j:", T[z])("case %i:", O[T[z]])("m%s=%j", $, O[T[z]])("break");
          }
          H("}");
        } else
          H('if(typeof d%s!=="object")', $)("throw TypeError(%j)", _.fullName + ": object expected")(
            "m%s=types[%i].fromObject(d%s)",
            $,
            q,
            $,
          );
      else {
        var A = !1;
        switch (_.type) {
          case "double":
          case "float":
            H("m%s=Number(d%s)", $, $);
            break;
          case "uint32":
          case "fixed32":
            H("m%s=d%s>>>0", $, $);
            break;
          case "int32":
          case "sint32":
          case "sfixed32":
            H("m%s=d%s|0", $, $);
            break;
          case "uint64":
            A = !0;
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            H("if(util.Long)")("(m%s=util.Long.fromValue(d%s)).unsigned=%j", $, $, A)(
              'else if(typeof d%s==="string")',
              $,
            )(
              "m%s=parseInt(d%s,10)",
              $,
              $,
            )('else if(typeof d%s==="number")', $)(
              "m%s=d%s",
              $,
              $,
            )('else if(typeof d%s==="object")', $)(
              "m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)",
              $,
              $,
              $,
              A ? "true" : "",
            );
            break;
          case "bytes":
            H('if(typeof d%s==="string")', $)(
              "util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)",
              $,
              $,
              $,
            )("else if(d%s.length >= 0)", $)("m%s=d%s", $, $);
            break;
          case "string":
            H("m%s=String(d%s)", $, $);
            break;
          case "bool":
            H("m%s=Boolean(d%s)", $, $);
            break;
        }
      }
      return H;
    }
    hd7.fromObject = function (_) {
      var q = _.fieldsArray,
        $ = Bc.codegen(["d"], _.name + "$fromObject")("if(d instanceof this.ctor)")("return d");
      if (!q.length) return $("return new this.ctor");
      $("var m=new this.ctor");
      for (var K = 0; K < q.length; ++K) {
        var O = q[K].resolve(),
          T = Bc.safeProp(O.name);
        if (O.map)
          $("if(d%s){", T)('if(typeof d%s!=="object")', T)("throw TypeError(%j)", O.fullName + ": object expected")(
            "m%s={}",
            T,
          )("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){", T),
            eQ6($, O, K, T + "[ks[i]]")("}")("}");
        else if (O.repeated)
          $("if(d%s){", T)("if(!Array.isArray(d%s))", T)("throw TypeError(%j)", O.fullName + ": array expected")(
            "m%s=[]",
            T,
          )("for(var i=0;i<d%s.length;++i){", T),
            eQ6($, O, K, T + "[i]")("}")("}");
        else {
          if (!(O.resolvedType instanceof DsH)) $("if(d%s!=null){", T);
          if ((eQ6($, O, K, T), !(O.resolvedType instanceof DsH))) $("}");
        }
      }
      return $("return m");
    };
    function Hl6(H, _, q, $) {
      if (_.resolvedType)
        if (_.resolvedType instanceof DsH)
          H(
            "d%s=o.enums===String?(types[%i].values[m%s]===undefined?m%s:types[%i].values[m%s]):m%s",
            $,
            q,
            $,
            $,
            q,
            $,
            $,
          );
        else H("d%s=types[%i].toObject(m%s,o)", $, q, $);
      else {
        var K = !1;
        switch (_.type) {
          case "double":
          case "float":
            H("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s", $, $, $, $);
            break;
          case "uint64":
            K = !0;
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            H('if(typeof m%s==="number")', $)("d%s=o.longs===String?String(m%s):m%s", $, $, $)("else")(
              "d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s",
              $,
              $,
              $,
              $,
              K ? "true" : "",
              $,
            );
            break;
          case "bytes":
            H(
              "d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s",
              $,
              $,
              $,
              $,
              $,
            );
            break;
          default:
            H("d%s=m%s", $, $);
            break;
        }
      }
      return H;
    }
    hd7.toObject = function (_) {
      var q = _.fieldsArray.slice().sort(Bc.compareFieldsById);
      if (!q.length) return Bc.codegen()("return {}");
      var $ = Bc.codegen(["m", "o"], _.name + "$toObject")("if(!o)")("o={}")("var d={}"),
        K = [],
        O = [],
        T = [],
        z = 0;
      for (; z < q.length; ++z) if (!q[z].partOf) (q[z].resolve().repeated ? K : q[z].map ? O : T).push(q[z]);
      if (K.length) {
        $("if(o.arrays||o.defaults){");
        for (z = 0; z < K.length; ++z) $("d%s=[]", Bc.safeProp(K[z].name));
        $("}");
      }
      if (O.length) {
        $("if(o.objects||o.defaults){");
        for (z = 0; z < O.length; ++z) $("d%s={}", Bc.safeProp(O[z].name));
        $("}");
      }
      if (T.length) {
        $("if(o.defaults){");
        for (z = 0; z < T.length; ++z) {
          var A = T[z],
            f = Bc.safeProp(A.name);
          if (A.resolvedType instanceof DsH)
            $("d%s=o.enums===String?%j:%j", f, A.resolvedType.valuesById[A.typeDefault], A.typeDefault);
          else if (A.long)
            $("if(util.Long){")(
              "var n=new util.Long(%i,%i,%j)",
              A.typeDefault.low,
              A.typeDefault.high,
              A.typeDefault.unsigned,
            )(
              "d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n",
              f,
            )("}else")("d%s=o.longs===String?%j:%i", f, A.typeDefault.toString(), A.typeDefault.toNumber());
          else if (A.bytes) {
            var w = "[" + Array.prototype.slice.call(A.typeDefault).join(",") + "]";
            $("if(o.bytes===String)d%s=%j", f, String.fromCharCode.apply(String, A.typeDefault))("else{")(
              "d%s=%s",
              f,
              w,
            )(
              "if(o.bytes!==Array)d%s=util.newBuffer(d%s)",
              f,
              f,
            )("}");
          } else $("d%s=%j", f, A.typeDefault);
        }
        $("}");
      }
      var Y = !1;
      for (z = 0; z < q.length; ++z) {
        var A = q[z],
          D = _._fieldsArray.indexOf(A),
          f = Bc.safeProp(A.name);
        if (A.map) {
          if (!Y) (Y = !0), $("var ks2");
          $("if(m%s&&(ks2=Object.keys(m%s)).length){", f, f)("d%s={}", f)("for(var j=0;j<ks2.length;++j){"),
            Hl6($, A, D, f + "[ks2[j]]")("}");
        } else if (A.repeated)
          $("if(m%s&&m%s.length){", f, f)("d%s=[]", f)("for(var j=0;j<m%s.length;++j){", f),
            Hl6($, A, D, f + "[j]")("}");
        else if (($("if(m%s!=null&&m.hasOwnProperty(%j)){", f, A.name), Hl6($, A, D, f), A.partOf))
          $("if(o.oneofs)")("d%s=%j", Bc.safeProp(A.partOf.name), A.name);
        $("}");
      }
      return $("return d");
    };
  });
