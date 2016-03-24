import {ObjectBase} from '../../../runtime/common/lang/ObjectBase';
import {Fatal} from '../../../runtime/common/lang/Fatal';
import {Objects} from '../../../runtime/common/lang/Objects';
import {ObjectUtil} from '../../../runtime/common/lang/ObjectUtil';
import {Point2} from '../../../runtime/common/math/Point2';
import {Point3} from '../../../runtime/common/math/Point3';
import {Vector3} from '../../../runtime/common/math/Vector3';
import {Vector4} from '../../../runtime/common/math/Vector4';
import {Color4} from '../../../runtime/common/math/Color4';
import {IProcessContext} from '../../../runtime/graphic/IProcessContext';
import {SMatrix3d} from '../../../runtime/graphic/math/SMatrix3d';
import {FTechniquePass} from '../technique/FTechniquePass';
import {FTechnique} from '../technique/FTechnique';
import {ERegionParameter} from './ERegionParameter';
import {FRenderable} from './FRenderable';
import {FDisplay} from './FDisplay';

//==========================================================
// <T>区域。</T>
//
// @class
// @author maocy
// @history 160305
//==========================================================
export class FRegion extends ObjectBase implements IProcessContext {
   // 改变状态
   public changed: boolean;
   // 命名空间
   public spaceName: string;
   // 背景色
   public backgroundColor: Color4;
   // 当前技术
   public technique: FTechnique;
   // 当前过程
   public techniquePass: FTechniquePass;
   // 当前相机
   public camera;
   // 当前投影
   public projection;
   // 显示集合
   public displays: Objects<FDisplay>;
   // 渲染集合
   public renderables: Objects<FRenderable>;
   // 所有渲染集合
   public allRenderables: Objects<FRenderable>;
   // 相机位置
   public cameraPosition: Point3;
   // 相机方向
   public cameraDirection: Vector3;
   // 相机视角矩阵
   public cameraViewMatrix: SMatrix3d;
   // 相机投影矩阵
   public cameraProjectionMatrix: SMatrix3d;
   // 相机视角投影矩阵
   public cameraViewProjectionMatrix: SMatrix3d;
   // 光源位置
   public lightPosition: Point3;
   // 光源方向
   public lightDirection: Vector3;
   // 光源视角矩阵
   public lightViewMatrix: SMatrix3d;
   // 光源投影矩阵
   public lightProjectionMatrix: SMatrix3d;
   // 光源视角投影位置
   public lightViewProjectionMatrix: SMatrix3d;
   // 选择位置
   public selectPosition: Point2;
   // 最后帧
   public finish: boolean;
   // 主方向光源
   // public directionalLight;
   // 光源集合
   // public lights: FObjects<FLight> = null;
   // @attribute
   // public ratioMatrix = null;
   public lightInfo;

   //==========================================================
   // <T>构造处理。</T>
   //
   // @method
   //==========================================================
   public constructor() {
      super();
      // 初始化参数
      this.changed = false;
      this.displays = new Objects<FDisplay>();
      this.renderables = new Objects<FRenderable>();
      this.allRenderables = new Objects<FRenderable>();
      this.cameraPosition = new Point3();
      this.cameraDirection = new Vector3();
      this.cameraViewMatrix = new SMatrix3d();
      this.cameraProjectionMatrix = new SMatrix3d();
      this.cameraViewProjectionMatrix = new SMatrix3d();
      this.lightPosition = new Point3();
      this.lightDirection = new Vector3();
      this.lightViewMatrix = new SMatrix3d();
      this.lightProjectionMatrix = new SMatrix3d();
      this.lightViewProjectionMatrix = new SMatrix3d();
      this.selectPosition = new Point2();
      this.finish = false;
      //this.ratioMatrix = new SMatrix3d();
      this.lightInfo = new Vector4();
      //this.lights = new FObjects<FLight>();
      //o._materialMap = RClass.create(FG3dMaterialMap);
   }

   //==========================================================
   // <T>判断是否变更过。</T>
   //
   // @return 变更过
   //==========================================================
   public isChanged() {
      return this.changed;
   }

   //==========================================================
   // <T>变更处理。</T>
   //==========================================================
   public change() {
      this.changed = true;
   }

   //==========================================================
   // <T>设置技术过程。</T>
   //
   // @method
   // @param pass 技术过程
   //==========================================================
   public setTechniquePass(pass: FTechniquePass, finish: boolean): void {
      this.techniquePass = pass;
      this.spaceName = pass.fullCode;
      this.finish = finish;
   }

