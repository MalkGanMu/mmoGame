import { _decorator, Component, Node, game } from 'cc';
import BlackBoard from '../../../../module_room/scene_room1/BlackBoard';
import BTAction from '../../BTAction';
import { NodeStatus } from '../../enum';

const { ccclass, property } = _decorator;

@ccclass('ActionSkill')
export default class ActionSkill extends BTAction {
    private duration: number = 2000;
    private startTime: number = 0;

    constructor(duration: number = 2000) {
        super();
        this.duration = duration;
    }

    onStart() {
        super.onStart()
        this.startTime = game.totalTime;
        console.log("ActionSkill onStart");
    }

    onUpdate() {
        if (game.totalTime - this.startTime > this.duration) {
            return NodeStatus.Success;
        }

        return NodeStatus.Running;
    }

    onEnd() {
        super.onEnd();
        BlackBoard.Instance.mp -= 20;
        console.log("ActionSkill onEnd");
    }
}