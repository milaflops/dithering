// for drawing grids on canvases and stuff

// made this to make some dithered patterns for crochet

// shoddy deterministic randomizer
const {makeRandomizer, reRandomize} = (() => {
    const lookupSize = 10000;
    let lookupTable = [];

    const populateLookupTable = () => {
        lookupTable = [];
        console.info("populating lookup table")
        for(let i = 0; i < lookupSize; i++) {
            lookupTable.push(Math.random())
        }
    }

    const makeRandomizer = seed => {
        let index = Math.round(seed * lookupSize);
        return () => {
            index = (index + 1) % lookupSize;
            return lookupTable[index];
        }
    }

    populateLookupTable();

    return {
        makeRandomizer,
        reRandomize: populateLookupTable
    }
})();

const makeGrid = ({base, image}) => {
    // get base parameters
    let { width, height } = base;
    // get image parameters
    let { noise, gradient, solidWhite, solidBlack } = image;
    // set comparator for shading the gradient
    let comparator = (width - 1) + (height - 1);
    let rand = makeRandomizer(0.25);
    let grid = [];
    for (let i=0; i<height; i++) {
        let row = [];
        for (let j=0; j<width; j++) {
            row.push((
                rand() * noise
            ) + (
                ((i + j) / comparator) * gradient
            ) + (
                0 * solidBlack
            ) + (
                1 * solidWhite
            ));
        }
        grid.push(row);
    }
    return grid;
}

const dither = (grid,{dither}) => {
    // let { image, noise, maze } = params.dither;
    let rand = makeRandomizer(0.75);
    return grid.map((row,row_idx) => (
        row.map((element,col_idx) => (
            (element * dither.image) +
            (rand() * dither.noise) +
            ((
                (row_idx % 2 == 0 ? 0 : 0.5) +
                (col_idx % 2 == 0 ? 0 : 0.5)
            ) * dither.maze) > 0.5 ? 1 : 0
        ))
    ))
}

const drawScaledImage = (canvas,grid,params) => {
    const ctx = canvas.getContext("2d");
    const {contrast, borderWidth} = params.display;

    // TODO: come up with a better way to fit the grid into the canvas
    // (maybe support margins for stitch number markings, or something? )

    // shoddily fit the pixel art into the canvas dimensions
    const gridHeight = grid.length
    const gridWidth = grid[0].length

    const scalar = Math.min(canvas.height, canvas.width) / Math.max(gridHeight, gridWidth)

    grid.forEach((row,row_idx) => {
        row.forEach((cell,col_idx) => {
            // contrast of 0 == goes from 0.5-0.5
            // contrast of 0.9 == goes from 0.05-0.95
            // contrast of 1 == goes from 0-1
            let shade = 255 * (
                (0.5 * (1 - contrast)) +
                (cell * contrast)
            );
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`
            ctx.fillRect(
                (col_idx * scalar) + borderWidth,
                (row_idx * scalar) + borderWidth,
                scalar-borderWidth,
                scalar-borderWidth
            )
        })
    })
}

const clearRect = (canvas) => {
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height)
}

const normalizeParams = ({base, display, image, dither}) => {
    // basically makes all "image" params total to 1
    // and all "dither" params total to 1
    let imageGenTotal = image.noise + image.gradient + image.solidWhite + image.solidBlack;
    if (imageGenTotal == 0) {
        // prevent zero division
        imageGenTotal = 0.01
    }
    let ditherTotal = dither.image + dither.noise + dither.maze;
    if (ditherTotal == 0) {
        ditherTotal = 0.01
    }
    return {
        base,
        display,
        image: {
            noise: image.noise / imageGenTotal,
            gradient: image.gradient / imageGenTotal,
            solidWhite: image.solidWhite / imageGenTotal,
            solidBlack: image.solidBlack / imageGenTotal
        },
        dither: {
            image: dither.image / ditherTotal,
            noise: dither.noise / ditherTotal,
            maze: dither.maze / ditherTotal
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("graphdisplayer");
    
    const parameters = {
        base: {
            width: 25,
            height: 25
        },
        display: {
            contrast: 0.75,
            borderWidth: 0.5
        },
        image: {
            noise: 0.25,
            gradient: 0.75,
            solidWhite: 0,
            solidBlack: 0
        },
        dither: {
            image: 1,
            noise: 0.25,
            maze: 0.5
        }
    }

    // attach to image generation sliders
    document.getElementById("imageNoise").addEventListener("input", event => {
        parameters.image.noise = event.target.value / 100
        redraw()
    })
    document.getElementById("imageGradient").addEventListener("input", event => {
        parameters.image.gradient = event.target.value / 100
        redraw()
    })
    document.getElementById("imageSolidWhite").addEventListener("input", event => {
        parameters.image.solidWhite = event.target.value / 100
        redraw()
    })
    document.getElementById("imageSolidBlack").addEventListener("input", event => {
        parameters.image.solidBlack = event.target.value / 100
        redraw()
    })

    // attach to dithering sliders
    document.getElementById("ditherImage").addEventListener("input", event => {
        parameters.dither.image = event.target.value / 100
        redraw()
    })
    document.getElementById("ditherNoise").addEventListener("input", event => {
        parameters.dither.noise = event.target.value / 100
        redraw()
    })
    document.getElementById("ditherMaze").addEventListener("input", event => {
        parameters.dither.maze = event.target.value / 100
        redraw()
    })

    // attach to buttons
    document.getElementById("reRandomize").addEventListener("click", event => {
        reRandomize()
        redraw()
    })

    // handy function for getting the normalized parameters
    // const params = () => normalizeParams(parameters);

    const redraw = () => {
        clearRect(canvas)
        let params = normalizeParams(parameters);
        let grid = dither(makeGrid(params), params);
        drawScaledImage(canvas, grid, params)
    }

    redraw()
})
