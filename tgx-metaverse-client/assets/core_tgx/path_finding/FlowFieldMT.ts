import { _decorator, Component, TiledMap, TiledLayer, Vec2, Node } from 'cc';
const { ccclass, property } = _decorator;

// 格子类，用于表示地图中的每个格子
class GridCell {
    // 该格子的移动代价，值为 Infinity 表示不可通行，值为 1 表示可通行
    public cost: number;
    // 存储每个目标对应的累积代价
    public integrationCost: number;
    // 该格子的流动方向，是一个二维向量
    public direction: Vec2;

    // 构造函数，初始化格子的移动代价
    constructor(cost: number) {
        this.cost = cost;
        this.integrationCost = Infinity;
        this.direction = new Vec2(0, 0);
    }
}

// 定义 FlowField 类，继承自 Cocos Creator 的 Component 类
@ccclass('FlowFieldMT')
export class FlowFieldMT extends Component {
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

    // 二维数组，存储地图中每个格子的信息，每个目标对应一个 grid
    private grids: GridCell[][][];
    // 最终流场得分
    private finalGrid: GridCell[][];
    // 每个格子的大小，是一个二维向量
    private tileSize: Vec2;
    // 地图的大小，以格子数量为单位，是一个二维向量
    private gridSize: Vec2;

    // 组件开始运行时调用的方法
    start() {
        if (this.tiledMap) {
            // 初始化地图网格
            this.initGrid();
            setTimeout(() => {
                this.updateFlowField();
            }, 1000);
            this.schedule(this.updateFlowField, 5); // 每隔 5 秒更新流场积分
        }
    }

    private initGrid() {
        const tileSize = this.tiledMap!.getTileSize();
        this.tileSize = new Vec2(tileSize.width * this.scale, tileSize.height * this.scale); // 乘以 scale
        const walkableLayer = this.tiledMap!.getLayer('2');
        const wallLayer = this.tiledMap!.getLayer('3');
        const mapSize = this.tiledMap!.getMapSize();
        this.gridSize = new Vec2(mapSize.width, mapSize.height);

        this.grids = [];
        this.finalGrid = [];
        for (let y = 0; y < this.gridSize.y; y++) {
            this.finalGrid[y] = [];
            for (let x = 0; x < this.gridSize.x; x++) {
                const walkableLayer = this.tiledMap!.getLayer('2');
                const wallLayer = this.tiledMap!.getLayer('3');
                let cost = Infinity;
                const walkableTile = walkableLayer?.getTileGIDAt(x, y);
                const wallTile = wallLayer?.getTileGIDAt(x, y);

                if (walkableTile!== 0 && wallTile === 0) {
                    cost = 1;
                }
                this.finalGrid[y][x] = new GridCell(cost);
            }
        }
    }

    private updateFlowField() {
        // 重置 grids
        this.grids = [];

        if (this.targets && this.targets.children.length > 0) {
            const targets: Vec2[] = [];
            this.targets.children.forEach(child => {
                const worldPosition = child.getWorldPosition();
                const tileX = Math.floor(Math.abs((worldPosition.x + this.offsetX)) / this.tileSize.x);
                const tileY = Math.floor(Math.abs((worldPosition.y + this.offsetY)) / this.tileSize.y);
                targets.push(new Vec2(tileX, tileY));
                // console.log('TargetsWPos:', worldPosition.x, worldPosition.y); // 输出获取到的目标点坐标
            });
            // console.log('Targets:', targets); // 输出获取到的目标点坐标

            // 为每个目标创建一个新的 grid
            for (let i = 0; i < targets.length; i++) {
                const grid: GridCell[][] = [];
                for (let y = 0; y < this.gridSize.y; y++) {
                    grid[y] = [];
                    for (let x = 0; x < this.gridSize.x; x++) {
                        const walkableLayer = this.tiledMap!.getLayer('2');
                        const wallLayer = this.tiledMap!.getLayer('3');
                        let cost = Infinity;
                        const walkableTile = walkableLayer?.getTileGIDAt(x, y);
                        const wallTile = wallLayer?.getTileGIDAt(x, y);

                        if (walkableTile!== 0 && wallTile === 0) {
                            cost = 1;
                        }
                        grid[y][x] = new GridCell(cost);
                    }
                }
                this.grids.push(grid);
                this.calculateIntegrationField(i, targets[i]);
            }

            // 计算最终流场得分
            this.calculateFinalGrid();
            // 计算最终的流动方向
            this.calculateFlowField();
            // this.printFlowFieldScores();
            // this.printFlowFieldDirections(); // 调用打印流场方向的方法
        }
    }

    // 计算单个目标的积分场的方法，采用四邻居
    private calculateIntegrationField(gridIndex: number, target: Vec2) {
        const grid = this.grids[gridIndex];
        const openList: Vec2[] = [target];
        grid[target.y][target.x].integrationCost = 0;

        while (openList.length > 0) {
            const current = openList.shift()!;
            const neighbors = this.getFourNeighbors(current);
            for (const neighbor of neighbors) {
                const newCost = grid[current.y][current.x].integrationCost + grid[neighbor.y][neighbor.x].cost;
                if (newCost < grid[neighbor.y][neighbor.x].integrationCost) {
                    grid[neighbor.y][neighbor.x].integrationCost = newCost;
                    openList.push(neighbor);
                }
            }
        }
    }

