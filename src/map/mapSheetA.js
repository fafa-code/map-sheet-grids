import MapSheet from './mapSheet';

/**
 * @class MapSheetA
 * @inherits MapSheet
 * 构建给定范围的1:1000000地图图幅
 */

class MapSheetA extends MapSheet {
    constructor(bounds) {
        super(bounds);
        this.scale = 1000000;   // 比例尺
    }

    /**
     * 获取图幅编号数组
     * @returns {Array<string>} 图幅编号数组
     */
    getGirdCodeList() {
        // 初始化图幅编号数组
        let girdCodeList = [];
        // 获取图幅范围的经纬度
        let northLatitude = this.bounds.getNorth();
        let southLatitude = this.bounds.getSouth();
        let westLongitude = this.bounds.getWest();
        let eastLongitude = this.bounds.getEast();
        // 计算图幅行列总数
        let rowCount = Math.ceil(northLatitude / 4) - Math.floor(southLatitude / 4);
        let colCount = Math.ceil(eastLongitude / 6) - Math.floor(westLongitude / 6);
        // 将图幅编号添加至图幅编号数组
        for (let i = 0; i < rowCount; i++) {
            for (let j = 0; j < colCount; j++) {
                let latitude = northLatitude - (i * 4);
                let longitude = westLongitude + (j * 6);
                let mapCode = this.getMapCodeA(latitude, longitude);
                girdCodeList.push(mapCode);
            }
        }
        return girdCodeList;
    }

    /**
     * 根据经纬度获取分幅编号
     * @param {number} latitude     // 纬度
     * @param {number} longitude    // 经度
     * @returns {string} 分幅编号
     */
    getMapCodeA(latitude, longitude) {
        // 计算1:100万行号
        let rowIndex = parseInt(Math.ceil(Math.abs(latitude) / 4));
        let rowIndexChar = (rowIndex !== 0) ? String.fromCharCode(rowIndex - 1 + 65) : "A";
        // 计算1:100万列号
        let colIndex = 0;
        if (longitude < 0 && (longitude % 6) === 0) {       // 如果经度小于零且为临界点，则将其归属为右侧的图幅
            colIndex = 32 + (longitude / 6);
        } else if (longitude === 180) {                     // 如果经度为180，则将其归属为左侧的图幅
            colIndex = 60;
        } else {
            colIndex = (longitude < 0) ? parseInt(Math.ceil(longitude / 6.0) + 31) : parseInt(Math.floor(longitude / 6) + 31);
        }
        // 拼接图幅编号
        let mapCode = "";
        // 如果纬度小于零(南半球)，在编号前添加"S"
        mapCode += (latitude > 0) ? rowIndexChar : "S" + rowIndexChar;
        // 如果列号小于10，在列号前补零
        mapCode += (colIndex < 10) ? "0" + colIndex : colIndex;
        return mapCode;
    }

}

export default MapSheetA;