document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("graphdisplayer");
    const contexte = canvas.getContext("2d");

    // ok lets start with ... 12x12!

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
                row.push(Math.floor(
                    ((i + j) / comparator) * 255
                ));
            }
            grid.push(row);
        }
        return grid;
    }

    const basicDither = (grid) => (
        grid.map(row => (
            row.map(element => {
                let test = Math.random() * 255
                if (test > element) {
                    return 255
                } else {
                    return 0
                }
            })
        ))
    )

    // draw a fucking gradient in a 12x12 grid
    let grid = basicDither(makeGradientGrid(75,100));

    const scalar = 8

    grid.forEach((row,row_idx) => {
        row.forEach((cell,col_idx) => {
            contexte.fillStyle = `rgb(${cell},${cell},${cell})`
            contexte.fillRect(
                col_idx * scalar,
                row_idx * scalar,
                scalar,
                scalar
            )
        })
    })
})
