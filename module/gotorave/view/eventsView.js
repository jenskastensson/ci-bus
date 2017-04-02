
cb.define({

	xtype: 'view',
	name: 'events',

	items: [{
		renderTo: '#body-col2',
		xtype: 'div',
		id: 'events-content',
		storelink: {
			id: 'events-strlk',
			store: 'events',
			field: 'ev',
			renderTo: '#events-content',
			alterdata: {
				'date': function(dt){
					var pdt = dt.split('-');
					if(pdt[2]){
						var res = pdt[2]+" "+cb.getConfig('meses', pdt[1])+" "+pdt[0];
						return res;
					}
				}
			},
			structure: {
				xtype: 'div',
				css: {'padding-bottom': '10px'},
				items: [{
					xtype: 'panel',
					type: 'info',
					attr: {'data-id': btoa('id')},
					items: [{
						xtype: 'head',
						items: [{
							xtype: 'review',
							attr: {data: 'event'},
							float: 'right',
							css: {'margin-right': '-5px'}
						},{
							xtype: 'div',
							cls: 'text-left',
							css: {'font-size': '19px'},
							field: 'name'
						}]
					},{
						xtype: 'body',
						cls: 'text-center',
						items: [{
							xtype: 'img',
							css: {'width': '100%', 'margin-bottom': '10px'},
							attr: {'src': btoa('image')}
						},{
							xtype: 'blockquote',
							field: 'description'
						},{
							xtype: 'blockquote',
							items: [{
								xtype: 'b',
								text: 'Fecha '
							},{
								xtype: 'span',
								text: btoa('date')
							}]
						},{
							xtype: 'blockquote',
							items: [{
								xtype: 'b',
								text: 'Lugar '
							},{
								xtype: 'span',
								text: btoa('postal')
							}]
						},{
							xtype: 'div',
							id: 'div1234',
							text: 'test'
						}]
					},{
						xtype: 'footer',
						storelink: {
							id: 'event-tags-strlk',
							store: 'current',
							field: 'tags',
							structure: {
								xtype: 'div',
								cls: 'label label-default',
								css: {
									'margin-right': '10px',
									'font-size': '17px'
								},
								text: btoa('name')
							}
						}
					}]
				}]
			}
		}
	}]

});