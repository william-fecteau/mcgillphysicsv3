'use strict';

/*
Global variables

*/

var deltaX;
var deltaY;
var deltaTime;
var alpha;
var beta;
var xLength;
var yLength;
var E = 157.5;
var gammaS = 0.3;
var al = 25.6 * 10 ** -6;

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

function diffusionStep(matrix) {
    //asserts eq validity
    if (alpha + beta > 1 / 2) {
        console.error('pepi');
    }

    var newMatrix = createEmptyArray(yLength);

    //evaluation function for points
    for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++) {
            //Hole/border detection
            if (matrix[j][i] >= 0) {
                //diffusion equation
                newMatrix[j][i] =
                    alpha * (math.max(matrix[j + 1][i], 0) + math.max(matrix[j - 1][i], 0)) +
                    beta * (math.max(matrix[j][i + 1], 0) + math.max(matrix[j][i - 1], 0)) +
                    (1 - 2 * alpha - 2 * beta) * math.max(matrix[j][i], 0);

                //fissure genesis
                var deltaTemp = math.abs(matrix[j][i] - newMatrix[j][i]);
                var seuilCritique = (math.sqrt((2 * E * gammaS) / math.PI) * 1) / (E * al);
                if (deltaTemp > seuilCritique) {
                    newMatrix[j][i] = -2;
                }
            } else newMatrix[j][i] = -1;
        }
    }

    return newMatrix;
}

function initMatrix(matrixSize, delta, diffusionCoeff) {
    //initialise diffusion eq data
    deltaX = delta;
    deltaY = delta;
    deltaTime = 0.95 * (deltaX ** 2 / (4 * diffusionCoeff));
    alpha = (diffusionCoeff * deltaTime) / deltaX ** 2;
    beta = (diffusionCoeff * deltaTime) / deltaY ** 2;
    xLength = matrixSize;
    yLength = matrixSize;

    //create empty matrix
    var bigTestArray = math.zeros([matrixSize, matrixSize]);

    //border generation
    for (let i = 0; i < matrixSize; i++) {
        bigTestArray[0][i] = -1;
        bigTestArray[matrixSize - 1][i] = -1;
    }

    for (let j = 0; j < matrixSize; j++) {
        bigTestArray[j][0] = -1;
        bigTestArray[j][matrixSize - 1] = -1;
    }

    return bigTestArray;
}

function compute(oldStep, heatSources) {
    for (let i = 0; i < heatSources.length; i++) {
        if (oldStep[heatSources[i].i][heatSources[i].j] === -1) continue;

        oldStep[heatSources[i].i][heatSources[i].j] += heatSources[i].heat;
    }

    return diffusionStep(oldStep);
}
