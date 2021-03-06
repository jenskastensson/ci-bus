
cb.define({

	xtype: 'view',
	name: 'users',

	items: [{
		renderTo: '#body-col2',
		xtype: 'div',
		id: 'panel-add-friend',
		display: 'none',
		items: [{
			xtype: 'panel',
			reload: false,
			type: 'info',
			margin: '0 0 10px 0',
			items: [{
				xtype: 'head',
				items: [{
					xtype: 'div',
					cls: 'text-left',
					css: {'font-size': '19px'},
					text: 'Invita a tu mejor amig@ a la comunidad'
				}]
			},{
				xtype: 'body',
				items: [{
					xtype: 'small',
					color: 'red',
					text: 'Solo puedes invitar a ' + cb.getConfig('user_data').add_friends + ' persona'
				},{
					xtype: 'h5',
					text: 'Introduce el correo electrónico'
				},{
					xtype: 'input',
					type: 'text',
					placeholder: 'ejemplo@email.com',
					name: 'invitemailuser',
					listeners: {
						keyup: function(){
							var t = $(this).val();
							var n1 = cb.strpos(t,'@');
							var n2 = cb.strpos(t,'.');
							if(n1!==false && n2!==false && n1>0 && n2>n1+2 && n2<t.length-2){
								$('#user_invitar_but').addClass('btn-primary');
								cb.enable('#user_invitar_but');
							}else{
								$('#user_invitar_but').removeClass('btn-primary');
								cb.disable('#user_invitar_but');
							}
						}
					}
				},{
					xtype: 'button',
					id: 'user_invitar_but',
					text: 'Invitar',
					margin: '10px 0 0 0',
					disabled: true,
					listeners: {
						click: function(){
							cb.ctr('gotorave','inviteuser')
						}
					}
				}]
			},{
				xtype: 'footer',
				id: 'user-progress',
				padding: '0',
				display: 'none',
				items: [{
					xtype: 'progress',
					margin: '0',
					items:[{
						striped: true,
						animated: true,
						value: 0
					}]
				}]
			}]
		},{
			xtype: 'div',
			id: 'users-content',
			items: {
				store: 'users',
				field: 'usr',
				xtype: 'panel',
				id: 'testpanel',
				type: 'info',
				css: {'margin-bottom': '10px'},
				attr: {'data-id': '{id}'},
				items: [{
					xtype: 'head',
					items: [{
						xtype: 'review',
						attr: {data: 'user'},
						float: 'right',
						css: {'margin-right': '-5px'}
					},/* {
						xtype: 'button',
						float: 'right',
						text: 'AAA {following}'
					},*/ {
						xtype: 'div',
						cls: 'text-left',
						css: {'font-size': '19px'},
						field: 'name'
					}]
				},{
					xtype: 'body',
					items: [{
						xtype: 'img',
						id: '{id}',
						css: {'width': '100%'},
						attr: {'src': '{image}'}
					}]
				},{
					xtype: 'footer',
					css: {overflow: 'auto'},
					items: {
						field: 'tags',
						xtype: 'div',
						cls: 'label label-default',
						css: {
							'margin-right': '10px',
							'font-size': '17px'
						},
						text: '{name}'
					}
				}]
			}
		}]
	}]
});