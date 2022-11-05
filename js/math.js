"use strict";

function output(strToOutput) {
    document.getElementById("output").innerHTML = strToOutput;
}

function computeSomethingInteresting() {
    return math.round(math.e, 3);
}


var idk = computeSomethingInteresting();
var matrix = math.matrix([1, 4, 9, 16, 25]);

output("Hello World! " + idk + " " + matrix);
