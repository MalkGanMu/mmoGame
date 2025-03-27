import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DIYFloowCamera2D')
export class DIYFloowCamera2D extends Component {
    // 目标组件
    @property(Node)
    target!: Node;

    // ui摇杆
    @property(Node)
    ui!: Node;

    start() {

    }

    update(deltaTime: number) {
        if (this.target) {
            let w_pos = this.target.getWorldPosition();
            this.ui.setWorldPosition(w_pos);
            w_pos.z = 5;
            this.node.setWorldPosition(w_pos);
        }
    }
}


