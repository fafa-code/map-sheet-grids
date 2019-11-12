import L from 'leaflet';
import MapSheet from './mapSheet';
import MapSheeetGrid from './mapSheetGrid';

/**
 * @class DrawMapGrids
 * 绘制地图格网
 */

class DrawMapGrids {
    constructor(map, bounds) {
        this.map = map;             // 地图对象
        this.bounds = bounds;       // 地图分幅范围
        this.mapSheetLayerGroup = null;
    }

    /**
     * 绘制格网并返回网格组
     * @returns {Array<MapSheeetGrid>} 网格组
     */
    drawGrids(fillcolor, fillOpacity) {
        // 获取分幅网格图幅编号数组
        let mapSheetA = new MapSheet(this.bounds, 1000000);
        let girdCodeList = mapSheetA.getGirdCodeList();
        // 初始化分幅格网图层组
        let gridLayers = L.layerGroup();
        // 初始化分幅网格对象数组
        let mapSheetGrids = [];
        // 绘制格网
        for (let i = 0; i < girdCodeList.length; i++) {
            let mapSheetGrid = new MapSheeetGrid(girdCodeList[i]);
            mapSheetGrid.setShapeStyle(fillcolor, fillOpacity);
            mapSheetGrid.addToLayer(gridLayers);
            mapSheetGrids[mapSheetGrid.mapCode] = mapSheetGrid;
        }
        // 将分幅格网添加至地图
        this.mapSheetLayerGroup = gridLayers.addTo(this.map);
        // 返回分幅网格对象数组
        return mapSheetGrids;
    }

    getLayerGroup() {
        return this.mapSheetLayerGroup;
    }
}

export default DrawMapGrids;