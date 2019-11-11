/**
 * @class MapSheet
 * 根据指定范围及比例尺创建分幅格网
 */
class MapSheet {
    constructor(bounds, scale) {
        if (bounds) {
            this.bounds = bounds;       // 图幅范围
        } else {
            throw new Error("未定义图幅范围！！！");
        }
        this.scale = scale ? scale : 1000000;
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
        // 获取经差纬差
        let latDiff = getLatLngDiff(this.scale).latDiff;
        let lngDiff = getLatLngDiff(this.scale).lngDiff;
        // 计算图幅行列总数
        let rowCount = Math.ceil(northLatitude / latDiff) - Math.floor(southLatitude / latDiff);
        let colCount = Math.ceil(eastLongitude / lngDiff) - Math.floor(westLongitude / lngDiff);
        // 将图幅编号添加至图幅编号数组
        for (let i = 0; i < rowCount; i++) {
            for (let j = 0; j < colCount; j++) {
                let latitude = northLatitude - (i * latDiff);
                let longitude = westLongitude + (j * lngDiff);
                let mapCode = this.getMapCode(latitude, longitude);
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
    getMapCode(latitude, longitude) {
        // 计算1:100万行号
        let rowIndex = parseInt(Math.ceil(Math.abs(latitude) / 4));
        let rowIndexChar = "";
        if (latitude <= 0 && (latitude % 4) === 0) {
            rowIndexChar = String.fromCharCode(rowIndex + 65);  // 南半球临界值归属为下面的图幅
        } else {
            rowIndexChar = String.fromCharCode(rowIndex - 1 + 65);
        }
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
            mapCode += getScaleCode(this.scale) + row + col;
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
        default:
    }
}

/**
 * 根据比例尺获取比例尺代码
 * @param {number} scale 比例尺
 * @returns {string} 比例尺代码
 */
function getScaleCode(scale) {
    switch (scale) {
        case 500000:
            return "B";
        default:
    }
}

/**
 * 获取比例尺大于1:1000000的图幅行号
 * @param {number} scale 比例尺
 * @param {number} latitude 纬度
 * @returns {string} 图幅行号
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
 * @param {number} scale 比例尺
 * @param {number} longitude 经度
 * @returns {string} 图幅列号
 */
function getColNum(scale, longitude) {
    let lngDiff = getLatLngDiff(scale).lngDiff;
    if (longitude % lngDiff === 0 && longitude < 0) {
        longitude += lngDiff;
    }
    if (longitude === 180) {
        longitude -= lngDiff;
    }
    let col = 0;
    if (longitude < 0) {
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

export default MapSheet;