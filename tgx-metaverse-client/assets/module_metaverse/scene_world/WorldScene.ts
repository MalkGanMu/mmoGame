// 导入 Cocos Creator 相关的模块和组件
import { AssetManager, assetManager, Color, Component, director, instantiate, Label, Node, Prefab, Quat, tween, TweenSystem, Vec2, _decorator, quat } from 'cc';
// 导入自定义的 TGX 框架相关模块
import { tgxEasyController, tgxEasyControllerEvent, tgxThirdPersonCameraCtrl, tgxUIAlert, tgxUIMgr } from '../../core_tgx/tgx';
// 导入场景工具类
import { SceneUtil } from '../../scripts/SceneDef';
// 导入世界管理类
import { WorldMgr } from './WorldMgr';
// 导入聊天 UI 组件
import { UIChat } from '../ui_chat/UIChat';
// 导入玩家组件
import { Player } from '../prefabs/Player/Player';
// 导入玩家名称组件
import { PlayerName } from '../prefabs/PlayerName/PlayerName';
// 导入世界 HUD UI 组件
import { UIWorldHUD } from '../ui_world_hud/UIWorldHUD';
// 导入子世界用户状态类型
import { SubWorldUserState } from '../../module_basic/shared/types/SubWorldUserState';

// 从 _decorator 中解构出 ccclass 和 property 装饰器
const { ccclass, property } = _decorator;

// 创建一个临时的四元数，用于插值计算
const tmpQuat = quat();

/**
 * SubWorldScene 类，继承自 Component，用于管理子世界场景的逻辑
 */
@ccclass('SubWorldScene')
export class SubWorldScene extends Component {

    // 当前玩家的实例，可能为 undefined
    selfPlayer?: Player;
    // 用于存储所有玩家节点的父节点，通过属性面板赋值
    @property(Node)
    players!: Node;
    // 第三人称相机控制器，用于跟随玩家，通过属性面板赋值
    @property(tgxThirdPersonCameraCtrl)
    followCamera!: tgxThirdPersonCameraCtrl;
    // 玩家预制体，用于创建新的玩家节点，通过属性面板赋值
    @property(Prefab)
    prefabPlayer!: Prefab;

    // 记录玩家的上一个动画状态，用于判断是否需要向服务器上报状态
    private _playerLastState: string = '';

    /**
     * 组件开始时调用的生命周期方法
     */
    async start() {
        // 初始化客户端
        this._initClient();

        // 确保与服务器建立连接
        await WorldMgr.ensureConnected();

        // 定时向服务器上报玩家状态，每 0.1 秒执行一次
        this.schedule(() => {
            // 如果当前玩家实例不存在，直接返回
            if (!this.selfPlayer) {
                return;
            }

            // 获取当前玩家的动画状态
            let curState = this.selfPlayer.aniState;
            // 如果当前状态为 walking 或者与上一个状态不同
            if (curState == 'walking' || curState != this._playerLastState) {
                // 向服务器发送玩家状态消息
                WorldMgr.worldConn.sendMsg('c2sMsg/UserState', {
                    aniState: this.selfPlayer.aniState,
                    pos: this.selfPlayer.node.position,
                    rotation: this.selfPlayer.node.rotation
                });
                // 更新上一个状态为当前状态
                this._playerLastState = curState;
            }
        }, 0.1);

        // 监听控制器的移动事件
        tgxEasyController.on(tgxEasyControllerEvent.MOVEMENT, this.onMovement, this);
        // 监听控制器的移动停止事件
        tgxEasyController.on(tgxEasyControllerEvent.MOVEMENT_STOP, this.onMovmentStop, this);

        // 显示世界 HUD UI
        tgxUIMgr.inst.showUI(UIWorldHUD);
        // 显示聊天 UI
        tgxUIMgr.inst.showUI(UIChat);

        // 监听场景的玩家动作事件
        director.getScene().on('event_player_action', (act: 'wave' | 'punch' | 'dance') => {
            // 处理玩家动作
            this.onPlayerAction(act);
        });
    }

    /**
     * 处理玩家移动事件
     * @param degree 移动的角度
     * @param strengthen 移动的强度
     */
    onMovement(degree: number, strengthen: number) {
        // 如果当前玩家实例不存在，直接返回
        if (!this.selfPlayer) {
            return;
        }
        // 设置玩家的动画状态为 walking
        this.selfPlayer.aniState = 'walking';
        // 根据移动角度和相机的欧拉角设置玩家节点的世界旋转
        this.selfPlayer.node.setWorldRotationFromEuler(0, degree + this.followCamera.node.eulerAngles.y + 90, 0);
    }

    /**
     * 处理玩家停止移动事件
     */
    onMovmentStop() {
        // 如果当前玩家实例不存在，直接返回
        if (!this.selfPlayer) {
            return;
        }
        // 设置玩家的动画状态为 idle
        this.selfPlayer.aniState = 'idle';
    }

