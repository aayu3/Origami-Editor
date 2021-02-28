var width = 450;
var height = 450;
var radius = height/2 - 5;
var angleApproxVar = 5;

// initialize SVG.js
var SVG = d3.select("body").append('svg').attr('width',width).attr('height',height);
var mountainGroup = SVG.append('g').attr('stroke','#0a07fe').attr('stroke-width',3);
var valleyGroup = SVG.append('g').attr('stroke','#f9030f').attr('stroke-width',3);
var flatFoldable = true;

var Inputs = d3.select("body").append('div').attr('id','Input');
var checkButton = Inputs.append('button').attr('type','button').attr('onclick','checkFoldability()').text("Check Flat Foldability");
var clearButton = Inputs.append('button').attr('type','button').attr('onclick','clearEdges()').text("Clear");
var strokeContainer = Inputs.append('div').attr('id','stroke-container');
var strokeSlider = strokeContainer.append('input').attr('id','stroke-slider').attr('type','range').attr('min','1').attr('max',
    '30').attr('value','3').attr('class','slider');
var strokeValueDisplay = strokeContainer.append('div').attr('id','strVD').text("Stroke: 3");

var angleDivContainer = Inputs.append('div').attr('id','stroke-container');
var angleDivSlider = angleDivContainer.append('input').attr('id','angle-div-slider').attr('type','range').attr('min','1').attr('max',
    '360').attr('value','5').attr('class','slider');
var angleDivDisplay = angleDivContainer.append('div').attr('id','aDD').text("Angle Approximation Value: 5");

var Display = d3.select("body").append('div').attr('id','Display');
var TrueFalse = Display.append('div').attr('id','TrueFalse').text('Flat Foldable: True');
var PreviewAngle = Display.append('div').attr('id','PreviewAngle').text('Angle: NaN');
var EvenAngles = Display.append('div').attr('id','EvenAngles').text('Even Angle Sum: 180');
var OddAngles = Display.append('div').attr('id','OddAngles').text('Odd Angle Sum: 180');
var Degree = Display.append('div').attr('id','Degree').text('Degree: 0');

var selected = false;
var Vertex = SVG.append('circle').attr('cx',height/2).attr("cy",height/2).attr('r',radius).attr('stroke','#111111').attr("fill-opacity",'0');
var centerV = SVG.append('circle').attr('cx',height/2).attr("cy",height/2).attr('r',3).attr('fill','#111111');
var changingCoords = false;
var changingLine;
var edges = [];


stroke_slider = document.getElementById("stroke-slider");
stroke_slider.oninput = function(){
    stroke = this.value;
    strokeValueDisplay.text('Stroke: '+stroke);
    mountainGroup.attr('stroke-width',stroke);
    valleyGroup.attr('stroke-width',stroke);
    render(edges)
};

angle_slider = document.getElementById("angle-div-slider");
angle_slider.oninput = function(){
    angleApproxVar = this.value;
    angleDivDisplay.text('Angle Approximation Value: '+ angleApproxVar)
    clearEdges()
}


function clearEdges(){
    edges = [];
    Degree.text("Degree: " + edges.length);
    mountainGroup.selectAll("*").remove();
    valleyGroup.selectAll("*").remove();

}
function radians_to_degrees(radians)
{
    var pi = Math.PI;
    return radians * (180/pi);
}
function degrees_to_radians(degrees){
    var pi = Math.PI;
    return degrees * (pi/180);
}

function checkFoldability(){
    sums = sumPairs();
    Degree.text("Degree: " + edges.length);
    if (sums[0] == sums[1] && checkBLB()){
        TrueFalse.text("Flat Foldable: True");
        EvenAngles.text('Even Angle Sum: '+sums[0]);
        OddAngles.text('Odd Angle Sum: '+sums[1]);
    }
    else{
        TrueFalse.text("Flat Foldable: False");
        EvenAngles.text('Even Angle Sum: '+sums[0]);
        OddAngles.text('Odd Angle Sum: '+sums[1]);
    }
}
class Line {
    constructor(xcoord,ycoord,type){
        this.x = xcoord-(height/2);
        this.y = (height/2)-ycoord;
        this.originalSVGX = xcoord;
        this.originalSVGY = ycoord;
        this.newSVGX;
        this.newSVGY;
        this.angle;
        this.length;
        this.type = type;
        this.name = 'x=' + this.x + "_y=" + this.y;
        this.rendered = false;
        this.calcLength();
        this.approxAngle();
        this.newSVGCoords();

    }
    changeCoord(nX,nY){
        this.x = nX;
        this.y = nY;
    }
    newSVGCoords(){
        this.newSVGX = radius*Math.cos(degrees_to_radians(this.angle))+(height/2);
        this.newSVGY = (height/2)-radius*Math.sin(degrees_to_radians(this.angle));
    }

