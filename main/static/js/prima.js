var Bookedobjs = [];
var Rows=["A","B","C","D","E","F","G","H","I","J"];
var Columns=12;
var Totalobjs=Rows.length*Columns;

function convertIntToobjNumbers(objs){
	var bookedobjs="";
	_.each(objs,function(obj){
		var row=Rows[parseInt(parseInt(obj)/12)];
		var column=parseInt(obj)%12;
		if(column==0){
			column=12;
		}
		if(_.indexOf(objs,obj)==objs.length-1){
			bookedobjs=bookedobjs+row+column;
		}
		else{
			bookedobjs=bookedobjs+row+column+",";
		}
	});
	return bookedobjs;
}

var InitialView = Backbone.View.extend({
	events:{
		"click #submitSelection": "submitForm"
	},
	submitForm : function(){
		var reservedobjs=JSON.parse(localStorage.getItem('Reservedobjs'));
		var availableobjs=Totalobjs;
		var selectedNumberOfobjs=$('#objs').val();
		if(reservedobjs!=null)
			availableobjs=Totalobjs-reservedobjs.length;
		if(!$('#name').val()){
			$(".error").html("Color is required");
		}
		else if(!selectedNumberOfobjs){
			$(".error").html("Number of objs is required");
		}
		else if(parseInt(selectedNumberOfobjs)>availableobjs){
			$(".error").html("You can only select "+availableobjs+" objs")
		}
		else
		{
			$(".error").html("");
			screenUI.showView();
		}
	}
});
var initialView = new InitialView({el:$('.selectionForm')});

var ScreenUI=Backbone.View.extend({
	events:{
		"click .empty-obj,.booked-obj":"toggleBookedobj",
		"click #confirmSelection":"bookitemss"
	},
	initialize:function(){
		var tableheaderTemplate = _.template($("#table-screen-header").html());
		var tableBodyTemplate=_.template($("#table-screen-body").html());
		var data={"rows":Rows,"columns":Columns};
		$("#screen-head").after(tableheaderTemplate(data));
		$("#screen-body").after(tableBodyTemplate(data));	
	},
	hideView:function(){
		$(this.el).hide();
	},
	showView:function(){
		$(this.el).show();
	},
	toggleBookedobj:function(event){
		var id="#"+event.currentTarget.id;
		if($(id).attr('class')=='empty-obj' && Bookedobjs.length<$('#objs').val()){
			Bookedobjs.push(id.substr(1));
			$(id).attr('src','static/img/selected.jpg');
			$(id).attr('class','booked-obj');

		}
		else if($(id).attr('class')=='booked-obj'){
			Bookedobjs=_.without(Bookedobjs,id.substr(1));
			$(id).attr('src','static/img/empty-obj.png');
			$(id).attr('class','empty-obj');
		}
	},
	updateitemsInfo:function(){
		var bookedobjs=convertIntToobjNumbers(Bookedobjs);
		$("#items-sold-info").append("<tr><td>"+$('#name').val()+"</td><td>"+$('#objs').val()+"</td><td>"+bookedobjs+"</td></tr>");
	},
	bookitemss:function(){
		if(Bookedobjs.length==parseInt($('#objs').val())) {
			$(".error").text("");
			var reservedobjs=JSON.parse(localStorage.getItem('Reservedobjs'))||[];
			_.each(Bookedobjs,function(bookedobj){
				reservedobjs.push(bookedobj);
			});
			var nameobjsJSON=JSON.parse(localStorage.getItem('NameobjsJSON'))||{};
			nameobjsJSON[$('#name').val()]=Bookedobjs;
			localStorage.setItem('NameobjsJSON',JSON.stringify(nameobjsJSON));
			localStorage.setItem('Reservedobjs',JSON.stringify(reservedobjs));
			this.updateitemsInfo();
			window.location.reload();
		}
		else{
			$(".error").html("Please select exactly "+ $('#objs').val()+" objs");
		}		
	},
});

var screenUI = new ScreenUI({el:$('.screen-ui')});
screenUI.hideView();

var itemsInfo=Backbone.View.extend({
	initialize:function(){
		var items=[];
		var json=JSON.parse(localStorage.getItem('NameobjsJSON'));
		if(json!=null){
		_.each(json,function(key,value){
			var name=value;
			var number=key.length;
			var bookedobjs=convertIntToobjNumbers(key);
			items.push({names:name,numbers:number,objs:bookedobjs});
		});
		var data={"items":items};
		var itemsInfoBody=_.template($("#table-items-info").html());
		$("#items-sold-info").html(itemsInfoBody(data));
		}
	}
});

var itemsInfo=new itemsInfo({el:$('.table-responsive')});
