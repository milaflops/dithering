// for drawing grids on canvases and stuff!
// I made this to generate some dithered patterns for crochet
//
// mikayla 2021

// shoddy deterministic randomizer & regenerator
const {makeRandomizer, reRandomize} = (() => {
    const lookupSize = 10000;
    let lookupTable = [];

    const populateLookupTable = () => {
        lookupTable = [];
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

const ditherPrePass = (grid,{dither}) => {
    let rand = makeRandomizer(0.75);
    return grid.map((row,row_idx) => (
        row.map((element,col_idx) => (
            (
                dither.image *
                element
            ) + (
                dither.noise *
                rand()
            ) + (
                dither.maze * (
                    (row_idx % 2 == 0 ? 0 : 0.5) +
                    (col_idx % 2 == 0 ? 0 : 0.5)
                )
            ) + (
                dither.checkerboard * (
                    ( row_idx + col_idx ) % 2 == 0 ? 0 : 0.75
                )
            )
        ))
    ))
}

// convert from float to 1 or 0
const posturize = (grid,{base}) => {
    return grid.map(row => (
        row.map(element => (
            (base.posturize ? (element > 0.5 ? 1 : 0) : element)
        ))
    ))
}

const fullGenerate = params => {
    return posturize(ditherPrePass(makeGrid(params),params),params)
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
    // normalize all all "image" params so they total to 1
    // and all "dither" params so they total to 1
    let imageGenTotal = image.noise + image.gradient + image.solidWhite + image.solidBlack;
    let ditherTotal = dither.image + dither.noise + dither.maze;
    // prevent zero division
    if (imageGenTotal == 0) {
        imageGenTotal = 0.01
    }
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
            maze: dither.maze / ditherTotal,
            checkerboard: dither.checkerboard / ditherTotal
        }
    }
}

// always good to have throttling on canvas stuff, taken from internet
function throttle(func, wait) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
        previous = Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = Date.now();
        if (!previous) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("graphdisplayer");
    
    const parameters = {
        base: {
            width: 25,
            height: 25,
            levels: 2,
            posturize: true
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
            maze: 0.5,
            checkerboard: 0
        }
    }

    // attach to settings sliders
    document.getElementById("baseResolution").addEventListener("input", event => {
        parameters.base.height = event.target.value;
        parameters.base.width = event.target.value;
        document.getElementById("baseResolutionDisp").innerHTML = parameters.base.height;
        limitedRedraw()
    })

    // attach to image generation sliders
    document.getElementById("imageNoise").addEventListener("input", event => {
        parameters.image.noise = event.target.value / 100
        limitedRedraw()
    })
    document.getElementById("imageGradient").addEventListener("input", event => {
        parameters.image.gradient = event.target.value / 100
        limitedRedraw()
    })
    document.getElementById("imageSolidWhite").addEventListener("input", event => {
        parameters.image.solidWhite = event.target.value / 100
        limitedRedraw()
    })
    document.getElementById("imageSolidBlack").addEventListener("input", event => {
        parameters.image.solidBlack = event.target.value / 100
        limitedRedraw()
    })

    // attach to dithering sliders
    document.getElementById("ditherImage").addEventListener("input", event => {
        parameters.dither.image = event.target.value / 100
        limitedRedraw()
    })
    document.getElementById("ditherNoise").addEventListener("input", event => {
        parameters.dither.noise = event.target.value / 100
        limitedRedraw()
    })
    document.getElementById("ditherMaze").addEventListener("input", event => {
        parameters.dither.maze = event.target.value / 100
        limitedRedraw()
    })
    document.getElementById("ditherCheckerboard").addEventListener("input", event => {
        parameters.dither.checkerboard = event.target.value / 100
        limitedRedraw()
    })

    // attach to buttons
    document.getElementById("reRandomize").addEventListener("click", event => {
        reRandomize()
        limitedRedraw()
    })

    const redraw = () => {
        clearRect(canvas)
        let params = normalizeParams(parameters);
        let grid = fullGenerate(params);
        drawScaledImage(canvas, grid, params)
    }

    // limit redraws to 15 frames per second
    const limitedRedraw = throttle(redraw, 1000 / 15)

    redraw()
})
