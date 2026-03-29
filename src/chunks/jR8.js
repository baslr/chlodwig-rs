  var jR8 = d((Gh, L5_) => {
    Gh.formatArgs = uY$;
    Gh.save = xY$;
    Gh.load = mY$;
    Gh.useColors = IY$;
    Gh.storage = pY$();
    Gh.destroy = (() => {
      let H = !1;
      return () => {
        if (!H)
          (H = !0),
            console.warn(
              "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
            );
      };
    })();
    Gh.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33",
    ];
    function IY$() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (
        typeof navigator < "u" &&
        navigator.userAgent &&
        navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
      )
        return !1;
      let H;
      return (
        (typeof document < "u" &&
          document.documentElement &&
          document.documentElement.style &&
          document.documentElement.style.WebkitAppearance) ||
        (typeof window < "u" &&
          window.console &&
          (window.console.firebug || (window.console.exception && window.console.table))) ||
        (typeof navigator < "u" &&
          navigator.userAgent &&
          (H = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) &&
          parseInt(H[1], 10) >= 31) ||
        (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
      );
    }
    function uY$(H) {
      if (
        ((H[0] =
          (this.useColors ? "%c" : "") +
          this.namespace +
          (this.useColors ? " %c" : " ") +
          H[0] +
          (this.useColors ? "%c " : " ") +
          "+" +
          L5_.exports.humanize(this.diff)),
        !this.useColors)
      )
        return;
      let _ = "color: " + this.color;
      H.splice(1, 0, _, "color: inherit");
      let q = 0,
        $ = 0;
      H[0].replace(/%[a-zA-Z%]/g, (K) => {
        if (K === "%%") return;
        if ((q++, K === "%c")) $ = q;
      }),
        H.splice($, 0, _);
    }
    Gh.log = console.debug || console.log || (() => {});
    function xY$(H) {
      try {
        if (H) Gh.storage.setItem("debug", H);
        else Gh.storage.removeItem("debug");
      } catch (_) {}
    }
    function mY$() {
      let H;
      try {
        H = Gh.storage.getItem("debug");
      } catch (_) {}
      if (!H && typeof process < "u" && "env" in process) H = process.env.DEBUG;
      return H;
    }
    function pY$() {
      try {
        return localStorage;
      } catch (H) {}
    }
    L5_.exports = m$6()(Gh);
    var { formatters: BY$ } = L5_.exports;
    BY$.j = function (H) {
      try {
        return JSON.stringify(H);
      } catch (_) {
        return "[UnexpectedJSONParseError]: " + _.message;
      }
    };
  });
