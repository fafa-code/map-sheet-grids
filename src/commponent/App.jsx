import React from 'react';
import MapComponent from './MapComponent';
import MapQueryComponent from './MapQueryComponent';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mapSheetGrids: [],          // 分幅网格对象数组
            mapSheetLayerGroup: null,
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
                <MapQueryComponent map={this.state.map} mapSheetGrids={this.state.mapSheetGrids} />
            </div>
        )
    }
}

export default App;