cb.define({

	xtype: 'view',
	name: 'chat',
	renderTo: '#chat-panel-body',

	items: {
		store: 'chat',
		field: 'chat',
		alterdata: {
			'online': function(onl){
				if(onl==1){
					return cb.create({
						xtype: 'badge',
						text: 'online',
						pull: 'right',
						color: '#555',
						css: {'background-color': '#ccfbcc'}
					}).outerHTML;
				}
				else return ' ';
			}
		},
		xtype: 'callout',
		margin: '3px',
		padding: '5px',
		type: '{type}',
		title: '{user} {online}',
		text: '{msg}'
	}
});