import { _decorator, Component, Node, TiledMap, Vec2, Vec3, RigidBody2D } from 'cc';
import { FlowFieldMT } from './FlowFieldMT';
const { ccclass, property } = _decorator;

@ccclass('PathFindingFF')
export class PathFindingFF extends Component {
    @property(Node)
    private chasers: Node | null = null;

    @property(TiledMap)
    private tiledMap: TiledMap | null = null;
    
    start() {
        setTimeout(() => {
            this.schedule(() => {
                this.move();
            }, 1);
        }, 2000);
    }
    move() {
        const flowFieldMT = this.tiledMap.getComponent(FlowFieldMT);
        if (flowFieldMT && this.chasers && this.chasers.children.length > 0) {
            this.chasers.children.forEach(child => {
                const characterPosition = child.getWorldPosition();
                const characterXY = new Vec2(characterPosition.x, characterPosition.y); 
                const rigidBody = child.getComponent(RigidBody2D); 
                // 获取角色当前位置的流动方向
                const direction = flowFieldMT.getDirection(characterXY); 
                // 根据方向移动角色
                rigidBody.linearVelocity = new Vec2(direction.x, -direction.y);
            });
        }
    }
}