    approxAngle(){
        var radval = Math.atan2(this.y,this.x);
        if (radval < 0){
            radval += 2*Math.PI;
        }
        var nearestWhole = Math.floor(radians_to_degrees(radval)+.5);
        this.angle = (angleApproxVar*Math.floor((nearestWhole/angleApproxVar)+.5))%360;
        return (angleApproxVar*Math.floor((nearestWhole/angleApproxVar)+.5))%360
    }
    calcLength(){
        this.length = Math.floor(Math.sqrt(this.x*this.x + this.y*this.y));
        return Math.floor(Math.sqrt(this.x*this.x + this.y*this.y))
    }
    calculateAngle(otherLine){
        return Math.abs(this.angle - otherLine.angle)
    }

    changeType(type){
        this.type = type
    }

}




function checkBLB(){
    if (edges.length >= 3){
        edges.sort(function(a, b){return a.angle-b.angle});
        for (var i = 0; i < edges.length; i++) {
            little = edges[i].calculateAngle(edges[(i+1)%edges.length]);
            big1 = edges[(i+1)%edges.length].calculateAngle((i+2)%edges.length);
            big2 = edges[(edges.length+i-1)%edges.length].calculateAngle(edges[i]);
            if (little <= big1 && little <= big2){
                if (edges[i].type == edges[(i+1)%edges.length].type){
                    return false
                }
            }
        }
    }
    return true
}

function sumPairs(){
    var evenSum = 0;
    var oddSum = 0;
    edges.sort(function(a, b){return a.angle-b.angle});
    console.log(edges);
    for (var i = 0; i < edges.length; i++) {
            if (i%2 == 0){
                evenSum += (edges[(i+1)%edges.length].angle-edges[i].angle+360)%360;
            }
            else {
                oddSum += (edges[(i+1)%edges.length].angle-edges[i].angle+360)%360;
            }
        }

    return [evenSum,oddSum];
}

function edgeExists(line) {
    angle = line.angle;
    for (i = 0; i < edges.length; i += 1) {
        if (angle == edges[i].angle) {
            return true;
        }
    }
    return false;
}

function render(edges){
    mountainGroup.selectAll("*").remove();
    valleyGroup.selectAll("*").remove();
    for (i = 0; i < edges.length; i+= 1){
        if (edges[i].type == "mountain"){
            mountainGroup.append("line").attr("x1",height/2).attr("y1",height/2).attr("x2",edges[i].newSVGX).attr("y2",edges[i].newSVGY);
        }
        else{
            valleyGroup.append("line").attr("x1",height/2).attr("y1",height/2).attr("x2",edges[i].newSVGX).attr("y2",edges[i].newSVGY);
        }
    }
}
SVG.on("click",addEdge).on('contextmenu',switchAssignment);


function switchAssignment(){
    var Coords = d3.mouse(this);
    d3.event.preventDefault();
    var line = new Line(Coords[0],Coords[1],'mountain');
    if (edgeExists(line)){
        PreviewAngle.text("Angle: " + line.angle);
        for (i = 0; i < edges.length; i += 1) {
            if (angle == edges[i].angle) {
                if (edges[i].type == 'mountain'){
                    edges[i].changeType('valley')
                }
                else{
                    edges[i].changeType('mountain')
                }
                render(edges)
                break

            }
        }
    }
}

function addEdge() {

    var Coords = d3.mouse(this);
    var line = new Line(Coords[0],Coords[1],'mountain');
    var eExists = false;
    if (edgeExists(line)){
        eExists = true;
        if (changingCoords){
            changingLine = line;
            changingCoords = true;
        }
        else{
            changingCoords = false;
        }
    }
    if (changingCoords){
        for (i = 0; i < edges.length; i+= 1){
            if (changingLine.angle == edges[i].angle){
                edges[i] = line;
                break
            }
        }
        render(edges);
        changingCoords = false;
    }
    else {
        if (eExists){
            return
        }
        else{
            edges.push(line);
            changingCoords = false;
            render(edges);
            PreviewAngle.text("Angle: "+line.angle)
        }


    }
    Degree.text("Degree: " + edges.length);
}
