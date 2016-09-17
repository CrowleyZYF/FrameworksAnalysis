# js-cookie
## 基本信息
- 名称：js-cookie
- 地址：<https://github.com/js-cookie/js-cookie>
- 作者：[js-cookie](https://github.com/js-cookie)
- 数据：**S**-3853 / **W**-173 / **F**-601 
- 代码：156行
- 更新：2016-09-17

## 简介
主要封装了JS的Cookie操作，前身是jquery-cookie。主要特点如下：
- 兼容所有游览器
- 支持所有字符
- 没有依赖性
- 支持JSON
- 支持AMD/CommonJS
- 命名标准为RFC 6265
- 支持自定义的编码/解码
- 压缩后只有900B

## 设计
1. **基本框架:** IIFE
	- 第一个分号是为了防止在uglify的时候，前一个js文件漏写分号后导致IIFE解析错误

	```javascript
	;(function (factory) {
		/*
		* 环境检测部分 CodeBlock-1:
		* 检测是不是AMD或者CommonJS的环境
		* 如果是
		* 则按照它们方式进行模块导入
		* 如果不是
		* 那么注册工厂函数
		*/
	}(function () {
		/*
		* API功能实现部分 CodeBlock-2:
		* 工厂函数，同时使用闭包暴露出有限且规范的接口
		*/
	}));
	```
2. **环境检测部分:** 三个条件判断，判断是否支持AMD/CommonJS，如果不支持就直接初始化工厂函数
	- **AMD:** [Asynchronous Module Definition](Asynchronous Module Definition)
	- **CommonJS:** [Common Module Definition](https://github.com/seajs/seajs/issues/242)

	```javascript
		//CodeBlock-1
		var registeredInModuleLoader = false;
		if (typeof define === 'function' && define.amd) {
			define(factory);
			registeredInModuleLoader = true;
		}
		if (typeof exports === 'object') {
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			/*
			* 这里主要是两个功能
			* 一个是初始化
			* 另外一个解决冲突问题
			* 
			*  
			* noConflict的调用会有两种情况:
			* 
			* 1. 的确有冲突，window.Cookies存了其他东西:
			* 这个时候用户调用noConflict时候，
			* 因为var OldCookies = window.Cookies;
			* 已经把旧版的内容给存储了下来
			* 所以即便window.Cookies = factory();
			* 把旧版的内容给顶替掉了
			* 在noConflict调用的时候，也可以通过OldCookies恢复过来
			* 然后再通过闭包形成的私有变量api返回给新的变量
			* 
			* 2. 没有冲突，window.Cookies为undefined:
			* 这样的话OldCookies就是undefined
			* 所以window.Cookies就reset成了undefined
			* 但是不能因为这样就把OldCookies删了
			* 把window.Cookies = OldCookies;改成
			* window.Cookies = undefined;
			* 因为那样处理不了第一种情况
			* var OldCookies = window.Cookies;
			*/
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	```
3. **API功能实现部分:** 
	- **基本架构:**
	
	```javascript
		function(){
			//扩展配置项 CodeBlock-2
			function extend () {
				//CodeBlock-2.1
	
			}
			//初始化库
			function init (converter){
				//CodeBlock-2.2
			}
			
			//按照默认配置初始化一次
			//参数必须要传，原因后面解释
			return init(function () {});
		}
	```
	- 
	
4. 


