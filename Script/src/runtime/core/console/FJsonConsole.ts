import {ClassUtil} from '../../common/reflect/ClassUtil';
import {JsonConnection} from '../../common/net/JsonConnection';
import {FHttpConsole} from './FHttpConsole';

//==========================================================
// <T>JSON数据通讯的控制台。</T>
//
// @console
// @author maocy
// @version 150104
//==========================================================
export class FJsonConsole extends FHttpConsole {
   //==========================================================
   // <T>创建一个网络链接。</T>
   //
   // @method
   // @return 网络链接
   //==========================================================
   public create() {
      return ClassUtil.create(JsonConnection);
   }
}
