"""Generate the Swamp V3 collision guide for GIMP. Requires Pillow."""

import json
from math import cos, radians, sin
from pathlib import Path

from PIL import Image, ImageDraw

TOOL_DIR = Path(__file__).resolve().parent
MAP_PATH = TOOL_DIR.parents[1] / "public/assets/maps/swamp-v3-large.tmj"
OUTPUT_PATH = TOOL_DIR / "collision-guide.png"
COLOR = (255, 0, 178, 255)


def outline_points(obj, offset_x, offset_y):
    if any(key in obj for key in ("gid", "text", "template")) or obj.get("point") or obj.get("ellipse"):
        return []

    if "polyline" in obj:
        local = [(p["x"], p["y"]) for p in obj["polyline"]]
    elif "polygon" in obj:
        local = [(p["x"], p["y"]) for p in obj["polygon"]]
        if len(local) >= 3:
            local.append(local[0])
    else:
        width, height = obj.get("width", 0), obj.get("height", 0)
        if width <= 0 or height <= 0:
            return []
        local = [(0, 0), (width, 0), (width, height), (0, height), (0, 0)]

    # Tiled rotates around the object's origin in its y-down coordinate system.
    angle = radians(obj.get("rotation", 0))
    c, s = cos(angle), sin(angle)
    origin_x, origin_y = obj["x"] + offset_x, obj["y"] + offset_y
    return [(round(origin_x + x * c - y * s), round(origin_y + x * s + y * c)) for x, y in local]


def main():
    tiled = json.loads(MAP_PATH.read_text(encoding="utf-8-sig"))
    collision = next(layer for layer in tiled["layers"] if layer["name"] == "Collision" and layer["type"] == "objectgroup")
    background = next(layer for layer in tiled["layers"] if layer["name"] == "Background" and layer["type"] == "imagelayer")
    with Image.open(MAP_PATH.parent / background["image"]) as source:
        guide = Image.new("RGBA", source.size)

    offset_x = collision.get("offsetx", 0) - background.get("offsetx", 0) - background.get("x", 0)
    offset_y = collision.get("offsety", 0) - background.get("offsety", 0) - background.get("y", 0)
    draw = ImageDraw.Draw(guide)
    count = 0
    for obj in collision["objects"]:
        points = outline_points(obj, offset_x, offset_y)
        if len(points) >= 2:
            draw.line(points, fill=COLOR, width=2)
            count += 1
    guide.save(OUTPUT_PATH)
    print(f"{OUTPUT_PATH} ({guide.width} x {guide.height}, {count} outlines)")


if __name__ == "__main__":
    main()
