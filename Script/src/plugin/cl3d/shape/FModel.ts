import {Objects} from '../../../runtime/common/lang/Objects';
import {FRenderModel} from 'render/FRenderModel';
import {FRenderModelMesh} from 'render/FRenderModelMesh';
import {FActor} from '../base/FActor';
import {FMeshRenderable} from './FMeshRenderable';

//==========================================================
// <T>渲染模型。</T>
//
// @author maocy
// @history 150106
//==========================================================
export class FModel extends FActor {
   // @attribute
   public _dataReady = false;
   public renderable = null;
   //    // @attribute
   //    o._display       = MO.Class.register(o, new MO.AGetter('_display'));
   //    // @attribute
   //    o._listenerLoad  = MO.Class.register(o, new MO.AListener('_listenerLoad', MO.EEvent.Load));

   //==========================================================
   // <T>构造处理。</T>
   //
   // @method
   //==========================================================
   public constructor() {
      super();
      // 创建显示层
      //var layer = this._layer = MO.Class.create(MO.FDisplayLayer);
      //this.registerLayer('sprite', layer);
      // 创建显示对象
      //var display = this._display = MO.Class.create(MO.FE3dModelDisplay);
      //layer.pushDisplay(display);
   }

   //==========================================================
   // <T>测试是否准备好。</T>
   //
   // @method
   // @return 是否准备好
   //==========================================================
   public testReady(): boolean {
      return this._dataReady;
   }

   //==========================================================
   // <T>加载渲染对象。</T>
   //
   // @param renderable 渲染对象
   //==========================================================
   public loadRenderable(modelRenderable: FRenderModel) {
      this.renderable = modelRenderable;
      var meshes: Objects<FRenderModelMesh> = modelRenderable.meshes;
      var count: number = meshes.count();
      for (var n: number = 0; n < count; n++) {
         var meshRenderable: FRenderModelMesh = meshes.at(n);
         var renderable: FMeshRenderable = new FMeshRenderable();
         renderable.loadRenderable(meshRenderable);
         this.pushRenderable(renderable);
      }
      // 选择技术
      // this.selectTechnique(this, MO.FE3dGeneralTechnique);
      // 加载资源
      //var resource = renderable.resource;
      // this.loadResource(resource);
      // 创建渲染对象
      // this._display.load(renderable);
      // 数据准备完成
      this._dataReady = true;
   }

   //==========================================================
   // <T>加载处理。</T>
   //
   // @return 处理结果
   //==========================================================
   public processLoad(): boolean {
      // 检测数据状态
      if (this._dataReady) {
         return true;
      }
      // // 检测渲染对象状态
      var renderable = this.renderable;
      if (!renderable.testReady()) {
         return false;
      }
      this.loadRenderable(renderable);
      // // 加载完成
      // var event = MO.Memory.alloc(MO.SEvent);
      // event.sender = this;
      // this.processLoadListener(event);
      // MO.Memory.free(event);
      return true;
   }

   //==========================================================
   // <T>构造处理。</T>
   //
   // @method
   //==========================================================
   public dispose() {
      // 释放属性
      this.renderable = null;
      // this._display = RObject.dispose(this._display);
      // 父处理
      super.dispose();
   }
}