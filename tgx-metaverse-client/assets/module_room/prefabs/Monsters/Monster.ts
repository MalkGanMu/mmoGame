import { _decorator, Component, Node } from 'cc';
import { PlayerAniState, SubWorldMonsterState } from '../../../module_basic/shared/types/SubWorldMonsterState';
const { ccclass, property } = _decorator;

@ccclass('Monster')
export class Monster extends Component {
    private _moveSpeed = 3;
    private aniState: PlayerAniState = 'idle';

    public updateState(state: SubWorldMonsterState) {
        this.node.setPosition(state.pos.x, state.pos.y, state.pos.z);
        this.aniState = state.aniState;
        // 可以添加更多状态更新逻辑，如生命值更新等
    }
}


