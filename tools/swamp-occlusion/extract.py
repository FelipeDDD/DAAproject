"""Rebuild the three experimental cutouts. Offline dependencies: Pillow and numpy."""
from pathlib import Path
import heapq
import json
import math

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
MAPS = ROOT / "public/assets/maps"
OUT = MAPS / "swamp-occlusion"
# ROI offset from the reference's top-left, ROI size, trusted interior and loose
# exterior boundary. Coordinates of both seed polygons are relative to the ROI.
SEEDS = {
    "brush": ((-92,-141), (220,205),
              [(40,133),(73,95),(92,63),(140,72),(153,59),(167,86),(190,99),(199,130),(155,155),(85,156)],
              [(7,143),(25,99),(45,89),(65,73),(79,34),(111,40),(123,54),(146,34),(165,41),(172,61),(198,66),(212,99),(217,130),(203,149),(174,162),(137,176),(76,171),(30,180)]),
    "pillar": ((-85,-145), (220,200),
               [(94,73),(108,64),(123,66),(127,74),(124,123),(142,136),(143,147),(117,161),(91,154),(76,143),(74,136),(97,124)],
               [(84,67),(98,56),(121,55),(136,69),(135,112),(149,115),(164,137),(158,155),(121,180),(89,176),(58,155),(56,139),(72,119),(87,112)]),
    "stump": ((-71,-90), (220,160),
              [(74,42),(84,33),(109,32),(122,44),(120,67),(132,88),(146,99),(124,94),(130,111),(109,103),(100,117),(91,103),(71,112),(83,86),(59,90),(73,72)],
              [(60,34),(78,23),(112,22),(132,34),(131,61),(145,78),(166,90),(166,102),(144,104),(158,123),(137,127),(113,117),(100,138),(88,117),(53,132),(54,115),(40,115),(59,93),(33,100),(31,86),(56,70)]),
}


def polygon(size, points):
    mask = Image.new("1", size)
    ImageDraw.Draw(mask).polygon(points, fill=1)
    return np.asarray(mask)


def segment(image, inside, envelope):
    # Competing connected seeds. Crossing a strong local RGB edge costs more.
    rgb = np.asarray(image, dtype=float)
    h, w = rgb.shape[:2]
    fg = polygon(image.size, inside)
    bg = ~polygon(image.size, envelope)
    labels = fg.copy()
    fixed = fg | bg
    cost = np.where(fixed, 0., np.inf)
    heap = []
    for y, x in zip(*np.nonzero(fixed)):
        if not fixed[max(y-1,0):y+2,max(x-1,0):x+2].all():
            heap.append((0., int(y), int(x)))
    heapq.heapify(heap)
    while heap:
        d, y, x = heapq.heappop(heap)
        if d != cost[y,x]:
            continue
        for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if not (0 <= ny < h and 0 <= nx < w) or fixed[ny,nx]:
                continue
            step = rgb[ny,nx] - rgb[y,x]
            new = d + 1 + math.sqrt(step @ step)**1.5
            if new < cost[ny,nx]:
                cost[ny,nx] = new
                labels[ny,nx] = labels[y,x]
                heapq.heappush(heap,(new,ny,nx))
    return Image.fromarray(labels.astype("uint8")*255)


def main():
    tiled = json.loads((MAPS/"swamp-v3-large.tmj").read_text(encoding="utf-8"))
    layers = {layer["name"]:layer for layer in tiled["layers"]}
    source = Image.open(MAPS/layers["Background"]["image"]).convert("RGB")
    OUT.mkdir(exist_ok=True)
    layout = {}
    sheet = Image.new("RGB",(660,690),"#393946")
    edges = Image.new("RGB",(660,220),"#393946")
    guides = layers.get("OcclusionReferences",{})
    references = [(r["name"],r,guides) for r in guides.get("objects",[])]
    for ref in layers["Collision"]["objects"]:
        props = {p["name"]:p["value"] for p in ref.get("properties",[])}
        if "occlusionMask" in props:
            references.append((props["occlusionMask"],ref,layers["Collision"]))
    if not any(name in SEEDS for name, _, _ in references):
        raise ValueError("Add an occlusion reference in Tiled before regenerating the cutouts.")
    for name, ref, layer in references:
        if name not in SEEDS:
            continue
        if name in layout:
            raise ValueError(f"Duplicate occlusion reference: {name}")
        col = list(SEEDS).index(name)
        (dx,dy),(w,h),inside,envelope = SEEDS[name]
        x = round(ref["x"]+layer.get("offsetx",0)+dx)
        y = round(ref["y"]+layer.get("offsety",0)+dy)
        roi = source.crop((x,y,x+w,y+h))
        alpha = segment(roi,inside,envelope)
        sheet.paste(roi,(col*220,0))
        sheet.paste(alpha,(col*220,230))
        sheet.paste(roi,(col*220,460),alpha)
        roi.putalpha(alpha)
        roi.save(OUT/(name+".png"))
        edge = roi.crop((60,35,170,145)).resize((220,220),Image.Resampling.NEAREST)
        edges.paste(edge,(col*220,0),edge)
        layout[name] = {"x":x,"y":y}
    (OUT/"placement.json").write_text(json.dumps(layout,indent=2)+"\n",encoding="utf-8")
    sheet.save(Path(__file__).with_name("comparison.png"))
    edges.save(Path(__file__).with_name("edges-2x.png"))


if __name__ == "__main__":
    main()
