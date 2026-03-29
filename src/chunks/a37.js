  var a37 = d((LHO, o37) => {
    /*!
  Copyright 2013 Lovell Fuller and others.
  SPDX-License-Identifier: Apache-2.0
*/ var Dz = Pd(),
      SI6 = {
        clear: "clear",
        source: "source",
        over: "over",
        in: "in",
        out: "out",
        atop: "atop",
        dest: "dest",
        "dest-over": "dest-over",
        "dest-in": "dest-in",
        "dest-out": "dest-out",
        "dest-atop": "dest-atop",
        xor: "xor",
        add: "add",
        saturate: "saturate",
        multiply: "multiply",
        screen: "screen",
        overlay: "overlay",
        darken: "darken",
        lighten: "lighten",
        "colour-dodge": "colour-dodge",
        "color-dodge": "colour-dodge",
        "colour-burn": "colour-burn",
        "color-burn": "colour-burn",
        "hard-light": "hard-light",
        "soft-light": "soft-light",
        difference: "difference",
        exclusion: "exclusion",
      };
    function Io4(H) {
      if (!Array.isArray(H)) throw Dz.invalidParameterError("images to composite", "array", H);
      return (
        (this.options.composite = H.map((_) => {
          if (!Dz.object(_)) throw Dz.invalidParameterError("image to composite", "object", _);
          let q = this._inputOptionsFromObject(_),
            $ = {
              input: this._createInputDescriptor(_.input, q, { allowStream: !1 }),
              blend: "over",
              tile: !1,
              left: 0,
              top: 0,
              hasOffset: !1,
              gravity: 0,
              premultiplied: !1,
            };
          if (Dz.defined(_.blend))
            if (Dz.string(SI6[_.blend])) $.blend = SI6[_.blend];
            else throw Dz.invalidParameterError("blend", "valid blend name", _.blend);
          if (Dz.defined(_.tile))
            if (Dz.bool(_.tile)) $.tile = _.tile;
            else throw Dz.invalidParameterError("tile", "boolean", _.tile);
          if (Dz.defined(_.left))
            if (Dz.integer(_.left)) $.left = _.left;
            else throw Dz.invalidParameterError("left", "integer", _.left);
          if (Dz.defined(_.top))
            if (Dz.integer(_.top)) $.top = _.top;
            else throw Dz.invalidParameterError("top", "integer", _.top);
          if (Dz.defined(_.top) !== Dz.defined(_.left)) throw Error("Expected both left and top to be set");
          else $.hasOffset = Dz.integer(_.top) && Dz.integer(_.left);
          if (Dz.defined(_.gravity))
            if (Dz.integer(_.gravity) && Dz.inRange(_.gravity, 0, 8)) $.gravity = _.gravity;
            else if (Dz.string(_.gravity) && Dz.integer(this.constructor.gravity[_.gravity]))
              $.gravity = this.constructor.gravity[_.gravity];
            else throw Dz.invalidParameterError("gravity", "valid gravity", _.gravity);
          if (Dz.defined(_.premultiplied))
            if (Dz.bool(_.premultiplied)) $.premultiplied = _.premultiplied;
            else throw Dz.invalidParameterError("premultiplied", "boolean", _.premultiplied);
          return $;
        })),
        this
      );
    }
    o37.exports = (H) => {
      (H.prototype.composite = Io4), (H.blend = SI6);
    };
  });
