"use strict";




/*
units: 
temperature: Kelvin
distance: meter
time: seconds
diffusion: m2/s


*/

function appendOutput(strToOutput) {
    document.getElementById("output").innerHTML = document.getElementById("output").innerHTML + strToOutput;
}

function clearOutput() {
    document.getElementById("output").innerHTML = "";
}





var matrix = ([1, 4, 9, 16, 25]);
var A = [[1,2,3],[2,5,6]];
var zgu = math.size(A);
console.log(math.size(matrix));
//appendOutput("Hello World! " + idk + " " + zgu);


function createEmptyArray(yLength){

    var newMatrix = [];
    for (var i = 0;i<yLength;i++) {
        newMatrix[i] = [];
    }

    return(newMatrix)
}


function diffusionStep(matrix,diffusionCoeff,deltaX,deltaY,deltaTime){

    var alpha = (diffusionCoeff* deltaTime)/(deltaX**2);
    var beta = (diffusionCoeff* deltaTime)/(deltaY**2);
    var xLength = math.size(matrix)[1];
    var yLength = math.size(matrix)[0];

    var newMatrix = createEmptyArray(yLength);

    for (let i = 0; i < xLength; i++){
        newMatrix[0][i] = 0;
        newMatrix[yLength-1][i] =0;
    }

    for (let j = 0; j< yLength; j++){
        newMatrix[j][0] =0;
        newMatrix[j][xLength -1] = 0;
    }

    for (let i = 1; i < xLength - 1; i++){
        for (let j = 1; j < yLength - 1; j++){
            newMatrix[j][i] = alpha*(matrix[j+1][i]+matrix[j-1][i]) + beta*(matrix[j][i+1]+matrix[j][i-1])+ (1-2*alpha-2*beta)*matrix[j][i];
        }
    }


    


    return(newMatrix);
}





var testArray = [[0,0,0,0],[0,200,0,0],[0,0,0,0],[0,0,0,0]];
console.log(math.size(testArray)[0])
console.log(math.size(testArray)[1])
console.log(diffusionStep(testArray,10**-15,1,1,1));

var bigTestArray = math.zeros([100,100]);

//appendOutput(bigTestArray);

bigTestArray[50][50] = 1473;

appendOutput(bigTestArray);



for (let i =0; i<5000;i++){
    
    bigTestArray = diffusionStep(bigTestArray,10**-11,0.0001,0.0001,0.001);
    console.log(bigTestArray);
}
