import L from 'leaflet';

/**
 * @class MapSheetGrid
 * 地图分幅网格
 */

class MapSheetGrid {
    constructor(mapCode) {
        this.mapCode = mapCode;
        this.center = getCenter(mapCode);
        this.shape = createShape(mapCode);
        this.marker = createMarker(mapCode);
    }

    setShapeStyle(fillColor, fillOpacity) {
        this.shape.setStyle({ fillColor: fillColor, fillOpacity: fillOpacity });
    }

    setMaker(text, className, iconSize) {
        let textDiv = this.marker.getIcon();
        textDiv.options.html = text;
        textDiv.options.className = className;
        textDiv.options.iconSize = iconSize;
        this.marker.setIcon(textDiv);
    }

    addToLayer(gridLayers) {
        gridLayers.addLayer(this.shape);
        gridLayers.addLayer(this.marker);
    }
}

function createShape(mapCode) {
    let bounds = getBounds(mapCode);
    return L.rectangle(bounds, { color: "red", fillColor: 'transparent', weight: 1 });
}

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

function getCenter(mapCode) {
    return getBounds(mapCode).getCenter();
}

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

export default MapSheetGrid;