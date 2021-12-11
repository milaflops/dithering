# dithering

makes a cool pixel grid using dithering!

it's a browser page: https://simulacroix.github.io/dithering/

## why

i found a cool dither algorithm someone made on twitter: https://twitter.com/lorenschmidt/status/1468671174821486594?s=20

and I wanted to play with it

because i want to make another crochet pattern like this one: https://twitter.com/simulacroix/status/1460484148745805824 

## basic design

html page, with some knobs and switches, and a canvas

monochrome for now

steps to draw pattern:
1. generate a square base image using a few parameters
    - **Noise**: random pixel value from 0.0-1.0
    - **Gradient**: diagonal fade from 0.0 in the top left to 1.0 in the bottom right
    - **Solid White**: 1.0
    - **Solid Black**: 0.0

    these are blended (averaged linearly) based on weights (the image sliders)
2. dither pre-pass
    - **Noise**: more random pixel values from 0.0-1.0
    - **Maze**: a plaid pattern based on pixel parity
    - **Checkerboard**: `(x + y).odd?` basically

    these are blended with the base image, also based on weights
3. posturize
    round the values up or down to make a monochrome bitmap
4. draw the image
    fit the grid onto the static canvas and put down a bunch of rectangles

## potential features

- switch between simple gradient and uploaded bitmap
- adjustable colors for better preview of crochet pattern
- diagonal guidelines/arrows for aid in stitching C2C (corner-to-corner) or other
- maybe image export for bringing into stitchfiddle or something
