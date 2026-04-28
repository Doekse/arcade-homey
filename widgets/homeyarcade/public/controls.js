'use strict';

/* AUTO-GENERATED -- DO NOT EDIT */
(function (global) {
  'use strict';

  var GAME_CONTROL_KEYS = Object.freeze({
    "aliencarnage": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 342,
      "b": 341,
      "x": 340,
      "y": 32,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "cosmo": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 341,
      "b": 32,
      "x": 340,
      "y": 342,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "doom": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 341,
      "b": 32,
      "x": 340,
      "y": 342,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "duke3d": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 341,
      "b": 32,
      "x": 340,
      "y": 342,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "dukenukem2": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 341,
      "b": 32,
      "x": 340,
      "y": 342,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "heretic": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 341,
      "b": 32,
      "x": 340,
      "y": 342,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "keen4": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 32,
      "b": 342,
      "x": 340,
      "y": 341,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "monsterbash": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 342,
      "b": 341,
      "x": 340,
      "y": 32,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "pcpacman": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 32,
      "b": 257,
      "x": 340,
      "y": 341,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "plbmpong": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 341,
      "b": 257,
      "x": 340,
      "y": 32,
      "menu": 256,
      "select": 258,
      "start": 257
    },
    "wolf3d": {
      "up": 265,
      "down": 264,
      "left": 263,
      "right": 262,
      "a": 341,
      "b": 32,
      "x": 340,
      "y": 342,
      "menu": 256,
      "select": 258,
      "start": 257
    }
  });

  var GAME_CONTROL_CONFIG = Object.freeze({
    "aliencarnage": {
      "up": {
        "key": 265,
        "action": "Move up",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Move down",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Move left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Move right",
        "mode": "hold"
      },
      "a": {
        "key": 342,
        "action": "Fire",
        "mode": "hold"
      },
      "b": {
        "key": 341,
        "action": "Jetpack",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Run (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 32,
        "action": "Swap weapons",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "cosmo": {
      "up": {
        "key": 265,
        "action": "Look up / climb",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Look down",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Move left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Move right",
        "mode": "hold"
      },
      "a": {
        "key": 341,
        "action": "Jump",
        "mode": "hold"
      },
      "b": {
        "key": 32,
        "action": "Secondary action",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Modifier (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 342,
        "action": "Throw bomb",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "doom": {
      "up": {
        "key": 265,
        "action": "Move forward",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Move backward",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Turn left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Turn right",
        "mode": "hold"
      },
      "a": {
        "key": 341,
        "action": "Fire",
        "mode": "hold"
      },
      "b": {
        "key": 32,
        "action": "Use / Open",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Run (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 342,
        "action": "Strafe",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Automap",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "duke3d": {
      "up": {
        "key": 265,
        "action": "Move forward",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Move backward",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Turn left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Turn right",
        "mode": "hold"
      },
      "a": {
        "key": 341,
        "action": "Fire",
        "mode": "hold"
      },
      "b": {
        "key": 32,
        "action": "Use / Open",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Run (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 342,
        "action": "Strafe",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Map",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "dukenukem2": {
      "up": {
        "key": 265,
        "action": "Move up",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Move down",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Move left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Move right",
        "mode": "hold"
      },
      "a": {
        "key": 341,
        "action": "Fire",
        "mode": "hold"
      },
      "b": {
        "key": 32,
        "action": "Jump / Use",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Run (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 342,
        "action": "Modifier",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "heretic": {
      "up": {
        "key": 265,
        "action": "Move forward",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Move backward",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Turn left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Turn right",
        "mode": "hold"
      },
      "a": {
        "key": 341,
        "action": "Attack",
        "mode": "hold"
      },
      "b": {
        "key": 32,
        "action": "Use / Open",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Run (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 342,
        "action": "Strafe",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Automap",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "keen4": {
      "up": {
        "key": 265,
        "action": "Look up / climb",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Look down",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Move left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Move right",
        "mode": "hold"
      },
      "a": {
        "key": 32,
        "action": "Shoot raygun",
        "mode": "hold"
      },
      "b": {
        "key": 342,
        "action": "Jump",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Modifier (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 341,
        "action": "Pogo",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "monsterbash": {
      "up": {
        "key": 265,
        "action": "Aim upward",
        "mode": "tap-or-hold",
        "tapKey": 265,
        "tapHoldMs": 140
      },
      "down": {
        "key": 264,
        "action": "Crouch",
        "mode": "tap-or-hold",
        "tapKey": 264,
        "tapHoldMs": 140
      },
      "left": {
        "key": 263,
        "action": "Move left",
        "mode": "tap-or-hold",
        "tapKey": 263,
        "tapHoldMs": 140
      },
      "right": {
        "key": 262,
        "action": "Move right",
        "mode": "tap-or-hold",
        "tapKey": 262,
        "tapHoldMs": 140
      },
      "a": {
        "key": 342,
        "action": "Fire slingshot",
        "mode": "hold"
      },
      "b": {
        "key": 341,
        "action": "Jump",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Modifier (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 32,
        "action": "Status",
        "mode": "tap"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "pcpacman": {
      "up": {
        "key": 265,
        "action": "Move up",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Move down",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Move left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Move right",
        "mode": "hold"
      },
      "a": {
        "key": 32,
        "action": "Action / pause",
        "mode": "hold"
      },
      "b": {
        "key": 257,
        "action": "Start",
        "mode": "tap"
      },
      "x": {
        "key": 340,
        "action": "Modifier (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 341,
        "action": "Secondary action",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "plbmpong": {
      "up": {
        "key": 265,
        "action": "Paddle up",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Paddle down",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Move left / menu",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Move right / menu",
        "mode": "hold"
      },
      "a": {
        "key": 341,
        "action": "Primary action",
        "mode": "hold"
      },
      "b": {
        "key": 257,
        "action": "Start / confirm",
        "mode": "tap"
      },
      "x": {
        "key": 340,
        "action": "Modifier (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 32,
        "action": "Secondary action",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    },
    "wolf3d": {
      "up": {
        "key": 265,
        "action": "Move forward",
        "mode": "hold"
      },
      "down": {
        "key": 264,
        "action": "Move backward",
        "mode": "hold"
      },
      "left": {
        "key": 263,
        "action": "Turn left",
        "mode": "hold"
      },
      "right": {
        "key": 262,
        "action": "Turn right",
        "mode": "hold"
      },
      "a": {
        "key": 341,
        "action": "Fire",
        "mode": "hold"
      },
      "b": {
        "key": 32,
        "action": "Use / Open",
        "mode": "hold"
      },
      "x": {
        "key": 340,
        "action": "Run (sticky)",
        "mode": "sticky"
      },
      "y": {
        "key": 342,
        "action": "Strafe",
        "mode": "hold"
      },
      "menu": {
        "key": 256,
        "action": "Menu",
        "mode": "tap"
      },
      "select": {
        "key": 258,
        "action": "Map / Status",
        "mode": "tap"
      },
      "start": {
        "key": 257,
        "action": "Confirm",
        "mode": "tap"
      }
    }
  });

  var GAME_BUNDLE_URLS = Object.freeze({
    "aliencarnage": "game/aliencarnage.jsdos",
    "cosmo": "game/cosmo.jsdos",
    "doom": "game/doom.jsdos",
    "duke3d": "game/duke3d.jsdos",
    "dukenukem2": "game/dukenukem2.jsdos",
    "heretic": "game/heretic.jsdos",
    "keen4": "game/keen4.jsdos",
    "monsterbash": "game/monsterbash.jsdos",
    "pcpacman": "game/pcpacman.jsdos",
    "plbmpong": "game/plbmpong.jsdos",
    "wolf3d": "game/wolf3d.jsdos"
  });

  var DEFAULT_GAME_ID = 'doom';

  var KNOWN_GAME_IDS = Object.keys(GAME_BUNDLE_URLS);

  /**
   * @param {Record<string, unknown>} settings
   * @returns {string}
   */
  function resolveGameId(settings) {
    var g = String(settings.game || DEFAULT_GAME_ID);
    for (var i = 0; i < KNOWN_GAME_IDS.length; i += 1) {
      if (g === KNOWN_GAME_IDS[i]) return g;
    }
    return DEFAULT_GAME_ID;
  }

  /**
   * @param {Record<string, unknown>} settings
   * @returns {string}
   */
  function resolveGameBundleUrl(settings) {
    var id = resolveGameId(settings);
    var url = GAME_BUNDLE_URLS[id];
    return url != null ? url : GAME_BUNDLE_URLS[DEFAULT_GAME_ID];
  }

  global.HomeyArcadeControls = Object.freeze({
    DEFAULT_GAME_ID: DEFAULT_GAME_ID,
    GAME_CONTROL_KEYS: GAME_CONTROL_KEYS,
    GAME_CONTROL_CONFIG: GAME_CONTROL_CONFIG,
    GAME_BUNDLE_URLS: GAME_BUNDLE_URLS,
    resolveGameId: resolveGameId,
    resolveGameBundleUrl: resolveGameBundleUrl,
  });
})(typeof window !== 'undefined' ? window : globalThis);
