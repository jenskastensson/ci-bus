
cb.define({
	xtype: 'view',
	name: 'base',
	items: [{
		xtype: 'header',
		renderTo: 'body'
	},{
		xtype: 'div',
		appendTo: 'body',
		id: 'content'
	},{
		xtype: 'footer',
		appendTo: 'body'
	}]
});