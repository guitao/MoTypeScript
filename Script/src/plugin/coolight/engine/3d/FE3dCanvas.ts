//==========================================================
// <T>模板画板。</T>
//
// @author maocy
// @history 150130
//==========================================================
export class FE3dCanvas {
    //    o = MO.Class.inherits(this, o, MO.FCanvas, MO.MGraphicObject, MO.MMouseCapture);
    //    //..........................................................
    //    // @attribute
    //    o._optionAlpha        = true;
    //    o._optionAntialias    = true;
    //    o._optionStageProcess = true;
    //    o._optionResize       = true;
    //    o._optionMouseCapture = true;
    //    // @attribute
    //    o._listenerLoad       = MO.Class.register(o, new MO.AListener('_listenerLoad', MO.EEvent.Load));
    //    o._size               = MO.Class.register(o, new MO.AGetter('_size'));
    //    o._logicSize          = MO.Class.register(o, new MO.AGetter('_logicSize'));
    //    o._screenSize         = MO.Class.register(o, new MO.AGetter('_screenSize'));
    //    o._interval           = 10;
    //    //..........................................................
    //    // @html
    //    o._hPanel             = null;
    //    o._hCanvas            = null;
    //    //..........................................................
    //    // @event
    //    o.onEnterFrame        = MO.Method.empty;
    //    // @event
    //    // @event
    //    o.onMouseCaptureStart = MO.Method.empty;
    //    o.onMouseCapture      = MO.Method.empty;
    //    o.onMouseCaptureStop  = MO.Method.empty;
    //    o.onTouchStart        = MO.Method.empty;
    //    o.onTouchMove         = MO.Method.empty;
    //    o.onTouchStop         = MO.Method.empty;
    //    // @event
    //    o.onResize            = MO.FE3dCanvas_onResize;
    //    //..........................................................
    //    // @method
    //    o.construct           = MO.FE3dCanvas_construct;
    //    // @method
    //    o.build               = MO.FE3dCanvas_build;
    //    o.resize              = MO.FE3dCanvas_resize;
    //    o.show                = MO.FE3dCanvas_show;
    //    o.hide                = MO.FE3dCanvas_hide;
    //    o.setVisible          = MO.FE3dCanvas_setVisible;
    //    o.setPanel            = MO.FE3dCanvas_setPanel;
    //    // @method
    //    o.dispose             = MO.FE3dCanvas_dispose;

    //==========================================================
    // <T>改变大小事件处理。</T>
    //
    // @method
    // @param event:SEvent 事件信息
    //==========================================================
    public onResize(event) {
        this.resize();
    }

    //==========================================================
    // <T>构造处理。</T>
    //
    // @method
    //==========================================================
    public construct() {
        var o = this;
        o.__base.FCanvas.construct.call(o);
        // 设置变量
        o._size = new MO.SSize2(1280, 720);
        o._logicSize = new MO.SSize2(1280, 720);
        o._screenSize = new MO.SSize2(1280, 720);
    }

    //==========================================================
    // <T>构建处理。</T>
    //
    // @method
    // @param hPanel:HtmlTag 页面元素
    //==========================================================
    public build(hPanel) {
        var o = this;
        // 获得大小
        var size = o._size;
        var width = size.width;
        var height = size.height;
        // 创建画板
        var hCanvas = o._hCanvas = MO.Window.Builder.create(hPanel, 'CANVAS');
        hCanvas.width = width;
        hCanvas.height = height;
        // 设置样式
        var hStyle = hCanvas.style;
        hStyle.left = '0px';
        hStyle.top = '0px';
        hStyle.width = '100%';
        hStyle.height = '100%';
        // 创建渲染环境
        var parameters = new MO.SArguments();
        parameters.alpha = o._optionAlpha;
        parameters.antialias = o._optionAntialias;
        o._graphicContext = MO.Graphic.Context3d.createContext(MO.FWglContext, hCanvas, parameters);
    }

    //==========================================================
    // <T>改变大小处理。</T>
    //
    // @method
    //==========================================================
    public resize(sourceWidth, sourceHeight) {
        var o = this;
        // 检查参数
        if (!sourceWidth || !sourceHeight) {
            throw new MO.TError(o, 'Invalid canvas size.');
        }
        o._screenSize.set(sourceWidth, sourceHeight);
        // 设置尺寸
        var width = parseInt(sourceWidth);
        var height = parseInt(sourceHeight);
        // 设置画板
        var hCanvas = o._hCanvas;
        hCanvas.width = width;
        hCanvas.height = height;
        o._size.set(width, height);
        // 设置范围
        var context = o._graphicContext;
        context.setViewport(0, 0, width, height);
        MO.Logger.debug(o, 'Canvas3d resize. (size={1}x{2}, buffer={3}x{4}, html={5})', width, height, context._handle.drawingBufferWidth, context._handle.drawingBufferHeight, hCanvas.outerHTML);
    }

    //==========================================================
    // <T>可见处理。</T>
    //
    // @method
    //==========================================================
    public show() {
        this.setVisible(true);
    }

    //==========================================================
    // <T>隐藏处理。</T>
    //
    // @method
    //==========================================================
    public hide() {
        this.setVisible(false);
    }

    //==========================================================
    // <T>设置可见处理。</T>
    //
    // @method
    // @param visible:Boolean 可见性
    //==========================================================
    public setVisible(visible) {
        MO.Window.Html.visibleSet(this._hCanvas, visible);
    }

    //==========================================================
    // <T>设置面板处理。</T>
    //
    // @method
    // @param hPanel:HtmlTag 页面元素
    //==========================================================
    public setPanel(hPanel) {
        var o = this;
        o._hPanel = hPanel;
        // 放入父容器
        hPanel.appendChild(o._hCanvas);
    }

    //==========================================================
    // <T>释放处理。</T>
    //
    // @method
    //==========================================================
    public dispose() {
        var o = this;
        // 释放属性
        o._graphicContext = MO.Lang.Object.dispose(o._graphicContext);
        o._size = MO.Lang.Object.dispose(o._size);
        o._screenSize = MO.Lang.Object.dispose(o._screenSize);
        o._logicSize = MO.Lang.Object.dispose(o._logicSize);
        o._hPanel = MO.Window.Html.free(o._hPanel);
        o._hCanvas = MO.Window.Html.free(o._hCanvas);
        // 父处理
        o.__base.FCanvas.dispose.call(o);
    }
}