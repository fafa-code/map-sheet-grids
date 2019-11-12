import React from 'react';
import MapComponent from './MapComponent';
import MapQueryComponent from './MapQueryComponent';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
            mapSheetGrids: [],          // 分幅网格对象数组
            mapSheetLayerGroup: null,   // 分幅格网图层
        }
    }

    /**
     * 设置状态值
     * @param {json} data 状态数据
     */
    setData(data) {
        this.setState(data);
    }

    render() {
        return (
            <div>
                <MapComponent setData={(data) => this.setData(data)} />
                <MapQueryComponent map={this.state.map} mapSheetGrids={this.state.mapSheetGrids} setData={(data) => this.setData(data)} />
            </div>
        )
    }
}

export default App;