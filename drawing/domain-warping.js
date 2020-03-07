function main() {
    let canvas = document.getElementById("drawing-surface");
    let ctx = canvas.getContext("2d");

    let squareSizes = 1;
    let scaleAmount = 5;

    let xCord = 0;
    let yCord = 0;
    for (let y = 0; y < window.innerHeight / squareSizes; y++) {
        for (let x = 0; x < window.innerWidth / squareSizes; x++) {
            noise = perlin.get(xCord / scaleAmount, yCord / scaleAmount);

            ctx.fillStyle = `rgb(
                ${Math.floor(((noise + 1) / 2) * 255)},
                ${Math.floor(((noise + 1) / 2) * 255)},
                ${Math.floor(((noise + 1) / 2) * 255)}
                )`;

            ctx.fillRect(xCord * squareSizes, yCord * squareSizes, squareSizes, squareSizes);
            xCord++;
        }
        yCord++;
        xCord = 0;
    }

    // create a grid and color it in


}

window.onload = () => {
    main();
}
