'use strict';

/*
units: 
temperature: Kelvin
distance: meter
time: seconds
diffusion: m2/s


*/

function createEmptyArray(yLength) {
    var newMatrix = [];
    for (var i = 0; i < yLength; i++) {
        newMatrix[i] = [];
    }

    return newMatrix;
}

function diffusionStep(matrix, diffusionCoeff, deltaX, deltaY, deltaTime) {
    var alpha = (diffusionCoeff * deltaTime) / deltaX ** 2;
    var beta = (diffusionCoeff * deltaTime) / deltaY ** 2;
    var xLength = math.size(matrix)[1];
    var yLength = math.size(matrix)[0];

    var newMatrix = createEmptyArray(yLength);

    for (let i = 0; i < xLength; i++) {
        newMatrix[0][i] = 0;
        newMatrix[yLength - 1][i] = 0;
    }

    for (let j = 0; j < yLength; j++) {
        newMatrix[j][0] = 0;
        newMatrix[j][xLength - 1] = 0;
    }

    for (let i = 1; i < xLength - 1; i++) {
        for (let j = 1; j < yLength - 1; j++) {
            newMatrix[j][i] =
                alpha * (matrix[j + 1][i] + matrix[j - 1][i]) +
                beta * (matrix[j][i + 1] + matrix[j][i - 1]) +
                (1 - 2 * alpha - 2 * beta) * matrix[j][i];
        }
    }

    return newMatrix;
}

function initMatrix() {
    var bigTestArray = math.zeros([100, 100]);
    bigTestArray[50][50] = 1473;

    return bigTestArray;
}

function compute(oldStep) {
    return diffusionStep(oldStep, 500 * 10 ** -10, 0.0001, 0.0001, 0.001);
}
