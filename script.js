$("document").ready(function(){
    $("#file").change(function() {
        papaParse($(this));
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
var filterBy = ["Account", "MonthBooked", "ConsumerGroup", "PromotionCode", "Revenue", "Streams", "Users"];
function papaParse(theFile) {
	theFile.parse({
        complete: function(results, file, inputElem, event) {
        	rowFields.push(results.results.fields);
            for(var i=0; i < results.results.rows.length; i++){
                var rowData = results.results.rows[i];
                tableKeysAndValues.push(rowData);
                fullTableValues.push(Object.values(rowData));
            }
           	loadChart();
        }
    });
}
function loadChart() {
	$("input").hide();
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
    rowFields = rowFields[0];
    for (var ifield = 0; ifield < rowFields.length; ifield++) {
    	if (rowFields[ifield] =="Revenue" || rowFields[ifield] =="Users" || rowFields[ifield] =="Streams") {
    		data.addColumn('number', rowFields[ifield]);
    	} else {
	    	data.addColumn('string', rowFields[ifield]);
	    	var uniqueDropdownList = (getUniqueValuesOfKey(tableKeysAndValues, rowFields[ifield]));

	    	if (document.getElementById(rowFields[ifield])) {

	    		$('#' + rowFields[ifield]).append('<option>- Select -</option>');
	    		for (var u=0; u<uniqueDropdownList.length; u++) {
	    			var htmlGo = '<option value='+uniqueDropdownList[u]+'>'+uniqueDropdownList[u]+'</option>';
					$('#' + rowFields[ifield]).append(htmlGo);
				}
			}
	    }
    }
	for (var i=0; i<fullTableValues.length; i++) {
	    data.addRows([
	      fullTableValues[i]
	    ]);
	}
    var table = new google.visualization.Table(document.getElementById('universal_table'));
    table.draw(data, {
    	showRowNumber: true, 
    	width: '100%', 
    	height: '100%'
    });
    //console.log(data.getValue(1, 1));
}

$(".charts .title").on("click", function() {
	$(".chartsdata").show();
})

$("form").on("submit", function(e) {
	e.preventDefault();
	metric = $('#metric').find(":selected").text();
	fullMapsDisplay.push(['Country', metric]);
	Account = $('#Account').find(":selected").text();
	MonthBooked = $('#MonthBooked').find(":selected").text();
	ConsumerGroup = $('#ConsumerGroup').find(":selected").text();
	PromotionCode = $('#PromotionCode').find(":selected").text();
	alert(metric + Account + MonthBooked + ConsumerGroup + PromotionCode);
	filterMapRegions();
})

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
	var filteredObj = findInObj(tableKeysAndValues, {Account: Account, MonthBooked: MonthBooked, ConsumerGroup: ConsumerGroup, PromotionCode: PromotionCode});
	filterBy = spliceFromArray(filterBy, metric);
	console.log(filterBy);
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
}