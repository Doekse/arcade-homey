# Handheld shell art

Drop **`cabinet.png`** here to enable the painted handheld shell (filename unchanged for compatibility). The widget auto-detects its presence (fallback outlines disappear, painted art takes over).

## Artist template

Use [`wireframe.svg`](wireframe.svg) as a guide layer. It shows the full 1080×1440 canvas, every hit rectangle labeled with its mode and sent key, the screen cutout, zone boundaries, and the dashed "safe area" inside each button where visible art should stay so finger taps slightly off the paint still register.

Import it as a **locked top layer** in Photoshop/Illustrator/Figma/Procreate, paint underneath, then hide/delete the layer before exporting `cabinet.png`.

## Shell PNG (`cabinet.png`) spec

- **Format:** 32-bit PNG with alpha channel.
- **Size:** exactly **1080 × 1440 px** (3:4 portrait). Other aspect ratios will letterbox inside the handheld frame and break button alignment.
- **Transparent screen cutout (4:3):** rectangle from `(65, 80)` to `(1015, 792)` — i.e. `6.019% / 5.556% / 87.963% / 49.444%` (left / top / width / height). `950 × 712` px, 4:3 aspect. Bottom stays fixed at `y = 792`. Leave fully transparent (alpha = 0), no drawn content. Marquee zone above is `y: 0–80 px`.
- **No trademarked DOOM logotype or official art.** Original DOOM-inspired imagery only.

## Painted button positions

Paint the visible button art so it sits roughly centered inside each hit rectangle below. Hit rectangles are `140 × 140 px` in the reference canvas — keep visible button art to ~100–120 px so taps slightly outside the paint still register.

| Button | Rect (left, top, width, height) | Rect (% of 1080 × 1440) | Mode | Sends |
|---|---|---|---|---|
| D-pad Up    | `205, 850, 140, 140` | `18.981%, 59.028%, 12.963%, 9.722%` | hold | KBD_up (265) |
| D-pad Left  | `65, 990, 140, 140`   | `6.019%, 68.75%, 12.963%, 9.722%`   | hold | KBD_left (263) |
| D-pad Right | `345, 990, 140, 140`  | `31.944%, 68.75%, 12.963%, 9.722%`  | hold | KBD_right (262) |
| D-pad Down  | `205, 1130, 140, 140` | `18.981%, 78.472%, 12.963%, 9.722%` | hold | KBD_down (264) |
| Y (strafe)  | `690, 900, 140, 140`  | `63.889%, 62.5%, 12.963%, 9.722%` | hold | KBD_leftalt (342) |
| X (run)     | `870, 900, 140, 140`  | `80.556%, 62.5%, 12.963%, 9.722%` | sticky | KBD_leftshift (340) |
| B (use)     | `690, 1080, 140, 140` | `63.889%, 75%, 12.963%, 9.722%` | hold | KBD_space (32) |
| A (fire)    | `870, 1080, 140, 140` | `80.556%, 75%, 12.963%, 9.722%` | hold | KBD_leftctrl (341) |
| MENU (pill) | `440, 850, 200, 60`  | `40.74%, 59.028%, 18.52%, 4.17%` | tap | KBD_esc (256) |
| SELECT      | `320, 1300, 200, 60` | `29.63%, 90.28%, 18.52%, 4.17%` | tap | KBD_tab (258) |
| START       | `560, 1300, 200, 60` | `51.85%, 90.28%, 18.52%, 4.17%` | tap | KBD_enter (257) |

Left column of the d-pad aligns with the screen cutout at **x = 65**. The face-button 2x2 block is **vertically centered** with the d-pad block (y **850–1270** on the reference canvas): rows at y **900** and **1080** with a **40 px** gap between them (same as the horizontal gap between the Y and X columns: 870 − (690 + 140) = **40**). SELECT and START also use a **40 px** horizontal gap and each is **200 px** wide (same width as MENU).

## Aligning the PNG

When iterating on art, load the widget URL with `?debug-hits=1` appended (e.g. append it to the iframe URL in devtools) to see:

- cyan dashed outline around the overlay box
- red solid outline around the screen cutout
- yellow dashed outline + label on each hit target

If painted buttons don't line up with hit targets, either nudge the art or adjust the `--l / --t` vars in `index.html` (search for `class="hit"` — inline style vars are the source of truth).
