import {SVector3} from './SVector3';
import {FloatUtil} from '../lang/RFloat';

//==========================================================
// <T>四元数。</T>
//
// @struct
// @author maocy
// @version 150109
//==========================================================
export class SQuaternion {
   // @attribute
   x = 0;
   y = 0;
   z = 0;
   w = 1;

   //============================================================
   // <T>构造处理。</T>
   //
   // @method
   // @param l:width:Number 宽度
   // @param t:height:Number 高度
   // @param r:deep:Number 深度
   // @param b:deep:Number 深度
   //============================================================
   constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
      // Attribute
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
   }

   //============================================================
   // <T>单位化处理。</T>
   //
   // @method
   //============================================================
   public identity() {
      var o = this;
      o.x = o.y = o.z = 0;
      o.w = 1;
      return o;
   }

   //============================================================
   // <T>接收一个四元数。</T>
   //
   // @method
   // @param value:SQuaternion 四元数
   //============================================================
   public assign(value) {
      var o = this;
      o.x = value.x;
      o.y = value.y;
      o.z = value.z;
      o.w = value.w;
   }

   //============================================================
   // <T>设置数据内容。</T>
   //
   // @method
   // @param x:Number X分量
   // @param y:Number Y分量
   // @param z:Number Z分量
   // @param w:Number W分量
   //============================================================
   public set(x, y, z, w) {
      var o = this;
      o.x = x;
      o.y = y;
      o.z = z;
      o.w = w;
   }

   //============================================================
   // <T>获得绝对值。</T>
   //
   // @method
   // @return Number 绝对值
   //============================================================
   public absolute() {
      var o = this;
      return Math.sqrt((o.x * o.x) + (o.y * o.y) + (o.z * o.z) + (o.w * o.w));
   }

   //============================================================
   // <T>单位化处理。</T>
   //
   // @method
   //============================================================
   public normalize() {
      var o = this;
      var value = o.absolute();
      if (value != 0) {
         var rate = 1 / value;
         o.x *= rate;
         o.y *= rate;
         o.z *= rate;
         o.w *= rate;
      }
   }

   //============================================================
   // <T>获得反方向。</T>
   //
   // @method
   // @param value:SQuaternion 四元数
   // @return SQuaternion 四元数
   //============================================================
   public conjugate(value: SQuaternion = null) {
      var o = this;
      var result = null;
      if (value) {
         result = value;
      } else {
         result = new SQuaternion();
      }
      result.x = -o.x;
      result.y = -o.y;
      result.z = -o.z;
      result.w = o.w;
      return result;
   }

   //============================================================
   // <T>乘法处理。</T>
   //
   // @method
   // @param value:SQuaternion 四元数
   //============================================================
   public mul(value) {
      var o = this;
      var x = o.x;
      var y = o.y;
      var z = o.z;
      var w = o.w;
      o.x = (w * value.x) + (x * value.w) + (y * value.z) - (z * value.y);
      o.y = (w * value.y) + (y * value.w) + (z * value.x) - (x * value.z);
      o.z = (w * value.z) + (z * value.w) + (x * value.y) - (y * value.x);
      o.w = (w * value.w) - (x * value.x) - (y * value.y) - (z * value.z);
   }

   //============================================================
   // <T>乘法处理。</T>
   //
   // @method
   // @param value1:SQuaternion 四元数1
   // @param value2:SQuaternion 四元数2
   //============================================================
   public mul2(value1, value2) {
      var o = this;
      o.x = (value1.w * value2.x) + (value1.x * value2.w) + (value1.y * value2.z) - (value1.z * value2.y);
      o.y = (value1.w * value2.y) + (value1.y * value2.w) + (value1.z * value2.x) - (value1.x * value2.z);
      o.z = (value1.w * value2.z) + (value1.z * value2.w) + (value1.x * value2.y) - (value1.y * value2.x);
      o.w = (value1.w * value2.w) - (value1.x * value2.x) - (value1.y * value2.y) - (value1.z * value2.z);
   }

   //============================================================
   // <T>变换三维矢量。</T>
   //
   // @method
   // @param input:SVector3 输入方向
   // @param output:SVector3 输出方向
   //============================================================
   public translate(input, output) {
      // 计算内容
      var q1 = new SQuaternion();
      q1.set(input.x, input.y, input.z, 0);
      q1.normalize();
      var q2 = this.conjugate();
      q1.mul(q2);
      var q = this.clone();
      q.mul(q1);
      // 返回结果
      var result = null;
      if (output) {
         result = output;
      } else {
         result = new SVector3();
      }
      result.set(q.x, q.y, q.z);
      return result;
   }

   //============================================================
   // <T>计算插值。</T>
   //
   // @method
   // @param value1:SQuaternion 开始四元数
   // @param value2:SQuaternion 结束四元数
   // @param rate:Float 比率
   //============================================================
   public slerp(value1, value2, rate) {
      var o = this;
      var rv = (value1.x * value2.x) + (value1.y * value2.y) + (value1.z * value2.z) + (value1.w * value2.w);
      var rf = false;
      if (rv < 0) {
         rf = true;
         rv = -rv;
      }
      var r1 = 0;
      var r2 = 0;
      if (rv > 0.999999) {
         r1 = 1 - rate;
         r2 = rf ? -rate : rate;
      } else {
         var ra = Math.acos(rv);
         var rb = 1 / Math.sin(ra);
         r1 = Math.sin((1 - rate) * ra) * rb;
         r2 = rf ? (-Math.sin(rate * ra) * rb) : (Math.sin(rate * ra) * rb);
      }
      o.x = (r1 * value1.x) + (r2 * value2.x);
      o.y = (r1 * value1.y) + (r2 * value2.y);
      o.z = (r1 * value1.z) + (r2 * value2.z);
      o.w = (r1 * value1.w) + (r2 * value2.w);
   }

   //==========================================================
   // <T>用轴向量和旋转角创建一个四元组。</T>
   //
   // @method
   // @param axis:SVector3 方向轴
   // @param angle:Number 弧度
   //==========================================================
   public fromAxisAngle(axis, angle) {
      var o = this;
      var r = angle * 0.5;
      var s = Math.sin(r);
      o.x = axis.x * s;
      o.y = axis.y * s;
      o.z = axis.z * s;
      o.w = Math.cos(r);
   }

   //==========================================================
   // <T>从欧拉角获得四元数。</T>
   //
   // @method
   // @param p:pitch:Number X转角
   // @param y:yaw:Number Y转角
   // @param r:roll:Number Z转角
   //==========================================================
   public fromEuler(p, y, r) {
      var o = this;
      var sr = Math.sin(r * 0.5);
      var cr = Math.cos(r * 0.5);
      var sp = Math.sin(p * 0.5);
      var cp = Math.cos(p * 0.5);
      var sy = Math.sin(y * 0.5);
      var cy = Math.cos(y * 0.5);
      o.x = cr * sp * cy + sr * cp * sy;
      o.y = cr * cp * sy - sr * sp * cy;
      o.z = sr * cp * cy - cr * sp * sy;
      o.w = cr * cp * cy + sr * sp * sy;
   }

   //==========================================================
   // <T>从四元数获得欧拉角。</T>
   //
   // @method
   // @param p:pitch:Number X转角
   // @param y:yaw:Number Y转角
   // @param r:roll:Number Z转角
   //==========================================================
   public parseEuler(p) {
      var o = this;
      var x2 = o.x * o.x;
      var y2 = o.y * o.y;
      var z2 = o.z * o.z;
      // 输出内容
      var r = null;
      if (p) {
         r = p;
      } else {
         r = new SVector3();
      }
      r.x = Math.asin(FloatUtil.toRange((o.w * o.x - o.y * o.z) * 2, -1, 1));
      r.y = Math.atan2(2 * (o.w * o.y + o.z * o.x), 1 - 2 * (x2 + y2));
      r.z = Math.atan2(2 * (o.w * o.z + o.x * o.y), 1 - 2 * (z2 + x2));
      return r;
   }

   //==========================================================
   // <T>序列化数据到输出流里。</T>
   //
   // @method
   // @param output:FByteStream 数据流
   //==========================================================
   public serialize(output) {
      var o = this;
      output.writeFloat(o.x);
      output.writeFloat(o.y);
      output.writeFloat(o.z);
      output.writeFloat(o.w);
   }

   //==========================================================
   // <T>从输入流里反序列化数据。</T>
   //
   // @method
   // @param input:FByteStream 数据流
   //==========================================================
   public unserialize(input) {
      var o = this;
      o.x = input.readFloat();
      o.y = input.readFloat();
      o.z = input.readFloat();
      o.w = input.readFloat();
   }

   //============================================================
   // <T>获得克隆对象。</T>
   //
   // @method
   // @return SQuaternion 克隆对象
   //============================================================
   public clone() {
      var o = this;
      var result = new SQuaternion();
      result.x = o.x;
      result.y = o.y;
      result.z = o.z;
      result.w = o.w;
      return result;
   }

   //============================================================
   // <T>获得字符串。</T>
   //
   // @method
   // @return String 字符串
   //============================================================
   public toString() {
      return this.x + ',' + this.y + ',' + this.z + ',' + this.w;
   }
}
