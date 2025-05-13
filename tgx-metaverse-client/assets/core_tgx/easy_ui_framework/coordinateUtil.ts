// import { _decorator, Vec2, Vec3, Camera, view, Node } from 'cc';
// const { ccclass, property } = _decorator;

// @ccclass('CoordinateUtil')
// export class CoordinateUtil {
//     /**
//      * 将屏幕坐标转换为世界坐标
//      * @param screenPos 屏幕坐标(x, y)
//      * @param camera 用于转换的相机，默认为主相机
//      * @returns 世界坐标
//      */
//     public static screenToWorld(screenPos: Vec2, camera?: Camera): Vec3 {
//         // 如果没有提供相机，则使用主相机
//         if (!camera) {
//             camera = Camera.main;
//         }
        
//         if (!camera) {
//             console.error("No main camera found!");
//             return new Vec3();
//         }
        
//         // 获取屏幕尺寸
//         const visibleSize = view.getVisibleSize();
        
//         // 将屏幕坐标转换为归一化设备坐标(NDC)
//         // 屏幕坐标原点在左上角，NDC坐标原点在屏幕中心
//         const ndcPos = new Vec3(
//             screenPos.x / visibleSize.width * 2 - 1,
//             1 - screenPos.y / visibleSize.height * 2,
//             0
//         );
        
//         // 使用相机将NDC坐标转换为世界坐标
//         const worldPos = new Vec3();
//         camera.convertToWorldSpaceAR(ndcPos, worldPos);
        
//         return worldPos;
//     }
    
//     /**
//      * 将触摸事件的坐标转换为世界坐标
//      * @param touch 触摸事件
//      * @param camera 用于转换的相机，默认为主相机
//      * @returns 世界坐标
//      */
//     public static touchToWorld(touch: Touch, camera?: Camera): Vec3 {
//         const screenPos = new Vec2(touch.getLocationX(), touch.getLocationY());
//         return this.screenToWorld(screenPos, camera);
//     }
    
//     /**
//      * 将UI坐标转换为世界坐标
//      * @param uiPos UI坐标
//      * @param canvas 画布节点
//      * @param camera 用于转换的相机，默认为主相机
//      * @returns 世界坐标
//      */
//     public static uiToWorld(uiPos: Vec2, canvas: Node, camera?: Camera): Vec3 {
//         // 如果没有提供相机，则使用主相机
//         if (!camera) {
//             camera = Camera.main;
//         }
        
//         // 将UI坐标转换为屏幕坐标
//         const screenPos = this.uiToScreen(uiPos, canvas);
        
//         // 将屏幕坐标转换为世界坐标
//         return this.screenToWorld(screenPos, camera);
//     }
    
//     /**
//      * 将UI坐标转换为屏幕坐标
//      * @param uiPos UI坐标
//      * @param canvas 画布节点
//      * @returns 屏幕坐标
//      */
//     private static uiToScreen(uiPos: Vec2, canvas: Node): Vec2 {
//         // 获取画布尺寸
//         const canvasSize = canvas.getContentSize();
        
//         // 计算屏幕坐标
//         return new Vec2(
//             uiPos.x + canvasSize.width / 2,
//             canvasSize.height - uiPos.y - canvasSize.height / 2
//         );
//     }
// }    