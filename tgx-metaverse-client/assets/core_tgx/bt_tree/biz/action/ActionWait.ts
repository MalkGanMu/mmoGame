import { _decorator, Component, Node, game } from 'cc';
import BTAction from '../../BTAction';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('ActionWait')
export default class ActionWait extends BTAction {
    private duration:number = 2000;
    private startTime:number = 0;
    constructor(duration:number = 2000){
        super();
        this.duration = duration;
    }

    onStart() {
        super.onStart();
        this.startTime = game.totalTime;
        console.log("ActionWait onStart");
    }
 
    onUpdate(): NodeStatus {
        if (game.totalTime - this.startTime >= this.duration) {
            return NodeStatus.Success;
        }
        return NodeStatus.Failure;
    }
 
    onEnd() {
        super.onEnd();
        console.log("ActionWait onEnd");
        this.status = NodeStatus.Inactive;
    }
}



