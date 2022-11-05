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

function diffusionStep(matrix, diffusionCoeff, deltaX) {
    var deltaY = deltaX;
    var deltaTime = 0.95 * (deltaX ** 2 / (4 * diffusionCoeff));
    var alpha = (diffusionCoeff * deltaTime) / deltaX ** 2;
    var beta = (diffusionCoeff * deltaTime) / deltaY ** 2;
    var xLength = math.size(matrix)[1];
    var yLength = math.size(matrix)[0];

    if (alpha + beta > 1 / 2) {
        console.error('pepi');
    }

    var newMatrix = createEmptyArray(yLength);

    for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++) {
            if (matrix[j][i] != -1) {
                newMatrix[j][i] =
                    alpha * (math.max(matrix[j + 1][i], 0) + math.max(matrix[j - 1][i], 0)) +
                    beta * (math.max(matrix[j][i + 1], 0) + math.max(matrix[j][i - 1], 0)) +
                    (1 - 2 * alpha - 2 * beta) * math.max(matrix[j][i], 0);
            } else newMatrix[j][i] = -1;
        }
    }

    return newMatrix;
}

function initMatrix() {
    var length = 100;
    var bigTestArray = math.zeros([length, length]);
    bigTestArray[50][50] = 1473;
    bigTestArray[53][53] = 1473;
    bigTestArray[52][51] = 50073;
    bigTestArray[5][5] = 50073;
    bigTestArray[7][7] = -1;
    bigTestArray[6][6] = -1;
    bigTestArray[8][9] = -1;

    for (let i = 0; i < length; i++) {
        bigTestArray[0][i] = -1;
        bigTestArray[length - 1][i] = -1;
    }

    for (let j = 0; j < length; j++) {
        bigTestArray[j][0] = -1;
        bigTestArray[j][length - 1] = -1;
    }

    return bigTestArray;
}

function compute(oldStep) {
    return diffusionStep(oldStep, 165 * 10 ** -6, 0.0001);
}
