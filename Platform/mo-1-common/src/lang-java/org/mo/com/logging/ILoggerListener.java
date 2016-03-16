/*
 * @(#)ILoggerListener.java
 *
 * Copyright 2008 microbject, All Rights Reserved.
 *
 */
package org.mo.com.logging;

import org.mo.com.system.IListener;

//============================================================
// <T>日志监听接口。</T>
//============================================================
public interface ILoggerListener
      extends
         IListener
{
   //============================================================
   // <T>初始化处理。</T>
   //============================================================
   void initialize();

   //============================================================
   // <T>日志处理。</T>
   //
   // @param sender 发出者
   // @param level 级别
   // @param info 信息
   //============================================================
   boolean processLogger(Object sender,
                         int level,
                         SLoggerInfo info);

   //============================================================
   // <T>刷新处理。</T>
   //============================================================
   void refresh();

   //============================================================
   // <T>释放处理。</T>
   //============================================================
   void release();
}