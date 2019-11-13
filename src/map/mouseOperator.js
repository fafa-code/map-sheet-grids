class MouseOperator {
    constructor(map) {
        this.map = map;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.active();
    }

    active() {
        this.map.on("mousedown", this.onMouseDown);
        this.map.on("mousemove", this.onMouseMove);
        this.map.on("mouseup", this.onMouseUp);
        this.map.on("dblclick", this.onDoubleClick);
        this.map.on("contextmenu", this.onContextMenu);

    }

    unActive() {
        this.map.off("mousedown", this.onMouseDown);
        this.map.off("mousemove", this.onMouseMove);
        this.map.off("mouseup", this.onMouseUp);
        this.map.off("dblclick", this.onDoubleClick);
        this.map.off("contextmenu", this.onContextMenu);
    }

    onMouseDown() {
        throw new Error("未实现onMouseDown方法！！！");
    }

    onMouseMove() {
        throw new Error("未实现onMouseMove方法！！！");
    }

    onMouseUp() {
        throw new Error("未实现onMouseUp方法！！！");
    }

    onContextMenu() {
        throw new Error("未实现onContextMenu方法！！！");
    }
}

export default MouseOperator;