package org.mo.data.synchronizer;

import org.mo.com.xml.FXmlNode;

//============================================================
// <T>数据同步器控制台接口。</T>
//============================================================ 
public interface ISynchronizerConsole
{
   //============================================================
   // <T>加载配置节点处理。</T>
   //
   // @param xconfig 配置节点
   //============================================================
   void loadConfig(FXmlNode xconfig);

   //============================================================
   // <T>加载配置文件名称。</T>
   //
   // @param fileName 文件名称
   //============================================================
   void loadFile(String fileName);

   //============================================================
   // <T>启动处理。</T>
   //============================================================
   void startup();
}