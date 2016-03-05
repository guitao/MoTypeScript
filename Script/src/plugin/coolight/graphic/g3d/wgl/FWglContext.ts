import {SEvent} from '../../../../../runtime/common/lang/SEvent';
import {FObjects} from '../../../../../runtime/common/lang/FObjects';
import {RLogger} from '../../../../../runtime/common/lang/RLogger';
import {RObject} from '../../../../../runtime/common/lang/RObject';
import {FError} from '../../../../../runtime/common/lang/FError';
import {RClass} from '../../../../../runtime/common/reflect/RClass';
import {RXml} from '../../../../../runtime/common/xml/RXml';
import {RRuntime} from '../../../../../runtime/common/RRuntime';
import {EParameterFormat} from '../EParameterFormat';
import {EAttributeFormat} from '../EAttributeFormat';
import {EIndexStride} from '../EIndexStride';
import {EFillMode} from '../EFillMode';
import {ETexture} from '../ETexture';
import {EDepthMode} from '../EDepthMode';
import {ECullMode} from '../ECullMode';
import {EDrawMode} from '../EDrawMode';
import {SLayoutBuffer} from '../SLayoutBuffer';
import {SLayoutSampler} from '../SLayoutSampler';
import {SContextCapability} from '../SContextCapability';
import {FContext} from '../FContext';
import {FProgram} from '../FProgram';
import {FVertexBuffer} from '../FVertexBuffer';
import {FIndexBuffer} from '../FIndexBuffer';
import {FWglVertexBuffer} from './FWglVertexBuffer';
import {FWglIndexBuffer} from './FWglIndexBuffer';
import {FWglFlatTexture} from './FWglFlatTexture';
import {FWglCubeTexture} from './FWglCubeTexture';
import {FWglProgram} from './FWglProgram';
import {FWglLayout} from './FWglLayout';
import {RWglUtility} from './RWglUtility';

//==========================================================
// <T>WebGL渲染环境。</T>
//
// @author maocy
// @refer https://www.khronos.org/registry/webgl
// @history 141230
//==========================================================
export class FWglContext extends FContext {
   // @attribute
   //_handle = MO.Class.register(o, new MO.AGetter('_handle'));
   public handle: WebGLRenderingContext = null;
   public _handleInstance = null;
   public _handleLayout = null;
   //_handleDrawBuffers = MO.Class.register(o, new MO.AGetter('_handleDrawBuffers'));
   protected _handleDrawBuffers = null;
   //_handleSamplerS3tc = MO.Class.register(o, new MO.AGetter('_handleSamplerS3tc'));
   protected _handleSamplerS3tc = null;
   protected _handleDebugShader = null;
   // @attribute
   protected _activeRenderTarget = null;
   protected _activeTextureSlot = null;
   // @attribute
   protected _parameters = null;
   protected _extensions = null;
   // @attribute
   protected _statusRecord = false;
   //_recordBuffers = MO.Class.register(o, new MO.AGetter('_recordBuffers'));
   public recordBuffers: FObjects<any> = new FObjects<any>();
   //_recordSamplers = MO.Class.register(o, new MO.AGetter('_recordSamplers'));
   public recordSamplers: FObjects<any> = new FObjects<any>();
   // @attribute
   //_statusDepthMask = MO.Class.register(o, new MO.AGetter('_statusDepthMask'), false);
   protected _statusDepthMask = false;
   //_statusFloatTexture = MO.Class.register(o, new MO.AGetter('_statusFloatTexture'), false);
   protected _statusFloatTexture = false;
   //_statusDrawBuffers = MO.Class.register(o, new MO.AGetter('_statusDrawBuffers'), false);
   protected _statusDrawBuffers = false;
   //_statusScissor = MO.Class.register(o, new MO.AGetter('_statusScissor'), false);
   protected _statusScissor = false;
   protected _data9 = new Float32Array(9);
   protected _data16 = new Float32Array(16);

   //==========================================================
   // <T>构造处理。</T>
   //
   // @method
   //==========================================================
   public constructor() {
      super();
      this.capability = new SContextCapability();
   }

   //==========================================================
   // <T>获得是否有效。</T>
   //
   // @method
   // @return Boolean 是否有效
   //==========================================================
   public isValid() {
      return this.handle;
   }

