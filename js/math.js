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
var gammaS = 0.3 * 10 ** 6;
var al = 25.6 * 10 ** -6;

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

                //fissure genesis
                var deltaTemp = math.abs(matrix[j][i] - newMatrix[j][i]);
                var seuilCritique = (math.sqrt((2 * E * gammaS) / math.PI) * 1) / (E * al);
                if (deltaTemp > seuilCritique) {
                    newMatrix[j][i] = -1;
                    unusedWeaknesses.push([j, i]);
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
    // var bigTestArray = getAmogus();
    // var bigTestArray = getDonut();
    var bigTestArray = getH();
    // var bigTestArray = getMonke();
    // var bigTestArray = getTrollface();

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
    path.push(startCoords);
    let startPoint = new THREE.Vector2(startCoords[0], startCoords[1]);
    let matrixSize = math.size(matrix);
    let closest = [50000000, 0, 0];
    console.log('a', closest, startPoint);
    //finding closest
    for (let i = 0; i < matrixSize[0]; i++) {
        for (let j = 0; j < matrixSize[1]; j++) {
            if (matrix[i][j] === -1) {
                let currentPoint = new THREE.Vector2(i, j);
                let currentDist = currentPoint.distanceTo(startPoint);
                //console.log('b', currentPoint, startPoint);
                //closest non-used point
                let found1 = false;
                if (currentDist < closest[0]) {
                    for (let k = 0; k < path.length; k++) {
                        if (path[k][0] === i && path[k][1] === j) {
                            found1 = true;
                            break;
                        }
                    }
                    if (!found1) {
                        closest[0] = currentDist;
                        closest[1] = i;
                        closest[2] = j;
                    }
                }
            }
        }
    }
    console.log('closest', closest);

    for (let i = 0; i < unusedWeaknesses.length; i++) {
        if (
            unusedWeaknesses[i][0] === startCoords[0] &&
            unusedWeaknesses[i][1] === startCoords[1]
        ) {
            unusedWeaknesses.splice(i, 1);
            break;
        }
    }
    let found = false;
    for (let i = 0; i < unusedWeaknesses.length; i++) {
        if (unusedWeaknesses[i][0] === closest[1] && unusedWeaknesses[i][1] === closest[2]) {
            pathfinding(matrix, [closest[1], closest[2]]);
            found = true;
            break;
        }
    }
    if (!found) {
        path.push([closest[1], closest[2]]);
        console.log(unusedWeaknesses, path);
    }
    return;
}

function compute(oldStep, heatSources) {
    for (let i = 0; i < heatSources.length; i++) {
        if (oldStep[heatSources[i].i][heatSources[i].j] === -1) continue;

        oldStep[heatSources[i].i][heatSources[i].j] += heatSources[i].heat;
    }
    return diffusionStep(oldStep);
}
