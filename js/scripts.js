jQuery(document).ready(function(){
    jQuery("#productTypes").change(function(){
        if(this.value != '') {
            var data = {'action': 'get_productsbytype_ajax','typeid': this.value }
            jQuery.post("admin-ajax.php", data, function(response) {
                //alert(response);
                jQuery("#tbProdTypes tbody").empty();
                jQuery.each(JSON.parse(response), function(i, prd) {
                    //alert(item.name);
                    var stock = parseInt(prd.stock);
                    var stockAction = (prd.vendor > 0 ? (stock == 0 ? "Purchase stock": "") : `<a href='#' alt='Update Stock' class='updateStock' >Update Stock</a>
                    <input type="button" id="btnSaveStock" value="Save" onclick="saveStock(this)" style="display: none;">
                    <input type="button" id="btnCancel" value="Cancel" onclick="cancelStock(this)" style="display: none;">`);
                    var stockStatus = (stock > 0 ? "In Stock": "Out Of Stock");
                    var rowStyle = (stock > 0 ? "inStock": "outOfStock");
                    var markup = "<tr id='" + prd.id + "' class='" + rowStyle + "'><td>" + prd.name 
                    + "</td><td>" + prd.product_type_name 
                    + "</td><td class='stockTd'>" + prd.stock 
                    + "<input type='number' class='stockVal' value='0' style='width: 90px; display: none;'></td><td class='stockStatus'>" + stockStatus 
                    + "</td><td class='stockAction'>"+ stockAction +"</td></tr>";
                    jQuery("#tbProdTypes tbody").append(markup);
                });
            });
        }
    });//productTypes").change

    jQuery('#saveApiModal').on('show.bs.modal', function (event) {
        var button = jQuery(event.relatedTarget) // Button that triggered the modal
        var _row = button.parents("tr");

        var recipient = button.data('whatever') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = jQuery(this)
        //modal.find('.modal-title').text('New message to ' + recipient)
        modal.find('.modal-body #api-name').val(_row.find('.apiname').text());
        modal.find('.modal-body #http-method').val(_row.find('.method').text());
        modal.find('.modal-body #table-name').val(_row.find('.table').text());
        modal.find('.modal-body #cols').val(_row.find('.cols').text());
        modal.find('.modal-body #url').val(_row.find('.url').text());
    });
    
    jQuery( "#btnSaveApi" ).click(function() {
        var target = jQuery(this).closest('.modal');
        var apiname = target.find('#api-name').val();
        var httpMethod = target.find('#http-method').val();
        var tableName = target.find('#table-name').val();
        var cols = target.find('#cols').val();
        //alert( "Modal submitted with text: " + apiname + httpMethod);

        jQuery.ajax({
            type: "POST",
            url: window.location.href.split("wp-admin")[0] + 'wp-json/ajdt/v1/utility',
            data: {
                'name' : apiname,
                'table' : tableName,
                'method' : httpMethod,
                'cols' : cols,
            },
            success: function(data, textStatus, jqXHR) {
                alert('Saved successfully');
                target.modal('hide');
                fetchApiList();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Failed to save API '+jqXHR+textStatus+errorThrown);
            }
        });
    });
    // jQuery('#saveApiModal').on('hide.bs.modal', function (event) {
    //     fetchApiList();
    // });

}); //document).ready

    function deleteApi(e){
        var apiname = jQuery(e).closest('tr').find('.apiname').text();
        alert(apiname);
        jQuery.ajax({
            type: "DELETE",
            url: window.location.href.split("wp-admin")[0] + 'wp-json/ajdt/v1/utility/' + apiname,
            success: function(data, textStatus, jqXHR) {
                //alert('Deleted successfully' + data + textStatus + jqXHR); 
                fetchApiList();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Failed to delete API '+jqXHR+textStatus+errorThrown);
            }
        });
    }

    function fetchApiList(){
        var baseUrl = window.location.href.split("wp-admin")[0];
        jQuery.ajax({
            type: "GET",
            url: baseUrl + 'wp-json/ajdt/v1/utility',
            success: function(response, textStatus, jqXHR) {
                jQuery("#tbApiList tbody").empty();
                jQuery.each(response, function(key, api){
                    var editButton = "<button type='button' style='font-size: 12px;' class='btn btn-success' data-toggle='modal' data-target='#saveApiModal' >Edit</button>";
                    var delButton = "<button class='btn btn-warning' style='font-size: 12px;' onclick='deleteApi(this)'>Delete</button>";
                    var markup = "<tr><td class='apiname'>" + key + "</td><td>" 
                                    + api.MethodName + "</td><td>" 
                                    + api.TableName + "</td><td>" 
                                    + api.SelectedColumn + "</td><td><a class='fas fa-user-edit' href='"+ baseUrl + api.Url +"'>" 
                                    + api.Url + "</a></td><td>" 
                                    + editButton + "&nbsp" 
                                    + delButton + "</td></tr>";
                    jQuery("#tbApiList tbody").append(markup);
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Failed to Fetch APIs '+jqXHR+textStatus+errorThrown);
            }
        });
    }