    // 获取指定格子相邻四个格子的方法
    private getFourNeighbors(position: Vec2): Vec2[] {
        const neighbors: Vec2[] = [];
        const directions = [
            new Vec2(-1, 0), new Vec2(1, 0),
            new Vec2(0, -1), new Vec2(0, 1)
        ];
        for (const dir of directions) {
            const newX = position.x + dir.x;
            const newY = position.y + dir.y;
            if (newX >= 0 && newX < this.gridSize.x && newY >= 0 && newY < this.gridSize.y) {
                neighbors.push(new Vec2(newX, newY));
            }
        }
        return neighbors;
    }

    // 获取指定格子相邻八个格子的方法
    private getEightNeighbors(position: Vec2): Vec2[] {
        const neighbors: Vec2[] = [];
        const directions = [
            new Vec2(-1, 0), new Vec2(1, 0),
            new Vec2(0, -1), new Vec2(0, 1),
            new Vec2(-1, -1), new Vec2(-1, 1),
            new Vec2(1, -1), new Vec2(1, 1)
        ];
        for (const dir of directions) {
            const newX = position.x + dir.x;
            const newY = position.y + dir.y;
            if (newX >= 0 && newX < this.gridSize.x && newY >= 0 && newY < this.gridSize.y) {
                neighbors.push(new Vec2(newX, newY));
            }
        }
        return neighbors;
    }

    // 计算最终流场得分
    private calculateFinalGrid() {
        for (let y = 0; y < this.gridSize.y; y++) {
            for (let x = 0; x < this.gridSize.x; x++) {
                let minCost = Infinity;
                for (let i = 0; i < this.grids.length; i++) {
                    const cost = this.grids[i][y][x].integrationCost;
                    if (cost < minCost) {
                        minCost = cost;
                    }
                }
                this.finalGrid[y][x].integrationCost = minCost;
            }
        }
    }

    // 计算最终的流动场的方法，采用八邻居
    private calculateFlowField() {
        for (let y = 0; y < this.gridSize.y; y++) {
            for (let x = 0; x < this.gridSize.x; x++) {
                const current = new Vec2(x, y);
                const neighbors = this.getEightNeighbors(current);
                let minCost = Infinity;
                let bestDirection = new Vec2(0, 0);
                for (const neighbor of neighbors) {
                    const cost = this.finalGrid[neighbor.y][neighbor.x].integrationCost;
                    if (cost < minCost) {
                        minCost = cost;
                        bestDirection = neighbor.subtract(current);
                    }
                }
                this.finalGrid[y][x].direction = bestDirection;
            }
        }
    }

    public getDirection(position: Vec2): Vec2 {
        const x = Math.floor(Math.abs((position.x + this.offsetX)) / this.tileSize.x);
        const y = Math.floor(Math.abs((position.y + this.offsetY)) / this.tileSize.y);
        if (x >= 0 && x < this.gridSize.x && y >= 0 && y < this.gridSize.y) {
            return this.finalGrid[y][x].direction;
        }
        return new Vec2(0, 0);
    }

    // 打印流场得分的方法
    private printFlowFieldScores() {
        console.log('Final Flow Field Scores:');
        for (let y = 0; y < this.gridSize.y; y++) {
            let rowScores = '';
            for (let x = 0; x < this.gridSize.x; x++) {
                const score = this.finalGrid[y][x].integrationCost;
                rowScores += `${score.toFixed(2)}\t`;
            }
            console.log(rowScores);
        }
    }

    // 打印流场方向的方法
    private printFlowFieldDirections() {
        console.log('Flow Field Directions:');
        for (let y = 0; y < this.gridSize.y; y++) {
            let rowDirections = '';
            for (let x = 0; x < this.gridSize.x; x++) {
                const direction = this.finalGrid[y][x].direction;
                let arrow = 'X';
                if (direction.x > 0 && direction.y === 0) {
                    arrow = '→';
                } else if (direction.x < 0 && direction.y === 0) {
                    arrow = '←';
                } else if (direction.y > 0 && direction.x === 0) {
                    arrow = '↓';
                } else if (direction.y < 0 && direction.x === 0) {
                    arrow = '↑';
                } else if (direction.x > 0 && direction.y > 0) {
                    arrow = '↘';
                } else if (direction.x > 0 && direction.y < 0) {
                    arrow = '↗';
                } else if (direction.x < 0 && direction.y > 0) {
                    arrow = '↙';
                } else if (direction.x < 0 && direction.y < 0) {
                    arrow = '↖';
                }
                rowDirections += arrow + ' ';
            }
            console.log(rowDirections);
        }
    }
}    