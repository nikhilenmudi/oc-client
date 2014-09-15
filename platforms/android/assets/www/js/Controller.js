
var latitude;
var longitude;

	
$(document).on('pagebeforecreate', '#vendors', function(){     
    setTimeout(function(){
        $.mobile.loading('show');
    },1);    
});



$(document).on('pageinit','#vendors', function(){	
	navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
	
		$(document).on('click','#vendors-list li', function(){
			sessionStorage.selectedVendorId = $(this).jqmData('id');
			console.log('Selected id: ' + sessionStorage.selectedVendorId);
			$.mobile.changePage('#Menu');
			
		});
	
});
function onLocationSuccess(position){
	
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	console.log("Showing location here<<<---------------------------------------------------->>"+latitude+"--"+longitude);
	showVendors(latitude, longitude);
	//alert('Latitude : '+ position.coords.latitude + 'Longitude : '+ position.coords.longitude);
	
}

function showVendors(latitude, longitude){

		console.log("Showing page before show location here<<<---------------------------------------------------->>"+latitude+"--"+longitude);
		$.ajax({
		type : 'GET',
		//url : "http://192.168.2.22:8080/server/getVendors",
		url : "http://orderchiefcloud-orderchief.rhcloud.com/getVendors/"+latitude+"/"+longitude,
		success : getListOfVendors
		
	});

}

function onLocationError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function successHandler(result) {
    //alert('Callback Success! Result = '+result)
}

function errorHandler(error) {
    alert(error);
}

function onNotificationGCM(e) {
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                console.log("Regid " + e.regid);
                //alert('registration id = '+e.regid);
				sessionStorage.registration_id = e.regid;
            }
        break;

        case 'message':
        	// if this flag is set, this notification happened while we were in the foreground.
        	// you might want to play a sound to get the user's attention, throw up a dialog, etc.
        	if (e.foreground)
        	{
				
			      
			       alert("foreground");
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
				
				
			}
				
			alert('MSG: ' + e.payload.data);
            //android only
			
            //amazon-fireos only
            
        break;

        case 'error':
          alert('GCM error = '+e.msg);
        break;

        default:
          alert('An unknown GCM event has occurred');
          break;
    }
}

function getListOfVendors(data){
	var list ="";
	var vendor = data;
	//alert("creating");
	$.each(vendor,function(i, value){
	list += '<li class="row" data-id ='+value.vendorId+'><img src="'+value.logo+'" /><h3>'+value.vendorName+'</h3><p>'+value.distance+' kms</p></li>';
	});
	$('#vendors-list').html(list).trigger('create');
	$('#vendors-list').listview('refresh');
	$.mobile.loading('hide');
}


$(document).on('pageinit','#Menu',function(){
	//$.mobile.showPageLoadingMsg();
	var pushNotification = window.plugins.pushNotification;
    pushNotification.register(successHandler, errorHandler,{"senderID":"953355430463","ecb":"onNotificationGCM"});
	var menuForVendor =sessionStorage.selectedVendorId;
	$.ajax({
		type:'GET',
		//url:"http://192.168.2.22:8080/server/getMenu/"+menuForVendor,
		url:"http://orderchiefcloud-orderchief.rhcloud.com/getMenu/"+menuForVendor,
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
var userGcmKey = sessionStorage.registration_id;
console.log(userGcmKey);
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
        //url : "http://192.168.2.22:8080/server/submitorder/"+userGcmKey,
        url : "http://orderchiefcloud-orderchief.rhcloud.com/submitorder/"+userGcmKey,
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