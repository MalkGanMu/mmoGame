import { _decorator, Component, TiledMap, TiledLayer, Vec2, Node } from 'cc';
const { ccclass, property } = _decorator;

// 格子类，用于表示地图中的每个格子
class GridCell {
    // 该格子的移动代价，值为 Infinity 表示不可通行，值为 1 表示可通行
    public cost: number;
    // 存储每个目标对应的累积代价，是一个数组，因为可能有多个目标
    public integrationCosts: number[];
    // 该格子的流动方向，是一个二维向量
    public direction: Vec2;

    // 构造函数，初始化格子的移动代价
    constructor(cost: number) {
        this.cost = cost;
        this.integrationCosts = [];
        this.direction = new Vec2(0, 0);
    }
}

// 定义 FlowField 类，继承自 Cocos Creator 的 Component 类
@ccclass('FlowField')
export class FlowField extends Component {
    // 用于引用 TiledMap 组件，可在编辑器中赋值
    @property(TiledMap)
    private tiledMap: TiledMap | null = null;

    @property(Node)
    private targets: Node | null = null;
    @property(Number)
    offsetX: number = 0;
    @property(Number)
    offsetY: number = 0;
    @property(Number)
    scale: number = 1; // 添加 scale 属性并设置默认值为 1

    // 二维数组，存储地图中每个格子的信息
    private grid: GridCell[][];
    // 每个格子的大小，是一个二维向量
    private tileSize: Vec2;
    // 地图的大小，以格子数量为单位，是一个二维向量
    private gridSize: Vec2;

    // 组件开始运行时调用的方法
    start() {
        if (this.tiledMap) {
            // 初始化地图网格
            this.initGrid();
            this.schedule(this.updateFlowField, 10); // 每隔 10 秒更新流场积分
        }
    }

