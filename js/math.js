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

var path = [];
var unusedWeaknesses = [];

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

function pathfinding(matrix, startCoords) {
    let startPoint = new THREE.Vector2(startCoords[0], startCoords[1]);
    let matrixSize = math.size(matrix);
    let closest;
    closest.dist = 0;
    for (i = 0; i < matrixSize[0]; i++) {
        for (j = 0; j < matrixSize[1]; j++) {
            if (matrix[i][j] === -1) {
                let currentPoint = new THREE.Vector2(i, j);
                let currentDist = currentPoint.distanceTo(startPoint);
                //closest non-used point
                if (currentDist < closest.dist) {
                    for (k = 0; k < path.length; k++) {
                        if (path[k][0] === i && path[k][1] === j) {
                            closest.dist = currentDist;
                            closest.i = i;
                            closest.j = j;
                            break;
                        }
                    }
                }
            }
        }
    }
    path.add(startCoords);
    for (i = 0; i < unusedWeaknesses.length; i++) {
        if (
            unusedWeaknesses[i][0] === startCoords[0] &&
            unusedWeaknesses[i][1] === startCoords[1]
        ) {
            unusedWeaknesses.splice(i, 1);
            break;
        }
    }
    for (i = 0; i < unusedWeaknesses.length; i++) {
        if (unusedWeaknesses[i][0] === closest.i && unusedWeaknesses[i][1] === closest.j) {
            pathfinding(matrix, closest);
            break;
        }
    }
    path.add(closest);
    return;
}

function compute(oldStep, heatSources) {
    for (let i = 0; i < heatSources.length; i++) {
        if (oldStep[heatSources[i].i][heatSources[i].j] === -1) continue;

        oldStep[heatSources[i].i][heatSources[i].j] += heatSources[i].heat;
    }

    return diffusionStep(oldStep);
}
