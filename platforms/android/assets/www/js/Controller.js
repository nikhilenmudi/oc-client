

$(document).on('pageinit','#vendors', function(){
	var pushNotification = window.plugins.pushNotification;
    pushNotification.register(app.successHandler, app.errorHandler,{"senderID":"953355430463","ecb":"app.onNotificationGCM"});
		$(document).on('click','#vendors-list li', function(){
			sessionStorage.selectedVendorId = $(this).jqmData('id');
			console.log('Selected id: ' + sessionStorage.selectedVendorId);
			$.mobile.changePage('#Menu');
			
		});
		
		$("#vendors").on('pagebeforeshow', function(){
		$.ajax({
		type : 'GET',
		url : "http://192.168.2.22:8080/server/getVendors",
		success : getListOfVendors
		
	});
});
	
});

function getListOfVendors(data){
	var list ="";
	var vendor = data;
	//alert("creating");
	$.each(vendor,function(i, value){
	list += '<li class="row" data-id ='+value.vendorId+'><img src="img/logo.png" /><h3>'+value.vendorName+'</h3></li>';
	});
	$('#vendors-list').html(list).trigger('create');
	$('#vendors-list').listview('refresh');
}


$(document).on('pageinit','#Menu',function(){
	//$.mobile.showPageLoadingMsg();
	var menuForVendor =sessionStorage.selectedVendorId;
	$.ajax({
		type:'GET',
		url:"http://192.168.2.22:8080/server/getMenu/"+menuForVendor,
		success: getMenuForVendor
	});
	
});

function getMenuForVendor(data,status,jqxhr){
	var menu = data;
		var menulistitem = createList(menu);
		$('#menu-content').append(menulistitem);
		$('div[data-role=collapsible]').collapsible();
		$('.custom-ch').checkboxradio();
		$('.custom').checkboxradio();
		
		$(".custom").on('change', calculateTotal);
		$("#submit").on('click', submitOrder);
		//$.mobile.hidePageLoadingMsg();
}


function calculateTotal(){
	var total = 0;
	$("input[type='radio']:checked").each(function(){
		total = parseFloat(total) + parseFloat($(this).val());
	});
	$("#total").html(total);
}

function submitOrder(){
var orderItem = {};
var order = [];
$("div[data-role='collapsible']").each(function(i){
	id = $(this).attr('data-id');
	var subOptionIds = [];
	$(this).find('input[type=radio]:checked').each(function(){
		subOptionIds.push($(this).attr('id'));
	});
	var optionIds = [];
	$(this).find('input[type=checkbox]:checked').each(function(){
		optionIds.push($(this).attr('id'));
	});
	orderItem = {
		id : id,
		optionIds : optionIds,
		subOptionIds : subOptionIds 
	}
	order.push(orderItem);
});
console.log(JSON.stringify(order));
var jsonOrders = JSON.stringify(order);
$.ajax({  
        type : 'POST',  
        url : "http://192.168.2.22:8080/server/submitorder",  
        data : jsonOrders,
		contentType : 'application/json',
        success : function() {  
            $.mobile.changePage('#thankYou');  
        }  
    });  
}

function createList(menudata){
	var html = '';
	$.each(menudata,function(i,val){
		html+=('<div data-role="collapsible" data-inset="true" data-id='+val.productId+'><h3>'+val.name+'</h3>');
		var parentProductName = val.name;
		$.each(val.productoption,function(i,val){
			html+=('<input value="'+val.baseprice+'" name="" type="checkbox" class="custom-ch" id="id'+val.productOptionId+'" /><label for="id'+val.productOptionId+'">'+val.topping+'</label>');
		});
		$.each(val.productSubOption,function(i,val){
			html+=('<input value="'+val.baseprice+'" name="'+parentProductName+'" type="radio" class="custom" id="'+val.productSubOptionId+'" /><label for="'+val.productSubOptionId+'">'+val.size+'</label>');
		});
		html+=('</div>');
	});
return html;
}