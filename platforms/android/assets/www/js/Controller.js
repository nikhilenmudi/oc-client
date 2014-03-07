
$(document).on('pageinit', '#vendors', function(){
	var list = "";
    $.ajax({
        url: "http://192.168.2.13:8080/server/getVendors"
    }).then(function(data, status, jqxhr) {
		//alert(data.vendorId);
		list += '<li class="row"><a href=""  data-role="none" data-title="'+data[0].vendorId+'" data-transition="slide">'+data[0].vendorName+'</a></li>';
		$('#vendors-list').html(list).trigger('create');
		$('#vendors-list').listview('refresh');
	});
});