   //==========================================================
   // <T>关联页面画布标签。</T>
   //
   // @method
   // @param hCanvas:HtmlCanvasTag 页面画布标签
   //==========================================================
   public linkCanvas(hCanvas) {
      super.linkCanvas(hCanvas)
      // 获得环境
      this._hCanvas = hCanvas;
      if (hCanvas.getContext) {
         // 设置参数
         var parameters: any = new Object();
         parameters.alpha = this._optionAlpha;
         parameters.antialias = this._optionAntialias;
         parameters.depth = true;
         parameters.stencil = false;
         parameters.premultipliedAlpha = false;
         // 初始化对象
         let handle = null;
         var codes = ['experimental-webgl2', 'experimental-webgl', 'webgl', 'webkit-3d', 'moz-webgl']
         var count = codes.length;
         for (var i = 0; i < count; i++) {
            var code = codes[i];
            handle = hCanvas.getContext(code, parameters);
            if (handle) {
               RLogger.debug(this, 'Create context3d. (code={1}, handle={2})', code, handle);
               break;
            }
         }
         if (!handle) {
            RLogger.error(this, 'Create context3d failure.');
            var event = new SEvent(this);
            //event.code = MO.EGraphicError.UnsupportWebGL;
            //event.message = "Current browser can't support WebGL technique.";
            //MO.Window.processDeviceError(event);
            event.dispose();
            return false;
         }
         this.handle = handle;
         //o._contextAttributes = handle.getContextAttributes();
      } else {
         var event = new SEvent(this);
         //event.code = MO.EGraphicError.UnsupportWebGL;
         //event.message = "Canvas can't support WebGL technique.";
         //MO.Window.processDeviceError(event);
         event.dispose();
         return false;
      }
      let handle = this.handle;
      // 设置状态
      this.setDepthMode(true, EDepthMode.LessEqual);
      this.setCullingMode(true, ECullMode.Front);
      // 获得渲染信息
      var capability = this.capability;
      capability.vendor = handle.getParameter(handle.VENDOR);
      capability.version = handle.getParameter(handle.VERSION);
      capability.shaderVersion = handle.getParameter(handle.SHADING_LANGUAGE_VERSION);
      capability.attributeCount = handle.getParameter(handle.MAX_VERTEX_ATTRIBS);
      capability.vertexConst = handle.getParameter(handle.MAX_VERTEX_UNIFORM_VECTORS);
      capability.varyingCount = handle.getParameter(handle.MAX_VARYING_VECTORS);
      capability.fragmentConst = handle.getParameter(handle.MAX_FRAGMENT_UNIFORM_VECTORS);
      capability.samplerCount = handle.getParameter(handle.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
      capability.samplerSize = handle.getParameter(handle.MAX_TEXTURE_SIZE);
      // 测试实例绘制支持
      var extension = this._handleInstance = handle.getExtension('ANGLE_instanced_arrays');
      if (extension) {
         capability.optionInstance = true;
      }
      capability.mergeCount = parseInt(((capability.vertexConst - 32) / 4) as any);
      // 测试顶点布局支持
      var extension = this._handleLayout = handle.getExtension('OES_vertex_array_object');
      if (extension) {
         capability.optionLayout = true;
      }
      // 测试32位索引支持
      var extension = handle.getExtension('OES_element_index_uint');
      if (extension) {
         capability.optionIndex32 = true;
      }
      // 测试多渲染支持
      var extension = this._handleDrawBuffers = handle.getExtension('WEBGL_draw_buffers');
      if (extension) {
         capability.optionDrawBuffers = true;
      }
      // 测试纹理压缩支持
      var extension = this._handleSamplerS3tc = handle.getExtension('WEBGL_compressed_texture_s3tc');
      if (extension) {
         capability.samplerCompressRgb = extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
         capability.samplerCompressRgba = extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      }
      // 测定渲染精度
      var shader: any = capability.shader = new Object();
      var vertexPrecision: any = shader.vertexPrecision = new Object();
      if (handle.getShaderPrecisionFormat) {
         vertexPrecision.floatLow = handle.getShaderPrecisionFormat(handle.VERTEX_SHADER, handle.LOW_FLOAT);
         vertexPrecision.floatMedium = handle.getShaderPrecisionFormat(handle.VERTEX_SHADER, handle.MEDIUM_FLOAT);
         vertexPrecision.floatHigh = handle.getShaderPrecisionFormat(handle.VERTEX_SHADER, handle.HIGH_FLOAT);
         vertexPrecision.intLow = handle.getShaderPrecisionFormat(handle.VERTEX_SHADER, handle.LOW_INT);
         vertexPrecision.intMedium = handle.getShaderPrecisionFormat(handle.VERTEX_SHADER, handle.MEDIUM_INT);
         vertexPrecision.intHigh = handle.getShaderPrecisionFormat(handle.VERTEX_SHADER, handle.HIGH_INT);
      }
      var fragmentPrecision: any = shader.fragmentPrecision = new Object();
      if (handle.getShaderPrecisionFormat) {
         fragmentPrecision.floatLow = handle.getShaderPrecisionFormat(handle.FRAGMENT_SHADER, handle.LOW_FLOAT);
         fragmentPrecision.floatMedium = handle.getShaderPrecisionFormat(handle.FRAGMENT_SHADER, handle.MEDIUM_FLOAT);
         fragmentPrecision.floatHigh = handle.getShaderPrecisionFormat(handle.FRAGMENT_SHADER, handle.HIGH_FLOAT);
         fragmentPrecision.intLow = handle.getShaderPrecisionFormat(handle.FRAGMENT_SHADER, handle.LOW_INT);
         fragmentPrecision.intMedium = handle.getShaderPrecisionFormat(handle.FRAGMENT_SHADER, handle.MEDIUM_INT);
         fragmentPrecision.intHigh = handle.getShaderPrecisionFormat(handle.FRAGMENT_SHADER, handle.HIGH_INT);
      }
      // 测试调试渲染器支持
      var extension = this._handleDebugShader = handle.getExtension('WEBGL_debug_shaders');
      if (extension) {
         capability.optionShaderSource = true;
      }
      return true;
   }

   //==========================================================
   // <T>获得参数。</T>
   //
   // @method
   // @param name:String 名称
   // @return Object 参数
   //==========================================================
   public parameter(name) {
      var parameters = this.parameters();
      return parameters[name];
   }

   //==========================================================
   // <T>获得参数集合。</T>
   //
   // @method
   // @return Object 参数集合
   //==========================================================
   public parameters() {
      // 获得属性
      var parameters = this._parameters;
      if (parameters) {
         return parameters;
      }
      // 获得参数
      var names = [
         'ACTIVE_TEXTURE', 'ALIASED_LINE_WIDTH_RANGE', 'ALIASED_POINT_SIZE_RANGE', 'ALPHA_BITS', 'ARRAY_BUFFER_BINDING',
         'BLEND', 'BLEND_COLOR', 'BLEND_DST_ALPHA', 'BLEND_DST_RGB', 'BLEND_EQUATION_ALPHA', 'BLEND_EQUATION_RGB', 'BLEND_SRC_ALPHA', 'BLEND_SRC_RGB', 'BLUE_BITS',
         'COLOR_CLEAR_VALUE', 'COLOR_WRITEMASK', 'COMPRESSED_TEXTURE_FORMATS', 'CULL_FACE', 'CULL_FACE_MODE', 'CURRENT_PROGRAM',
         'DEPTH_BITS', 'DEPTH_CLEAR_VALUE', 'DEPTH_FUNC', 'DEPTH_RANGE', 'DEPTH_TEST', 'DEPTH_WRITEMASK', 'DITHER',
         'ELEMENT_ARRAY_BUFFER_BINDING',
         'FRAMEBUFFER_BINDING', 'FRONT_FACE',
         'GENERATE_MIPMAP_HINT', 'GREEN_BITS',
         'IMPLEMENTATION_COLOR_READ_FORMAT', 'IMPLEMENTATION_COLOR_READ_TYPE',
         'LINE_WIDTH',
         'MAX_COMBINED_TEXTURE_IMAGE_UNITS', 'MAX_CUBE_MAP_TEXTURE_SIZE', 'MAX_FRAGMENT_UNIFORM_VECTORS', 'MAX_RENDERBUFFER_SIZE', 'MAX_TEXTURE_IMAGE_UNITS', 'MAX_TEXTURE_SIZE',
         'MAX_VARYING_VECTORS', 'MAX_VERTEX_ATTRIBS', 'MAX_VERTEX_TEXTURE_IMAGE_UNITS', 'MAX_VERTEX_UNIFORM_VECTORS', 'MAX_VIEWPORT_DIMS',
         'PACK_ALIGNMENT', 'POLYGON_OFFSET_FACTOR', 'POLYGON_OFFSET_FILL', 'POLYGON_OFFSET_UNITS',
         'RED_BITS', 'RENDERBUFFER_BINDING', 'RENDERER',
         'SAMPLE_BUFFERS', 'SAMPLE_COVERAGE_INVERT', 'SAMPLE_COVERAGE_VALUE', 'SAMPLES', 'SCISSOR_BOX', 'SCISSOR_TEST', 'SHADING_LANGUAGE_VERSION',
         'STENCIL_BACK_FAIL', 'STENCIL_BACK_FUNC', 'STENCIL_BACK_PASS_DEPTH_FAIL', 'STENCIL_BACK_PASS_DEPTH_PASS', 'STENCIL_BACK_REF', 'STENCIL_BACK_VALUE_MASK',
         'STENCIL_BACK_WRITEMASK', 'STENCIL_BITS', 'STENCIL_CLEAR_VALUE', 'STENCIL_FAIL', 'STENCIL_FUNC', 'STENCIL_PASS_DEPTH_FAIL', 'STENCIL_PASS_DEPTH_PASS',
         'STENCIL_REF', 'STENCIL_TEST', 'STENCIL_VALUE_MASK', 'STENCIL_WRITEMASK', 'SUBPIXEL_BITS',
         'TEXTURE_BINDING_2D', 'TEXTURE_BINDING_CUBE_MAP',
         'UNPACK_ALIGNMENT', 'UNPACK_COLORSPACE_CONVERSION_WEBGL', 'UNPACK_FLIP_Y_WEBGL', 'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
         'VENDOR', 'VERSION', 'VIEWPORT'];
      var handle = this.handle;
      var count = names.length;
      parameters = new Object();
      for (var i = 0; i < count; i++) {
         var name = names[i];
         parameters[name] = handle.getParameter(handle[name]);
      }
      // 获得调试信息
      var extension = handle.getExtension('WEBGL_debug_renderer_info');
      if (extension) {
         parameters['UNMASKED_RENDERER_WEBGL'] = handle.getParameter(extension.UNMASKED_RENDERER_WEBGL);
         parameters['UNMASKED_VENDOR_WEBGL'] = handle.getParameter(extension.UNMASKED_VENDOR_WEBGL);
      }
      // 设置参数
      this._parameters = parameters;
      return parameters;
   }

   //==========================================================
   // <T>获得扩展。</T>
   //
   // @method
   // @param name:String 名称
   // @return Object 扩展
   //==========================================================
   public extension(name) {
      var extensions = this.extensions();
      return extensions[name];
   }

   //==========================================================
   // <T>获得扩展集合。</T>
   //
   // @method
   // @return Object 扩展集合
   //==========================================================
   public extensions() {
      // 获得属性
      var extensions = this._extensions;
      if (!extensions) {
         extensions = this._extensions = new Object();
         // 获得参数
         var handle = this.handle;
         var names = handle.getSupportedExtensions();
         var count = names.length;
         for (var i = 0; i < count; i++) {
            var name = names[i];
            extensions[name] = handle.getExtension(name);
         }
      }
      return extensions;
   }

   //==========================================================
   // <T>允许浮点纹理。</T>
   //
   // @method
   // @return Boolean 是否允许
   //==========================================================
   public enableFloatTexture() {
      if (!this._statusFloatTexture) {
         var handle = this.handle;
         // 检查浮点纹理
         var extension = handle.getExtension('OES_texture_float');
         if (!extension) {
            return false;
         }
         // 检查浮点纹理采样
         var extension = handle.getExtension('OES_texture_float_linear');
         if (!extension) {
            return false;
         }
         // 设置状态
         this._statusFloatTexture = true;
      }
      return this._statusFloatTexture;
   }

   //==========================================================
   // <T>允许多纹理。</T>
   //
   // @method
   // @return Boolean 是否允许
   //==========================================================
   public enableDrawBuffers() {
      if (!this._statusDrawBuffers) {
         var handle = this.handle;
         // 检查句柄
         var extension = this._handleDrawBuffers;
         if (!extension) {
            return false;
         }
         // 检查浮点纹理采样
         extension.drawBuffersWEBGL([
            extension.COLOR_ATTACHMENT0_WEBGL
         ]);
         // 设置状态
         this._statusDrawBuffers = true;
      }
   }

   //==========================================================
   // <T>开始记录操作。</T>
   //
   // @method
   //==========================================================
   public recordBegin() {
      this.recordBuffers.clear();
      this.recordSamplers.clear();
      this._statusRecord = true;
   }

   //==========================================================
   // <T>解除记录操作。</T>
   //
   // @method
   //==========================================================
   public recordEnd() {
      this._statusRecord = false;
   }

   //==========================================================
   // <T>创建渲染程序。</T>
   //
   // @method
   // @return FProgram3d 顶点缓冲
   //==========================================================
   public createProgram(clazz: Function = FWglProgram) {
      var program = this.createObject(FWglProgram);
      this._storePrograms.push(program);
      this._statistics.programTotal++;
      return program;
   }

   //==========================================================
   // <T>创建布局。</T>
   //
   // @method
   // @return FProgram3d 顶点缓冲
   //==========================================================
   public createLayout(clazz: Function = FWglLayout) {
      var layout = RClass.create(FWglLayout);
      layout.linkGraphicContext(this);
      if (this.capability.optionLayout) {
         layout.setup();
      }
      this._storeLayouts.push(layout);
      this._statistics.layoutTotal++;
      return layout;
   }

   //==========================================================
   // <T>创建顶点缓冲。</T>
   //
   // @method
   // @param clazz:Function 类对象
   // @return FG3dVertexBuffer 顶点缓冲
   //==========================================================
   public createVertexBuffer(clazz: Function = FWglVertexBuffer) {
      var buffer = this.createObject(clazz);
      buffer.linkGraphicContext(this);
      buffer.setup();
      this._storeBuffers.push(buffer);
      this._statistics.vertexBufferTotal++;
      return buffer;
   }

   //==========================================================
   // <T>创建索引缓冲。</T>
   //
   // @method
   // @param clazz:Function 类对象
   // @return FG3dIndexBuffer 索引缓冲
   //==========================================================
   public createIndexBuffer(clazz: Function = FWglIndexBuffer) {
      var buffer = this.createObject(clazz);
      this._storeBuffers.push(buffer);
      this._statistics.indexBufferTotal++;
      return buffer;
   }

   //==========================================================
   // <T>创建平面渲染纹理。</T>
   //
   // @method
   // @param clazz:Function 类对象
   // @return FG3dFlatTexture 平面渲染纹理
   //==========================================================
   public createFlatTexture(clazz: Function = FWglFlatTexture) {
      var texture = this.createObject(clazz);
      this._storeTextures.push(texture);
      this._statistics.flatTextureTotal++;
      return texture;
   }

   //==========================================================
   // <T>创建立方渲染纹理。</T>
   //
   // @method
   // @param clazz:Function 类对象
   // @return FG3dCubeTexture 立方渲染纹理
   //==========================================================
   public createCubeTexture(clazz: Function = FWglCubeTexture) {
      var texture = this.createObject(clazz);
      this._storeTextures.push(texture);
      this._statistics.cubeTextureTotal++;
      return texture;
   }

   //==========================================================
   // <T>创建渲染目标。</T>
   //
   // @method
   // @param clazz:Function 类对象
   // @return FG3dRenderTarget 渲染目标
   //==========================================================
   public createRenderTarget(clazz) {
      //var texture = o.createObject(MO.Runtime.nvl(clazz, MO.FWglRenderTarget));
      //o._storeTargets.push(texture);
      //o._statistics.targetTotal++;
      //return texture;
   }

   //==========================================================
   // <T>设置视角大小。</T>
   //
   // @param left:Integer 左位置
   // @param top:Integer 上位置
   // @param width:Integer 宽度
   // @param height:Integer 高度
   //==========================================================
   public setViewport(left, top, width, height) {
      //o._size.set(width, height);
      //o._viewportRectangle.set(left, top, width, height);
      this.handle.viewport(left, top, width, height);
      RLogger.debug(this, 'Context3d viewport. (location={1},{2}, size={3}x{4})', left, top, width, height);
   }

   //==========================================================
   // <T>设置填充模式。</T>
   //
   // @param fillModeCd:EFillMode 填充模式
   //==========================================================
   public setFillMode(fillModeCd) {
      var graphic = this.handle;
      // 检查状态
      if (this._fillModeCd == fillModeCd) {
         return false;
      }
      this._statistics.frameFillModeCount++;
      //..........................................................
      // 设置开关
      switch (fillModeCd) {
         case EFillMode.Point:
            //graphic.polygonMode(graphic.FRONT_AND_BACK, graphic.POINT);
            break;
         case EFillMode.Line:
            //graphic.polygonMode(graphic.FRONT_AND_BACK, graphic.LINE);
            break;
         case EFillMode.Face:
            //graphic.polygonMode(graphic.FRONT, graphic.FILL);
            break;
         default:
            throw new FError('Invalid parameter. (fill_mode={1})', fillModeCd);
      }
      this._fillModeCd = fillModeCd;
      return true;
   }

   //==========================================================
   // <T>设置深度模式。</T>
   //
   // @param depthFlag:Boolean 深度开关
   // @param depthCd:EDepthMode 深度模式
   // @return 处理结果
   //==========================================================
   public setDepthMode(depthFlag, depthCd) {
      var graphic = this.handle;
      // 检查状态
      if ((this._optionDepth == depthFlag) && (this._depthModeCd == depthCd)) {
         return false;
      }
      this._statistics.frameDepthModeCount++;
      //..........................................................
      // 设置开关
      if (this._optionDepth != depthFlag) {
         if (depthFlag) {
            graphic.enable(graphic.DEPTH_TEST);
         } else {
            graphic.disable(graphic.DEPTH_TEST);
         }
         this._optionDepth = depthFlag;
      }
      // 设置内容
      if (depthFlag && (this._depthModeCd != depthCd)) {
         var depthCode = RWglUtility.convertDepthMode(graphic, depthCd);
         graphic.depthFunc(depthCode);
         this._depthModeCd = depthCd;
      }
      return true;
   }

   //==========================================================
   // <T>设置深度输出模式。</T>
   //
   // @param depthMask:Boolean 深度输出
   // @return 处理结果
   //==========================================================
   public setDepthMask(depthMask) {
      if (this._statusDepthMask != depthMask) {
         this._statistics.frameDepthMaskCount++;
         this.handle.depthMask(depthMask);
         this._statusDepthMask = depthMask;
         return true;
      }
      return false;
   }

   //==========================================================
   // <T>设置剪裁模式。</T>
   //
   // @param cullFlag:Boolean 剪裁开关
   // @param cullCd:ECullMode 剪裁模式
   // @return 处理结果
   //==========================================================
   public setCullingMode(cullFlag, cullCd) {
      var graphic = this.handle;
      // 检查状态
      if ((this._optionCull == cullFlag) && (this._cullModeCd == cullCd)) {
         return false;
      }
      this._statistics.frameCullModeCount++;
      //..........................................................
      // 设置开关
      if (this._optionCull != cullFlag) {
         if (cullFlag) {
            graphic.enable(graphic.CULL_FACE);
         } else {
            graphic.disable(graphic.CULL_FACE);
         }
         this._optionCull = cullFlag;
      }
      // 设置内容
      if (cullFlag && (this._cullModeCd != cullCd)) {
         var cullValue = RWglUtility.convertCullMode(graphic, cullCd);
         graphic.cullFace(cullValue);
         this._cullModeCd = cullCd;
      }
      return true;
   }

   //==========================================================
   // <T>设置融合方式。</T>
   //
   // @param blendFlag:Boolean 剪裁开关
   // @param sourceCd:EBlendMode 来源融合模式
   // @param tagetCd:EBlendMode 目标融合模式
   // @return 处理结果
   //==========================================================
   public setBlendFactors(blendFlag, sourceCd, tagetCd) {
      var graphic = this.handle;
      // 检查状态
      if ((this._statusBlend == blendFlag) && (this._blendSourceCd == sourceCd) && (this._blendTargetCd == tagetCd)) {
         return false;
      }
      this._statistics.frameBlendModeCount++;
      //..........................................................
      // 设置开关
      if (this._statusBlend != blendFlag) {
         if (blendFlag) {
            graphic.enable(graphic.BLEND);
         } else {
            graphic.disable(graphic.BLEND);
            this._blendSourceCd = 0;
            this._blendTargetCd = 0;
         }
         this._statusBlend = blendFlag;
      }
      // 设置效果
      if (blendFlag && ((this._blendSourceCd != sourceCd) || (this._blendTargetCd != tagetCd))) {
         var sourceValue = RWglUtility.convertBlendFactors(graphic, sourceCd);
         var tagetValue = RWglUtility.convertBlendFactors(graphic, tagetCd);
         graphic.blendFunc(sourceValue, tagetValue);
         this._blendSourceCd = sourceCd;
         this._blendTargetCd = tagetCd;
      }
      return true;
   }

   //==========================================================
   // <T>设置有效区域。</T>
   // <P>剪裁区域的原点坐标是屏幕的左下角。</P>
   //
   // @param left:Integer 左位置
   // @param top:Integer 上位置
   // @param width:Integer 宽度
   // @param height:Integer 高度
   //==========================================================
   public setScissorRectangle(left, top, width, height) {
      var handle = this.handle;
      // 设置标志
      var scissorFlag = (width > 0) && (height > 0);
      if (this._statusScissor != scissorFlag) {
         if (scissorFlag) {
            handle.enable(handle.SCISSOR_TEST);
         } else {
            handle.disable(handle.SCISSOR_TEST);
         }
         this._statusScissor = scissorFlag;
      }
      // 设置范围
      if (scissorFlag) {
         handle.scissor(left, top, width, height);
      }
   }

   //==========================================================
   // <T>设置渲染目标。</T>
   //
   // @method
   // @param renderTarget:FG3dRenderTarget 渲染目标
   //==========================================================
   public setRenderTarget(renderTarget) {
      var graphic = this.handle;
      // 检查是否需要切换
      if (this._activeRenderTarget == renderTarget) {
         return;
      }
      this._statistics.frameTargetCount++;
      //............................................................
      // 设置程序
      var result = true;
      if (renderTarget == null) {
         // 解除渲染目标
         graphic.bindFramebuffer(graphic.FRAMEBUFFER, null);
         result = this.checkError("bindFramebuffer", "Bind frame buffer. (frame_buffer={1})", null);
         if (!result) {
            return result;
         }
         // 修改视角
         // var size = o._size;
         // graphic.viewport(0, 0, size.width, size.height);
         //var rectangle = o._viewportRectangle;
         //graphic.viewport(0, 0, rectangle.width, rectangle.height);
      } else {
         // 绑定渲染目标
         graphic.bindFramebuffer(graphic.FRAMEBUFFER, renderTarget._handle);
         result = this.checkError("bindFramebuffer", "Bind frame buffer. (frame_buffer={1})", renderTarget._handle);
         if (!result) {
            return result;
         }
         // 修改视角
         var size = renderTarget.size();
         graphic.viewport(0, 0, size.width, size.height);
      }
      this._activeRenderTarget = renderTarget;
      return result;
   }

   //==========================================================
   // <T>设置渲染程序。</T>
   //
   // @param program 渲染程序
   //==========================================================
   public setProgram(program: FProgram) {
      var graphic = this.handle;
      // 检查参数
      if (this._program == program) {
         return;
      }
      this._statistics.frameProgramCount++;
      //............................................................
      // 设置程序
      var programHandle = null;
      if (program) {
         programHandle = (program as any).handle
      }
      graphic.useProgram(programHandle);
      this._program = program;
      // 检查错误
      return this.checkError("useProgram", "Set program failure. (program={1}, program_native={2})", program, programHandle);
   }

   //==========================================================
   // <T>绑定常量数据。</T>
   //
   // @param shaderCd:EShader 渲染器类型
   // @param slot:Integer 插槽
   // @param formatCd:EParameterFormat 数据类型
   // @param data:Float32Array 数据
   // @param count:Integer 数据个数
   // @return Boolean 处理结果
   //==========================================================
   public bindConst(shaderCd, slot, formatCd, data, count) {
      var graphic = this.handle;
      var result = true;
      this._statistics.frameConstCount++;
      //............................................................
      // 修改数据
      switch (formatCd) {
         case EParameterFormat.Float1: {
            // 修改数据
            graphic.uniform1fv(slot, data);
            this._statistics.frameConstLength += data.byteLength;
            // 检查错误
            result = this.checkError("uniform1fv", "Bind const data failure. (shader_cd={1}, slot={2}, data={3}, count={4})", shaderCd, slot, data, count);
            break;
         }
         case EParameterFormat.Float2: {
            // 修改数据
            graphic.uniform2fv(slot, data);
            this._statistics.frameConstLength += data.byteLength;
            // 检查错误
            result = this.checkError("uniform2fv", "Bind const data failure. (shader_cd={1}, slot={2}, data={3}, count={4})", shaderCd, slot, data, count);
            break;
         }
         case EParameterFormat.Float3: {
            // 修改数据
            graphic.uniform3fv(slot, data);
            this._statistics.frameConstLength += data.byteLength;
            // 检查错误
            result = this.checkError("uniform3fv", "Bind const data failure. (shader_cd={1}, slot={2}, data={3}, count={4})", shaderCd, slot, data, count);
            break;
         }
         case EParameterFormat.Float4: {
            // 修改数据
            graphic.uniform4fv(slot, data);
            this._statistics.frameConstLength += data.byteLength;
            // 检查错误
            result = this.checkError("uniform4fv", "Bind const data failure. (shader_cd={1}, slot={2}, data={3}, count={4})", shaderCd, slot, data, count);
            break;
         }
         case EParameterFormat.Float3x3: {
            // 修改数据
            let bytes = this._data9;
            bytes[0] = data[0];
            bytes[1] = data[4];
            bytes[2] = data[8];
            bytes[3] = data[1];
            bytes[4] = data[5];
            bytes[5] = data[9];
            bytes[6] = data[2];
            bytes[7] = data[6];
            bytes[8] = data[10];
            //graphic.uniformMatrix3fv(slot, graphic.FALSE, bytes);
            graphic.uniformMatrix3fv(slot, false, bytes);
            this._statistics.frameConstLength += bytes.byteLength;
            // 检查错误
            result = this.checkError("uniformMatrix3fv", "Bind const matrix3x3 failure. (shader_cd={1}, slot={2}, data={3}, count={4})", shaderCd, slot, data, count);
            break;
         }
         case EParameterFormat.Float4x4: {
            // 修改数据
            let bytes = null;
            if (data.constructor == Float32Array) {
               bytes = data;
            } else if (data.writeData) {
               bytes = this._data16;
               data.writeData(bytes, 0);
            } else {
               throw new FError(this, 'Unknown data type.');
            }
            //graphic.uniformMatrix4fv(slot, graphic.FALSE, bytes);
            graphic.uniformMatrix4fv(slot, false, bytes);
            this._statistics.frameConstLength += bytes.byteLength;
            // 检查错误
            result = this.checkError("uniformMatrix4fv", "Bind const matrix4x4 failure. (shader_cd={1}, slot={2}, data={3}, count={4})", shaderCd, slot, data, count);
            break;
         }
         default: {
            throw new FError(this, 'Unknown format type. (format_cd={1})', formatCd);
         }
      }
      return result;
   }

   //==========================================================
   // <T>绑定顶点缓冲。</T>
   //
   // @param slot:Integer 插槽
   // @param vertexBuffer:FG3dVertexBuffer 顶点缓冲
   // @param offset:Integer 偏移位置
   // @param formatCd:String 格式
   //==========================================================
   public bindVertexBuffer(slot, vertexBuffer:FVertexBuffer, offset:number, formatCd:any) {
      var graphic = this.handle;
      var result = true;
      this._statistics.frameBufferCount++;
      //............................................................
      // 录制模式
      if (this._statusRecord) {
         var layout = new SLayoutBuffer();
         layout.slot = slot;
         layout.buffer = vertexBuffer;
         layout.index = offset;
         layout.formatCd = formatCd;
         this.recordBuffers.push(layout);
      }
      //............................................................
      // 设定顶点流
      var handle = null;
      if (vertexBuffer != null) {
         handle = (vertexBuffer as any).handle;
      }
      graphic.bindBuffer(graphic.ARRAY_BUFFER, handle);
      // 检查错误
      result = this.checkError("bindBuffer", "Bind buffer. (buffer_id=%d)", handle);
      if (!result) {
         return result;
      }
      //............................................................
      // 激活顶点流
      if (vertexBuffer) {
         graphic.enableVertexAttribArray(slot);
         result = this.checkError("enableVertexAttribArray", "Enable vertex attribute array. (slot=%d)", slot);
         if (!result) {
            return result;
         }
      } else {
         graphic.disableVertexAttribArray(slot);
         result = this.checkError("disableVertexAttribArray", "Disable vertex attribute array. (slot=%d)", slot);
         return result;
      }
      //............................................................
      // 设置顶点流
      var stride = vertexBuffer.stride;
      switch (formatCd) {
         case EAttributeFormat.Float1:
            graphic.vertexAttribPointer(slot, 1, graphic.FLOAT, false, stride, offset);
            break;
         case EAttributeFormat.Float2:
            graphic.vertexAttribPointer(slot, 2, graphic.FLOAT, false, stride, offset);
            break;
         case EAttributeFormat.Float3:
            graphic.vertexAttribPointer(slot, 3, graphic.FLOAT, false, stride, offset);
            break;
         case EAttributeFormat.Float4:
            graphic.vertexAttribPointer(slot, 4, graphic.FLOAT, false, stride, offset);
            break;
         case EAttributeFormat.Byte4:
            graphic.vertexAttribPointer(slot, 4, graphic.UNSIGNED_BYTE, false, stride, offset);
            break;
         case EAttributeFormat.Byte4Normal:
            graphic.vertexAttribPointer(slot, 4, graphic.UNSIGNED_BYTE, true, stride, offset);
            break;
         default:
            throw new FError(this, "Unknown vertex format. (format_cd=%d)", formatCd);
      }
      // 检查错误
      result = this.checkError("glVertexAttribPointer", "Bind vertex attribute pointer. (slot=%d, format_cd=%d)", slot, formatCd);
      return result;
   }

   //==========================================================
   // <T>绑定纹理。</T>
   //
   // @param slot:Object 插槽
   // @param index:Integer 索引
   // @param texture:FG3dTexture 纹理
   // @return 处理结果
   //==========================================================
   public bindTexture(slot, index, texture) {
      var graphic = this.handle;
      var result = true;
      this._statistics.frameTextureCount++;
      //............................................................
      // 录制模式
      if (this._statusRecord) {
         var layout = new SLayoutSampler();
         layout.slot = slot;
         layout.index = index;
         layout.texture = texture;
         this.recordSamplers.push(layout);
      }
      //............................................................
      // 激活纹理
      if (this._activeTextureSlot != slot) {
         graphic.uniform1i(slot, index);
         graphic.activeTexture(graphic.TEXTURE0 + index);
         result = this.checkError("activeTexture", "Active texture failure. (slot=%d, index=%d)", slot, index);
         if (!result) {
            return result;
         }
         this._activeTextureSlot = slot;
      }
      //............................................................
      // 空纹理处理
      if (texture == null) {
         graphic.bindTexture(graphic.TEXTURE_2D, null);
         result = this.checkError("bindTexture", "Bind texture clear failure. (slot=%d)", slot);
         return result;
      }
      //............................................................
      // 绑定纹理
      var handle = texture._handle;
      var textureCd = texture.textureCd();
      switch (textureCd) {
         case ETexture.Flat2d: {
            graphic.bindTexture(graphic.TEXTURE_2D, handle);
            result = this.checkError("glBindTexture", "Bind flag texture failure. (texture_id=%d)", handle);
            if (!result) {
               return result;
            }
            break;
         }
         case ETexture.Cube: {
            graphic.bindTexture(graphic.TEXTURE_CUBE_MAP, handle);
            result = this.checkError("glBindTexture", "Bind cube texture failure. (texture_id=%d)", handle);
            if (!result) {
               return result;
            }
            break;
         }
         default: {
            throw new FError(this, 'Unknown texture type.');
         }
      }
      return result;
   }

   //==========================================================
   // <T>清空内容。</T>
   //
   // @param red:Float 红色
   // @param green:Float 绿色
   // @param blue:Float 蓝色
   // @param alpha:Float 透明
   // @param depth:Float 深度
   //==========================================================
   public clear(red, green, blue, alpha, depth) {
      var graphic = this.handle;
      graphic.clearColor(red, green, blue, alpha);
      graphic.clearDepth(depth);
      graphic.clear(graphic.COLOR_BUFFER_BIT | graphic.DEPTH_BUFFER_BIT);
      this._statistics.frameClearCount++;
   }

   //==========================================================
   // <T>清空颜色内容。</T>
   //
   // @param red:Float 红色
   // @param green:Float 绿色
   // @param blue:Float 蓝色
   // @param alpha:Float 透明
   //==========================================================
   public clearColor(red, green, blue, alpha) {
      var graphic = this.handle;
      graphic.clearColor(red, green, blue, alpha);
      graphic.clear(graphic.COLOR_BUFFER_BIT);
      this._statistics.frameClearCount++;
   }

   //==========================================================
   // <T>清空深度内容。</T>
   //
   // @param depth:Float 深度
   //==========================================================
   public clearDepth(depth) {
      var graphic = this.handle;
      graphic.clearDepth(depth);
      graphic.clear(graphic.DEPTH_BUFFER_BIT);
      this._statistics.frameClearCount++;
   }

   //==========================================================
   // <T>读取指定范围的数据。</T>
   //
   // @param left:Integer 左位置
   // @param top:Integer 上位置
   // @param width:Integer 宽度
   // @param height:Integer 高度
   // @return Uint8Array 数据
   //==========================================================
   public readPixels(left, top, width, height) {
      var graphic = this.handle;
      var length = 4 * width * height;
      var data = new Uint8Array(length);
      graphic.readPixels(left, top, width, height, graphic.RGBA, graphic.UNSIGNED_BYTE, data);
      return data;
   }

   //==========================================================
   // <T>绘制三角形。</T>
   //
   // @param indexBuffer 索引缓冲
   // @param offset:Integer 开始位置
   // @param count:Integer 索引总数
   //==========================================================
   public drawTriangles(indexBuffer: FIndexBuffer, offset, count) {
      var graphic = this.handle;
      var result = true;
      // 设置参数
      if (offset == null) {
         offset = 0;
      }
      if (count == null) {
         count = indexBuffer.count;
      }
      // 设置索引流
      graphic.bindBuffer(graphic.ELEMENT_ARRAY_BUFFER, (indexBuffer as any).handle);
      result = this.checkError("bindBuffer", "Bind element array buffer failure. (index=0x%08X, offset=%d, count=%d, buffer_id)", indexBuffer, offset, count, (indexBuffer as any).handle);
      if (!result) {
         return result;
      }
      // 计算位宽
      var strideCd = indexBuffer.strideCd;
      var strideValue = RWglUtility.convertIndexStride(graphic, strideCd);
      var offsetValue = 0;
      switch (strideCd) {
         case EIndexStride.Uint16:
            offsetValue = offset << 1;
            break;
         case EIndexStride.Uint32:
            offsetValue = offset << 2;
            break;
      }
      // 绘制处理
      var drawModeCd = indexBuffer.drawModeCd;
      var drawModeValue = RWglUtility.convertDrawMode(graphic, drawModeCd);
      switch (drawModeCd) {
         case EDrawMode.Lines:
            //if(indexBuffer._lineWidth){
            //graphic.lineWidth(indexBuffer._lineWidth);
            //}
            //graphic.enable(graphic.BLEND);
            //graphic.enable(graphic.LINE_SMOOTH);
            //graphic.hint(graphic.LINE_SMOOTH_HINT, graphic.FASTEST);
            //graphic.blendFunc(graphic.SRC_ALPHA, graphic.ONE_MINUS_SRC_ALPHA);
            break;
      }
      graphic.drawElements(drawModeValue, count, strideValue, offsetValue);
      this._statistics.frameTriangleCount += count;
      this._statistics.frameDrawCount++;
      result = this.checkError("drawElements", "Draw triangles failure. (index={1}, offset={2}, count={3})", indexBuffer, offset, count);
      if (!result) {
         return result;
      }
      // 清空索引流
      graphic.bindBuffer(graphic.ELEMENT_ARRAY_BUFFER, null);
      result = this.checkError("bindBuffer", "Bind element array buffer failure. (index={1}, offset={2}, count={3})", indexBuffer, offset, count);
      if (!result) {
         return result;
      }
      return result;
   }

   //==========================================================
   // <T>绘制处理。</T>
   //
   // @return 处理结果
   //==========================================================
   public present() {
   }

   //==========================================================
   // <T>检查执行错误。</T>
   //
   // @param code:String 代码
   // @param message:String 消息
   // @param parameter1:String 参数1
   //==========================================================
   public checkError(code, message, ...parameters) {
      // 检查运行模式
      if (!this.capability.optionDebug) {
         return true;
      }
      //if (!MO.Runtime.isDebug()) {
      //   return true;
      //}
      // 获得错误原因
      var graphic = this.handle;
      var result = false;
      var error = null;
      var errorInfo = null;
      while (true) {
         // 获得错误
         error = graphic.getError();
         if (error == graphic.NO_ERROR) {
            result = true;
            break;
         }
         // 获得原因
         switch (error) {
            case graphic.INVALID_OPERATION:
               errorInfo = "Invalid operation.";
               break;
            case graphic.INVALID_ENUM:
               errorInfo = "Invalid enum.";
               break;
            case graphic.INVALID_VALUE:
               errorInfo = "Invalid value.";
               break;
            case graphic.INVALID_FRAMEBUFFER_OPERATION:
               errorInfo = "Invalid paramebuffer opeartion.";
               break;
            case graphic.OUT_OF_MEMORY:
               errorInfo = "Out of memory.";
               break;
            default:
               errorInfo = "Unknown";
               break;
         }
      }
      //............................................................
      // 输出错误信息
      if (!result) {
         RLogger.fatal(this, null, 'OpenGL check failure. (code={1}, description={2})', error, errorInfo);
      }
      return result;
   }

   //===========================================================
   // <T>存储设置。</T>
   //
   // @method
   // @param xconfig:TXmlNode 配置节点
   //===========================================================
   public saveConfig(xconfig) {
      var o = this;
      // 存储参数集合
      var parameters = o.parameters();
      var xparameters = xconfig.create('Parameters');
      RXml.saveObject(xparameters, 'Parameter', parameters);
      // 存储扩展集合
      var extensions = o.extensions();
      var xextensions = xconfig.create('Extensions');
      RXml.saveObject(xextensions, 'Extension', extensions);
   }

   //==========================================================
   // <T>释放处理。</T>
   //
   // @method
   //==========================================================
   public dispose() {
      var o = this;
      // 释放属性
      o._data9 = null;
      o._data16 = null;
      // 释放属性
      o.recordBuffers = RObject.dispose(o.recordBuffers);
      o.recordSamplers = RObject.dispose(o.recordSamplers);
      // 释放属性
      //o._contextAttributes = null;
      o._parameters = null;
      o._extensions = null;
      o._activeTextureSlot = null;
      o._handleDrawBuffers = null;
      o._handleSamplerS3tc = null;
      o._handleDebugShader = null;
      // 父处理
      super.dispose();
   }
}