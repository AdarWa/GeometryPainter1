var sceneWidth = window.innerWidth;
var sceneHeight = window.innerHeight;

function download(content, filename, contentType)
{
    if(!contentType) contentType = 'application/octet-stream';
        var a = document.createElement('a');
        var blob = new Blob([content], {'type':contentType});
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
}

var stage = new Konva.Stage({
    container: 'container',   // id of container <div>
    width: sceneWidth,
    height: sceneHeight
});
  
var layer = new Konva.Layer();
var vertices = new Konva.Layer();
stage.add(layer);
stage.add(vertices);

let points = [];
let line = null;
let shapes = [];
let draw = false;

document.getElementById('draw').addEventListener(
    'click',
    function () {
      if(!draw){
        draw = true;
        document.getElementById('draw').value = "Stop Drawing";
      }else {
        draw = false;
        document.getElementById('draw').value = "Draw";
      }
    },
    false
);




let names = [];
let shapeList = [];
let color = '#'+Math.floor(Math.random()*16777215).toString(16);
let onVertex = false;
let onSide = false;
let count = 0;
let newShape = true;
let currentShape = 0;
let from = null;
const indexToAlpha = (num = 1) => {
    const A = 'A'.charCodeAt(0);
    let numberToCharacter = number => {
       return String.fromCharCode(A + number);
    };
    return numberToCharacter(num);
 };

 document.getElementById('download').addEventListener(
    'click',
    function () {
        download(JSON.stringify(shapeList), "geometry.json", "application/json");
    },
    false
);

vertices.on('mouseenter', function(){
    onVertex = true;
});
vertices.on('mouseleave', function(){
    onVertex = false;
});

layer.on('mouseenter', function(){
    onSide = true;
});
layer.on('mouseleave', function(){
    onSide = false;
});

stage.on('pointerdown', function () {
    if(!draw || onVertex) return;
    var mousePos = stage.getPointerPosition();
    points.push(mousePos.x);
    points.push(mousePos.y);
    var vertex = new Konva.Circle({
        x: mousePos.x,
        y: mousePos.y,
        radius: 10,
        fill: color,
    });
    let on = "";
    if(onSide){
        let distances = [];
        shapeList.forEach((shape) =>{
            for (let i = 0; i < shape.vertices.length; i++) {
                let i1 = i;
                let i2 = i+1;
                if(i == shape.vertices.length-1){
                    i2 = 0;
                }
                let a = shape.vertices[i1];
                let b = shape.vertices[i2];
                let m = (a.y-b.y)/(a.x-b.x);
                let n = a.y - m*a.x;
                let d = Math.abs((m*mousePos.x - mousePos.y + n)/Math.sqrt(Math.pow(m,2)+1));
                distances.push({distance:d, name: a.name + b.name});
            }            
        });
        let min = 1000000;
        let minName = "";
        distances.forEach((distance) => {
            if(distance.distance < min){
                min = distance.distance;
                minName = distance.name;
            }
        });
        on = minName;
    }
    if(newShape){
        newShape = false;
        if(on != ""){
            from = null;
        }
        shapeList.push({vertices: [{x:mousePos.x,y:mousePos.y, name: indexToAlpha(count), on: on, from: from, to: null}]});
        from = null;
    }else {
        if(from != ""){
            from = null;
        }
        shapeList[currentShape].vertices.push({x:mousePos.x,y:mousePos.y, name: indexToAlpha(count), on: on, from:from, to: null});
        from = null;
    }
    vertices.add(
        new Konva.Text({
            x: mousePos.x,
            y: mousePos.y,
            text: indexToAlpha(count),
            fontSize: 30
        })
    );
    let vertexName = indexToAlpha(count);
    count++;
    let i = points.length;
    console.log(shapeList);
    vertex.on('pointerdown', function () {
        if(!draw){
            let name = prompt("Please enter the name of this vertex.");
            if(name == null || name == "" || name == undefined){
                return;
            }
            names.push({index:i, name:name});
            vertices.add(
                new Konva.Text({
                    x: mousePos.x,
                    y: mousePos.y,
                    text: name,
                    fontSize: 30
                })
            );
        }else{
            if(points.length > 0){
                line.remove();
                points.push(vertex.absolutePosition().x);
                points.push(vertex.absolutePosition().y);
                layer.add(new Konva.Line({
                    points: points,
                    stroke: 'red',
                    strokeWidth: 15,
                    lineCap: 'round',
                    lineJoin: 'round',
                }));
                shapes.push({points:points});
                color = '#'+Math.floor(Math.random()*16777215).toString(16);
                points = [];
                newShape = true;
                shapeList[currentShape].vertices[shapeList[currentShape].vertices.length-1].to = vertexName;
                currentShape++;
            }else {
                points.push(vertex.absolutePosition().x);
                points.push(vertex.absolutePosition().y);
            }
            from = vertexName;
        }
    });
    vertices.add(vertex);
    if(points.length > 1){
        if(line != null){
            line.remove();
        }
        line = new Konva.Line({
            points: points,
            stroke: 'red',
            strokeWidth: 15,
            lineCap: 'round',
            lineJoin: 'round',
          });
        layer.add(line);
    }
});

