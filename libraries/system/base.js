var cb = {};
cb.module = {};
cb.module.controller = {};
cb.module.view = {};
cb.module.store = {};
cb.module.storelink = {};
cb.module.component = {};
cb.config = [];
cb.elenamed = 0;

cb.autoname = function(){
	var r = 'autoname_'+this.elenamed;
	this.elenamed++;
	return r;
}

cb.ctr = function(ctr, fun, vals)
{
	if(cb.module.controller[ctr] && $.type(cb.module.controller[ctr][fun]) == 'function'){
		cb.module.controller[ctr][fun](vals);
	}
}

cb.get = function(type, name, field){
	return cb.module[type]? cb.module[type][name]? cb.module[type][name][field]? cb.module[type][name][field]: cb.module[type][name]: false: false;
}

cb.send = function(formn,module,store,callback)
{
	$.ajax({
	  dataType: "script",
	  cache: true,
	  url: module+'/store/'+store,
	  method: 'post',
	  contentType: "application/x-www-form-urlencoded;charset=UTF-8",
	  data: $("form[name='"+formn+"']").serializeArray(),
	  success: callback
	});
}

cb.require = function(dt, callback)
{
	$.ajax({
			dataType: "script",
			cache: true,
			method: 'post',
			data: {data:JSON.stringify(dt)},
			url: 'require',
			success: callback
	});
}

cb.loadLineal = function (arr)
{
	if($.isArray(arr[0]))
	{
		cb.load(arr[0][0], arr[0][1], arr[0][2], arr[0][3], cb.loadSecondLineal(arr, 0));
	}
	else if($.isArray(arr) && arr.length > 2)
	{
		cb.load(arr[0], arr[1], arr[2], arr[3]);
	}
}

cb.loadSecondLineal = function(arr, n)
{
	return function(data, textStatus, jqXHR) {
		n++;
		if($.isArray(arr[n]))
		{
	        cb.load(arr[n][0], arr[n][1], arr[n][2], arr[n][3], cb.loadSecondLineal(arr, n));
		}
    };
}

cb.load = function(type, module, name, data, callback)
{
	if($.isFunction(name))
	{
		callback = name;
		name = module;
	}
	if(!name) name = module;
	if($.isFunction(data))
	{
		callback = data;
		data = {};
	}
	if($.isPlainObject(name))
	{
		data = name;
		name = module;
	}
	if(type == 'store')
	{
		if(!this.module.storelink[name])
		{
			this.module.storelink[name] = {};
		}
		$.ajax({
		  dataType: "script",
		  cache: true,
		  url: module+'/'+type+'/'+name,
		  method: 'post',
		  data: data,
		  success: callback
		});
	}
	else if(type == 'component')
	{		
		if(!this.module.component[name])
		{
			this.module.component[name] = {};
		}
		
		$.ajax({
		  dataType: "script",
		  cache: true,
		  url: module+'/'+type+'/'+name,
		  method: 'post',
		  data: data,
		  success: callback
		});
	}
	else
	{
		$.cachedScript(module+'/'+type+'/'+name,'js').done(callback);
	}
}

cb.define = function(obj)
{
	if(obj.name && obj.xtype)
	{
		if(obj.xtype == 'store')
		{
			if(!this.module.storelink[obj.name]) this.module.storelink[obj.name] = new Object;
			this.storeSetValues(obj.name, obj.data);
		}
		if(obj.data && this.module[obj.xtype][obj.name])
		{
			for(var fie in this.module[obj.xtype][obj.name].data)
			{
				if(!obj.data[fie]) obj.data[fie] = this.module[obj.xtype][obj.name].data[fie];
			}
		}
		this.module[obj.xtype][obj.name] = obj;
		if($.isArray(obj['require'])) this.require(obj['require']);
		if($.isFunction(obj['onload'])) obj['onload']();
		if(obj.xtype == 'view') this.render(obj);
	}
}

