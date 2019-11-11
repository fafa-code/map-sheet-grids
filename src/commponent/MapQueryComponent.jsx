import React from 'react';
import L from 'leaflet';
import '../index.css';

class MapQueryComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mapCodeInput: "",
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
     * 查询所有格网状态
     */
    onHandleQueryAllClick() {
        let data = [
            { name: "H45", status: -1 },
            { name: "I47", status: 0 },
            { name: "K51", status: 1 },
            { name: "J44", status: 1 }
        ];
        let mapSheetGrids = this.props.mapSheetGrids;
        for (let i = 0; i < data.length; i++) {
            if (data[i].status === -1) {
                mapSheetGrids[data[i].name].setShapeStyle('red', 0.5);
            } else if (data[i].status === 0) {
                mapSheetGrids[data[i].name].setShapeStyle('#49ef04', 0.5);
            } else {
                mapSheetGrids[data[i].name].setShapeStyle('blue', 0.5);
            }
        }
        let center = this.getCenter(mapSheetGrids, data);
        let map = this.props.map;
        map.setView(center, 5);
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
    }

    /**
     * 获取请求后返回的格网的中心点
     * @param {Array<MapSheetGrid>} mapSheetGrids 分幅格网
     * @param {json} data 请求结果数据
     */
    getCenter(mapSheetGrids, data) {
        let gridCenterLats = [];    // 格网中心纬度数组
        let gridCenterLngs = [];    // 格网中心经度数组
        for (let i = 0; i < data.length; i++) {
            let gridCenter = mapSheetGrids[data[i].name].center;
            gridCenterLats.push(gridCenter.lat);
            gridCenterLngs.push(gridCenter.lng);
        }
        // 对纬度数组排序
        gridCenterLats.sort((lat1, lat2) => {
            return lat1 - lat2;
        });
        // 对经度数组排序
        gridCenterLngs.sort((lng1, lng2) => {
            return lng1 - lng2;
        });
        let lat = (gridCenterLats[0] + gridCenterLats[gridCenterLats.length - 1]) / 2;
        let lng = (gridCenterLngs[0] + gridCenterLngs[gridCenterLngs.length - 1]) / 2;
        let center = L.latLng(lat, lng);
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

    render() {
        return (
            <div className="queryDiv">
                <input className="qureyInput" type="text" name="mapCode" placeholder="请输入图幅编号" autoComplete="off" onChange={this.handleChange.bind(this)} />
                <button className="queryBtn" onClick={this.onHandleQueryClick.bind(this, this.state.map)}>查询</button>
                <button className="queryStatusBtn" onClick={this.onHandleQueryAllClick.bind(this, this.state.map)}>查询下载状态</button>
            </div>
        )
    }
}

export default MapQueryComponent;