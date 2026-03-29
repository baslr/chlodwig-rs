    (TY1 = {
      pixels: {
        x: "Horizontal pixel position read directly from the most recent screenshot image, measured from the left edge. The server handles all scaling.",
        y: "Vertical pixel position read directly from the most recent screenshot image, measured from the top edge. The server handles all scaling.",
      },
      normalized_0_100: {
        x: "Horizontal position as a percentage of screen width, 0.0\u2013100.0 (0 = left edge, 100 = right edge).",
        y: "Vertical position as a percentage of screen height, 0.0\u2013100.0 (0 = top edge, 100 = bottom edge).",
      },
    }),
      (Cv7 = {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: [
              "key",
              "type",
              "mouse_move",
              "left_click",
              "left_click_drag",
              "right_click",
              "middle_click",
              "double_click",
              "triple_click",
              "scroll",
              "hold_key",
              "screenshot",
              "cursor_position",
              "left_mouse_down",
              "left_mouse_up",
              "wait",
            ],
            description: "The action to perform.",
          },
          coordinate: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            description: "(x, y) for click/mouse_move/scroll/left_click_drag end point.",
          },
          start_coordinate: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            description: "(x, y) drag start \u2014 left_click_drag only. Omit to drag from current cursor.",
          },
          text: {
            type: "string",
            description:
              "For type: the text. For key/hold_key: the chord string. For click/scroll: modifier keys to hold.",
          },
          scroll_direction: { type: "string", enum: ["up", "down", "left", "right"] },
          scroll_amount: { type: "integer", minimum: 0, maximum: 100 },
          duration: { type: "number", description: "Seconds (0\u2013100). For hold_key/wait." },
          repeat: { type: "integer", minimum: 1, maximum: 100, description: "For key: repeat count." },
        },
        required: ["action"],
      });
