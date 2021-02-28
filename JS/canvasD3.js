var width = 600;
var height = 600;
var sGridLength = 20;

// initialize SVG.js
var SVG = d3.select("body").append('svg').attr('width',width).attr('height',height);
var gridGroup = SVG.append('g').attr('stroke','#939393');
var lineGroup = SVG.append('g').attr('stroke','#3bf5f9');
var vertexColor = document.getElementById("myColor");
var vertices =[];
var changingCoords = false;
var existingVertexEdge = 0;
var changingCoordsVertex=0;
var addingEdge = false;
var rootVertex = 0;
var previewGroup = SVG.append('g').attr('stroke','#ff0000');
var vertexGroup = SVG.append('g').attr('fill',vertexColor);


//initialize square grid
for (i = 0; i <= width; i+= sGridLength){
    gridGroup.append('line').attr("x1",i).attr("y1",0).attr("x2",i).attr("y2",height);
}

for (i = 0; i <= height; i+= sGridLength){
    gridGroup.append('line').attr("x1",0).attr("y1",i).attr("x2",width).attr("y2",i);

}

class Vertex {
    constructor(xcoord,ycoord,radius,neighbors,name){
        this.x = xcoord;
        this.y = ycoord;
        this.radius = radius;
        this.name = name;
        this.neighbors = neighbors;
        this.edges = [];
        this.rendered = false;
    }
    changeCoord(nX,nY){
        for (var i = 0; i < this.neighbors.length; i++) {
            const edge = new Edge(this,this.neighbors[i]);
            edge.delete(lineGroup);
        }
        this.x = nX;
        this.y = nY;
        vertexGroup.select("#"+this.name).remove();
        this.name = "v_"+String(this.x) + "_"+String(this.y);
    }
    render(group,edgeGroup){
        if (this.rendered){
            group.select("#"+this.name).remove();
            group.append('circle').attr("cx",this.x).attr("cy",this.y).attr("r",this.radius).attr('fill','#000000').attr("stroke",'#000000').attr("id",this.name);
            for (var i = 0; i < this.neighbors.length; i++) {
                const edge = new Edge(this,this.neighbors[i]);
                edge.render(edgeGroup);
            }
        }
        else{
            group.append('circle').attr("cx",this.x).attr("cy",this.y).attr("r",this.radius).attr('fill','#000000').attr("stroke",'#000000').attr("id",this.name);
            for (var i = 0; i < this.neighbors.length; i++) {
                const edge = new Edge(this,this.neighbors[i]);
                edge.render(edgeGroup);
            }
            this.rendered= true;
        }
    }
    addNeighbor(vertex){
        this.neighbors.push(vertex);
        this.render(vertexGroup,lineGroup);
    }

}

class Edge {
    constructor(vertex1,vertex2){
        this.v1 = vertex1;
        this.v2 = vertex2;
        this.name1 = "e_"+ String(vertex1.name) + "_"+ String(vertex2.name);
        this.name2 = "e_" + String(vertex2.name) + "_"+ String(vertex1.name);


    }
    delete(group){
        group.select("#"+this.name1).remove();
        group.select("#"+this.name2).remove();
    }
    render(group){
        group.select("#"+this.name1).remove();
        group.select("#"+this.name2).remove();
        group.append('line').attr("x1",this.v1.x).attr("x2",this.v2.x).attr("y1",this.v1.y).attr("y2",this.v2.y).attr("id",this.name1);
    }
}

function vertexExists(vertex) {
    var status = false;
    for (i=0;i<vertices.length;i++){
        console.log('checking='+vertices[i].name);
        console.log('actuall='+("v_" + String(vertex[0])+"_"+String(vertex[1])));
        if (("v_" + String(vertex[0])+"_"+String(vertex[1])) == vertices[i].name){
            console.log()
            status = true;
            console.log("vertex=" +vertex);
            console.log("existing="+vertices[i]);
            if (addingEdge){
                existingVertexEdge = vertices[i];
            }
            if (changingCoords){
                changingCoordsVertex = vertices[i];
            }
            break;
        }
    }
    return status
}

var vertexRadius = 3;
function roundToSquare(x, y, sLength) {
    var roundedX = Math.round(x/sLength)*sLength;
    var roundedY = Math.round(y/sLength)*sLength;
    return [roundedX,roundedY]
}
SVG.on("click",addEdge).on("contextmenu",moveVertex).on("mousemove",preview);
var x1 = 0;
var y1 = 0;
var mDown = false;

function moveVertex(){
    var Coords = d3.mouse(this);
    var rCoords = roundToSquare(Coords[0],Coords[1],sGridLength);
    x = rCoords[0];
    y = rCoords[1];
    addingEdge = false;
    d3.event.preventDefault();
    if (changingCoords){
        changingCoords = false;
        changingCoordsVertex.changeCoord(x,y);
        changingCoordsVertex.render(vertexGroup,lineGroup);
    }
    else {
        changingCoords = true;
        var status = vertexExists(rCoords);
        if (status){
            //pass
        }
        else{
            changingCoords = false;
        }
    }

}

function addEdge() {
    var vColor = document.getElementById("myColor");
    vertexGroup.attr('fill',vColor);
    var Coords = d3.mouse(this);
    var rCoords = roundToSquare(Coords[0],Coords[1],sGridLength);
    x = rCoords[0];
    y = rCoords[1];
    changingCoords=false;
    if (addingEdge){
        var status = vertexExists(rCoords);
        if (status){
            existingVertexEdge.addNeighbor(rootVertex);
            rootVertex.addNeighbor(existingVertexEdge);
            existingVertexEdge.render(vertexGroup,lineGroup);
            rootVertex.render(vertexGroup,lineGroup);
        }
        else{
            const vertex = new Vertex(x,y,vertexRadius,[rootVertex],"v_"+x+"_"+y);
            rootVertex.addNeighbor(vertex);
            vertex.render(vertexGroup,lineGroup);
            rootVertex.render(vertexGroup,lineGroup);
            vertices.push(vertex)
        }
        addingEdge=false;
    }
    else {
        addingEdge = true;
        var status = vertexExists(rCoords);
        if (status){
            rootVertex = existingVertexEdge;
        }
        else{
            const vertex = new Vertex(x,y,vertexRadius,[],"v_"+x+"_"+y);
            rootVertex = vertex;
            vertex.render(vertexGroup,lineGroup);
            vertices.push(vertex)
        }
    }
}

function preview() {
    var Coords = d3.mouse(this);
    var rCoords = roundToSquare(Coords[0],Coords[1],sGridLength);
    x = rCoords[0];
    y = rCoords[1];
    previewGroup.selectAll("*").remove();
    var status = vertexExists(rCoords);
    if (status){
        previewGroup.append('circle').attr("cx",x).attr("cy",y).attr("r",5).attr('fill','rgba(0,0,0,0.54)')
    }
    else {
        previewGroup.append('circle').attr("cx",x).attr("cy",y).attr("r",3).attr('fill','rgb(0,0,0)')
    }
    if (addingEdge){
        previewGroup.append('line').attr("x1",x).attr("y1",y).attr("x2",rootVertex.x).attr("y2",rootVertex.y)
    }
    if (changingCoords){
        changingCoordsVertex.changeCoord(x,y);
        changingCoordsVertex.render(previewGroup,previewGroup)
    }

}

