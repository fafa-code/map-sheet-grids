import L from 'leaflet';
import MouseOperator from './mouseOperator';
import DrawMapGrids from './drawSheetGrids';

class RectSelectTool extends MouseOperator {
    constructor(map) {
        super(map);
        this.startLatLng = null;
        this.endLatLng = null;
        this.rectangle = null;
        this.gridGroupOfSelected = null;
        this.gridOfSelected = [];
        this.textMarker = null;
    }

    onMouseDown(event) {
        this.startLatLng = event.latlng;
    }

    onMouseMove(event) {
        if (!this.startLatLng || this.gridGroupOfSelected) {
            return;
        }
        if (this.rectangle) {
            this.rectangle.remove();
        }
        this.endLatLng = event.latlng;
        let bounds = L.latLngBounds([this.startLatLng, this.endLatLng]);
        this.rectangle = L.rectangle(bounds, { color: "green", fillColor: 'green', weight: 1 }).addTo(this.map);
    }

    onMouseUp() {
        if (this.gridGroupOfSelected) {
            return;
        }
        if (this.rectangle) {
            this.rectangle.remove();
        }
        let bounds = L.latLngBounds([this.startLatLng, this.endLatLng]);
        // 根据拉框范围绘制分幅格网
        let drawSheetGrids = new DrawMapGrids(this.map, bounds);
        // 获取选中的单个格网对象数组 
        this.gridOfSelected = drawSheetGrids.drawGrids("blue", 0.5);
        // 获取选中的格网图层组
        this.gridGroupOfSelected = drawSheetGrids.getLayerGroup();
        // 添加提示信息
        this.textMarker = getTextInfo(this.gridOfSelected).addTo(this.map);
        // 地图拖动可用
        this.map.dragging.enable();
    }

    onDoubleClick() {
        console.log("添加表单");
    }

    onContextMenu() {
        // 移除选中的格网图层组
        this.gridGroupOfSelected.removeFrom(this.map);
        this.textMarker.remove();
        this.gridOfSelected = null;
        this.unActive();
    }
}

/**
 * 根据请求数据获取数据范围
 * @param {Array<MapSheetGrid>} mapSheetGrids 分幅格网
 * @param {Array<string>} 格网编号数组 
 * @returns {L.LatLngBounds} 数据范围
 */
function getBounds(mapSheetGrids, data) {
    let gridLats = [];    // 格网中心纬度数组
    let gridLngs = [];    // 格网中心经度数组
    for (let i = 0; i < data.length; i++) {
        let bounds = mapSheetGrids[data[i]].shape.getBounds();
        gridLats.push(bounds.getNorth());
        gridLats.push(bounds.getSouth());
        gridLngs.push(bounds.getWest());
        gridLngs.push(bounds.getEast());
    }
    // 对纬度数组排序
    gridLats.sort((lat1, lat2) => {
        return lat1 - lat2;
    });
    // 对经度数组排序
    gridLngs.sort((lng1, lng2) => {
        return lng1 - lng2;
    });
    let southWest = L.latLng(gridLats[0], gridLngs[0]);
    let northEast = L.latLng(gridLats[gridLats.length - 1], gridLngs[gridLngs.length - 1]);
    let bounds = L.latLngBounds(southWest, northEast);
    return bounds;
}

// 添加提示信息
function getTextInfo(gridOfSelected) {
    let mapCodeArray = [];
    // 获取选中的所有格网图幅编码
    for (let item in gridOfSelected) {
        mapCodeArray.push(item);
    }
    let bounds = getBounds(gridOfSelected, mapCodeArray);
    let textLatLng = L.latLng(bounds.getNorth(), bounds.getWest());
    let textDiv = L.divIcon({
        html: "双击下载，右键删除",
        className: 'tipsInfo',
        iconSize: [150, 32],
        iconAnchor: [-6, 26],
    });
    return L.marker(textLatLng, { icon: textDiv });
}

export default RectSelectTool;