   //==========================================================
   // <T>增加一个显示对象。</T>
   //
   // @param display 显示对象
   //==========================================================
   public pushDisplay(display: FDisplay): void {
      this.displays.push(display);
   }

   //==========================================================
   // <T>增加一个渲染对象。</T>
   //
   // @param renderable 渲染对象
   //==========================================================
   public pushRenderable(renderable: FRenderable): void {
      this.renderables.push(renderable);
      this.allRenderables.push(renderable);
   }

   //==========================================================
   // <T>准备处理。</T>
   //==========================================================
   public prepare() {
      // 数据未改变
      this.changed = false;
      // 清空全部渲染对象
      this.allRenderables.clear();
      // 数据未改变
      this.changed = false;
      // 设置相机信息
      var camera = this.camera;
      var projection = camera.projection;
      camera.updateFrustum();
      // 修正屏幕比例
      //var pixelRatio = MO.Window.Browser.capability().pixelRatio;
      // var ratioMatrix = this.ratioMatrix.identity();
      //ratioMatrix.setScaleAll(pixelRatio);
      //ratioMatrix.update();
      // 设置视角内容
      this.cameraPosition.assign(camera.position);
      this.cameraDirection.assign(camera.direction);
      this.cameraViewMatrix.assign(camera.matrix);
      this.cameraProjectionMatrix.assign(projection.matrix);
      this.cameraViewProjectionMatrix.assign(camera.matrix);
      this.cameraViewProjectionMatrix.append(projection.matrix);
      // 设置光源信息
      this.lightDirection.set(1, 1, 1);
      this.lightDirection.normalize();
      // var light = this.directionalLight;
      // if (light) {
      //    var lightCamera = light.camera;
      //    var lightCameraPosition = lightCamera.position;
      //    //var lp = lc.projection();
      //    this.lightPosition.assign(lightCamera.position);
      //    this.lightDirection.assign(lightCamera.direction);
      //    this.lightViewMatrix.assign(lightCamera.matrix);
      //    //o._lightProjectionMatrix.assign(lp.matrix());
      //    //o._lightViewProjectionMatrix.assign(lc.matrix());
      //    //o._lightViewProjectionMatrix.append(lp.matrix());
      //    //o._lightInfo.set(0, 0, lp._znear, 1.0 / lp.distance());
      // }
      // 清空全部渲染对象
      this.allRenderables.clear();
   }

   //==========================================================
   // <T>重置处理。</T>
   //==========================================================
   public reset() {
      // 清空渲染集合
      this.renderables.clear();
   }

   //==========================================================
   // <T>计算参数数据。</T>
   //
   // @param parameterCd:EG3dRegionParameter 参数类型
   // @return 参数内容
   //==========================================================
   public calculate(parameterCd: ERegionParameter): any {
      switch (parameterCd) {
         case ERegionParameter.CameraPosition:
            return this.cameraPosition;
         case ERegionParameter.CameraDirection:
            return this.cameraDirection;
         case ERegionParameter.CameraViewMatrix:
            return this.cameraViewMatrix;
         case ERegionParameter.CameraProjectionMatrix:
            return this.cameraProjectionMatrix;
         case ERegionParameter.CameraViewProjectionMatrix:
            return this.cameraViewProjectionMatrix;
         case ERegionParameter.LightPosition:
            return this.lightPosition;
         case ERegionParameter.LightDirection:
            return this.lightDirection;
         case ERegionParameter.LightViewMatrix:
            return this.lightViewMatrix;
         case ERegionParameter.LightProjectionMatrix:
            return this.lightProjectionMatrix;
         case ERegionParameter.LightViewProjectionMatrix:
            return this.lightViewProjectionMatrix;
         case ERegionParameter.LightInfo:
            return this.lightInfo;
      }
      throw new Fatal(this, 'Unknown parameter type. (type_cd={1})', parameterCd);
   }

   //==========================================================
   // <T>更新处理。</T>
   //==========================================================
   public update() {
      var renderables = this.renderables;
      var count = renderables.count();
      for (var i: number = 0; i < count; i++) {
         var renderable = renderables.at(i);
         renderable.update(this);
      }
      this.changed = true;
   }

   //==========================================================
   // <T>释放处理。</T>
   //==========================================================
   public dispose(): void {
      // this.ratioMatrix = RObject.free(this.ratioMatrix);
      // this.lights = RObject.free(this.lights);
      this.renderables = ObjectUtil.free(this.renderables);
      this.allRenderables = ObjectUtil.free(this.allRenderables);
      super.dispose();
   }
}
