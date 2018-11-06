var dps = []; // dataPoints
var dps2 = [];
var dps3 = [];
var dps4 = [];

var agentPos = [50,50,50];
var agentPosEstimated = [50,50,50];
var userPos = [50,50,50];
var userPosEstimated = [50,50,50];

window.onload = function () {

var chart = new CanvasJS.Chart("chartContainer", {
	title :{
		text: "Performance"
	},
	axisY: {
		includeZero: false
	},      
	data: [{
		type: "line",
		dataPoints: dps
	}, {
		  type: "line",
		  dataPoints: dps2
	}]
});

var chart2 = new CanvasJS.Chart("chartContainer2", {
	      title :{
		        text: "Performance"
	      },
	      axisY: {
		        includeZero: false
	      },      
	      data: [{
		        type: "line",
		        dataPoints: dps3
	      },{
		        type: "line",
		        dataPoints: dps4
	      }]
});


var xVal = 0;
var yVal = 100; 
var updateInterval = 2000;
var dataLength = 10; // number of dataPoints visible at any point

var updateChart = function (count) {

	count = count || 1;

	for (var j = 0; j < count; j++) {
      var smallRand = Math.round(1 + Math.random() *(-1-1));
      var bigRand = 1.4 * Math.round(4.5 + Math.random() *(-4-4));
      if (bigRand < 6) {
          bigRand = 0;
      }
		yVal = yVal + smallRand + bigRand;

		dps.push({
			x: xVal,
			y: yVal
		});

      var smallRand = Math.round(1 + Math.random() *(-1-1));
      var bigRand = 1.4 * Math.round(4 + Math.random() *(-4-4));
      if (bigRand < 6) {
          bigRand = 0;
      }
		  yVal = yVal + smallRand + bigRand;
		  dps2.push({
			    x: xVal,
			    y: yVal
		  });
      var smallRand = Math.round(1 + Math.random() *(-1-1));
      var bigRand = 1.4 * Math.round(4.5 + Math.random() *(-4-4));
      if (bigRand < 6) {
          bigRand = 0;
      }
		  yVal = yVal + smallRand + bigRand;
	    dps3.push({
			    x: xVal,
			    y: yVal
		  });

      var smallRand = Math.round(1 + Math.random() *(-1-1));
      var bigRand = 1.4 * Math.round(4 + Math.random() *(-4-4));
      if (bigRand < 6) {
          bigRand = 0;
      }
		  yVal = yVal + smallRand + bigRand;
	    dps4.push({
			    x: xVal,
			    y: yVal
		  });

		xVal++;
	}
	  if (dps3.length > dataLength) {
		    dps3.shift();
	  }

	  chart2.render();

	if (dps.length > dataLength) {
		dps.shift();
	}

	chart.render();
};

updateChart(dataLength);
    setInterval(function(){updateChart();}, updateInterval);

}
