  var MQH = d((Voq) => {
    function vC4(H, { flow: _, indicator: q, next: $, offset: K, onError: O, parentIndent: T, startOnNewline: z }) {
      let A = !1,
        f = z,
        w = z,
        Y = "",
        D = "",
        j = !1,
        M = !1,
        J = null,
        P = null,
        X = null,
        R = null,
        W = null,
        Z = null,
        k = null;
      for (let E of H) {
        if (M) {
          if (E.type !== "space" && E.type !== "newline" && E.type !== "comma")
            O(E.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          M = !1;
        }
        if (J) {
          if (f && E.type !== "comment" && E.type !== "newline")
            O(J, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          J = null;
        }
        switch (E.type) {
          case "space":
            if (!_ && (q !== "doc-start" || $?.type !== "flow-collection") && E.source.includes("\t")) J = E;
            w = !0;
            break;
          case "comment": {
            if (!w) O(E, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            let S = E.source.substring(1) || " ";
            if (!Y) Y = S;
            else Y += D + S;
            (D = ""), (f = !1);
            break;
          }
          case "newline":
            if (f) {
              if (Y) Y += E.source;
              else if (!Z || q !== "seq-item-ind") A = !0;
            } else D += E.source;
            if (((f = !0), (j = !0), P || X)) R = E;
            w = !0;
            break;
          case "anchor":
            if (P) O(E, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (E.source.endsWith(":"))
              O(E.offset + E.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0);
            (P = E), k ?? (k = E.offset), (f = !1), (w = !1), (M = !0);
            break;
          case "tag": {
            if (X) O(E, "MULTIPLE_TAGS", "A node can have at most one tag");
            (X = E), k ?? (k = E.offset), (f = !1), (w = !1), (M = !0);
            break;
          }
          case q:
            if (P || X) O(E, "BAD_PROP_ORDER", `Anchors and tags must be after the ${E.source} indicator`);
            if (Z) O(E, "UNEXPECTED_TOKEN", `Unexpected ${E.source} in ${_ ?? "collection"}`);
            (Z = E), (f = q === "seq-item-ind" || q === "explicit-key-ind"), (w = !1);
            break;
          case "comma":
            if (_) {
              if (W) O(E, "UNEXPECTED_TOKEN", `Unexpected , in ${_}`);
              (W = E), (f = !1), (w = !1);
              break;
            }
          default:
            O(E, "UNEXPECTED_TOKEN", `Unexpected ${E.type} token`), (f = !1), (w = !1);
        }
      }
      let v = H[H.length - 1],
        y = v ? v.offset + v.source.length : K;
      if (
        M &&
        $ &&
        $.type !== "space" &&
        $.type !== "newline" &&
        $.type !== "comma" &&
        ($.type !== "scalar" || $.source !== "")
      )
        O($.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      if (J && ((f && J.indent <= T) || $?.type === "block-map" || $?.type === "block-seq"))
        O(J, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma: W,
        found: Z,
        spaceBefore: A,
        comment: Y,
        hasNewline: j,
        anchor: P,
        tag: X,
        newlineAfterProp: R,
        end: y,
        start: k ?? y,
      };
    }
    Voq.resolveProps = vC4;
  });
