# dithering

toying around with different dithering techniques!

check it out here: https://simulacroix.github.io/dithering/

i found a cool dither algorithm on twitter: https://twitter.com/lorenschmidt/status/1468671174821486594?s=20

this is relevant to my recent efforts to crochet cool pixel patterns and stuff

so I wanted to make an interactive pattern maker

## basic design

html page, with some knobs and switches and a canvas

for now, focusing on monochrome

steps to draw pattern:
- scale image to input resolution
- generate dithered bitmap
- map grid to canvas so pixels are sharp and clear
- draw grid using these boxes

### 1. generate input images based on params & blend
    - random grayscale pixels (bright values from 0-1)
    - a diagonal gradient for fun
    - a solid color pass, maybe

### 1b post-processing
    - currently no middle step here, might add later

### 2. dither input image based on params
resultant pixel is posturized (rounded up or down) after blending with other patterns based on params:
- random noise
- maze

## potential features

- switch between simple gradient and uploaded bitmap
- adjustable colors for better preview of 
- diagonal guidelines/arrows for aid in stitching C2C (corner-to-corner)
- maybe image export for bringing into stitchfiddle or something
