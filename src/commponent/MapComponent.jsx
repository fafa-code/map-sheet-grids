import React from 'react';
import L from 'leaflet';
import '../index.css';
import DrawMapGrids from '../map/drawSheetGrids';

class MapComponent extends React.Component {

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

        // 将切片添加至地图
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            minZoom: 1,
            maxZoom: 18,
            id: 'mapbox.streets'
        }).addTo(map);
        this.props.setData({map:map});

        // 设置图幅绘制范围
        let southWest = L.latLng(-85, -180),
            northEast = L.latLng(85, 180),
            drawBounds = L.latLngBounds(southWest, northEast);

        // 绘制地图分幅格网
        let drawSheetGrids = new DrawMapGrids(map, drawBounds);
        let mapSheetGrids = drawSheetGrids.drawGrids();
        let mapSheetLayerGroup = drawSheetGrids.getLayerGroup();
        this.props.setData({mapSheetGrids:mapSheetGrids});
        this.props.setData({mapSheetLayerGroup:mapSheetLayerGroup});
        
        // 分幅格网图层控制
        var overlays = {
            "分幅格网": mapSheetLayerGroup
        };
        L.control.layers(null, overlays).addTo(map);

        map.on('click', this.onMapClick.bind(this, mapSheetGrids));
    }

    render() {
        return (
            <div id="mapid" className="mapContainer"></div>
        );
    }
}

export default MapComponent;