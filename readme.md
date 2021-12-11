# dithering

i found a new cool dither algorithm on twitter

this is relevant to my recent efforts to crochet cool pixel patterns and stuff

## basic design

html page, with some knobs and switches and a canvas

for now, focusing on monochrome

steps to draw pattern:
- scale image to input resolution
- generate dithered bitmap
- map grid to canvas so pixels are sharp and clear
- draw grid using these boxes

like, a function:
```
func gridToCoords(width,height,output_width,output_height)
```

and it'll export, like, a list of corners
```
input: 3, 2, 600, 400
(a 3x2 graph mapped onto a 600x400 canvas)

output:
[
  // 6 pixels
  [],
  [],
]
```

## potential features

- switch between simple gradient and uploaded bitmap
- adjustable colors for better preview of 
- diagonal guidelines/arrows for aid in stitching C2C (corner-to-corner)
- maybe image export for bringing into stitchfiddle or something