cb.storeAppendValues = function(elep, storelink, data)
{
	if(storelink.renderTo)
	{
		$(storelink.renderTo).empty();
	}
	
	if(elep)
	{
		storelink.appendTo = elep;
	}
	
	if($.isArray(data))
	{
		this.storeSetArray(storelink, storelink.field, data);
	}
	else if($.isPlainObject(data))
	{
		this.storeSetObject(storelink, storelink.field, data);
	}
	
	return elep;
}
cb.storeSetObject = function(strlk, field, data)
{
	if($.isPlainObject(data) && strlk['field'] == field && strlk.structure)
	{
		strlk.structure.data = data;
		var ele = this.create(strlk.structure);
		var Avalues = [];
		var AAlinks = [];
		for(var field2 in data)
		{
			if($.isArray(data[field2]))
			{
				var parse_field = field? field+'.'+field2 : field2;
				this.storeSetArray(strlk, parse_field, data[field2]);
			}
			else if($.isPlainObject(data[field2]))
			{
				var parse_field = field? field+'.'+field2 : field2;
				this.storeSetObject(strlk, parse_field, data[field2]);
			}
			else
			{
				var links = "";
				var Alinks = [];
				if(field)
				{
					var t_field = field+'.'+field2;
					var p_field = t_field.split('.');
					for(var r=0; r<p_field.length; r++)
					{
						var t2_field = "";
						for(var r2=r; r2<p_field.length; r2++)
						{
							t2_field += p_field[r2];
							if(r2<p_field.length - r && r2<p_field.length-1) t2_field += ".";
						}
						links += "[strlk='"+btoa(t2_field)+"']";
						Alinks.push(btoa(t2_field));
						if($.isPlainObject(strlk.alterdata))
						{
							if(strlk.alterdata[t2_field])
							{
								data[field2] = strlk.alterdata[t2_field](data[field2]);
							}
						}
						if(r<p_field.length-1) links += ", ";
					}
				}
				else 
				{
					links = "[strlk='"+btoa(field2)+"']";
					Alinks.push(btoa(field2));
				}
				if(links != "")
				{
					cb.storeSet($(ele).find(links), data[field2]);
					Avalues.push(data[field2]);
					AAlinks.push(Alinks);
				}
			}
		}
		
		if(strlk.fastset)
		{
			var htmlString = $(ele).prop('outerHTML');
			
			for(var t=0; t<Avalues.length; t++)
			{
				for(var r=0; r<AAlinks[t].length; r++)
				{
					htmlString = htmlString.replace(new RegExp(AAlinks[t][r],"g"), Avalues[t]);
				}
			}
			
			$(strlk.appendTo).append(htmlString);
		}
		else
		{	
			cb.storeRecursiveSet(ele, AAlinks, Avalues);
			$(strlk.appendTo).append(ele);
		}
	}
	else if($.isArray(data))
	{
		this.storeSetArray(strlk, field, data);
	}
}
cb.storeRecursiveSet = function(elem, links, values)
{
	if($(elem).children().length)
	{
		$(elem).children().each(function(idx){
			cb.storeRecursiveSet(this, links, values);
		});
	}
	else
	{
		if($(elem).is('input')) var t_cn = $(elem).val();
		else var t_cn = $(elem).html();
		if(t_cn)
		{
			var t_cn2 = t_cn;
			for(var t=0; t<values.length; t++)
			{
				for(var s=0; s<links[t].length; s++)
				{
					t_cn2 = t_cn2.replace(new RegExp(links[t][s],"g"), values[t]);
				}
			}
			if(t_cn2 != t_cn)
			{
				if($(elem).is('input')) $(elem).val(t_cn2);
				else $(elem).html(t_cn2);
			}
		}
	}
	if (elem.hasAttributes && elem.hasAttributes()) {
		var attrs = elem.attributes;
		var staff = $(elem).html();
		for(var c=0; c<attrs.length; c++)
		{
			for(var t=0; t<values.length; t++)
			{
				for(var s=0; s<links[t].length; s++)
				{
					var nam = attrs[c].name;
					if(nam != "strlk")
					{
						var val = attrs[c].value;
						val = val.replace(new RegExp(links[t][s],"g"), values[t]);
						nam = nam.replace(new RegExp(links[t][s],"g"), values[t]);
						if(nam != attrs[c].name)
						{
							$(elem).removeAttr(nam).attr(nam, val);
						}
						else if(val != attrs[c].value)
						{
							$(elem).attr(nam, val);
						}
						staff = staff.replace(new RegExp(links[t][s],"g"), values[t]);
					}
				}
			}
		}
		if(staff != $(elem).html())$(elem).html(staff);
	}
	return elem;
}
cb.storeSetArray = function(strlk, field, data)
{
	if($.isArray(data))
	{
		for(var t=0; t<data.length; t++)
		{
			if($.isArray(data[t]))
			{
				this.storeSetArray(strlk, field, data[t]);
			}
			else if($.isPlainObject(data[t]))
			{
				if($.isArray(strlk.structure))
				{
					for(var i=0; i<strlk.structure.length; i++)
					{
						var t_strlk = strlk;
						t_strlk.structure = t_strlk.structure[i];
						this.storeSetObject(t_strlk, field, data[t]);
					}
				}
				else
				{
					this.storeSetObject(strlk, field, data[t]);
				}
			}
		}
	}
}
cb.storeSetValues = function(store, data)
{
	if($.isPlainObject(this.module.storelink[store]))
	{
		strlk = this.module.storelink[store];
		for(var str in strlk)
		{
			if(data[ strlk[str].field ])
			{
				if(strlk[str].renderTo)
				{
					$(strlk[str].renderTo).empty();
					strlk[str].appendTo = strlk[str].renderTo;
				}
				for(var field in data)
				{
					if($.isArray(data[field]))
					{
						this.storeSetArray(strlk[str], field, data[field]);
					}
					else if($.isPlainObject(data[field]))
					{
						this.storeSetObject(strlk[str], field, data[field]);
					}
				}
			}
		}
	}

	for(var field in data)
	{
		if($("[strlk='"+btoa(store+'.'+field)+"']"))
		{
			$("[strlk='"+btoa(store+'.'+field)+"']").trigger('storelink', {'data': data[field], 'field': field});
		}
	}
}

cb.storeSet = function(ele, value)
{
	if($(ele).is('input'))
	{
		$(ele).val(value);
	}
	else
	{
		$(ele).html(value);
	}
	return ele;
}

cb.setConfig = function(va, val){
			
	if($.isArray(va) || $.isPlainObject(va))
	{	
		this.config = $.extend(this.config, va);
	}
	else
	{
		this.config[va] = val;
	}
}

cb.getConfig = function(va, var2){
			
	if(!var2){
		if(this.config[va])
		{
			return this.config[va];
		}
	}else{
		if(this.config[va])
		{
			if(this.config[va][var2])
			{
				return this.config[va][var2];
			}
		}
	}
}

cb.render = function(obj, callback)
{
	vw = obj.name;
	if($.isPlainObject(obj.items))
	{
		if(obj.items.reload !== false || !$('#'+obj.items.id).length){
			if(obj.items.renderTo){
				$(obj.items.renderTo).html('');
			}
			this.create(obj.items);
		}
	}
	else if($.isArray(obj.items))
	{
		for (var j=0; j<obj.items.length; j++) {
			if(obj.items[j].reload !== false || !$('#'+obj.items[j].id).length){
				if(obj.items[j].renderTo){
					$(obj.items[j].renderTo).html('');
				}
				this.create(obj.items[j]);
			}
		}
	}
	if($.isFunction(callback))
	{
		callback();
	}
}
			
