var width = 600;
var height = 600;
var sGridLength = 20;

// initialize SVG.js
if (SVG.supported) {
    var draw = SVG('drawing').size(width,height)
} else {
    alert('SVG not supported')
}

//initialize square grid
for (i = 0; i <= width; i+= sGridLength){
    var line = draw.line(i,0,i,height);
    line.stroke({ color: '#939393', width: 1, linecap: 'round' });
}

for (i = 0; i <= height; i+= sGridLength){
    var line = draw.line(0,i,width,i);
    line.stroke({ color: '#939393', width: 1, linecap: 'round' });
}

var vertexRadius = 5;
function roundToSquare(x, y, sLength) {
    var roundedX = Math.round(x/sLength)*sLength;
    var roundedY = Math.round(y/sLength)*sLength;
    return [roundedX,roundedY]
}

var x1 = 0;
var y1 = 0;
function getDownCoords(event) {
    var rCoords = roundToSquare(event.clientX-12,event.clientY-13,sGridLength);
    x1 = rCoords[0];
    y1 = rCoords[1];
    var rect = draw.circle(vertexRadius).fill('#1e1aff').move(x1-vertexRadius/2, y1-vertexRadius/2);

    console.log(x1);
    console.log(y1);
}



function drawLine(event) {
    var rCoords = roundToSquare(event.clientX-12,event.clientY-13,sGridLength);
    x2 = rCoords[0];
    y2 = rCoords[1];
    console.log(x2);
    console.log(y2);
    var line = draw.line(x1,y1,x2,y2);
    line.stroke({ color: '#f06', width: 1, linecap: 'round' });
    var rect = draw.circle(vertexRadius).fill('#1e1aff').move(x1-vertexRadius/2, y1-vertexRadius/2);
    var rect = draw.circle(vertexRadius).fill('#1e1aff').move(x2-vertexRadius/2, y2-vertexRadius/2);

}