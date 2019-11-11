import MapSheet from './mapSheet';

/**
 * @class MapSheetA
 * @inherits MapSheet
 * 构建给定范围的1:1000000地图图幅
 */

class MapSheetA extends MapSheet {
    constructor(scale, bounds) {
        super(bounds);
        this.scale = scale;   // 比例尺
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
                let latitude = northLatitude;
                if (latitude > 0) {
                    latitude = northLatitude - (i * 4);
                } else {
                    latitude = southLatitude + (i * 4);
                }
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
        if (this.scale !== 1000000) {
            let row = getRowNum(this.scale, latitude);
            let col = getColNum(this.scale, longitude);
            mapCode += "B" + row + col;
        }
        return mapCode;
    }

}

/**
 * 根据比例尺获取经差纬差
 * @param {number} scale 比例尺
 * @returns {json} 经纬差
 */
function getLatLngDiff(scale) {
    switch (scale) {
        case 1000000:
            return { latDiff: 4, lngDiff: 6 };
        case 500000:
            return { latDiff: 2, lngDiff: 3 };
    }
}

/**
 * 获取比例尺大于1:1000000的图幅行号
 */
function getRowNum(scale, latitude) {
    let latDiff = getLatLngDiff(scale).latDiff;
    if (latitude % latDiff === 0 && latitude !== 0) {
        latitude -= latDiff;
    }
    let row = 4 / latDiff - Math.floor(Math.abs((latitude % 4) / latDiff));
    row = rowColNumFormatter(row);
    return row;
}

/**
 * 获取比例尺大于1:1000000的图幅列号
 */
function getColNum(scale, longitude) {
    let lngDiff = getLatLngDiff(scale).lngDiff;
    if (longitude % lngDiff === 0 && longitude !== 0 && longitude < 0) {
        longitude += lngDiff;
    }
    if (longitude % lngDiff === 0 && longitude !== 0 && longitude > 0) {
        longitude -= lngDiff;
    } 
    let col = 0;
    if (longitude < 0 ) {
        col = Math.ceil((longitude % 6.0) / lngDiff + 1);
    } else {
        col = Math.floor((longitude % 6.0) / lngDiff + 1);
    }
    col = rowColNumFormatter(col);
    return col;
}

/**
 * 格式化行列号
 * @param {number} num 
 * @returns {string} 格式化之后的行列号
 */
function rowColNumFormatter(num) {
    let result = "";
    // 判断行列号的长度
    let numFlag = ("" + num).length;
    if (numFlag === 1) {
        result = "00" + num;
    }
    if (numFlag === 2) {
        result = "0" + num;
    }
    if (numFlag === 3) {
        result = "" + num;
    }
    return result;
}

export default MapSheetA;