cb.create = function(opt){

	if(!opt.xtype) opt.xtype='span';
	
	if($.type(opt.xtype) == 'string')
	{
		if(opt.xtype == 'nav')
		{
			if(!opt.toggle)opt.toggle = this.autoname();
			if(!opt.renderTo || opt.renderTo == 'main') opt.renderTo = 'header';
			var ele = document.createElement('nav');
			$(ele).addClass('navbar');
			if(opt.type)
			{
				var tcls = opt.type.split(' ');
				for(var i=0; i<tcls.length; i++)
				{
					if(tcls[i].trim() != '') $(ele).addClass('navbar-'+tcls[i]);
				}
				opt.notype = true;
			}
			else
			{
				$(ele).addClass('navbar-default');
			}
			var conta = document.createElement('div');
			$(conta).addClass('container-fluid');
			conta = this.common_prop(conta, opt);
			if($.isArray(opt.items))
			{
				for(var a=0;a<opt.items.length;a++)
				{
					if(opt.items[a].xtype == 'header')
					{
						opt.items[a].xtype = 'navbar-header';
						opt.items[a].target = opt.toggle;
					}
					else if(opt.items[a].xtype == 'collapse' || opt.items[a].xtype == 'navbar-collapse')
					{
						opt.items[a].xtype = 'navbar-collapse';
						opt.items[a].cls = opt.toggle;
					}
					$(conta).append(this.create(opt.items[a]));
				}
			}
			opt.noitems = true;
			$(ele).append(conta);
		}
		else if(opt.xtype == 'navbar-collapse')
		{
			var ele = document.createElement('div');
			$(ele).addClass('collapse navbar-collapse');
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'navbar-header')
		{
			var ele = document.createElement('div');
			$(ele).addClass('navbar-header');
			ele = this.common_prop(ele, opt);
			$(ele).append(this.create({
				xtype: 'button',
				type: 'button',
				cls: 'collapsed navbar-toggle',
				attr: {
					'data-toggle': 'collapse',
					'data-target': '.'+opt.target
				},
				items: [{
					xtype: 'span',
					cls: 'sr-only',
					text: 'Toggle navigation'
				},{
					xtype: 'span',
					cls: 'icon-bar'
				},{
					xtype: 'span',
					cls: 'icon-bar'
				},{
					xtype: 'span',
					cls: 'icon-bar'
				}]
			}));
		}
		else if(opt.xtype == 'button-menu')
		{
			opt.xtype = 'button';
			conta = this.create(opt);
			$(conta).addClass('navbar-btn');
			ele = document.createElement('li');
			$(ele).append(conta);
		}
		else if(opt.xtype == 'text-menu')
		{
			conta = document.createElement('p');
			$(conta).addClass('navbar-text');
			conta = this.common_prop(conta, opt);
			ele = document.createElement('li');
			$(ele).append(conta);
		}
		else if(opt.xtype == 'navbar')
		{
			opt.cls? opt.cls = 'nav navbar-nav '+opt.cls : opt.cls = 'nav navbar-nav';
			if(opt.type)
			{
				var tcls = opt.type.split(' ');
				for(var i=0; i<tcls.length; i++)
				{
					opt.cls = opt.cls + ' navbar-'+tcls[i];
				}
				opt.notype = true;
			}
			var ele = document.createElement('ul');
			ele = this.common_prop(ele, opt);
			if($.isArray(opt.items))
			{
				for(var a=0;a<opt.items.length;a++)
				{
					if(opt.items[a].xtype == 'dropdown') opt.items[a].xtype = 'dropdown-menu';
					if(opt.items[a].xtype == 'button') opt.items[a].xtype = 'button-menu';
					if(opt.items[a].xtype == 'text') opt.items[a].xtype = 'text-menu';
					$(ele).append(this.create(opt.items[a]));
				}
			}
			opt.noitems = true;
		}
		else if(opt.xtype == 'dropdown-menu')
		{
			opt.cls? opt.cls = 'dropdown '+opt.cls : opt.cls = 'dropdown';
			var ele = document.createElement('li');
			if(!opt.type) opt.type = 'dropdown';
			$(ele).addClass(opt.type);
			if(opt.id)
			{
				$(ele).attr('id',opt.id);
				opt.id = false;
			}
			var but = document.createElement('a');
			but = this.common_prop(but, {
				cls:'dropdown-toggle',
				attr: {
					'data-toggle':'dropdown',
					'role':'button',
					'aria-haspopup':'true',
					'aria-expanded':'true'}});
			but = this.common_prop(but, opt);
			if(opt.caret!==false)
			{
				$(but).append(this.create({
					xtype: 'span',
					cls: 'caret'
				}));
			}
			$(ele).append(but);
			var ul = document.createElement('ul');
			$(ul).addClass('dropdown-menu');
			if($.isArray(opt.items))
			{
				for(var a=0;a<opt.items.length;a++)
				{
					var li = document.createElement('li');
					if(opt.items[a].xtype == 'separator' || opt.items[a].xtype == 'divider')
					{
						li = this.common_prop(li, {
							cls: 'divider',
							attr: {'role':'separator'}});
						li = this.common_prop(li, opt.items[a]);
					}
					else if(opt.items[a].xtype == 'dropdown-header' || opt.items[a].xtype == 'header')
					{
						opt.items[a].cls? opt.items[a].cls = 'dropdown-header '+opt.items[a].cls : opt.items[a].cls = 'dropdown-header';
						li = this.common_prop(li, opt.items[a]);
					}
					else
					{
						$(li).append(this.create(opt.items[a]));
					}
					$(ul).append(li);
				}
			}
			$(ele).append(ul);
			opt.noitems = true;
		}
		else if(opt.xtype == 'dropdown' || opt.xtype == 'dropup')
		{
			if(!opt.type) opt.type2 = 'default';
			else opt.type2 = opt.type;
			opt.type = 'button';
			if(opt.xtype == 'dropup') var t_xtype = 'btn-group ' + opt.xtype;
			else var t_xtype = 'btn-group';
			var ele = document.createElement('div');
			$(ele).attr('role', 'group');
			$(ele).addClass(t_xtype);
			var but = document.createElement('button');
			but = this.common_prop(but, {
				cls:'btn btn-'+opt.type2+' dropdown-toggle',
				attr: {
					'data-toggle':'dropdown',
					'aria-haspopup':'true',
					'aria-expanded':'false',
					'type':'button'}
			});
			if(!opt.id) opt.id=this.autoname();
			if(opt.size) opt.cls += ' btn-'+opt.size;
			if(opt.split)
			{
				var but2 = this.create({
					xtype:'button',
					attr:{'type':'button'},
					cls:'btn btn-'+opt.type2
				});
				but2 = this.common_prop(but2, opt);
				$(ele).append(but2);
				$(but).append(this.create({xtype:'span',text:'&nbsp;'}));
				if(opt.caret!==false)
				{
					$(but).append(this.create({xtype:'span', cls:'caret'}));
				}
				$(but).append(this.create({xtype:'span',text:'&nbsp;'}));
			}
			else
			{
				but = this.common_prop(but, opt);
				if(opt.caret!==false)
				{
					$(but).append(this.create({xtype:'span', cls:'caret'}));
				}
			}
			$(ele).append(but);
			var ul = document.createElement('ul');
			$(ul).addClass('dropdown-menu').attr('aria-labelledby',opt.id);
			if($.isArray(opt.items))
			{
				for(var a=0;a<opt.items.length;a++)
				{
					var li = document.createElement('li');
					if(opt.items[a].xtype == 'separator' || opt.items[a].xtype == 'divider')
					{
						li = this.common_prop(li, {
							cls: 'divider',
							attr: {'role':'separator'}});
						li = this.common_prop(li, opt.items[a]);
					}
					else if(opt.items[a].xtype == 'dropdown-header' || opt.items[a].xtype == 'header')
					{
						opt.items[a].cls? opt.items[a].cls = 'dropdown-header '+opt.items[a].cls : opt.items[a].cls = 'dropdown-header';
						li = this.common_prop(li, opt.items[a]);
					}
					else
					{
						$(li).append(this.create(opt.items[a]));
					}
					$(ul).append(li);
				}
			}
			$(ele).append(ul);
			opt.noitems = true;
		}
		else if(opt.xtype == 'container')
		{
			var ele = document.createElement('div');
			if(opt.type == 'fluid'){
				$(ele).addClass('container-fluid');
				opt.notype = true;
			}else{
				$(ele).addClass('container');
			}
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'progress')
		{
			var ele = document.createElement('div');
			$(ele).addClass('progress');
			if($.isArray(opt.items))
			{
				for(var a=0; a<opt.items.length; a++)
				{
					if(!opt.items[a].xtype) opt.items[a].xtype = 'progress-bar';
				}
			}
			else if($.isPlainObject(opt.items))
			{
				if(!opt.items.xtype) opt.items.xtype = 'progress-bar';
			}
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'progress-bar')
		{
			var ele = document.createElement('div');
			$(ele).addClass('progress-bar');
			if(opt.type) $(ele).addClass('progress-bar-'+opt.type);
			if(opt.striped) $(ele).addClass('progress-bar-striped');
			if(opt.animated || opt.active) $(ele).addClass('active');
			if(!opt.min) opt.min = 0;
			if(!opt.max) opt.max = 100;
			if(opt.value) opt.width = opt.value+'%';
			$(ele).attr({'aria-valuemin':opt.min, 'aria-valuemax':opt.max, 'aria-valuenow':opt.value});
			ele = this.common_prop(ele, opt);
		}	
		else if(opt.xtype == 'table')
		{
			var ele = document.createElement('table');
			$(ele).addClass('table');
			if($.isArray(opt.items))
			{
				for(var a=0; a<opt.items.length; a++)
				{
					if(opt.items[a].xtype == 'head')
						opt.items[a].xtype = 'thead';
			 		if(opt.items[a].xtype == 'body')
						opt.items[a].xtype = 'tbody';
			 	}
			 }			 
			 ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'thead')
		{
		 	var ele = document.createElement('thead');
		 	opt.t_tr = document.createElement('tr');
		 	for(var h=0;h<opt.items.length;h++)
		 	{
		 		if(!opt.items[h].xtype)
		 		{
		 			opt.items[h].xtype = 'th';
		 			opt.t_th = this.create(opt.items[h]);
		 		}
		 		else
		 		{
		 			opt.t_th = document.createElement('th');
		 			$(opt.t_th).append(this.create(opt.items[h]));
		 		}
		 		$(opt.t_tr).append(opt.t_th);
		 	}
		 	$(ele).append(opt.t_tr);
			opt.noitems = true;
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'tbody')
		{
		 	var ele = document.createElement('tbody');
		 	opt.t_tr = document.createElement('tr');
		 	if(opt.items)
		 	{
			 	for(var h=0;h<opt.items.length;h++)
			 	{
			 		opt.t_type = h==0? 'th': 'td';
			 		if(!opt.items[h].xtype || opt.items[h].xtype == 'td' || opt.items[h].xtype == 'th')
			 		{
			 			if(!opt.items[h].xtype) opt.items[h].xtype = opt.t_type;
			 			opt.t_th = this.create(opt.items[h]);
			 		}
			 		else
			 		{
			 			opt.t_th = document.createElement(opt.t_type);
			 			$(opt.t_th).append(this.create(opt.items[h]));
			 		}
			 		if(opt.items[h].scope) $(opt.t_th).attr('scope', opt.items[h].scope);
			 		if(opt.items[h].field)
			 		{
			 			$(opt.t_th).attr('strlk', btoa(opt.items[h].field));
			 			$(opt.t_tr).css('display','none');
			 		}
			 		$(opt.t_tr).append(opt.t_th);
			 	}
			 	$(ele).append(opt.t_tr);
				opt.noitems = true;
		 	}
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'th')
		{
			var ele = document.createElement('th');
			if(opt.scope) $(ele).attr('scope', opt.scope);
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'button')
		{
			var ele = document.createElement(opt.xtype);
			if(!opt.type) opt.type = 'default';
			opt.cls? opt.cls = 'btn btn-'+opt.type+' '+opt.cls : opt.cls = 'btn btn-'+opt.type;
			if(opt.size) opt.cls += ' btn-'+opt.size;
			opt.type = 'button';
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'ico')
		{
			var ele = document.createElement('span');
			$(ele).addClass(opt.type);
			ele = this.common_prop(ele, {attr:{'aria-hidden':'true'}});
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'thumbnail')
		{
			if(!opt.type) opt.type = 'div';
			var ele = document.createElement(opt.type);
			opt.notype = true;
			opt.cls? opt.cls = 'thumbnail '+opt.cls : opt.cls = 'thumbnail';
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'alert')
		{
			if(!opt.type) opt.type = 'warning';
			if(opt.dismissible || opt.closable)
				opt.type += ' alert-dismissible';
			var ele = document.createElement('div');
			if(opt.dismissible || opt.closable)
			{
				var spa = document.createElement('span');
				spa = this.common_prop(spa, {
					attr: {'aria-hidden':'true'},
					text: '&times;'});
				var but = document.createElement('button');
				but = this.common_prop(but, {
					cls:'close',
					attr:{'data-dismiss':'alert',
						'aria-label':'Close'}});
				$(but).append(spa);
				$(ele).append(but);
			}
			ele = this.common_prop(ele, {
				cls: 'alert alert-'+opt.type,
				attr: {'role':'alert'}});
			opt.notype = true;
			var spa2 = document.createElement('span');
			spa2 = this.common_prop(spa2, opt);
			$(ele).append(spa2);
		}
		else if(opt.xtype == 'badge')
		{
			var ele = document.createElement('span');
			opt.cls = 'badge';
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'toolbar')
		{
			var ele = document.createElement('div');
			$(ele).addClass('btn-toolbar');
			$(ele).attr('role','toolbar');
			if(opt.label) $(ele).attr('aria-label', opt.label);
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'group')
		{
			var ele = document.createElement('div');
			if(opt.type == 'vertical') $(ele).addClass('btn-group-vertical');
			else $(ele).addClass('btn-group');
			if(opt.type == 'justified') $(ele).addClass('btn-group-justified');
			$(ele).attr('role','group');
			if(opt.label) $(ele).attr('aria-label', opt.label);
			if(opt.size) $(ele).addClass('btn-group-'+opt.size);
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'callout')
		{
			var ele = document.createElement('div');
			$(ele).addClass('bs-callout');
			if(opt.type) $(ele).addClass('bs-callout-'+opt.type);
			if(opt.title) $(ele).append(this.create({ xtype: 'h4', text: opt.title }));
			opt.ele_p = document.createElement('p');
			if(opt.text || opt.html)
			{
				opt.text? opt.ttext = opt.text : opt.ttext = opt.html;
				$(opt.ele_p).html(opt.ttext);
				opt.notext = true;
				opt.nohtml = true;
			}
			if($.isArray(opt.items))
			{
				for(var a=0;a<opt.items.length;a++)
					$(opt.ele_p).append(this.create(opt.items[a]));
					
				opt.noitems = true;
			}
			$(ele).append(opt.ele_p);
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'panel')
		{
			var ele = document.createElement('div');
			$(ele).addClass('panel').css('margin-bottom', '0px');
			if(opt.type)
			{
				$(ele).addClass('panel-'+opt.type);
				opt.notype = true;
			}
			else
			{
				$(ele).addClass('panel-default');
			}
			if($.isArray(opt.items))
			{
				for(var a=0;a<opt.items.length;a++)
				{
					if(opt.items[a].xtype == 'head' || opt.items[a].xtype == 'heading'){
						opt.items[a].xtype = 'panel-heading';
					}
					else if(opt.items[a].xtype == 'body' || opt.items[a].xtype == 'content'){
						opt.items[a].xtype = 'panel-body';
					}
					else if(opt.items[a].xtype == 'footer'){
						opt.items[a].xtype = 'panel-footer';
					}
					else if(opt.items[a].xtype == 'title'){
						opt.items[a].xtype = 'panel-title';
					}
				}
			}
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'panel-heading' || opt.xtype == 'panel-body' || opt.xtype == 'panel-footer')
		{
			var ele = document.createElement('div');
			$(ele).addClass(opt.xtype);
			if(opt.title) $(ele).append(this.create({ xtype: 'panel-title', text: opt.title }))
			if($.isArray(opt.items))
			{
				for(var a=0;a<opt.items.length;a++)
				{
					if(opt.items[a].xtype == 'title'){
						opt.items[a].xtype = 'panel-title';
					}
				}
			}
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'panel-title')
		{
			var ele = document.createElement('h3');
			$(ele).addClass(opt.xtype);
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'tabpanel')
		{
			opt.t_ul = document.createElement('ul');
			$(opt.t_ul).addClass('nav nav-tabs');
			$(opt.t_ul).attr('role','tablist');
			
			opt.t_div = document.createElement('div');
			$(opt.t_div).addClass('tab-content');
			
			opt.t_content = document.createElement('div');
			$(opt.t_content).addClass('tab-content');
			
			if($.isArray(opt.items))
			{
				opt.t_n = 1;
				for(var a=0; a<opt.items.length; a++)
				{
					if(!opt.items[a].id) opt.items[a].id = this.autoname();
					
					if($.isPlainObject(opt.items[a].tab))
					{
						opt.t_a = document.createElement('a');
						opt.t_li = document.createElement('li');
						
						if(opt.items[a].tab.xtype == 'dropdown')
						{
							opt.t_a = this.common_prop(opt.t_a, {
								cls: 'dropdown-toggle',
								attr: { 'role': 'dropdown',
										'aria-controls': opt.items[a].id+'-contents',
										'data-toggle': 'dropdown'},
								id: opt.items[a].id
							});
							$(opt.t_a).attr('href', '#');
							opt.t_a = this.common_prop(opt.t_a, opt.items[a].tab);
							$(opt.t_a).append('&nbsp;');
							if(opt.caret!==false)
							{
								$(opt.t_a).append(this.create({xtype: 'span', cls: 'caret'}));
							}
							$(opt.t_li).addClass('dropdown');
							opt.t_ul2 = document.createElement('ul');
							$(opt.t_ul2).addClass('dropdown-menu');
							$(opt.t_ul2).attr({ 'aria-labelledby': opt.items[a].id,
											id: opt.items[a].id+'-contents'
							});
							if($.isArray(opt.items[a].tab.items))
							{
								for(var k=0;k<opt.items[a].tab.items.length;k++)
								{
									opt.t_li2 = document.createElement('li');
									if(!opt.items[a].tab.items[k].xtype) opt.items[a].tab.items[k].xtype = "a";
									if(opt.items[a].tab.items[k].xtype == 'separator' || opt.items[a].tab.items[k].xtype == 'divider')
									{
										opt.t_li2 = this.common_prop(opt.t_li2, {
											cls: 'divider',
											attr: {'role':'separator'}});
										opt.t_li2 = this.common_prop(opt.t_li2, opt.items[a].tab.items[k]);
									}
									else if(opt.items[a].tab.items[k].xtype == 'dropdown-header' || opt.items[a].tab.items[k].xtype == 'header')
									{
										opt.items[a].tab.items[k].cls? opt.items[a].tab.items[k].cls = 'dropdown-header '+opt.items[a].tab.items[k].cls : opt.items[a].tab.items[k].cls = 'dropdown-header';
										opt.t_li2 = this.common_prop(opt.t_li2, opt.items[a].tab.items[k]);
									}
									else
									{
										if(opt.items[a].tab.items[k].xtype == "a")
										{
											if(opt.items[a].tab.items[k].ref)
											{
												opt.items[a].tab.items[k].attr = {
													role: 'tab',
													'data-toggle': 'tab',
													'aria-controls': opt.items[a].tab.items[k].ref,
													'aria-expanded': opt.items[a].tab.items[k].active
												};
												opt.items[a].tab.items[k].id = opt.items[a].tab.items[k].ref+'-tab';
												opt.items[a].tab.items[k].href = '#'+opt.items[a].tab.items[k].ref;
											}
										}
										$(opt.t_li2).append(this.create(opt.items[a].tab.items[k]));
									}
									$(opt.t_ul2).append(opt.t_li2);
								}
							}
							opt.items[a].tab.noitems = true;
						}
						else
						{
							opt.t_a = this.common_prop(opt.t_a, {
							id: opt.items[a].id+'-tab',
								attr: {
									'aria-controls': opt.items[a].id,
									'role': 'tab',
									'data-toggle': 'tab'
								}
							});
							$(opt.t_a).attr('href', '#'+opt.items[a].id);
							$(opt.t_a).append(this.create(opt.items[a].tab));
						}
						
						if(opt.items[a].active) $(opt.t_a).attr('aria-expanded', 'true');
						else $(opt.t_a).attr('aria-expanded', 'false');
						
						$(opt.t_li).append(opt.t_a);
						if(opt.t_ul2)
						{
							$(opt.t_li).append(opt.t_ul2);
							opt.t_ul2 = false;
						}
						$(opt.t_li).attr('role', 'presentation');
						if(opt.items[a].active) $(opt.t_li).addClass('active');
						$(opt.t_ul).append(opt.t_li);
						opt.t_li = false;
					}
					
					if($.isPlainObject(opt.items[a].panel))
					{
						opt.items[a].panel = [opt.items[a].panel];
					}
					
					if($.isArray(opt.items[a].panel))
					{
						for(var k=0;k<opt.items[a].panel.length;k++)
						{
							if($.isPlainObject(opt.items[a].panel[k]))
							{
								if(!opt.items[a].panel[k].id) opt.items[a].panel[k].id = opt.items[a].id;
								if(!opt.items[a].panel[k].active && opt.items[a].panel.length == 1) opt.items[a].panel[k].active = opt.items[a].active;
								opt.t_div = document.createElement('div');
								opt.t_div = this.common_prop(opt.t_div, {
									cls: 'tab-pane fade',
									id: opt.items[a].panel[k].id,
									attr: { 'role': 'tabpanel',
											'aria-labelledby': opt.items[a].panel[k].id + '-tab' },
									css: { 'border-left': '1px solid #DDD',
											'border-right': '1px solid #DDD',
											'border-bottom': '1px solid #DDD'}
								});
								if(opt.items[a].panel[k].active) $(opt.t_div).addClass('active in');
								$(opt.t_div).append(this.create(opt.items[a].panel[k]));
								$(opt.t_content).append(opt.t_div);
								opt.t_div = false;
							}
						}
					}
				}
			}
			opt.noitems = true;
			
			var ele = document.createElement('div');
			ele = this.common_prop(ele, opt);
			$(ele).attr('data-example-id', 'togglable-tabs');
			$(ele).append(opt.t_ul);
			$(ele).append(opt.t_content);
		}
		else if(opt.xtype == 'row')
		{
			var ele = document.createElement('div');
			$(ele).addClass('row');
			if(!opt.margin) opt.margin = '3px';
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'col')
		{
			var ele = document.createElement('div');
			if(!opt.size) opt.size = 12;
			if($.isPlainObject(opt.size))
			{
				for (var key in opt.size) {
					$(ele).addClass('col-'+key+'-'+opt.size[key]);
				}
			}
			else if(!$.isArray(opt.size))
			{
				$(ele).addClass('col-xs-'+opt.size);
			}
			if($.isPlainObject(opt.offset))
			{
				for (var key in opt.offset) {
					$(ele).addClass('col-'+key+'-offset-'+opt.offset[key]);
				}
			}
			else if(!$.isArray(opt.offset))
			{
				$(ele).addClass('col-xs-offset-'+opt.offset);
			}
			if(!opt.padding)opt.padding = '5px';
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'input')
		{
			var ele = document.createElement(opt.xtype);
			$(ele).addClass('form-control');
			if(!opt.type)opt.type = "text";
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'select')
		{
			var ele = document.createElement(opt.xtype);
			$(ele).addClass('form-control');
			if($.isArray(opt.items))
			{
				for(var s=0; s<opt.items.length; s++)
				{
					if(!opt.items[s].xtype) opt.items[s].xtype = 'option';
				}
			}
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'form')
		{
			if(!opt.name) opt.name = this.autoname();
			var ele = document.createElement('form');
			if($.isArray(opt.items))
			{
				for(var s=0; s<opt.items.length; s++)
				{
					if(opt.items[s].xtype == 'group') opt.items[s].xtype = 'form-group';
				}
			}
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'form-group')
		{
			var ele = document.createElement('div');
			$(ele).addClass('form-group');
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'label')
		{
			var ele = document.createElement(opt.xtype);
			if(!opt.for)$(ele).attr('for', opt.for);
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'glyphicon')
		{
			var ele = document.createElement('span');
			$(ele).addClass('glyphicon glyphicon-'+opt.type);
			ele = this.common_prop(ele, opt);
		}
		else if(opt.xtype == 'component')
		{
			var cmp = false;
			if(cmp = cb.module.component[opt.name])
			{
				cmp.name = false;
				cmp = $.extend(cmp, opt);
				cmp.xtype = 'span';
				var ele = this.create(cmp);
				ele = this.common_prop(ele, opt);
			}
			else
			{
				return false;
			}
		}
		else
		{
			var ele = document.createElement(opt.xtype);
			ele = this.common_prop(ele, opt);
		}
		
		if($.isPlainObject(opt.items))
		{
			$(ele).append(this.create(opt.items));
		}
								
		if($.isArray(opt.items) && !opt.noitems)
		{
			for(var a=0;a<opt.items.length;a++)
				$(ele).append(this.create(opt.items[a]));
		}
		
		if(opt.renderTo)
			$(opt.renderTo).empty().append(ele);
			
		if(opt.appendTo)
			$(opt.appendTo).append(ele);
			
		if(opt.prependTo)
			$(opt.prependTo).prepend(ele);
					
		if(opt.storelink && !opt.nostorelink)
		{
			if(opt.data && opt.data[opt.storelink.field] && opt.storelink.store == 'current')
			{
				if($('body').find(opt.storelink.appendTo).length)
				{
					this.storeAppendValues(opt.storelink.appendTo, opt.storelink, opt.data[opt.storelink.field]);
				}
				else if($('body').find(opt.storelink.renderTo).length)
				{
					this.storeAppendValues(opt.storelink.renderTo, opt.storelink, opt.data[opt.storelink.field]);
				}
			}
			else if(this.module.store[opt.storelink.store] && this.module.store[opt.storelink.store].data[opt.storelink.field])
			{
				if($('body').find(opt.storelink.appendTo).length)
				{
					this.storeAppendValues($(opt.storelink.appendTo), opt.storelink, this.module.store[opt.storelink.store].data[opt.storelink.field]);
				}
				else
				{
					var t_contn = document.createElement('div');
					$(t_contn).append(ele);
					if($(t_contn).find(opt.storelink.appendTo).length)
					{
						t_strlk_ele = $(t_contn).find(opt.storelink.appendTo);
						this.storeAppendValues(t_strlk_ele, opt.storelink, this.module.store[opt.storelink.store].data[opt.storelink.field]);
						$(t_contn).find(opt.storelink.appendTo).append($(t_strlk_ele).contents());
						ele = $(t_contn).contents();
					}
				}
			}
		}
					
		return ele;
	}
}
			