    /**
     * 初始化客户端的方法
     */
    private _initClient() {
        // 创建世界连接
        WorldMgr.createWorldConnection(SceneUtil.sceneParams);

        // 获取子世界的关卡数据
        let levelData = WorldMgr.subWorldConfig.levelData;
        // 如果关卡数据、资源包和预制体名称都存在
        if (levelData && levelData.bundle && levelData.prefab) {
            // 加载资源包
            assetManager.loadBundle(levelData.bundle, (err, bundle: AssetManager.Bundle) => {
                // 加载预制体
                bundle.load(levelData.prefab, (err, prefab: Prefab) => {
                    // 将实例化的预制体添加到场景中
                    director.getScene().addChild(instantiate(prefab));
                });
            });
        }

        // 监听服务器的聊天消息
        WorldMgr.worldConn.listenMsg('s2cMsg/Chat', v => {
            // 根据用户 ID 获取玩家节点的 PlayerName 组件
            let playerName = this.players.getChildByName(v.user.uid)?.getComponent(PlayerName);
            // 如果组件存在，显示聊天消息
            if (playerName) {
                playerName.showChatMsg(v.content);
            }
        });

        // 监听服务器的用户状态更新消息
        WorldMgr.worldConn.listenMsg('s2cMsg/UserStates', v => {
            // 遍历所有用户状态
            for (let uid in v.userStates) {
                // 更新用户状态
                this._updateUserState(v.userStates[uid]);
            }
            // 更新玩家数量
            WorldMgr.playerNum = this.players.children.length;
        });

        // 监听服务器的用户加入消息
        WorldMgr.worldConn.listenMsg('s2cMsg/UserJoin', v => {
            // 将新用户信息添加到子世界数据中
            WorldMgr.subWorldData.users.push({
                ...v.user
            });
            // 更新玩家数量
            WorldMgr.playerNum = this.players.children.length;
        });

        // 监听服务器的用户退出消息
        WorldMgr.worldConn.listenMsg('s2cMsg/UserExit', v => {
            // 从子世界数据中移除退出的用户
            WorldMgr.subWorldData.users.remove(v1 => v1.uid === v.user.uid);
            // 从玩家节点父节点中移除退出的玩家节点
            this.players.getChildByName(v.user.uid)?.removeFromParent();
            // 更新玩家数量
            WorldMgr.playerNum = this.players.children.length;
        });
    }

    /**
     * 处理玩家动作的方法
     * @param state 玩家的动作状态，如 wave、punch、dance
     */
    onPlayerAction(state: 'wave' | 'punch' | 'dance') {
        // 如果当前玩家实例不存在，直接返回
        if (!this.selfPlayer) {
            return;
        }
        // 设置玩家的动画状态为指定的动作状态
        this.selfPlayer.aniState = state;
    }

    /**
     * 更新用户状态的方法
     * @param state 子世界用户状态
     */
    private _updateUserState(state: SubWorldUserState) {
        // 根据用户 ID 获取玩家节点
        let node = this.players.getChildByName(state.uid);

        // 如果节点不存在，创建新的玩家节点
        if (!node) {
            // 实例化玩家预制体
            node = instantiate(this.prefabPlayer);
            // 设置节点名称为用户 ID
            node.name = state.uid;
            // 将节点添加到玩家节点父节点中
            this.players.addChild(node);
            // 设置节点的位置
            node.setPosition(state.pos.x, state.pos.y, state.pos.z);
            // 设置节点的旋转
            node.setRotation(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);
            // 获取节点的 Player 组件
            const player = node.getComponent(Player)!;
            // 设置玩家的动画状态
            player.aniState = state.aniState;
            // 从子世界数据中查找用户信息
            let userInfo = WorldMgr.subWorldData.users.find(v => v.uid === state.uid);
            // 如果用户信息存在
            if (userInfo) {
                // 创建一个颜色对象
                let color = new Color();
                // 从用户的视觉 ID 转换为颜色
                Color.fromUint32(color, userInfo.visualId);
                // 设置玩家模型的主颜色
                player.mesh.material?.setProperty('mainColor', color);
            }
            // 设置玩家名称标签的文本
            player.lblName.string = userInfo?.name || '???';

            // 如果是当前用户
            if (state.uid === WorldMgr.currentUser.uid) {
                // 设置当前玩家实例
                this.selfPlayer = player;
                // 标记该节点为当前玩家节点
                this.selfPlayer.node['_isMyPlayer_'] = true;
                // 设置相机的跟随目标
                this.followCamera.target = node.getChildByName('focusTarget')!;
            }
            return;
        }

        // 如果是当前用户，不进行服务端状态同步
        if (state.uid === WorldMgr.currentUser.uid) {
            return;
        }

        // 更新其他玩家的动画状态
        node.getComponent(Player)!.aniState = state.aniState;
        // 移除节点位置上的所有动画
        TweenSystem.instance.ActionManager.removeAllActionsFromTarget(node.position as any);
        // 使用插值动画平滑更新节点的位置和旋转
        tween(node.position).to(0.1, state.pos, {
            onUpdate: (v, ratio) => {
                // 这里原代码可能有误，node!.position = node!.position; 可删除
                // 更新节点的旋转
                node!.rotation = Quat.slerp(tmpQuat, node!.rotation, state.rotation, ratio!);
            }
        }).tag(99).start();
    }

    /**
     * 组件销毁时调用的生命周期方法
     */
    onDestroy() {
        // 取消监听服务器的聊天消息
        WorldMgr.worldConn.unlistenMsgAll('s2cMsg/Chat');
        // 取消监听服务器的用户状态更新消息
        WorldMgr.worldConn.unlistenMsgAll('s2cMsg/UserStates');
        // 取消监听服务器的用户加入消息
        WorldMgr.worldConn.unlistenMsgAll('s2cMsg/UserJoin');
        // 取消监听服务器的用户退出消息
        WorldMgr.worldConn.unlistenMsgAll('s2cMsg/UserExit');
        // 断开与服务器的连接
        WorldMgr.worldConn.disconnect(3456, 'normal');
        // 移除所有标签为 99 的动画
        TweenSystem.instance.ActionManager.removeAllActionsByTag(99);
    }

}