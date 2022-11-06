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

var E, gammaS, al, diffusionCoefficent;

var path = [];
var unusedWeaknesses = [];
var resolved = [];

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
                var deltaTemp = math.abs(math.max(matrix[j][i], 0) - math.max(newMatrix[j][i], 0));
                var seuilCritique = (math.sqrt((2 * E * gammaS) / math.PI) * 1) / (E * al);

                if (deltaTemp > seuilCritique) {
                    newMatrix[j][i] = -1;
                    matrix[j][i] = -1;
                    unusedWeaknesses.push([j, i]);

                    path = [];
                    pathfinding(matrix, [j, i]);
                    while (path.length > 1) {
                        fissure(matrix);
                    }
                }
            } else if (matrix[j][i] === -1) {
                newMatrix[j][i] = -1;
            } else if (matrix[j][i] === -2) {
                newMatrix[j][i] = -2;
            } else if (matrix[j][i] === -3) {
                newMatrix[j][i] = -3;
            }
        }
    }

    return newMatrix;
}

function initMatrix(matrixSize, delta) {
    //initialise diffusion eq data
    deltaX = delta;
    deltaY = delta;
    deltaTime = 0.95 * (deltaX ** 2 / (4 * diffusionCoefficent));
    alpha = (diffusionCoefficent * deltaTime) / deltaX ** 2;
    beta = (diffusionCoefficent * deltaTime) / deltaY ** 2;
    xLength = matrixSize;
    yLength = matrixSize;

    //create empty matrix
    var bigTestArray = [];
    // la forme se calcule avant le play donc prend amogus tt le temps par default
    forme = Number(forme);
    if (forme === 1) {
        bigTestArray = getAmogus();
    } else if (forme === 2) {
        bigTestArray = getDonut();
    } else if (forme === 3) {
        bigTestArray = getH();
    } else if (forme === 4) {
        bigTestArray = getMonke();
    } else if (forme === 5) {
        bigTestArray = getTrollface();
    } else {
        bigTestArray = math.zeros([matrixSize, matrixSize]);
    }

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
    resolved.push(startCoords);
    let startPoint = new THREE.Vector2(startCoords[0], startCoords[1]);
    let matrixSize = math.size(matrix);
    let closest = [50000000, 0, 0];
    // console.log('a', closest, startPoint);
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
                    for (let k = 0; k < resolved.length; k++) {
                        if (resolved[k][0] === i && resolved[k][1] === j) {
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
    // console.log('closest', closest);
    path.push(startCoords);
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
        // console.log(unusedWeaknesses, path);
    }
    return;
}

function fissure(matrix) {
    // console.log('fissure' + path);
    let px1 = path[0][0];
    let py1 = path[0][1];
    let px2 = path[1][0];
    let py2 = path[1][1];

    let dx = px2 - px1;
    let dy = py2 - py1;
    let v = new THREE.Vector2(dx, dy);

    let vU = v.normalize();

    px1 = Math.round(px1 + vU.x);
    py1 = Math.round(py1 + vU.y);

    matrix[px1][py1] = -3;
    if (px1 === px2 && py1 === py2) {
        path.splice(0, 1);
    } else {
        path[0][0] = px1;
        path[0][1] = py1;
    }
}

function compute(oldStep, heatSources) {
    for (let i = 0; i < heatSources.length; i++) {
        if (oldStep[heatSources[i].i][heatSources[i].j] === -1) continue;

        oldStep[heatSources[i].i][heatSources[i].j] += heatSources[i].heat;
    }
    return diffusionStep(oldStep);
}
