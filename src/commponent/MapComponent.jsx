import React from 'react';
import L from 'leaflet';
import '../index.css';
import DrawMapGrids from '../map/drawSheetGrids';

class MapComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mapCodeInput: "",   // 输入的图幅编号
            map: null,          // 地图对象
            mapSheetGrids: [],  // 分幅网格对象数组
        }
    }

    /**
     * 处理表单内容改变事件
     * @param {Object} event 事件对象
     */
    handleChange(event) {
        // 更新状态
        this.setState({
            mapCodeInput: event.target.value,
        });
    }

    /**
     * 处理查询按钮点击事件
     */
    onHandleQueryClick() {
        let mapCode = this.state.mapCodeInput;
        let mapSheetGrids = this.state.mapSheetGrids;
        let map = this.state.map;
        let url = "http://10.16.28.19:8080/gx-image-helper-app/landi/rest/tileserver/query?mapCode=" + mapCode;
        this.promiseRequest(url).then((result) => {
            if (result) {
                mapSheetGrids[mapCode].setShapeStyle('blue');
                map.setView(mapSheetGrids[mapCode].center, 6);
            }
        });
    }

    /**
     * 处理地图点击事件
     * @param {Array<MapSheeetGrid>} mapSheetGrids 分幅网格对象数组
     * @param {L.MouseEvent} event 地图点击事件对象
     */
    onMapClick(mapSheetGrids, event) {
        // let mapCode = mapSheetTools.getMapCodeA(event.latlng.lat, event.latlng.lng);
        // console.log(mapSheetGrids[mapCode]);
        console.log(event.latlng);
    }

    getCenter(data) {
        let row = [];
        let col = [];
        for (let i = 0; i < data.length; i++) {
            row.push(parseInt(data[i].name.substring(0, 1).charCodeAt() - 65));
            col.push(parseInt(data[i].name.substring(1)));
        }
        row.sort((value1, value2) => value1 - value2);
        col.sort((value1, value2) => value1 - value2);
        let centerLat = row[0] * 4 + ((row[row.length - 1] + 1) * 4 - row[0] * 4) / 2;
        let lngMin = col[0] > 31 ? ((col[0] - 31) * 6) : ((col[0] - 32) * 6);
        let lngMax = col[row.length - 1] > 31 ? ((col[row.length - 1] - 30) * 6) : ((col[row.length - 1] - 31) * 6);
        let centerLng = lngMin + (lngMax - lngMin) / 2;
        
        let center = L.latLng(centerLat, centerLng);
        console.log(center);
        return center;
    }

    /**
     * Promise请求
     * @param {string} url 请求url
     * @returns {Promise} Promise对象
     */
    promiseRequest(url) {
        const promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.send();
            xhr.onload = function () {
                if (this.status === 200) {
                    let result = JSON.parse(xhr.responseText)
                    resolve(result)
                } else {
                    console.log("请求失败！");
                    reject("请求失败！");
                }
            }
        });
        return promise;
    }

    componentDidMount() {

        // 设置地图显示范围
        let corner1 = L.latLng(-85, -180),
            corner2 = L.latLng(85, 180),
            bounds = L.latLngBounds(corner1, corner2);

        // 初始化地图
        let map = L.map('mapid', {
            center: [31.298, 120.583],
            zoom: 11,
            attributionControl: false,
            maxBounds: bounds,
        });
        this.setState({ map: map });

        // 将切片添加至地图
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            minZoom: 1,
            maxZoom: 18,
            id: 'mapbox.streets'
        }).addTo(map);

        // 设置图幅绘制范围
        let southWest = L.latLng(0, -6),
            northEast = L.latLng(4, -12),
            drawBounds = L.latLngBounds(southWest, northEast);

        // 绘制地图分幅格网
        let drawSheetGrids = new DrawMapGrids(map, drawBounds);
        let mapSheetGrids = drawSheetGrids.drawGrids();
        // console.log(mapSheetGrids);
        // 模拟数据
        // let data = [
        //     { name: "H51", status: -1 },
        //     { name: "I47", status: 0 },
        //     { name: "J51", status: 1 },
        // ];
        // for (let i = 0; i < data.length; i++) {
        //     if (data[i].status === -1) {
        //         mapSheetGrids[data[i].name].setShapeStyle('red', 0.5);
        //     } else if (data[i].status === 0) {
        //         mapSheetGrids[data[i].name].setShapeStyle('#49ef04', 0.5);
        //     } else {
        //         mapSheetGrids[data[i].name].setShapeStyle('blue', 0.5);
        //     }
        // }
        // let center = this.getCenter(data);
        // map.setView(center, 5);
        // let url = "http://10.16.28.19:8080/gx-image-helper-app/landi/rest/tileserver/queryAll";
        // this.promiseRequest(url).then((result) => {
        //     for (let i = 0; i < result.length; i++) {
        //         if (result[i].status === -1) {
        //             mapSheetGrids[result[i].name].setShapeStyle('red', 0.5);
        //         } else if (result[i].status === 0) {
        //             mapSheetGrids[result[i].name].setShapeStyle('#49ef04', 0.5);
        //         } else {
        //             mapSheetGrids[result[i].name].setShapeStyle('blue', 0.5);
        //         }
        //     }
        // });

        // 设置state并给地图添加监听事件
        this.setState({ mapSheetGrids: mapSheetGrids });
        map.on('click', this.onMapClick.bind(this, mapSheetGrids));
    }

    render() {
        return (
            <div>
                <div id="mapid" className="mapContainer"></div>
                <div className="queryDiv">
                    <input className="qureyInput" type="text" name="mapCode" placeholder="请输入图幅编号" autoComplete="off" onChange={this.handleChange.bind(this)} />
                    <button className="queryBtn" onClick={this.onHandleQueryClick.bind(this, this.state.map)}>查询</button>
                </div>
            </div>
        );
    }
}

export default MapComponent;