cb.common_prop = function(ele, opt)
{
	if($.isArray(opt.require))
		this.require(opt.require);
	
	if($.type(opt.cls) == 'string' && !opt.nocls)
		$(ele).addClass(opt.cls);
		
	if($.type(opt.html) == 'string' && !opt.nohtml)
		$(ele).html(opt.html);
		
	if($.type(opt.text) == 'string' && !opt.notext)
		$(ele).html(opt.text);
	
	if($.type(opt.glyphicon) == 'string')
		$(ele).prepend(this.create({xtype:'glyphicon',type:opt.glyphicon}));
	
	if($.type(opt.id) == 'string')
		$(ele).attr('id', opt.id);
	
	if(opt.disabled || opt.disable)
		$(ele).attr('disabled', 'disabled');
			
	if($.type(opt.name) == 'string'  && !opt.noname)
		$(ele).attr('name', opt.name);
		
	if($.type(opt.type) == 'string' && !opt.notype)
		$(ele).attr('type', opt.type);
		
	if($.type(opt.href) == 'string')
		$(ele).attr('href', opt.href);
		
	if($.type(opt.value) == 'string' && !opt.novalue)
		$(ele).attr('value', opt.value);
							
	if($.isPlainObject(opt.css))
		$(ele).css(opt.css);
		
	if($.type(opt.padding) == 'string' || $.isNumeric(opt.padding))
		$(ele).css('padding', opt.padding);
		
	if($.type(opt.margin) == 'string' || $.isNumeric(opt.margin))
		$(ele).css('margin', opt.margin);
		
	if($.type(opt.color) == 'string')
		$(ele).css('color', opt.color);
		
	if($.type(opt.float) == 'string')
		$(ele).css('float', opt.float);
		
	if($.type(opt.shadow) == 'string')
		$(ele).css('box-shadow', opt.shadow);
		
	if($.type(opt.size) == 'string' || $.isNumeric(opt.size))
		$(ele).css('font-size', opt.size);
		
	if($.type(opt.weight) == 'string')
		$(ele).css('font-weight', opt.weight);
		
	if($.type(opt.align) == 'string')
		$(ele).css('text-align', opt.align);
	
	if($.type(opt.pull) == 'string')
		$(ele).addClass('pull-'+opt.pull);
		
	if($.type(opt.height) == 'string')
		$(ele).css('height', opt.height);
		
	if($.type(opt.width) == 'string')
		$(ele).css('width', opt.width);
	
	if($.type(opt.placeholder) == 'string')
		$(ele).attr('placeholder', opt.placeholder);
	
	if($.type(opt.display) == 'string')
		$(ele).css('display', opt.display);
	
	if($.type(opt.cursor) == 'string')
		$(ele).css('cursor', opt.cursor);
		
	if($.isPlainObject(opt.attr))
		$(ele).attr(opt.attr);
		
	if(opt.data && $.isArray(opt.items))
	{
		for(var i=0; i<opt.items.length; i++)
		{
			opt.items[i].data = opt.data;
		}
	}
		
	if(opt.badge)
	{
		$(ele).append('&nbsp;').append(this.create({
			xtype: 'badge',
			text: opt.badge }));
	}
	
	if(opt.storelink && opt.storelink.store)
	{
		if(!this.module.storelink[opt.storelink.store])
			this.module.storelink[opt.storelink.store] = {};
		if(!opt.storelink.id)
		{
			if(opt.id)
			{
				opt.storelink.id=opt.id;
			}
			else
			{
				opt.id = this.autoname();
				opt.storelink.id = opt.id;
				$(ele).attr('id', opt.storelink.id);
			}
		}
		
		if(!opt.storelink.field)
		{
			opt.storelink.field = opt.storelink.store;
		}
		this.module.storelink[opt.storelink.store][opt.storelink.id] = opt.storelink;
				
		if(opt.data && opt.data[opt.storelink.field] && opt.storelink.store == 'current')
		{
			if(((!opt.storelink.appendTo || opt.storelink.appendTo == '#'+opt.id) && (!opt.storelink.renderTo || opt.storelink.renderTo == '#'+opt.id)) || (opt.storelink.appendTo && !opt.id) || (opt.storelink.renderTo && !opt.id))
			{
				opt.nostorelink = true;
				ele = this.storeAppendValues(ele, opt.storelink, opt.data[opt.storelink.field]);
			}
		}			
		else if(this.module.store[opt.storelink.store] && this.module.store[opt.storelink.store].data[opt.storelink.field])
		{
			if(!opt.storelink.renderTo && !opt.storelink.appendTo)
			{
				opt.storelink.renderTo = '#'+opt.id;
			}
			
			if(opt.storelink.renderTo == '#'+opt.id || opt.storelink.appendTo == '#'+opt.id)
			{
				opt.nostorelink = true;
				ele = this.storeAppendValues(ele, opt.storelink, this.module.store[opt.storelink.store].data[opt.storelink.field]);
			}
		}
	}
	
	if(opt.store && opt.field)
	{
		if(cb.module.store[opt.store] && cb.module.store[opt.store].data[opt.field])
		{
			cb.storeSet(ele, cb.module.store[opt.store].data[opt.field]);
		}
		$(ele).attr('strlk',btoa(opt.store+'.'+opt.field)).on('storelink', function(ev, val){
			val = val.data;
			cb.storeSet(this, val);
		});
	}
	else if(opt.field)
	{
		$(ele).attr('strlk',btoa(opt.field));
	}
	
	if(opt.listener)
	{
		$(ele).on(opt.listener);
	}
	
	return ele;
}

