  var oA7 = d((u6O, rA7) => {
    function pH1(H) {
      if (!H) return null;
      if (typeof H === "string") return H;
      return H.source;
    }
    function BH1(H) {
      return Tu6("(", H, ")*");
    }
    function Tu6(...H) {
      return H.map((q) => pH1(q)).join("");
    }
    function gH1(H) {
      let _ = {
          keyword:
            "abort acronym acronyms alias all and assign binary card diag display else eq file files for free ge gt if integer le loop lt maximizing minimizing model models ne negative no not option options or ord positive prod put putpage puttl repeat sameas semicont semiint smax smin solve sos1 sos2 sum system table then until using while xor yes",
          literal: "eps inf na",
          built_in:
            "abs arccos arcsin arctan arctan2 Beta betaReg binomial ceil centropy cos cosh cvPower div div0 eDist entropy errorf execSeed exp fact floor frac gamma gammaReg log logBeta logGamma log10 log2 mapVal max min mod ncpCM ncpF ncpVUpow ncpVUsin normal pi poly power randBinomial randLinear randTriangle round rPower sigmoid sign signPower sin sinh slexp sllog10 slrec sqexp sqlog10 sqr sqrec sqrt tan tanh trunc uniform uniformInt vcPower bool_and bool_eqv bool_imp bool_not bool_or bool_xor ifThen rel_eq rel_ge rel_gt rel_le rel_lt rel_ne gday gdow ghour gleap gmillisec gminute gmonth gsecond gyear jdate jnow jstart jtime errorLevel execError gamsRelease gamsVersion handleCollect handleDelete handleStatus handleSubmit heapFree heapLimit heapSize jobHandle jobKill jobStatus jobTerminate licenseLevel licenseStatus maxExecError sleep timeClose timeComp timeElapsed timeExec timeStart",
        },
        q = { className: "params", begin: /\(/, end: /\)/, excludeBegin: !0, excludeEnd: !0 },
        $ = { className: "symbol", variants: [{ begin: /=[lgenxc]=/ }, { begin: /\$/ }] },
        K = {
          className: "comment",
          variants: [
            { begin: "'", end: "'" },
            { begin: '"', end: '"' },
          ],
          illegal: "\\n",
          contains: [H.BACKSLASH_ESCAPE],
        },
        O = {
          begin: "/",
          end: "/",
          keywords: _,
          contains: [
            K,
            H.C_LINE_COMMENT_MODE,
            H.C_BLOCK_COMMENT_MODE,
            H.QUOTE_STRING_MODE,
            H.APOS_STRING_MODE,
            H.C_NUMBER_MODE,
          ],
        },
        T = /[a-z0-9&#*=?@\\><:,()$[\]_.{}!+%^-]+/,
        z = {
          begin: /[a-z][a-z0-9_]*(\([a-z0-9_, ]*\))?[ \t]+/,
          excludeBegin: !0,
          end: "$",
          endsWithParent: !0,
          contains: [K, O, { className: "comment", begin: Tu6(T, BH1(Tu6(/[ ]+/, T))), relevance: 0 }],
        };
      return {
        name: "GAMS",
        aliases: ["gms"],
        case_insensitive: !0,
        keywords: _,
        contains: [
          H.COMMENT(/^\$ontext/, /^\$offtext/),
          {
            className: "meta",
            begin: "^\\$[a-z0-9]+",
            end: "$",
            returnBegin: !0,
            contains: [{ className: "meta-keyword", begin: "^\\$[a-z0-9]+" }],
          },
          H.COMMENT("^\\*", "$"),
          H.C_LINE_COMMENT_MODE,
          H.C_BLOCK_COMMENT_MODE,
          H.QUOTE_STRING_MODE,
          H.APOS_STRING_MODE,
          {
            beginKeywords: "set sets parameter parameters variable variables scalar scalars equation equations",
            end: ";",
            contains: [
              H.COMMENT("^\\*", "$"),
              H.C_LINE_COMMENT_MODE,
              H.C_BLOCK_COMMENT_MODE,
              H.QUOTE_STRING_MODE,
              H.APOS_STRING_MODE,
              O,
              z,
            ],
          },
          {
            beginKeywords: "table",
            end: ";",
            returnBegin: !0,
            contains: [
              { beginKeywords: "table", end: "$", contains: [z] },
              H.COMMENT("^\\*", "$"),
              H.C_LINE_COMMENT_MODE,
              H.C_BLOCK_COMMENT_MODE,
              H.QUOTE_STRING_MODE,
              H.APOS_STRING_MODE,
              H.C_NUMBER_MODE,
            ],
          },
          {
            className: "function",
            begin: /^[a-z][a-z0-9_,\-+' ()$]+\.{2}/,
            returnBegin: !0,
            contains: [{ className: "title", begin: /^[a-z0-9_]+/ }, q, $],
          },
          H.C_NUMBER_MODE,
          $,
        ],
      };
    }
    rA7.exports = gH1;
  });
