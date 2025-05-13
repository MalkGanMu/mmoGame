import { _decorator, Node, EventTouch, Touch, Component, UITransform, Input, EventKeyboard, KeyCode, v2, Vec3, input, Scene, director, EventMouse, macro, view, screen, isValid, CameraComponent } from 'cc';
import { EasyControllerEvent } from './EasyController';
const { ccclass, property } = _decorator;

@ccclass('tgxUI_JoystickDIY')
export class UI_JoystickDIY extends Component {
    
    private static _inst: UI_JoystickDIY = null;
    private _movementTouch: any;
    public static get inst(): UI_JoystickDIY {
        return this._inst;
    }

    private _ctrlRoot: UITransform = null;
    private _ctrlPointer: Node = null;
    private _checkerCamera: UITransform = null;
    private _buttons: Node = null;

    private _key2buttonMap = {};

    private _scene: Scene = null;

    protected onLoad(): void {
        UI_JoystickDIY._inst = this;
    }

    start() {
        let checkerMovement = this.node.getChildByName('checker_movement').getComponent(UITransform);
        checkerMovement.node.on(Input.EventType.TOUCH_START, this.onTouchStart_Movement, this);
        checkerMovement.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove_Movement, this);
        checkerMovement.node.on(Input.EventType.TOUCH_END, this.onTouchUp_Movement, this);
        checkerMovement.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchUp_Movement, this);

        let checkerCamera = this.node.getChildByName('checker_camera').getComponent(UITransform);
        checkerCamera.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

        this._checkerCamera = checkerCamera;

        this._ctrlRoot = this.node.getChildByName('ctrl').getComponent(UITransform);
        this._ctrlRoot.node.active = false;
        this._ctrlPointer = this._ctrlRoot.node.getChildByName('pointer');

        this._buttons = this.node.getChildByName('buttons');

        this._key2buttonMap[KeyCode.KEY_J] = 'btn_slot_0';
        this._key2buttonMap[KeyCode.KEY_K] = 'btn_slot_1';
        this._key2buttonMap[KeyCode.KEY_L] = 'btn_slot_2';
        this._key2buttonMap[KeyCode.KEY_U] = 'btn_slot_3';
        this._key2buttonMap[KeyCode.KEY_I] = 'btn_slot_4';

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        this._scene = director.getScene();
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this._scene = null;

        UI_JoystickDIY._inst = null;
    }

    bindKeyToButton(keyCode: KeyCode, btnName: string) {
        this._key2buttonMap[keyCode] = btnName;
    }

    setButtonVisible(btnName: string, visible: boolean) {
        let node = this._buttons?.getChildByName(btnName);
        if (node) {
            node.active = visible;
        }
    }

    getButtonByName(btnName: string): Node {
        return this._buttons.getChildByName(btnName);
    }

    onTouchStart_Movement(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let x = touch.getUILocationX();
            let y = touch.getUILocationY();
            if (!this._movementTouch) {
                let halfWidth = this._checkerCamera.width / 2;
                let halfHeight = this._checkerCamera.height / 2;

                this._ctrlRoot.node.active = true;
                this._ctrlRoot.node.setPosition(x - halfWidth, y - halfHeight, 0);
                this._ctrlPointer.setPosition(0, 0, 0);
                this._movementTouch = touch;
            }
        }
    }

    onTouchMove_Movement(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                let halfWidth = this._checkerCamera.width / 2;
                let halfHeight = this._checkerCamera.height / 2;
                let x = touch.getUILocationX();
                let y = touch.getUILocationY();

                let pos = this._ctrlRoot.node.position;
                let ox = x - halfWidth - pos.x;
                let oy = y - halfHeight - pos.y;

                let len = Math.sqrt(ox * ox + oy * oy);
                if (len <= 0) {
                    return;
                }

                let dirX = ox / len;
                let dirY = oy / len;
                let radius = this._ctrlRoot.width / 2;
                if (len > radius) {
                    len = radius;
                    ox = dirX * radius;
                    oy = dirY * radius;
                }

                this._ctrlPointer.setPosition(ox, oy, 0);

                // degree 0 ~ 360 based on x axis.
                let degree = Math.atan(dirY / dirX) / Math.PI * 180;
                if (dirX < 0) {
                    degree += 180;
                }
                else {
                    degree += 360;
                }

                this.emitEvent(EasyControllerEvent.MOVEMENT, degree, len / radius);
            }
        }
    }

    onTouchUp_Movement(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                this.emitEvent(EasyControllerEvent.MOVEMENT_STOP);
                this._movementTouch = null;
                this._ctrlRoot.node.active = false;
            }
        }
    }

    onTouchStart(event: EventTouch) {
        let touch = event.getTouches()[0];
        let x = touch.getUILocationX();
        let y = touch.getUILocationY();
    
        let screenWidth = view.getVisibleSize().width;
        let screenHeight = view.getVisibleSize().height;
    
        let centerX = screenWidth / 2;
        let centerY = screenHeight / 2;
    
        let dx = x - centerX;
        let dy = y - centerY;
        let length = Math.sqrt(dx * dx + dy * dy);
        let directionVector = length > 0 
            ? new Vec3(dx / length, dy / length, 0) 
             : new Vec3(0, 0, 0);
    
        this.emitEvent(EasyControllerEvent.CLICK_VECTOR, directionVector);
    }

    private _keys = [];
    private _degree: number = 0;

    onKeyDown(event: EventKeyboard) {
        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W) {
            if (this._keys.indexOf(keyCode) == -1) {
                this._keys.push(keyCode);
                this.updateDirection();
            }
        }
        else {
            let btnName = this._key2buttonMap[keyCode];
            if (btnName) {
                this.emitEvent(EasyControllerEvent.BUTTON, btnName);
            }
        }
    }

    onKeyUp(event: EventKeyboard) {
        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W) {
            let index = this._keys.indexOf(keyCode);
            if (index != -1) {
                this._keys.splice(index, 1);
                this.updateDirection();
            }
        }
    }

    onMouseWheel(event: EventMouse) {
        let delta = event.getScrollY() * 0.1;
        this.emitEvent(EasyControllerEvent.CAMERA_ZOOM, delta);
    }

    onButtonSlot(event) {
        let btnName = event.target.name;
        this.emitEvent(EasyControllerEvent.BUTTON, btnName);
    }

    private _key2dirMap = null;

    updateDirection() {
        if (this._key2dirMap == null) {
            this._key2dirMap = {};
            this._key2dirMap[0] = -1;
            this._key2dirMap[KeyCode.KEY_A] = 180;
            this._key2dirMap[KeyCode.KEY_D] = 0;
            this._key2dirMap[KeyCode.KEY_W] = 90;
            this._key2dirMap[KeyCode.KEY_S] = 270;

            this._key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_W] = this._key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_A] = 135;
            this._key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_W] = this._key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_D] = 45;
            this._key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_S] = this._key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_A] = 225;
            this._key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_S] = this._key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_D] = 315;

            this._key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_D] = this._key2dirMap[KeyCode.KEY_D];
            this._key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_A] = this._key2dirMap[KeyCode.KEY_A];
            this._key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_S] = this._key2dirMap[KeyCode.KEY_S];
            this._key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_W] = this._key2dirMap[KeyCode.KEY_W];
        }
        let keyCode0 = this._keys[this._keys.length - 1] || 0;
        let keyCode1 = this._keys[this._keys.length - 2] || 0;
        this._degree = this._key2dirMap[keyCode1 * 1000 + keyCode0];
        if (this._degree == null || this._degree < 0) {
            this.emitEvent(EasyControllerEvent.MOVEMENT_STOP);
        }
        else {
            this.emitEvent(EasyControllerEvent.MOVEMENT, this._degree, 1.0);
        }
    }

    private emitEvent(type: string, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
        if (isValid(this._scene)) {
            this._scene.emit(type, arg0, arg1, arg2, arg3, arg4);
        }
        else {
            console.log('oops!');
        }
    }
}
    