cb.strpos = function(texto, word){
	for(var i=0;i<texto.length;i++){
		if(texto[i]==word[0]){
			for(var r=1;r<=word.length;r++){
				if(r==word.length){
					return (i-word.length+1);
				}
				if(texto[i]!=word[r]){
					r = word.length+1;
				}
			}
		}
	}
	return false;
}

////[ General functions ]////

cb.enable = function(id){
	$(id).removeAttr('disabled');
}

cb.disable = function(id){
	$(id).attr('disabled','disabled');
}

cb.sto = function(fn, to){
	setTimeout(fn, to);
}

cb.popup = function(pp){
	
	if($.isPlainObject(pp))
	{
		if(!pp.xtype)pp.xtype = 'panel';
		if(!pp.css) pp.css = {};
		if(!pp.id) pp.id = this.autoname();
		if(!pp.offsetTop) pp.offsetTop = 0;
		pp.css.margin = 'auto';
		
		var popup = this.create({
			xtype: 'div',
			css :{
				position: 'fixed',
				top: '0px',
				left: '0px',
				width: '100%',
				height: '100%',
				background: 'rgba(0, 0, 0, 0.5)',
				overflow: 'hidden',
				'z-index': 16777271
			}
		});
		var tid = pp.id;
		$(popup).append(this.create(pp));
		$(document.body).append(popup);
		this.verticalCenter('#'+tid, pp.offsetTop);
		if(pp.effect){
			this.effect('#'+tid, pp.effect);
		}
	}
}

