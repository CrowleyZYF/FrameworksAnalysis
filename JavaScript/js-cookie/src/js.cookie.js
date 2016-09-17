/*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
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
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	//拓展cookie的配置项，会将所有参数的键值对合并在一起
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write
			// 如果参数的个数大于1，说明是写cookie
			if (arguments.length > 1) {
				//首先是合并所有的配置项
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				//过期时间需要设置成天数，这里会自动转化成毫秒
				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				//如果传进来的是JSON对象，那么stringify之后的第一个字符是{或者[，如果是的话，就换一下，因为之前传进来的是对象，cookie存的是对象
				//如果不是，就不用管了，因为本来就是字符串
				try {
					result = JSON.stringify(value);
					//^在开头代表了匹配开头，不是非的意思，非的话是在[]里面的那种
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				//这里对value进行百分号转义处理，遵守RFC 6265的标准，如果有其它的标准的话，可以自己编写converter
				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				//对key进行百分号转义以及()的处理
				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				//拼接键值对和相关的配置
				return (document.cookie = [
					key, '=', value,
					attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					attributes.path ? '; path=' + attributes.path : '',
					attributes.domain ? '; domain=' + attributes.domain : '',
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// 如果参数个数小于1个，如果没有参数，那就返回空，如果有一个参数，就继续处理
			// Read
			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				/*
				* 这里为了获取value， 先用=分隔，之后用=连接是因为可能value里包含了=，比如baidu就是
				* BAIDUID=70947D3040ABFDC14431B2DE9:FG=1
				*/
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				//如果是json对象的话，因为当时是用stringify存进去的，所以value的第一个字符串和最后一个字符串都是"，所以需要删除一下
				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					//key进行解码
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					//这个json的布尔值会通过apply传进来
					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					//如果匹配上了，就break直接返回了
					if (key === name) {
						result = cookie;
						break;
					}

					//如果没有key，就把所有cookie都返回
					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		//这里这样写应该是为了不接受多余的参数，你也是屌的－ －
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			//apply里的第一个参数，就是调用对象，都是this指针所指的东西，所以在api里可以通过this.json可以访问到这个对象
			//需要return，是因为这里调用后，如果不返回结果就在函数里，没有返回出去
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		//过期时间设置为-1就相当于删除了
		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		//这样子为了调用withConverter的时候，可以重新调用初始化函数，来加上新的转化器
		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
