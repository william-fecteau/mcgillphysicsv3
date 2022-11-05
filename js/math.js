"use strict";

function appendOutput(strToOutput) {
    document.getElementById("output").innerHTML = document.getElementById("output").innerHTML + strToOutput;
}

function clearOutput() {
    document.getElementById("output").innerHTML = "";
}

function computeSomethingInteresting() {
    return math.round(math.e, 3);
}


var idk = computeSomethingInteresting();
var matrix = math.matrix([1, 4, 9, 16, 25]);

appendOutput("Hello World! " + idk + " " + matrix);
