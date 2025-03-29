import { _decorator, Component, Node } from 'cc';
import BTNode from './BTNode';
import BTParent from './BTParent';
import { AbortType } from './enum';
const { ccclass, property } = _decorator;

@ccclass('BTComposite')
export default abstract class BTComposite extends BTParent {
    abortType:AbortType

    constructor(childrens: Array<BTNode>, abortType:AbortType = AbortType.None) {
        super(childrens);
        this.abortType = abortType;
    }
}


