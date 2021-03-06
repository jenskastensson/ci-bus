
cb.define({
	xtype: 'view',
	name: 'home',
	items: [{
		xtype: 'container',
		renderTo: '#content',
		cls: 'text-center',
		type: 'fluid',
		css: {'padding-top': '50px'},
		items: [{
			xtype: 'row',
			items: [{
				xtype: 'col',
				size: {
					xs: 0,
					sm: 3,
					lg: 4
				}
			},{
				xtype: 'col',
				size: {
					xs: 12,
					sm: 6,
					lg: 4,
				},
				items: [{
					xtype: 'panel',
					type: 'info',
					css: {'box-shadow': '0px 0px 20px -4px rgba(0,0,0,0.5)'},
					items: [{
						xtype: 'head',
						title: 'Conectar usuario'
					},{
						xtype: 'body',
						items: [{
							xtype: 'form',
							name: 'chat-login',
							items: [{
								xtype: 'group',
								items: [{
									xtype: 'input',
									type: 'hidden',
									name: 'action',
									value: 'login'
								},{
									xtype: 'label',
									text: 'Correo electrónico'
								},{
									xtype: 'input',
									type: 'text',
									name: 'user'
								}]
							},{
								xtype: 'group',
								items: [{
									xtype: 'label',
									text: 'Contraseña'
								},{
									xtype: 'input',
									type: 'password',
									name: 'pass',
									listeners: {
										keyup: function(e){
											if(e.keyCode == 13){
												cb.ctr('gotorave', 'login');
											}
										}
									}
								}]
							},{
								xtype: 'group',
								items: [{
									xtype: 'button',
									type: 'primary',
									glyphicon: 'link',
									text: ' Conectar, vamos de fiesta ',
									css: {'padding-right':'20px'},
									listeners: {
										click: function(e){
											e.preventDefault();
											cb.ctr('gotorave', 'login');
										}
									}
								}]
							},{
								xtype: 'a',
								text: 'Soy nuevo, quiero registrarme',
								listeners: {
									click: function(){
										cb.ctr('gotorave', 'inforeg');
									}
								}
							}]
						}]
					},{
						xtype: 'footer',
						text: '¿No recuerdas tu contraseña? ',
						items: [{
							xtype: 'a',
							text: ' Haz click aquí'
						}]
					}]
				}]
			},{
				xtype: 'col',
				size: {
					xs: 0,
					sm: 3,
					lg: 4
				}
			}]
		}]
	}]
});