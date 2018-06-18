cb.define({
	xtype: 'controller',
	name: 'ci-bus',
	
	route: {
		'#loadview/:str': 'loadview',
		'#home': 'loadhome'
	},
	
	loadview: function (hash) {
		if (hash[1] == 'items') {
			cb.getCmp('#mainmenu-items').show();
		} else {
			cb.getCmp('#mainmenu-items').hide();
		}
		cb.render(cb.getView(hash[1]));
		$('pre code').each(function(i, block) {
		    hljs.highlightBlock(block);
		});
	},
	
	loadhome: function () {
		cb.render(cb.getView('ci-bus'));
	},
	
	onload: function () {
	    
		//Load font
		$.cachedScript("https://fonts.googleapis.com/css?family=Quicksand:300,400", "css");
		$('body').css({
			'font-family': 'Quicksand, Verdana, Arial',
			'font-weight': 300
		});
		
		// Load highlight style and script
		$.cachedScript("libraries/highlight/styles/tomorrow.css", "css");
		$.cachedScript("libraries/highlight/highlight.pack.js", "js").done(function () {
			cb.loadAll([
			    //['component', 'gotorave', 'review'],
				['store', 'ci-bus', 'code'],
				['store', 'ci-bus', 'texts'],
				['view', 'common', 'base'],
				['view', 'ci-bus', 'mainmenu'],
				['view', 'ci-bus', 'doc/createmodule'],
				['view', 'ci-bus', 'doc/controllers'],
				['view', 'ci-bus', 'doc/views'],
				['component', 'ci-bus', 'totestcode'],
				['view', 'ci-bus', 'doc/items'],
				['view', 'ci-bus', 'ci-bus']
			], function () {
				cb.router.hashchange();
			});
		});
	},
	
	formatCode: function (code) {
	    code = code.replace(new RegExp('{',"g"), '&#123;');
	    code = code.replace(new RegExp('}',"g"), '&#125;');
	    return code;
	}
});