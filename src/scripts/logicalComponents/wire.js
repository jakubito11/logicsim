import { INPUT_STATE, CURRENT_ACTION } from "./states.js";
import { mainEditor } from "../circuitEditor.js";
import { currentMouseAction } from "../main.js";
import { openAlert } from "../userInterface.js";
import { Node } from "./node.js";

export class Wire {
    constructor(startNode) {
        this.startNode = startNode;

        this.endNode = null;

        this.startID = startNode.id;
        this.endID = null;


        this.mainEditor = mainEditor;
        this.layer = this.mainEditor.findOne("#componentLayer");


        this.wire = new Konva.Line({
            stroke: "white",
            strokeWidth: 3,
            name: "wire",
            hitStrokeWidth: 10
        })

        this.wire.setAttr('Wire', this);
        this.wire.on("mouseover", () => this.mouseOver());
        this.wire.on("mouseout", () => this.mouseOut());


        this.layer.add(this.wire);
        this.wire.zIndex(0);

        this.endX = 0;
        this.endY = 0;
    }


    mouseOver() {

        if(this.endNode == null || currentMouseAction != CURRENT_ACTION.REMOVE_WIRE) return;

        this.wire.setAttrs({
            opacity: 0.3,
        })

        return true;
    }

    mouseOut() {
        this.wire.setAttrs({
            opacity: 1
        })
    }

    draw() {

        if(this.endNode == null) {

            

            if(!this.startNode.isAlive) return false;

            this.updateEnd(this.calculatePositionToScale(this.mainEditor.getPointerPosition().x).xAxis, this.calculatePositionToScale(this.mainEditor.getPointerPosition().y).yAxis);

            this.wire.setAttrs({
                points: [this.startNode.getPosition().posX, this.startNode.getPosition().posY, this.endX, this.endY]
            })

            


        } else if(this.startNode.isAlive && this.endNode.isAlive) {

            this.generateNodeValue();

            this.wire.setAttrs({
                bezier: true,
                points: [this.startNode.getPosition().posX, this.startNode.getPosition().posY,
                    this.startNode.getPosition().posX + 20, this.startNode.getPosition().posY,
                    this.endNode.getPosition().posX - 20, this.endNode.getPosition().posY,
                    this.endNode.getPosition().posX, this.endNode.getPosition().posY]
            })

            // ak je hodnota pravdivá medzi dvoma svorkami

            if (this.startNode.getValue() && this.endNode.getValue()) {

                this.wire.setAttrs({
                    stroke: "green",
                })

            } else {

                this.wire.setAttrs({
                    stroke: "white",
                })
            }
        


        } else {

            this.endNode.setValue(false);
            return false; 
        }
        

        return true;

    }



    destroy() {


        this.startNode.setInputState(INPUT_STATE.FREE);

        
        if(this.endNode == null) {
            return;
        }

        this.endNode.setValue(false);
        this.endNode.setInputState(INPUT_STATE.FREE);
    

        
    }



    generateNodeValue() {

        if((this.startNode.isOutput && this.endNode.isOutput) || (!this.startNode.isOutput && !this.endNode.isOutput)) {

            this.startNode.setValue(this.startNode.getValue() || this.endNode.getValue());
            this.endNode.setValue(this.startNode.getValue());

        } else {
            this.endNode.setValue(this.startNode.getValue());
        }
    }

    getStartNode() {

        return this.startNode;
    }

    updateEnd(endX, endY) {
        this.endX = endX;
        this.endY = endY;
    }


    setEndNode(endNode) {

        if (endNode.isOutput) {

            let tempNode = this.startNode;
            this.startNode = endNode;
            this.endNode = tempNode;
            this.endNode.setInputState(INPUT_STATE.TAKEN);

        } else {
            this.endNode = endNode;
            this.startNode.setInputState(INPUT_STATE.TAKEN);
            this.endNode.setInputState(INPUT_STATE.TAKEN);
        }

        this.startID = this.startNode.id;
        this.endID = this.endNode.id;
    }


    // iba zatial pre pointer zmeni v circuit editore neskor

    calculatePositionToScale(variable) {

        return {
            xAxis: variable / this.mainEditor.scaleX() - this.mainEditor.x() / this.mainEditor.scaleX(),
            yAxis: variable / this.mainEditor.scaleY() - this.mainEditor.y() / this.mainEditor.scaleY(),
        };
    }


}


export class WireMng {

    constructor() {

        this.wire = [];
        this.isOpened = false;
        this.finishedDrawing = true;
    }


    draw() {

        for(let i = this.wire.length - 1; i >= 0; i--) {
            let result = this.wire[i].draw();

            if(result == false) {

                this.isOpened = false;
                if(this.wire[i] != null) {
                    this.wire[i].wire.destroy();
                    this.wire[i].destroy();

                }

                delete this.wire[i];
                this.wire.splice(i, 1)
            }
            
        }

    }


    addNode(node) {

        if (this.isOpened == false) {
            this.wire.push(new Wire(node));
            this.isOpened = true;
            this.finishedDrawing = false;
            document.getElementById("mainBoard").style.cursor = "crosshair";

        } else {

            let index = this.wire.length - 1;

            if (node != this.wire[index].getStartNode() && (this.wire[index].getStartNode().isOutput != node.isOutput)) {

                this.wire[index].setEndNode(node);
                // save state

            } else {
                
                this.wire[index].wire.destroy();
                delete this.wire[index];
                this.wire.length--;
                openAlert("warning", "WireLoop");
            }

            this.isOpened = false;
            this.finishedDrawing = true;
            document.getElementById("mainBoard").style.cursor = "default";
        }


    }
    
}