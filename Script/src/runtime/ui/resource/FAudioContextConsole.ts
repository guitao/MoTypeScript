import {ScopeEnum} from '../../common/lang/ScopeEnum';
import {Objects} from '../../common/lang/Objects';
import {ObjectUtil} from '../../common/lang/ObjectUtil';
import {RClass} from '../../common/reflect/RClass';
import {FConsole} from '../../core/FConsole';
import {FAudioContext} from './FAudioContext';

//==========================================================
// <T>音频环境。</T>
//
// @author sunpeng
// @history 150714
//==========================================================
export class FAudioContextConsole extends FConsole {
   // @attribute
   protected _scopeCd = ScopeEnum.Global;
   // @attribute
   protected _contexts = null;

   //==========================================================
   // <T>构造处理。</T>
   //
   // @method
   //==========================================================
   public constructor() {
      super();
      // 设置属性
      this._contexts = new Objects();
   }

   //==========================================================
   // <T>创建声音资源。</T>
   //
   // @method
   // @param uri:String 网络地址
   // @return AudioBufferSourceNode 音频缓冲
   //==========================================================
   public create(uri) {
      var o = this;
      var context = RClass.create(FAudioContext);
      context.setup();
      o._contexts.push(context);
      return context;
   }

   //==========================================================
   // <T>释放处理。</T>
   //
   // @method
   //==========================================================
   public dispose() {
      var o = this;
      // 释放属性
      this._contexts = ObjectUtil.dispose(this._contexts);
      // 父处理
      super.dispose();
   }
}

