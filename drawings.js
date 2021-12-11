// for drawing grids on canvases and stuff

// made this to make some dithered patterns for crochet

const makeRandomGrid = (width,height) => {
    let grid = [];
    for (let i=0; i<height; i++) {
        let row = [];
        for (let j=0; j<width; j++) {
            row.push(Math.floor(Math.random()*255))
        }
        grid.push(row);
    }
    return grid;
}

const makeGradientGrid = (width,height) => {
    // top left will be 0, bottom right will be 255
    let comparator = (width - 1) + (height - 1);
    let grid = [];
    for (let i=0; i<height; i++) {
        let row = [];
        for (let j=0; j<width; j++) {
            // row.push(Math.floor(Math.random()*255))
            row.push(
                (i + j) / comparator
            );
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

document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("graphdisplayer");
    // draw a fucking gradient in a 12x12 grid
    // let grid = basicDither(makeGradientGrid(75,100));
    
    const parameters = {
        ditherWeight: 0.5
    }
    
    const rangeSlider = document.getElementById("weightRange")
    rangeSlider.addEventListener("input", event => {
        parameters.ditherWeight = event.target.value / 100
        redraw()
    })
    
    let grid = weightedDither(makeGradientGrid(25,25), parameters.ditherWeight);
    drawScaledImage(canvas, grid)

    const redraw = () => {
        clearRect(canvas)
        let grid = weightedDither(makeGradientGrid(25,25), parameters.ditherWeight);
        drawScaledImage(canvas, grid)
    }
})
