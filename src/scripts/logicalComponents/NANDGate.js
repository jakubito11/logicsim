import { Component } from "./component.js";
import { Node } from "./node.js";

export class NANDGate extends Component {
    constructor(x, y, color, rotation) {

        super(x, y, color, rotation)


        this.id = "NAND";
        this.editType = "gateEdit";
        this.numOfInputs = 2;
    }

    setEditInfo() {

        let inputValue = document.getElementById("inputEdit").value;

        if (!this.validateInputFields(inputValue) || inputValue == "") return;

        this.destroy();
        this.numOfInputs = inputValue;
        this.render();
    }

    setupNodes() {

        let shift = 20;

        // načítaj vstupy

        for(let i = 0; i < this.numOfInputs; i++) {
            this.nodes[i] = new Node(-60, shift, false, false, this.color, "I" + i);
            this.nodes[i].createPin(0, shift, -60, shift, this.component);

            shift += 40;
        }

 
        this.nodes[this.numOfInputs] = new Node(120, (this.numOfInputs * 40) / 2, true, false, this.color, "Y0"); // Y0
        this.nodes[this.numOfInputs].createPin(60, (this.numOfInputs * 40) / 2, 120, (this.numOfInputs * 40) / 2, this.component);

        this.startNodeId = this.nodes[0].id;
    }


    render() {

        const IECgateBody = new Konva.Shape({
            
            sceneFunc: (context, shape) => {

                context.fillStyle = this.color;
                context.font = "bold 25px Arial";
                context.beginPath();
                context.rect(0,0,60,this.numOfInputs * 40);
                context.fillText("&", 20, 40);
                context.fillStrokeShape(shape);
            },

            id: "IEC",
            stroke: this.color,
            strokeWidth: this.strokeWidth
        })

        const ANSIgateBody = new Konva.Shape({

            sceneFunc: (context, shape) => {
                context.beginPath();
                context.moveTo(0, 10);
                context.quadraticCurveTo(60, 5, 60, (this.numOfInputs * 40) / 2);
                context.quadraticCurveTo(60, this.numOfInputs * 40 - 5, 0, this.numOfInputs * 40 - 10);
                context.closePath();
                context.fillStrokeShape(shape);

            },

            stroke: this.color,
            strokeWidth: this.strokeWidth,
            id: "ANSI",

        });

        const bubble = new Konva.Circle({
            x: 65,
            y: (this.numOfInputs * 40)  / 2,
            radius: 5,
            fill: this.color,
            stroke: this.color,
            strokeWidth: this.strokeWidth,
        })


        if(this.useEuroGates()) {
            IECgateBody.visible(true);
            ANSIgateBody.visible(false);
        } else {
            IECgateBody.visible(false);
            ANSIgateBody.visible(true);
        }


        this.setupNodes();
        this.component.add(IECgateBody, bubble, ANSIgateBody);


        this.layer.add(this.component);
    }

    calculateValue() {

        let q = true;

        for(let i = 0; i != this.numOfInputs; i++)
            q &= this.nodes[i].value;
        
        return !q;

    }


    execute() {

        this.nodes[this.numOfInputs].setValue(this.calculateValue());
    }
}