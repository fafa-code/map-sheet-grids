import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Menu, Icon } from 'antd';
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

        const { SubMenu } = Menu;
        const { Header, Content, Sider } = Layout;

        return (
            <Layout>
                <Header className="header">
                    <div className="logo" />
                    <Menu theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['2']}
                        style={{ lineHeight: '64px' }}>
                        <Menu.Item key="1">地图</Menu.Item>
                        <Menu.Item key="2">下载列表</Menu.Item>
                    </Menu>
                </Header>
                <Content>
                    <Layout>
                        <Sider width={200} style={{ background: '#fff' }}>
                            <Menu
                                mode="inline"
                                defaultSelectedKeys={['1']}
                                defaultOpenKeys={['sub1']}
                                style={{ height: '100%' }}
                            >
                                <SubMenu
                                    key="sub1"
                                    title={<span><Icon type="user" />中国</span>}
                                >
                                    <Menu.Item key="1">option1</Menu.Item>
                                    <Menu.Item key="2">option2</Menu.Item>
                                    <Menu.Item key="3">option3</Menu.Item>
                                    <Menu.Item key="4">option4</Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Sider>
                        <Content style={{minHeight: 280 }}>
                            <div>
                                <MapComponent setData={(data) => this.setData(data)} />
                                <MapQueryComponent map={this.state.map} mapSheetGrids={this.state.mapSheetGrids} setData={(data) => this.setData(data)} />
                            </div>
                        </Content>
                        <Content style={{ padding: '0 24px', minHeight: 280, display: 'none' }}>Content2</Content>
                    </Layout>
                </Content>
            </Layout>
        )
    }
}

export default App;