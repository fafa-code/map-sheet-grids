import React from 'react';
import L from 'leaflet';
import '../index.css';
import DrawMapGrids from '../map/drawSheetGrids';

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
        let mapSheetGrids = this.props.mapSheetGrids;
        let map = this.props.map;
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
        let mapCodeArray = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].status === -1) {
                mapSheetGrids[data[i].name].setShapeStyle('red', 0.5);
            } else if (data[i].status === 0) {
                mapSheetGrids[data[i].name].setShapeStyle('#49ef04', 0.5);
            } else {
                mapSheetGrids[data[i].name].setShapeStyle('blue', 0.5);
            }
            mapCodeArray.push(data[i].name);
        }
        let center = this.getBounds(mapSheetGrids, mapCodeArray).getCenter();
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

    onSelectBoundsClick() {

        let map = this.props.map;
        map.dragging.disable();

        // 定义拉框选择相关变量
        let startLatLng = null;             // 拉框选择起点
        let rectangle = null;               // 拉框矩形
        let gridGroupOfSelected = null;     // 选中的格网图层组 
        let gridOfSelected = [];            // 选中的单个格网对象数组
        let textMarker = null;              // 提示信息注记

        // 鼠标按下事件
        const onMouseDown = (event) => {
            startLatLng = event.latlng;
            map.on("mousemove", onMouseMove);
            map.off("mousedown", onMouseDown);
        }

        // 鼠标移动事件
        const onMouseMove = (event) => {
            if (rectangle) {
                rectangle.remove();
            }
            let corner1 = startLatLng,
                corner2 = event.latlng,
                bounds = L.latLngBounds(corner1, corner2);
            rectangle = L.rectangle(bounds, { color: "green", fillColor: 'green', weight: 1 }).addTo(map);
        }

        // 鼠标松开事件
        const onMouseUp = () => {
            map.off("mousemove", onMouseMove);
            // 根据拉框范围绘制分幅格网
            let drawSheetGrids = new DrawMapGrids(map, rectangle.getBounds());
            // 获取选中的单个格网对象数组 
            gridOfSelected = drawSheetGrids.drawGrids("blue", 0.5);
            // 获取选中的格网图层组
            gridGroupOfSelected = drawSheetGrids.getLayerGroup();
            // 添加提示信息
            addTextInfo();
            // 地图拖动可用
            map.dragging.enable();
            // 移除绘制的拉框
            rectangle.remove();
            map.off("mouseup", onMouseUp);
        }

        // 鼠标右键事件
        const onContextMenu = () => {
            // 移除选中的格网图层组
            gridGroupOfSelected.removeFrom(map);
            // 移除提示信息文字注记
            textMarker.remove();
            map.off("contextmenu", onContextMenu);
        }

        // 添加提示信息
        const addTextInfo = () => {
            let mapCodeArray = [];
            // 获取选中的所有格网图幅编码
            for (let item in gridOfSelected) {
                mapCodeArray.push(item);
            }
            let bounds = this.getBounds(gridOfSelected, mapCodeArray);
            let textLatLng = L.latLng(bounds.getNorth(), bounds.getWest());
            let textDiv = L.divIcon({
                html: "双击下载，右键删除",
                className: 'tipsInfo',
                iconSize: [150, 32],
                iconAnchor: [-6, 26],
            });
            textMarker = L.marker(textLatLng, { icon: textDiv });
            textMarker.addTo(map);
        }

        // 设置地图事件监听
        map.on("mousedown", onMouseDown);
        map.on("mouseup", onMouseUp);
        map.on("contextmenu", onContextMenu);
    }

    /**
     * 根据请求数据获取数据范围
     * @param {Array<MapSheetGrid>} mapSheetGrids 分幅格网
     * @param {Array<string>} 格网编号数组 
     * @returns {L.LatLngBounds} 数据范围
     */
    getBounds(mapSheetGrids, data) {
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
                <button className="queryBtn" onClick={this.onHandleQueryClick.bind(this)}>查询</button>
                <button className="queryStatusBtn" onClick={this.onHandleQueryAllClick.bind(this)}>查询下载状态</button>
                <button className="queryStatusBtn" onClick={this.onSelectBoundsClick.bind(this)}>通过拉框选择</button>
            </div>
        )
    }
}

export default MapQueryComponent;