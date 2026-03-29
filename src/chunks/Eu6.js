  var Eu6 = d((bN_) => {
    var { DOCUMENT_MODE: bZH } = w8H(),
      sj7 = [
        "+//silmaril//dtd html pro v0r11 19970101//",
        "-//as//dtd html 3.0 aswedit + extensions//",
        "-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
        "-//ietf//dtd html 2.0 level 1//",
        "-//ietf//dtd html 2.0 level 2//",
        "-//ietf//dtd html 2.0 strict level 1//",
        "-//ietf//dtd html 2.0 strict level 2//",
        "-//ietf//dtd html 2.0 strict//",
        "-//ietf//dtd html 2.0//",
        "-//ietf//dtd html 2.1e//",
        "-//ietf//dtd html 3.0//",
        "-//ietf//dtd html 3.2 final//",
        "-//ietf//dtd html 3.2//",
        "-//ietf//dtd html 3//",
        "-//ietf//dtd html level 0//",
        "-//ietf//dtd html level 1//",
        "-//ietf//dtd html level 2//",
        "-//ietf//dtd html level 3//",
        "-//ietf//dtd html strict level 0//",
        "-//ietf//dtd html strict level 1//",
        "-//ietf//dtd html strict level 2//",
        "-//ietf//dtd html strict level 3//",
        "-//ietf//dtd html strict//",
        "-//ietf//dtd html//",
        "-//metrius//dtd metrius presentational//",
        "-//microsoft//dtd internet explorer 2.0 html strict//",
        "-//microsoft//dtd internet explorer 2.0 html//",
        "-//microsoft//dtd internet explorer 2.0 tables//",
        "-//microsoft//dtd internet explorer 3.0 html strict//",
        "-//microsoft//dtd internet explorer 3.0 html//",
        "-//microsoft//dtd internet explorer 3.0 tables//",
        "-//netscape comm. corp.//dtd html//",
        "-//netscape comm. corp.//dtd strict html//",
        "-//o'reilly and associates//dtd html 2.0//",
        "-//o'reilly and associates//dtd html extended 1.0//",
        "-//o'reilly and associates//dtd html extended relaxed 1.0//",
        "-//sq//dtd html 2.0 hotmetal + extensions//",
        "-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//",
        "-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//",
        "-//spyglass//dtd html 2.0 extended//",
        "-//sun microsystems corp.//dtd hotjava html//",
        "-//sun microsystems corp.//dtd hotjava strict html//",
        "-//w3c//dtd html 3 1995-03-24//",
        "-//w3c//dtd html 3.2 draft//",
        "-//w3c//dtd html 3.2 final//",
        "-//w3c//dtd html 3.2//",
        "-//w3c//dtd html 3.2s draft//",
        "-//w3c//dtd html 4.0 frameset//",
        "-//w3c//dtd html 4.0 transitional//",
        "-//w3c//dtd html experimental 19960712//",
        "-//w3c//dtd html experimental 970421//",
        "-//w3c//dtd w3 html//",
        "-//w3o//dtd w3 html 3.0//",
        "-//webtechs//dtd mozilla html 2.0//",
        "-//webtechs//dtd mozilla html//",
      ],
      rq1 = sj7.concat(["-//w3c//dtd html 4.01 frameset//", "-//w3c//dtd html 4.01 transitional//"]),
      oq1 = ["-//w3o//dtd w3 html strict 3.0//en//", "-/w3c/dtd html 4.0 transitional/en", "html"],
      tj7 = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"],
      aq1 = tj7.concat(["-//w3c//dtd html 4.01 frameset//", "-//w3c//dtd html 4.01 transitional//"]);
    function oj7(H) {
      let _ = H.indexOf('"') !== -1 ? "'" : '"';
      return _ + H + _;
    }
    function aj7(H, _) {
      for (let q = 0; q < _.length; q++) if (H.indexOf(_[q]) === 0) return !0;
      return !1;
    }
    bN_.isConforming = function (H) {
      return H.name === "html" && H.publicId === null && (H.systemId === null || H.systemId === "about:legacy-compat");
    };
    bN_.getDocumentMode = function (H) {
      if (H.name !== "html") return bZH.QUIRKS;
      let _ = H.systemId;
      if (_ && _.toLowerCase() === "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd") return bZH.QUIRKS;
      let q = H.publicId;
      if (q !== null) {
        if (((q = q.toLowerCase()), oq1.indexOf(q) > -1)) return bZH.QUIRKS;
        let $ = _ === null ? rq1 : sj7;
        if (aj7(q, $)) return bZH.QUIRKS;
        if ((($ = _ === null ? tj7 : aq1), aj7(q, $))) return bZH.LIMITED_QUIRKS;
      }
      return bZH.NO_QUIRKS;
    };
    bN_.serializeContent = function (H, _, q) {
      let $ = "!DOCTYPE ";
      if (H) $ += H;
      if (_) $ += " PUBLIC " + oj7(_);
      else if (q) $ += " SYSTEM";
      if (q !== null) $ += " " + oj7(q);
      return $;
    };
  });