cb.verticalCenter = function(obj, offset){
	var wh = $(window).height();
	var oh = $(obj).height();
	var mt = (wh-oh)/2-offset;
	if(mt<0)mt=0;
	$(obj).css({'margin-top': mt});
	return obj;
}

cb.effect = function(obj, eff){
	if($.type(eff) == 'string'){
		var effe = eff;
	}else if($.isArray(eff)){
		if(eff[0]) var effe = eff[0];
		if(eff[1]) var vel = eff[1];
		if(eff[2]) var val = eff[2];
		if(eff[3]) var dire = eff[3];
	}else if($.isPlainObject(eff)){
		if(eff.type) var effe = eff.type;
		if(eff.value) var val = eff.value;
		if(eff.vel) var vel = eff.vel;
		if(eff.dire) var dire = eff.dire;
		if($.isFunction(eff.fun)) var fun = eff.fun;
	}
	if(!fun) var fun = function(){};
	if(!vel){
		var vel = 'fast';
	}else if($.isFunction(vel)){
		fun = vel;
		vel = 'fast';
	}
	if(!val || !$.isNumeric(val)){
		var val = 20;
	}else if($.isFunction(val)){
		fun = val;
		val = 20;
	}
	if(!dire){
		var dire = 'up';
	}else if($.isFunction(dire)){
		fun = dire;
		dire = 'up';
	}
	if(effe == 'fadein'){
		$(obj).fadeIn(vel, fun);
	}
	if(effe == 'fadeout'){
		$(obj).fadeOut(vel, fun);
	}
	if(effe == 'flipin'){
		if(dire == 'up'){
			var wh = $(window).height();
			var tt = $(obj).css('top').replace('px', '');
			if($.isNumeric(tt)){
				$(obj).css({top: wh+'px', opacity: 0}).animate({opacity: 1, top: tt+'px'}, vel, fun);
			}else{
				var mt = $(obj).css('margin-top').replace('px', '');
				if(!$.isNumeric(mt)){ mt = 0; }
				$(obj).css({'margin-top': wh+'px', opacity: 0}).animate({opacity: 1, 'margin-top': mt+'px'}, vel, fun);
			}
		}else if(dire == 'down'){
			var th = $(obj).height() * -1;
			var tt = $(obj).css('top').replace('px', '');
			if($.isNumeric(tt)){
				$(obj).css({top: th+'px', opacity: 0}).animate({opacity: 1, top: tt+'px'}, vel, fun);
			}else{
				var mt = $(obj).css('margin-top').replace('px', '');
				if(!$.isNumeric(mt)){ mt = 0; }
				$(obj).css({'margin-top': th+'px', opacity: 0}).animate({opacity: 1, 'margin-top': mt+'px'}, vel, fun);
			}
		}else if(dire == 'right'){
			var tw = $(obj).width() * -1;
			var tl = $(obj).css('left').replace('px', '');
			if($.isNumeric(tl)){
				$(obj).css({left: tw+'px', opacity: 0}).animate({opacity: 1, left: tl+'px'}, vel, fun);
			}else{
				var mt = $(obj).css('margin-left').replace('px', '');
				if(!$.isNumeric(mt)){ mt = 0; }
				$(obj).css({'margin-left': tw+'px', opacity: 0}).animate({opacity: 1, 'margin-left': mt+'px'}, vel, fun);
			}
		}else if(dire == 'left'){
			var tw = $(window).width();
			var tl = $(obj).css('left').replace('px', '');
			if($.isNumeric(tl)){
				$(obj).css({left: tw+'px', opacity: 0}).animate({opacity: 1, left: tl+'px'}, vel, fun);
			}else{
				var mt = $(obj).css('margin-left').replace('px', '');
				if(!$.isNumeric(mt)){ mt = 0; }
				$(obj).css({'margin-left': tw+'px', opacity: 0}).animate({opacity: 1, 'margin-left': mt+'px'}, vel, fun);
			}
		}
	}
	if(effe == 'flipout'){
		if(dire == 'down'){
			var wh = $(window).height();
			var tt = $(obj).css('top').replace('px', '');
			if($.isNumeric(tt)){
				$(obj).animate({top: wh+'px', opacity: 0}, vel, fun);
			}else{
				$(obj).animate({'margin-top': wh+'px', opacity: 0}, vel, fun);
			}
		}else if(dire == 'up'){
			var th = $(obj).height() * -1;
			var tt = $(obj).css('top').replace('px', '');
			if($.isNumeric(tt)){
				$(obj).animate({top: th+'px', opacity: 0}, vel, fun);
			}else{
				$(obj).animate({'margin-top': th+'px', opacity: 0}, vel, fun);
			}
		}else if(dire == 'left'){
			var tw = $(obj).width() * -1;
			var tl = $(obj).css('left').replace('px', '');
			if($.isNumeric(tl)){
				$(obj).animate({left: tw+'px', opacity: 0}, vel, fun);
			}else{
				$(obj).animate({'margin-left': tw+'px', opacity: 0}, vel, fun);
			}
		}else if(dire == 'right'){
			var tw = $(window).width();
			var tl = $(obj).css('left').replace('px', '');
			if($.isNumeric(tl)){
				$(obj).animate({left: tw+'px', opacity: 0}, vel, fun);
			}else{
				$(obj).animate({'margin-left': tw+'px', opacity: 0}, vel, fun);
			}
		}
	}
}