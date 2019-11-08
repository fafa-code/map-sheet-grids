class MapSheet {
    constructor(bounds) {
        if (bounds) {
            this.bounds = bounds;       // 图幅范围
        } else {
            throw new Error("未定义图幅范围！！！");
        }
    }

    /**
     * 抽象方法，获取图幅行列总数
     */
    getRowColCount() {
        throw new Error('Unimplemented abstract method.');
    }
}

export default MapSheet;