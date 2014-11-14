
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
	alert("Your location is "+latitude+" , "+longitude);
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
				
			console.log($("#app-status-ul").html());
			
			
            // on Android soundname is outside the payload.
            // On Amazon FireOS all custom attributes are contained within payload
            //var soundfile = e.soundname || e.payload.sound;
            // if the notification contains a soundname, play it.
            //var my_media = new Media("/android_asset/www/"+ beep.wav);
            //my_media.play();
				
			      
			      
			       alert("foreground");
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
				
				
			}
			navigator.vibrate(3000);	
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
	list += '<li class="row" data-id ='+value.vendorId+'><img src="'+value.logo+'" /><h3>'+value.vendorName+'</h3><p>'+value.distance+' kms   Wait - '+value.waitingNumber+'</p></li>';
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

$(document).on('pageinit','#payment',function(){
	$('#submitPayment').on('click',function(){
				Stripe.setPublishableKey('pk_test_ncGWhS9H6MA1nJbx9CdeUiEX');
				var cardNumber = $("#cardNumber").val();
				var cardName = $("#cardName").val();
				var expDate = $("#expDate").val();
				var cvcNumber = $("#cvc").val();
				Stripe.card.createToken({
				number: cardNumber,
				cvc: cvcNumber,
				exp_month: expDate.slice(0,2),
				exp_year: expDate.slice(2,4)
				}, stripeResponseHandler);
				var paymentInfo = cardNumber+" "+cardName+" "+expDate+" "+cvc;
				//"{"cardNumber":cardNumber,"cardName":cardName,"expDate":expDate,"cvc":cvc}"
                // Send data to server through the ajax call
                // action is functionality we want to call and outputJSON is our data
                          
                
		
	});
	

});
function stripeResponseHandler(status, response) {
  var $form = $('#paymentInfo');

  if (response.error) {
    // Show the errors on the form
    $form.find('.payment-errors').text(response.error.message);
  } else {
    // response contains id and card, which contains additional card details
    var paymentToken = response.id;
    // Insert the token into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(paymentToken));
    // and submit
    console.log("The token is created "+paymentToken);
	//$form.get(0).submit();
	var userGcmKey = sessionStorage.registration_id;
	console.log("payment for order key   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"+userGcmKey);
	var jsonOrders = sessionStorage.currentOrder;
	console.log("orders are this +++++++++++++++++++++++++++++++++++++++++++++++++++++++++"+jsonOrders);
	var complexKey = userGcmKey+" "+paymentToken;
	$.ajax({
						type: 'POST',
						url: "http://orderchiefcloud-orderchief.rhcloud.com/processPayment/"+complexKey,
                        data : jsonOrders,
						contentType : 'application/json',
                        async: 'true',
                        beforeSend: function() {
                            // This callback function will trigger before data is sent
                        	
                            $.mobile.loading('show'); // This will show ajax spinner
                        },
                        complete: function() {
                            $.mobile.loading('hide');// This callback function will trigger on data sent/received complete
							 // This will hide ajax spinner
                        },
                        success: function() {
								
                                $.mobile.changePage("#thankYou");                        
                            
                        },
                        error: function (request,error) {
                            // This callback function will trigger on unsuccessful action               
                            alert('Network error has occurred please try again!');
                        }
                    });            
  }
}
function getMenuForVendor(data,status,jqxhr){
	
	var menu = data;
		var menulistitem = createList(menu);
		$('#menu-content').append(menulistitem);
		$('div[data-role=collapsible]').collapsible();
		$('.custom-ch').checkboxradio();
		$('.custom').checkboxradio();
		
		$(".custom").on('change', calculateTotal);
		$(".custom-ch").on('change', calculateTotal);
		$("#submit").on('click', submitOrder);
		//$.mobile.hidePageLoadingMsg();
}


function calculateTotal(){
	var total = 0;
	$("input[type='radio']:checked").each(function(){
		total = parseFloat(total) + parseFloat($(this).val());
	});
	
	$("input[type='checkbox']:checked").each(function(){
		total = parseFloat(total) + parseFloat($(this).val());
	});
	
	
	$("#total").html(total);
}

function submitOrder(){
var orderItem = {};
var order = [];
var userGcmKey = sessionStorage.registration_id;
console.log("submitting order with key -------------------------------------------------------"+userGcmKey);
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
sessionStorage.currentOrder = jsonOrders;
$.mobile.changePage('#payment');


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