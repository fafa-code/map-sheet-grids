import L from 'leaflet';

/**
 * 根据经纬度获取图幅编号
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @returns {string} 地图图幅编号
 */
export function getMapCodeA(latitude, longitude) {
    // 计算1:100万行号
    let rowIndex = parseInt(Math.ceil(Math.abs(latitude) / 4));
    let rowIndexChar = String.fromCharCode(rowIndex - 1 + 65);
    // 计算1:100万列号
    let colIndex = 0;
    if (longitude === -180) {
        colIndex = 2;
    } else if (longitude === 180) {
        colIndex = 60;
    } else {
        colIndex = (longitude < 0) ? parseInt(Math.ceil(longitude / 6.0) + 31) : parseInt(Math.floor(longitude / 6) + 31);
    }
    // 拼接图幅编号
    let mapCode = "";
    mapCode += (latitude > 0) ? rowIndexChar : "S" + rowIndexChar;
    mapCode += (colIndex < 10) ? "0" + colIndex : colIndex;
    return mapCode;
}

/**
 * 根据图幅号获取经纬度范围
 * @param {string} mapCode 
 * @returns {L.latLngBounds} 地理范围
 */
export function getLatLngBounds(mapCode) {
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
