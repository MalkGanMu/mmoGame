import { _decorator, Component, Node, PhysicsSystem2D, EPhysics2DDrawFlags, TiledMap, RigidBodyComponent, RigidBody, PhysicsSystem, BoxCollider, RigidBody2D, BoxColliderComponent, BoxCollider2D, ERigidBodyType, ERigidBody2DType } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('Physics')
export class Physics extends Component {
    @property(TiledMap)
    tiledMap!: TiledMap;

    start() {
        let tiledSize = this.tiledMap.getTileSize();
        let wallLayer = this.tiledMap.getLayer('3');
        let wallLayerSize = wallLayer.getLayerSize();

        for(let i = 0; i < wallLayerSize.width; i++) {
            for(let j = 0; j < wallLayerSize.height; j++) {
                let tiled = wallLayer.getTiledTileAt(i, j, true);
                if (tiled.grid != 0) {
                    let body = tiled.node.addComponent(RigidBody2D);
                    body.group = 2;
                    body.type = ERigidBody2DType.Static;
                    let collider = tiled.node.addComponent(BoxCollider2D);
                    collider.offset.set(-((wallLayerSize.width - 1) * tiledSize.width / 2), -((wallLayerSize.height - 1) * tiledSize.height / 2));
                    collider.size.set(tiledSize);
                    collider.apply();
                }
                
            }
        }
    }

    onLoad() {
        // 开启物理引擎
        if (PhysicsSystem2D.instance) {
            PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
    EPhysics2DDrawFlags.Pair |
    EPhysics2DDrawFlags.CenterOfMass |
    EPhysics2DDrawFlags.Joint |
    EPhysics2DDrawFlags.Shape;
        }
    }
    update(deltaTime: number) {
        
    }
}


