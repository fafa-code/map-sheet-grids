import L from 'leaflet';
import { polygon as Polygon, lineString as LineString } from '@turf/helpers';
import intersect from '@turf/intersect';
import booleanCrosses from '@turf/boolean-crosses';
import MouseOperator from './mouseOperator';
import DrawMapGrids from './drawSheetGrids';

class PolygonSelectTool extends MouseOperator {
    constructor(map) {
        super(map);
        this.paths = [];
        this.polygon = null;
        this.textMarker = null;
        this.gridGroupOfSelected = null;
        this.gridOfSelected = [];
    }

    /**
     * 鼠标单击
     * @param {object} event 事件对象 
     */
    onClick(event) {
        let value1 = event.latlng + "";
        let value2 = this.paths[this.paths.length - 1] + "";
        if (value1 !== value2) {
            this.paths.push(event.latlng);
        }
    }

    /**
     * 鼠标移动
     * @param {object} event 事件对象
     */
    onMouseMove(event) {
        if (this.paths.length === 0 || this.gridGroupOfSelected) {
            return;
        }
        if (this.polygon) {
            this.polygon.remove();
        }
        let paths = this.paths.slice();
        paths.push(event.latlng);
        this.polygon = L.polygon(paths, { color: 'red' }).addTo(this.map);
    }

    /**
     * 鼠标双击
     * @param {object} event 事件对象
     */
    onDoubleClick() {
        if (this.paths.length < 2) {
            this.map.dragging.enable();
            this.paths = null;
            this.unActive();
            return;
        }
        if (this.gridGroupOfSelected) {
            console.log("添加表单");
        } else {
            let bounds = this.polygon.getBounds();
            // 根据拉框范围绘制分幅格网
            let drawSheetGrids = new DrawMapGrids(this.map, bounds);
            this.gridOfSelected = drawSheetGrids.drawGrids("blue", 0.5);
            this.gridGroupOfSelected = drawSheetGrids.getLayerGroup();
            for (let key in this.gridOfSelected) {
                let selected = isIntersected(this.gridOfSelected[key].shape, this.polygon);
                if (!selected) {
                    this.gridGroupOfSelected.removeLayer(this.gridOfSelected[key].shape);
                    this.gridGroupOfSelected.removeLayer(this.gridOfSelected[key].marker);
                }
            }
            this.polygon.remove();
            // 添加提示信息
            this.textMarker = getTextInfo(this.gridOfSelected).addTo(this.map);
            // 地图拖动可用
            this.map.dragging.enable();
        }
    }

    onContextMenu() {
        this.reset();
    }

    reset() {
        this.map.dragging.enable();
        this.paths = null;
        if (this.polygon) {
            this.polygon.remove();
            this.polygon = null;
        }
        if (this.textMarker) {
            this.textMarker.remove();
            this.textMarker = null;
        }
        if (this.gridGroupOfSelected) {
            this.gridGroupOfSelected.remove();
            this.gridGroupOfSelected = null;
        }
        this.gridOfSelected = null;
        this.unActive();
    }

    onMouseDown() {

    }

    onMouseUp() {

    }

}

function isIntersected(grid, polygon) {
    let gridRings = grid.toGeoJSON().geometry.coordinates;
    let polygonRings = polygon.toGeoJSON().geometry.coordinates;
    let gridPoly = Polygon(gridRings);
    let polygonPoly = [];
    let intersection = false;
    if (polygonRings[0].length < 4) {
        polygonPoly = LineString(polygonRings[0]);
        intersection = booleanCrosses(polygonPoly, gridPoly);
    } else {
        polygonPoly = Polygon(polygonRings);
        intersection = intersect(gridPoly, polygonPoly) ? true : false;
    }
    // console.log(intersection);
    return intersection;
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

export default PolygonSelectTool;