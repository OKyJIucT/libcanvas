/*
---
description: Extends native prototypes with several useful functions

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Number.degree
- Number.getDegree
- Number.normalizeAngle
- Number.between
- String.repeat
- String.safeHTML
- String.nl2br
- String.replaceAll
- String.begins
- Array.getLast
- Array.remove
- Array.sum
- Array.remove
- Array.average
- Array.firstReal
- Array.shuffle
- Array.sortBy
- $log
- $equals
- Math.hypotenuse
- Math.cathetus
- parseUri
*/

// Number
(function () {


Number.implement({
	/**
	 * Cast degrees to radians
	 * (90).degree() == Math.PI/2
	 */
	degree: function () {
		return this * Math.PI / 180;
	},
	/**
	 * Cast radians to degrees
	 * (Math.PI/2).getDegree() == 90
	 */
	getDegree: function () {
		return this / Math.PI * 180;
	},
	normalizeAngle : function () {
		var num = this;
		while (num < 0) {
			num += (360).degree();
		}
		return num % (360).degree();
	},
	between: function (n1, n2, equals) {
		return (n1 <= n2) && (
			(equals == 'L'   && this == n1) ||
			(equals == 'R'   && this == n2) ||
			(  this  > n1    && this  < n2) ||
			([true, 'LR', 'RL'].contains(equals) && (n1 == this || n2 == this))
		);
	}
});

})();

// String
String.implement({
	repeat: function (times) {
		var s = this;
		new Number(times).times(function (t) {
			s += this;
		}, this);
		return s;
	},
	safeHTML: function () {
		return this.replace(/[<'&">]/g, function (symb) {
			return {
				'&'  : '&amp;',
				'\'' : '&#039;',
				'\"' : '&quot;',
				'<'  : '&lt;',
				'>'  : '&gt;'
			}[symb];
		});
	},
	nl2br: function () {
		return this.replaceAll('\n', '<br />\n');
	},
	replaceAll: function (find, replace) {
		return this.split(find).join(replace);
	},
	begins: function (w, caseInsensitive) {
		return (caseInsensitive) ? w == this.substr(0, w.length) :
			w.toLowerCase() == this.substr(0, w.length).toLowerCase();
	}
});

// Array
Array.implement({
	getLast : function () {
		return this[this.length - 1];
	},
	remove: function (index) {
		this.splice(index, 1);
		return this;
	},
	sum: function () {
		var s = 0;
		this.each(function (elem) {
			s += elem;
		});
		return s;
	},
	average: function () {
		return this.sum() / this.length;
	},
	firstReal: function () {
		for (var i = 0; i < this.length; i++) {
			if ($chk(this[i])) {
				return this[i];
			}
		}
		return null;
	},
	shuffle : function () {
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
		return this;
	},
	sortBy : function (method, reverse) {
		var get = function (elem) {
			return elem[method] ? elem[method]() : 0;
		}
		return this.sort(function ($0, $1) {
			var result = get($1) - get($0) >= 0 ? 1 : -1;
			return reverse ? -result : result;
		});
	}
});

// <image> tag
$extend(HTMLImageElement.prototype, {
	sprite : function () {
		if (!this.isLoaded()) {
			$log('Image not loaded in Image.sprite: ', this);
			throw 'Image not loaded in Image.sprite, logged';
		}
		var buf;
		if (arguments.length) {
			var rect = new LibCanvas.Shapes.Rectangle;
			rect.set.apply(rect, arguments);
			var index = [rect.from.x,rect.from.y,rect.width,rect.height].join('.');
			this.spriteCache = this.spriteCache || {};
			buf = this.spriteCache[index]
			if (!buf) {
				buf = LibCanvas.Buffer(rect.width, rect.height);
				buf.getContext('2d-libcanvas').drawImage({
					image : this,
					crop  : rect,
					draw  : [0,0,rect.width,rect.height]
				});
				this.spriteCache[index] = buf;
			}

		} else {
			buf = LibCanvas.Buffer(this.width, this.height);
			buf.getContext('2d-libcanvas').drawImage(this, 0, 0);
		}
		return buf;
	},
	isLoaded : function () {
		if (!this.complete) {
			return false;
		}
		return !$defined(this.naturalWidth) || this.naturalWidth; // browsers
	}
});

// else
var $log = function () {
	try {
		console.log.apply(console, arguments);
	} catch (e) {}
};

var $equals = function (obj1, obj2) {
	var plain = function (obj) {
		return typeof obj != 'object' ||
			[false, 'element', 'textnode', 'whitespace']
				.contains($type(obj));
	}
	if (obj1 == obj2) {
		return true;
	} else if (plain(obj1) || plain(obj2)) {
		return obj1 == obj2;
	} else {
		for (var i in obj1) {
			if (!(i in obj2) || !$equals(obj1[i], obj2[i])) {
				return false;
			}
		}
	}
	return true;
};

Math.hypotenuse = function (cathetus1, cathetus2)  {
    return (cathetus1.pow(2) + cathetus2.pow(2)).sqrt();
};


Math.cathetus = function (hypotenuse, cathetus2)  {
    return (hypotenuse.pow(2) - cathetus2.pow(2)).sqrt();
};

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str || window.location),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
}

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};