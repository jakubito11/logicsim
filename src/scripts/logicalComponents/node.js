import { mainEditor } from "../circuitEditor.js";
import { INPUT_STATE } from "./states.js";
import { nodeValues } from "./oscilloscope.js";

export let nodeList = [];
let currentId = 0;


export class Node {
    constructor(posX, posY, isOutput = false, value = false, color) {
        this.value = value;
        this.posX = posX;
        this.posY = posY;
        this.isOutput = isOutput;
        this.radius = 5;
        this.amplitude = 10; // pre osciloskop
        this.color = color;

        this.isAlive = true;
        this.inputState = INPUT_STATE.FREE;

        this.node = new Konva.Circle({
            x: posX,
            y: posY,
            radius: this.radius,
            stroke: "grey",
            fill: "#343a40",
            hitStrokeWidth: 10,
            //fill: "white",
            name: "node",
        })

        this.pin = new Konva.Shape();

        this.mainEditor = mainEditor;

        this.node.on("mouseover", () => this.mouseOver());
        this.node.on("mouseout", () => this.mouseOut());
        this.node.on("contextmenu", () => this.openEditBox());
        this.node.setAttr('Node', this);

        this.id = currentId;
        currentId++;

        nodeList[this.id] = this;
    }

    getPosition() {
        return {
            posX: this.calculatePositionToScale(this.node.getAbsolutePosition().x).xAxis,
            posY: this.calculatePositionToScale(this.node.getAbsolutePosition().y).yAxis,
        }
    }


    destroy() {
        this.isAlive = false;

        delete nodeList[this.id];
    }



    static setCurrentId(id) {
        currentId = id;
    }


    static setNewNodelist(newNodelist) {
        nodeList = newNodelist;
    }



    updatePosition(posX, posY) {

        this.posX = posX;
        this.posY = posY;
    }



    createPin(x, y, lx, ly, component, label, tx, ty, fs) {

        // velkost fontu je volitelny parameter bud je ine cislo alebo vzdy 13

        fs = fs || 13;

        this.pin.setAttrs({

            sceneFunc: (context, shape) => {

                context.fillStyle = this.color;
                context.font = `bold ${fs}px Arial`;
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(lx, ly);
                context.fillText(label, tx, ty)
                context.fillStrokeShape(shape);
            },

            stroke: this.color,
            strokeWidth: 2,
            hitStrokeWidth: 30,
        })

        component.add(this.pin, this.node);
    
    }


    draw() {

        return this.node;
    }

    mouseOver() {

        this.node.setAttrs({
            stroke: "grey",
            strokeWidth: 4,
            radius: 8,
        })

        return true;

    }

    mouseOut() {

        this.node.setAttrs({
            strokeWidth: 2,
            stroke: "grey",
            radius: this.radius,
        })

    }

    setValue(value) {

        this.value = value;
    }


    setInputState(state) {

        this.inputState = state;
    } 


    getValue() {

        return this.value;
    }

    calculatePositionToScale(variable) {

        return {
            xAxis: variable / this.mainEditor.scaleX() - this.mainEditor.x() / this.mainEditor.scaleX(),
            yAxis: variable / this.mainEditor.scaleY() - this.mainEditor.y() / this.mainEditor.scaleY(),
        };
    }


    fillValue() {
        if(this.getValue()) {

            this.node.fill("green")
            this.pin.stroke("green")

        } else {

            this.node.fill("#343a40");
            this.pin.stroke("white");
        }
    }


    openEditBox() {

        let currentNode = this;

        nodeEditBox.style.display = "block";

        document.getElementById("apply").onclick = () => {

            nodeValues[channels.value] = currentNode;
        }


        document.getElementById("ok").onclick = () => {

            nodeEditBox.style.display = "none";
        }


    }

}