    private initGrid() {
        const tileSize = this.tiledMap!.getTileSize();
        this.tileSize = new Vec2(tileSize.width * this.scale, tileSize.height * this.scale); // 乘以 scale
        const walkableLayer = this.tiledMap!.getLayer('2');
        const wallLayer = this.tiledMap!.getLayer('3');
        const mapSize = this.tiledMap!.getMapSize();
        this.gridSize = new Vec2(mapSize.width, mapSize.height);

        this.grid = [];
        for (let y = 0; y < this.gridSize.y; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize.x; x++) {
                let cost = Infinity;
                const walkableTile = walkableLayer?.getTileGIDAt(x, y);
                const wallTile = wallLayer?.getTileGIDAt(x, y);

                if (walkableTile!== 0 && wallTile === 0) {
                    cost = 1;
                }

                this.grid[y][x] = new GridCell(cost);
                console.log(`Grid (${x}, ${y}) cost:`, cost); // 输出每个格子的 cost 值
            }
        }
    }

    private updateFlowField() {
        // 重置 grid 的累积代价和流动方向
        for (let y = 0; y < this.gridSize.y; y++) {
            for (let x = 0; x < this.gridSize.x; x++) {
                this.grid[y][x].integrationCosts = [];
                this.grid[y][x].direction = new Vec2(0, 0);
            }
        }
        if (this.targets && this.targets.children.length > 0) {
            const targets: Vec2[] = [];
            this.targets.children.forEach(child => {
                const worldPosition = child.getWorldPosition();
                const tileX = Math.floor(Math.abs((worldPosition.x + this.offsetX)) / this.tileSize.x);
                const tileY = Math.floor(Math.abs((worldPosition.y + this.offsetY)) / this.tileSize.y);
                targets.push(new Vec2(tileX, tileY));
                console.log('TargetsWPos:', worldPosition.x, worldPosition.y); // 输出获取到的目标点坐标
            });
            console.log('Targets:', targets); // 输出获取到的目标点坐标
            this.calculateIntegrationFields(targets);
            this.calculateFlowField();
            this.printFlowFieldScores();
        }
    }

    // 计算每个目标的积分场的方法
    private calculateIntegrationFields(targets: Vec2[]) {
        // 遍历每个目标
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            // 用于广度优先搜索的开放列表，初始时将目标点加入
            const openList: Vec2[] = [target];
            // 遍历地图的每一个格子
            for (let y = 0; y < this.gridSize.y; y++) {
                for (let x = 0; x < this.gridSize.x; x++) {
                    // 如果该格子的第 i 个目标的累积代价还未初始化
                    if (!this.grid[y][x].integrationCosts[i]) {
                        // 则将其初始化为 Infinity
                        this.grid[y][x].integrationCosts[i] = Infinity;
                    }
                }
            }
            // 将目标点的第 i 个目标的累积代价设置为 0
            this.grid[target.y][target.x].integrationCosts[i] = 0;

            // 当开放列表不为空时，继续进行广度优先搜索
            while (openList.length > 0) {
                // 从开放列表中取出一个格子
                const current = openList.shift()!;
                // 获取该格子的相邻格子
                const neighbors = this.getNeighbors(current);
                // 遍历相邻格子
                for (const neighbor of neighbors) {
                    // 计算从当前格子到相邻格子的新累积代价
                    const newCost = this.grid[current.y][current.x].integrationCosts[i] + this.grid[neighbor.y][neighbor.x].cost;
                    // 如果新累积代价小于相邻格子当前的累积代价
                    if (newCost < this.grid[neighbor.y][neighbor.x].integrationCosts[i]) {
                        // 则更新相邻格子的累积代价
                        this.grid[neighbor.y][neighbor.x].integrationCosts[i] = newCost;
                        // 将相邻格子加入开放列表
                        openList.push(neighbor);
                    }
                }
            }
        }
    }

    // 计算最终的流动场的方法
    private calculateFlowField() {
        // 遍历地图的每一行
        for (let y = 0; y < this.gridSize.y; y++) {
            // 遍历地图的每一列
            for (let x = 0; x < this.gridSize.x; x++) {
                // 当前格子的坐标
                const current = new Vec2(x, y);
                // 获取当前格子的相邻格子
                const neighbors = this.getNeighbors(current);
                // 初始化最小总代价为 Infinity
                let minTotalCost = Infinity;
                // 初始化最小总代价对应的方向为零向量
                let minDirection = new Vec2(0, 0);
                // 遍历相邻格子
                for (const neighbor of neighbors) {
                    // 初始化总代价为 0
                    let totalCost = 0;
                    // 遍历每个目标
                    for (let i = 0; i < this.grid[y][x].integrationCosts.length; i++) {
                        // 累加相邻格子到每个目标的累积代价
                        totalCost += this.grid[neighbor.y][neighbor.x].integrationCosts[i];
                    }
                    // 如果总代价小于最小总代价
                    if (totalCost < minTotalCost) {
                        // 更新最小总代价
                        minTotalCost = totalCost;
                        // 更新最小总代价对应的方向
                        minDirection = neighbor.subtract(current);
                    }
                }
                // 设置当前格子的流动方向
                this.grid[y][x].direction = minDirection;
            }
        }
    }

    // 获取指定格子相邻格子的方法
    private getNeighbors(position: Vec2): Vec2[] {
        // 存储相邻格子的数组
        const neighbors: Vec2[] = [];
        // 定义四个方向的偏移量，分别为左、右、下、上
        const directions = [
            new Vec2(-1, 0), new Vec2(1, 0),
            new Vec2(0, -1), new Vec2(0, 1)
        ];
        // 遍历四个方向
        for (const dir of directions) {
            // 计算相邻格子的 x 坐标
            const newX = position.x + dir.x;
            // 计算相邻格子的 y 坐标
            const newY = position.y + dir.y;
            // 如果相邻格子在地图范围内
            if (newX >= 0 && newX < this.gridSize.x && newY >= 0 && newY < this.gridSize.y) {
                // 将相邻格子的坐标加入 neighbors 数组
                neighbors.push(new Vec2(newX, newY));
            }
        }
        return neighbors;
    }

    public getDirection(position: Vec2): Vec2 {
        const x = Math.floor(position.x / this.tileSize.x);
        const y = Math.floor(position.y / this.tileSize.y);
        if (x >= 0 && x < this.gridSize.x && y >= 0 && y < this.gridSize.y) {
            return this.grid[y][x].direction;
        }
        return new Vec2(0, 0);
    }

    // 打印流场得分的方法
    private printFlowFieldScores() {
        console.log('Flow Field Scores:');
        for (let y = 0; y < this.gridSize.y; y++) {
            let rowScores = '';
            for (let x = 0; x < this.gridSize.x; x++) {
                const scores = this.grid[y][x].integrationCosts;
                const totalScore = scores.reduce((sum, score) => sum + score, 0);
                rowScores += `${totalScore.toFixed(2)}\t`;
            }
            console.log(rowScores);
        }
    }
}    