// for drawing grids on canvases and stuff

// made this to make some dithered patterns for crochet

// const makeRandomGrid = (width,height) => {
//     let grid = [];
//     for (let i=0; i<height; i++) {
//         let row = [];
//         for (let j=0; j<width; j++) {
//             row.push(Math.floor(Math.random()*255))
//         }
//         grid.push(row);
//     }
//     return grid;
// }

// const makeGradientGrid = (width,height) => {
//     // top left will be 0, bottom right will be 255
//     let comparator = (width - 1) + (height - 1);
//     let grid = [];
//     for (let i=0; i<height; i++) {
//         let row = [];
//         for (let j=0; j<width; j++) {
//             // row.push(Math.floor(Math.random()*255))
//             row.push(
//                 (i + j) / comparator
//             );
//         }
//         grid.push(row);
//     }
//     return grid;
// }

const makeGrid = ({base, image}) => {
    // get base parameters
    let { width, height } = base;
    // get image parameters
    let { noise, gradient, solidWhite, solidBlack } = image;
    // set comparator for shading the gradient
    let comparator = (width - 1) + (height - 1);
    let grid = [];
    for (let i=0; i<height; i++) {
        let row = [];
        for (let j=0; j<width; j++) {
            row.push((
                Math.random() * noise
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

const basicDither = (grid) => (
    grid.map(row => (
        row.map(element => {
            let test = Math.random()
            if (test > element) {
                return 1
            } else {
                return 0
            }
        })
    ))
)

const weightedDither = (grid,weight) => (
    grid.map(row => (
        row.map(element => {
            // let test = Math.random()
            let pixel = (element * (1 - weight)) + (Math.random() * weight)
            if (pixel > 0.5) {
                return 1
            } else {
                return 0
            }
        })
    ))
)

const dither = (grid,{dither}) => (
    // let { image, noise, maze } = params.dither;
    grid.map((row,row_idx) => (
        row.map((element,col_idx) => (
            (element * dither.image) +
            (Math.random() * dither.noise) +
            ((
                (row_idx % 2 == 0 ? 0 : 0.5) +
                (col_idx % 2 == 0 ? 0 : 0.5)
            ) * dither.maze) > 0.5 ? 1 : 0
        ))
    ))
)

const drawScaledImage = (canvas,grid) => {
    const ctx = canvas.getContext("2d");

    // TODO: come up with a better way to fit the grid into the canvas
    // (maybe support margins for stitch number markings, or something? )

    // get canvas min dimension to know how to scale
    const maxCanvasDimension = Math.min(canvas.height, canvas.width)

    const gridHeight = grid.length
    const gridWidth = grid[0].length

    const maxGridDimension = Math.max(gridHeight, gridWidth)

    const scalar = maxCanvasDimension / maxGridDimension

    grid.forEach((row,row_idx) => {
        row.forEach((cell,col_idx) => {
            let shade = cell * 255
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`
            ctx.fillRect(
                (col_idx * scalar) + 0.5,
                (row_idx * scalar) + 0.5,
                scalar-0.5,
                scalar-0.5
            )
        })
    })
}

const clearRect = (canvas,grid) => {
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height)
}

const normalizeParams = ({base, image, dither}) => {
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
    // draw a fucking gradient in a 12x12 grid
    // let grid = basicDither(makeGradientGrid(75,100));
    
    const parameters = {
        base: {
            width: 25,
            height: 25
        },
        image: {
            noise: 0,
            gradient: 1,
            solidWhite: 0,
            solidBlack: 0
        },
        dither: {
            image: 0.5,
            noise: 0.5,
            maze: 0
        }
    }

    const params = () => normalizeParams(parameters);

    document.getElementById("imageNoise").addEventListener("input", event => {
        parameters.image.noise = event.target.value / 100
        redraw()
    })
    document.getElementById("imageGradient").addEventListener("input", event => {
        parameters.image.gradient = event.target.value / 100
        redraw()
    })

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

    const redraw = () => {
        clearRect(canvas)
        let grid = dither(makeGrid(params()), params());
        // let grid = makeGrid(params());
        drawScaledImage(canvas, grid)
    }

    redraw()
})
