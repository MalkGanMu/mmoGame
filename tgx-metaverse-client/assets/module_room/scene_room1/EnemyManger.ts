import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { SubWorldMonsterState } from '../../module_basic/shared/types/SubWorldMonsterState';
import { WorldMgr } from '../../module_metaverse/scene_world/WorldMgr';
const { ccclass, property } = _decorator;
import { Monster } from '../prefabs/Monsters/Monster';
import { RoomMgr } from './RoomMgr';

@ccclass('EnemyManger')
export class EnemyManger extends Component {
    selfMonster?: Monster;

    @property(Prefab)
    prefabMonster!: Prefab;

    @property(Node)
    Monsters!: Node;
    
    private _initClient() {
        // ... 原有代码 ...

        // 监听服务器的敌人状态更新消息
        // WorldMgr.worldConn.listenMsg('s2cMsg/MonsterStates', v => {
        //     for (let uid in v.MonsterStates) {
        //         this._updateMonsterState(v.MonsterStates[uid]);
        //     }
        // });

        // ... 原有代码 ...
    }

    private _updateMonsterState(state: SubWorldMonsterState) {
        let node = this.Monsters.getChildByName(state.uid);

        if (!node) {
            node = instantiate(this.prefabMonster);
            node.name = state.uid;
            this.Monsters.addChild(node);
            const monster = node.getComponent(Monster)!;
            monster.updateState(state);
            return;
        }

        const monster = node.getComponent(Monster)!;
        monster.updateState(state);
    }   
}


