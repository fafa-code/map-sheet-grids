import React from 'react';
import L from 'leaflet';
import { Input, Menu, Dropdown, Icon } from 'antd';
import '../index.css';
import RectSelectTool from '../map/rectSelectTool';
import PolygonSelectTool from '../map/polygonSelectTool';

class MapQueryComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            querySheetStatus: [],
            selectResult: null
        }
    }

    /**
     * 处理查询按钮点击事件
     */
    onHandleQueryClick(mapCode) {
        this.resetQueryResult();
        if (!mapCode) {
            return;
        }
        let mapSheetGrids = this.props.mapSheetGrids;
        let querySheetStatus = this.state.querySheetStatus.slice();

        let url = "http://10.16.28.240:8069/gx-image-helper-app/landi/rest/tileserver/query?mapCode=" + mapCode;
        this.promiseRequest(url).then((result) => {
            if (result.status === -1) {
                mapSheetGrids[mapCode].setShapeStyle('red', 0.5);
            } else if (result.status === 0) {
                mapSheetGrids[mapCode].setShapeStyle('#49ef04', 0.5);
            } else {
                mapSheetGrids[mapCode].setShapeStyle('blue', 0.5);
            }
            querySheetStatus.push(mapSheetGrids[mapCode]);
            this.setState({ querySheetStatus: querySheetStatus });
            let map = this.props.map;
            map.setView(mapSheetGrids[mapCode].center, 6);
        });
    }

    /**
     * 查询所有格网状态
     */
    onHandleQueryAllClick() {
        this.resetQueryResult();
        let url = "http://10.16.28.240:8069/gx-image-helper-app/landi/rest/tileserver/queryAll";
        let mapSheetGrids = this.props.mapSheetGrids;
        let querySheetStatus = this.state.querySheetStatus.slice();
        let mapCodeArray = [];
        this.promiseRequest(url).then((result) => {
            for (let i = 0; i < result.length; i++) {
                if (result[i].status === -1) {
                    mapSheetGrids[result[i].name].setShapeStyle('red', 0.5);
                } else if (result[i].status === 0) {
                    mapSheetGrids[result[i].name].setShapeStyle('#49ef04', 0.5);
                } else {
                    mapSheetGrids[result[i].name].setShapeStyle('blue', 0.5);
                }
                mapCodeArray.push(result[i].name);
                querySheetStatus.push(mapSheetGrids[result[i].name]);
            }
            this.setState({ querySheetStatus: querySheetStatus });
            let center = this.getBounds(mapSheetGrids, mapCodeArray).getCenter();
            let map = this.props.map;
            map.setView(center, 5);
        });
    }

    resetSelectResult() {
        let selectResult = this.state.selectResult;
        if (selectResult) {
            selectResult.reset();
        }
    }


    onSelectBoundsClick() {
        this.resetSelectResult();
        let map = this.props.map;
        map.dragging.disable();
        let recSelect = new RectSelectTool(map);
        this.setState({
            selectResult: recSelect,
        });
    }

    onPolygonSelectClick() {
        this.resetSelectResult();
        let map = this.props.map;
        map.dragging.disable();
        let polySelect = new PolygonSelectTool(map);
        this.setState({
            selectResult: polySelect,
        });
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

    resetQueryResult() {
        let querySheetStatus = this.state.querySheetStatus.slice();
        querySheetStatus.forEach((item) => {
            item.setShapeStyle('transparent');
        });
        this.setState({ querySheetStatus: querySheetStatus });
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
                    reject("请求失败！");
                }
            }
        });
        return promise;
    }

    render() {
        const { Search } = Input;

        const menu = (
            < Menu >
                <Menu.Item key="1" onClick={this.onSelectBoundsClick.bind(this)}>通过拉框选择</Menu.Item>
                <Menu.Item key="2" onClick={this.onPolygonSelectClick.bind(this)}>通过多边形选择</Menu.Item>
            </Menu>
        )

        return (
            <div className="operateDiv" >
                <div>
                    <Search style={{ width: 180 }} placeholder="请输入图幅编号" onSearch={this.onHandleQueryClick.bind(this)} />
                    <button className="queryAll" onClick={this.onHandleQueryAllClick.bind(this)}>查询所有格网</button>
                </div>
                <div>
                    <Dropdown overlay={menu}>
                        <button className="selectBtn">选择图幅 <Icon type="down" /></button>
                    </Dropdown>
                </div>
            </div>
        )
    }
}

export default MapQueryComponent;