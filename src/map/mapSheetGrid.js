import L from 'leaflet';

/**
 * @class MapSheetGrid
 * 地图分幅网格
 */

class MapSheetGrid {
    constructor(mapCode) {
        this.mapCode = mapCode;                 // 图幅编号
        this.center = getCenter(mapCode);       // 图幅中心点
        this.shape = createShape(mapCode);      // 图幅外观
        this.marker = createMarker(mapCode);    // 图幅注记
    }

    /**
     * 设置图幅外观样式
     * @param {string} fillColor 填充色
     * @param {number} fillOpacity 透明度
     */
    setShapeStyle(fillColor, fillOpacity) {
        fillColor = fillColor ? fillColor : "transparent";
        this.shape.setStyle({ fillColor: fillColor, fillOpacity: fillOpacity });
    }

    /**
     * 设置图幅注记内容及样式
     * @param {string} text 注记内容
     * @param {string} className 样式名称
     * @param {Array<number>} iconSize 注记尺寸
     */
    setMaker(text, className, iconSize) {
        let textDiv = this.marker.getIcon();
        textDiv.options.html = text;
        textDiv.options.className = className;
        textDiv.options.iconSize = iconSize;
        this.marker.setIcon(textDiv);
    }

    /**
     * 将图幅外形及图幅注记添加至图层组
     * @param {L.LayerGroup} gridLayers 
     */
    addToLayer(gridLayers) {
        gridLayers.addLayer(this.shape);
        gridLayers.addLayer(this.marker);
    }
}

/**
 * 创建图幅外观
 * @param {string} mapCode 图幅编号
 * @returns {L.Rectangle} 图幅外观 
 */
function createShape(mapCode) {
    let bounds = getBounds(mapCode);
    return L.rectangle(bounds, { color: "red", fillColor: 'transparent', weight: 1 });
}

/**
 * 创建图幅注记
 * @param {string} mapCode 
 * @returns {L.Marker} 图幅注记
 */
function createMarker(mapCode) {
    let center = getCenter(mapCode);
    let textDiv = L.divIcon({
        html: mapCode,
        className: 'my-div-icon',
        iconSize: [20, 20],
    });
    let textMarker = L.marker(center, { icon: textDiv });
    return textMarker;
}

/**
 * 获取图幅中心点
 * @param {string} mapCode 
 * @returns {L.LatLng} 图幅中心点
 */
function getCenter(mapCode) {
    return getBounds(mapCode).getCenter();
}

/**
 * 获取图幅范围
 * @param {string} mapCode
 * @returns {L.LatLngBounds} 图幅范围 
 */
function getBounds(mapCode) {
    // 判断是否为南半球
    let latFlag = false;
    // 获取图幅编号的第二位， 
    let secondOfMapCode = mapCode.substring(1, 2).toUpperCase().charAt(0).charCodeAt();
    // 若图幅位于南半球，则取第二位之后的部分作为图幅号
    if (65 <= secondOfMapCode && 90 >= secondOfMapCode && "S".startsWith(mapCode.substring(0, 1).toUpperCase())) {
        latFlag = true;
        mapCode = mapCode.toUpperCase().substring(1);
    }
    // 地理范围经纬度的最值
    let minLat, minLng, maxLat, maxLng;
    let rowIndex = (mapCode.substring(0, 1).toUpperCase().charCodeAt() - 65);
    let colIndex = parseInt(mapCode.substring(1, 3)) - 31;
    // 获取纬度最大最小值
    minLat = rowIndex * 4;
    maxLat = (minLat + 4) < 85 ? (minLat + 4) : 85;
    // 获取经度最大最小值
    if (colIndex > 0) {
        minLng = colIndex * 6;
        maxLng = minLng + 6;
    } else if (colIndex === 0) {
        minLng = -6;
        maxLng = 6;
    } else {
        minLng = colIndex * 6;
        maxLng = minLng - 6;
    }
    // 获取其它比例尺下经纬度最大最小值
    if (mapCode.length > 3) {
        let row = parseInt(mapCode.substring(4, 7));
        let col = parseInt(mapCode.substring(7, 10));
        // 根据比例尺代码获取经差纬差
        let scaleCode = mapCode.substring(3, 4);
        let latLngDiff = getLatLngDiff(scaleCode);
        // 获取纬度最大最小值
        minLat = (4.0 / 2 - row) * latLngDiff.latDiff + minLat;
        maxLat = minLat + latLngDiff.latDiff;
        if (colIndex > 0) {
            minLng = (col - 1) * latLngDiff.lngDiff + minLng;
            maxLng = minLng + latLngDiff.lngDiff;
        } else {
            minLng = (col - 1) * latLngDiff.lngDiff + minLng;
            maxLng = minLng - latLngDiff.lngDiff;
        }
    }
    // 设置地理范围
    let latLngBounds = null;
    if (!latFlag) {
        let southWest = L.latLng(minLat, minLng);
        let northEast = L.latLng(maxLat, maxLng);
        latLngBounds = L.latLngBounds(southWest, northEast);
    } else {
        let southWest = L.latLng(-maxLat, minLng);
        let northEast = L.latLng(-minLat, maxLng);
        latLngBounds = L.latLngBounds(southWest, northEast);
    }
    return latLngBounds;
}

/**
 * 获取经纬差
 * @param {string} scaleCode 比例尺代码
 * @returns {json} 经差纬差
 */
function getLatLngDiff(scaleCode) {
    switch (scaleCode) {
        case "B":
            return { latDiff: 2, lngDiff: 3 };
        default:
    }
}

export default MapSheetGrid;