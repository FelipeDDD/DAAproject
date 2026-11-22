"""Offline art build. Pass a checkout of spritefx at the revision in SOURCES.md."""
import argparse
import json
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image

HERE = Path(__file__).resolve().parent
ICE = ["#193657", "#286693", "#44afbd", "#a3f4ef", "#f3fffb"]
HOLY = ["#275646", "#40906a", "#97d581", "#ffefa4", "#fffbe3"]
SPIRIT = ["#352153", "#73499b", "#ba86dc", "#f2cafa", "#fffbed"]
TOXIN = ["#302244", "#52504a", "#839b42", "#bde75c", "#f5ffc8"]

# Output name, upstream spec, and overrides to its ramps and individual layers.
# Per-layer overrides replace only the listed top-level properties.
RECIPES = [
    ("blast", "explosion", {}, {}),
    ("meteor", "meteor_strike", {}, {}),
    ("spark", "hit_spark", {"spark": HOLY}, {"star": {"shape": {
        "sdf": "star", "points": 4, "inner": 0.18, "r": {"keys": [[0, 10], [0.3, 8], [1, 2]]}
    }}}),
    ("shards", "hit_spark", {"spark": ICE}, {
        "star": {"shape": {"sdf": "star", "points": 6, "inner": 0.26, "r": 6}},
        "streaks": {"emit": {"mode": "burst", "count": [10, 12], "from": {"area": "circle", "r": 3}},
                    "velocity": {"speed": [2.2, 3.8], "angle": "out"}, "drag": 0.10}
    }),
    ("smoke", "smoke_burst", {}, {}),
    ("miasma", "smoke_burst", {"dust": TOXIN}, {"burst": {"buoyancy": 0.04, "wind": [0.18, -0.02]}}),
    ("venom", "will_o_wisp", {"wisp": TOXIN}, {}),
    ("ember", "campfire", {}, {}),
    ("bolt", "lightning_strike", {}, {}),
    ("sweep", "slash", {}, {}),
    ("shade", "slash", {"steel": SPIRIT}, {}),
    ("rift", "black_hole", {}, {}),
    ("quake", "ground_slam", {}, {}),
    ("ray", "laser_beam", {"laser": SPIRIT, "band": SPIRIT[1:4]}, {}),
    ("litany", "summon", {"arcane": HOLY}, {}),
    ("blessing", "heal_potion", {"holy": HOLY}, {}),
    ("frost", "frost_nova", {}, {}),
    ("gate", "portal", {}, {}),
    ("cyclone", "fire_tornado", {}, {}),
    ("barrier", "hex_barrier_hit", {}, {}),
    ("snow", "blizzard", {}, {}),
    ("spirit", "demon_burst", {"hellfire": SPIRIT}, {}),
]


def generate(source):
    sys.path.insert(0, str(source.resolve()))
    from fx.pipeline import render_effect
    from fx.sheets import load_frames
    from fx.spec import load_effect

    dest = HERE / "sheets"
    dest.mkdir(exist_ok=True)
    manifest = {}
    with TemporaryDirectory() as tmp:
        for name, template, ramps, edits in RECIPES:
            spec = json.loads((source / "examples" / (template + ".json")).read_text())
            spec["name"] = name
            for key, colors in ramps.items():
                spec["ramps"][key] = {"colors": colors}
            for layer in spec["layers"]:
                layer.update(edits.get(layer["id"], {}))
            path = Path(tmp) / (name + ".json")
            path.write_text(json.dumps(spec))
            effect, faults = load_effect(path)
            if faults:
                raise ValueError(f"{name}: {faults}")
            info = render_effect(effect, tmp)
            _, frames = load_frames(effect, Path(tmp))
            width, height = info["canvas"]
            cols = min(len(frames), 8)
            rows = (len(frames) + cols - 1) // cols
            sheet = Image.new("RGBA", (cols * width, rows * height))
            best_coverage = 0
            poster = None
            for i, frame in enumerate(frames):
                image = Image.fromarray(frame["image"])
                sheet.paste(image, (i % cols * width, i // cols * height))
                alpha = image.getchannel("A")
                coverage = sum(alpha.histogram()[1:])
                if coverage > best_coverage:
                    best_coverage = coverage
                    x, y, right, bottom = alpha.getbbox()
                    poster = [i, x, y, right - x, bottom - y]
            if poster is None:
                raise ValueError(f"{name} is empty")
            sheet.save(dest / (name + ".png"), optimize=True)
            manifest[name] = dict(width=width, height=height, anchor=info["anchor"], poster=poster,
                                  frameMs=[f["duration_ms"] for f in info["frames"]])
            print(f"{name}: {len(frames)} frames, {width} x {height}", flush=True)
    entries = [f'  "{name}": {json.dumps(data)}' for name, data in manifest.items()]
    (dest / "manifest.json").write_text("{\n" + ",\n".join(entries) + "\n}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spritefx", type=Path)
    generate(parser.parse_args().spritefx)
