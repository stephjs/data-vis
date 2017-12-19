$("document").ready(function(){
    $("#file").change(function() {
        $(".filtersdata").show();
        papaParseCsvForTableValues($(this), loadFullTable);
    });
});
var fullTableValues = [];
var tableKeysAndValues = [];
var rowFields = [];
var metric = "";
var Account= "";
var MonthBooked= "";
var ConsumerGroup= "";
var PromotionCode= "";
var fullMapsDisplay = [];
var filteredObj = [];
var filterBy = ["Account", "MonthBooked", "ConsumerGroup", "PromotionCode", "Revenue", "Streams", "Users"];


function papaParseCsvForTableValues(theFile, callback) {
	theFile.parse({
        complete: function(results, file, inputElem, event) {
        	rowFields.push(results.results.fields);
            for(var i=0; i < results.results.rows.length; i++){
                var rowData = results.results.rows[i];
                tableKeysAndValues.push(rowData);
                fullTableValues.push(Object.values(rowData));
            }
           	callback();
        }
    });
}
function loadFullTable() {
	$(".fileupload").hide();
	$(".returnchart").show();
	google.charts.load('current', {'packages':['table']});
    google.charts.setOnLoadCallback(drawTable);
}

function spliceFromArray(arr, goAwayElement) {
	return arr.filter(item => item !== goAwayElement);
}

function getUniqueValuesOfKey(array, key){
  return array.reduce(function(carry, item){
    if(item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
    return carry;
  }, []);
}

function drawTable() {
    var data = new google.visualization.DataTable();

    createTableRowsAndColumns(data, rowFields[0], fullTableValues);
    
    var table = new google.visualization.Table(document.getElementById('universal_table'));
    table.draw(data, {
    	showRowNumber: true, 
    	width: '100%', 
    	height: '100%'
    });
}


function createTableRowsAndColumns(googleData, tableFields, tableRows) {
    for (var i = 0; i < tableFields.length; i++) {
        if (tableFields[i] =="Revenue" || tableFields[i] =="Users" || tableFields[i] =="Streams") {
            googleData.addColumn('number', tableFields[i]);
        } else {
            googleData.addColumn('string', tableFields[i]);
            var uniqueDropdownList = (getUniqueValuesOfKey(tableKeysAndValues, tableFields[i]));

            if (document.getElementById(tableFields[i])) {

                $('#' + tableFields[i]).append('<option>- Select -</option>');
                for (var u=0; u<uniqueDropdownList.length; u++) {
                    var htmlGo = '<option value='+uniqueDropdownList[u]+'>'+uniqueDropdownList[u]+'</option>';
                    $('#' + tableFields[i]).append(htmlGo);
                }
            }
        }
    }
    //add data rows for the table
    for (var i=0; i<tableRows.length; i++) {
        googleData.addRows([
          tableRows[i]
        ]);
    }
}

$("form").on("submit", function(e) {
    e.preventDefault();
    if (validateFilterSelects()) {
        $("#regions_div").show();
        $(".filtersdata").hide();
        $("button").hide();
        metric = $('#metric').find(":selected").text();
        fullMapsDisplay.push(['Country', metric]);
        Account = $('#Account').find(":selected").text();
        MonthBooked = $('#MonthBooked').find(":selected").text();
        ConsumerGroup = $('#ConsumerGroup').find(":selected").text();
        PromotionCode = $('#PromotionCode').find(":selected").text();
        $(".maintitle").html(Account+" "+metric+" in "+MonthBooked+" for "+PromotionCode+" ("+ConsumerGroup+") Accounts");
        filterMapRegions();
    } else {
        alert("please fill out all form fields");
    }
});

function validateFilterSelects() {
    var checks = 0;
    $( "select" ).each(function( index ) {
        if ($(this).find(":selected").text() != "- Select -") {
            checks++;
        }
    });
    if (checks == $( "select" ).length){
        return true;
    }
}

function findInObj(starterObj, filterCriteria){
  return starterObj.filter(function(obj) {
    return Object.keys(filterCriteria).every(function(c) {
      return obj[c] == filterCriteria[c];
    });
  });
}

function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable(fullMapsDisplay);
    var options = {colors: ["ADE1B4", "89C28F", "65A46A", "418545", "1D6720"]};
    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);
}
function selectValidation() {
    $('.selectmenu').each(function () {
        if ($(this).val() == 'select') {
            return false;
        }
    });
    return true;
}

function filterMapRegions() {
	filteredObj = findInObj(tableKeysAndValues, {Account: Account, MonthBooked: MonthBooked, ConsumerGroup: ConsumerGroup, PromotionCode: PromotionCode});
	filterBy = spliceFromArray(filterBy, metric);
	for (var i=0; i<filteredObj.length; i++) {
		for (var item=0; item<filterBy.length; item++) {
			delete (filteredObj[i])[filterBy[item]];
		}
		let finalDataArr = Object.values(filteredObj[i]);
		fullMapsDisplay.push(finalDataArr);
	  
	}
	google.charts.load('current', {
	    'packages':['geochart'],
	    'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
	});
	google.charts.setOnLoadCallback(drawRegionsMap);

    var data = new google.visualization.DataTable();
    var lookingForValues = [Account, MonthBooked, ConsumerGroup, PromotionCode];
    var filteredTableValues = [];
    for (var i=0; i<fullTableValues.length; i++) {
        var currentArray = fullTableValues[i];
        secondloop:
        for (var el=0; el<lookingForValues.length; el++) {
            if (fullTableValues[i].indexOf(lookingForValues[el]) == -1) {
                break secondloop;
            } else if (el == lookingForValues.length -1) {
                filteredTableValues.push(fullTableValues[i]);
            }
        }
    }
    // updated table values based on filter
    createTableRowsAndColumns(data, rowFields[0], filteredTableValues);
    var table = new google.visualization.Table(document.getElementById('universal_table'));
    table.draw(data, {
        showRowNumber: true, 
        width: '100%'
    });
}