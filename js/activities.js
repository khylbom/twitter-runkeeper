function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets
		.map(function(tweet) { 
			return new Tweet(tweet.text, tweet.created_at);
		})
		.filter(function(tweet) {
			return tweet.activityType != "unknown";
		})
		.filter(function(tweet) {
			return { "activityType": tweet.activityType, "distance": tweet.distance, "time": tweet.time };
		});

	//spec for vega-lite visualization of number of Tweets by activity
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
		"description": "A graph of the number of Tweets containing each type of activity.",
		"height": 360,
		"data": { "values": tweet_array },
		"mark": "bar",
		"encoding": {
			"y": {  
				"field": "activityType", 
				"type": "nominal",
				"sort": { "op": "count", "field": "activityType", "order": "descending" }, 
				"axis": { "title": "Activity" }
			},
			"x": { 
				"aggregate": "count",
				"field": "activityType",
				"type": "quantitative"
			},
			"color": { "field": "activityType", "type": "nominal", "legend": null },
		},
	};

	vegaEmbed('#activityVis', activity_vis_spec, { actions:false }).catch(console.warn);

	//filter tweet array by top 3 activities (run, walk, bike) and remap data
	tweet_data_top3 = tweet_array.filter(function(tweet) {
		return (tweet.activityType == "run" || tweet.activityType == "walk" || tweet.activityType == "bike");
	});

	//define spec for vega-lite visualization for distance by day of the week for 3 most tweeted-about activities
	distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
	  "description": "A graph of the distances by day of the week for the three most tweeted-about activities.",
		"width": 200,
		"height": 200,
		"data": { "values": tweet_data_top3 },
		"mark": "point",
		"encoding": {
			"x": { 
				"timeUnit": "day", 
				"field": "time", 
				"type": "ordinal",
				"axis": { "title": "Day of the week" }
			},
			"y": { 
				"field": "distance",
				"type": "quantitative",
				"groupby": "activityType",
				"axis": { "title": "Distance (km)" }
			},
			"color": { 
				"field": "activityType", 
				"type": "nominal", 
				"legend": { "title": "Activity type"} 
			}
		},
		"legend": { "title": "Activity type" }
	};

	vegaEmbed("#distanceVis", distance_vis_spec, { actions: false }).catch(console.warn);

	//define spec for vega-lite visualization for mean distance by day of the week for 3 most tweeted-about activities
	distance_vis_aggregated_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v2.6.0.json",
	  "description": "A graph of the distances by day of the week for the three most tweeted-about activities.",
		"width": 200,
		"height": 200,
		"data": { "values": tweet_data_top3 },
		"mark": "point",
		"encoding": {
			"x": { 
				"timeUnit": "day", 
				"field": "time", 
				"type": "ordinal",
				"axis": { "title": "Day of the week" }
			},
			"y": { 
				"aggregate": "average",
				"field": "distance",
				"type": "quantitative",
				"groupby": "activityType",
				"axis": { "title": "Mean distance (km)" }
			},
			"color": { 
				"field": "activityType", 
				"type": "nominal",
				"legend": { "title": "Activity type" }
			}
		},
	};

	vegaEmbed("#distanceVisAggregated", distance_vis_aggregated_spec, { actions: false }).catch(console.warn);
	$('#distanceVisAggregated').hide(); //hide aggregated plot by default

	//use visualizations to answer questions about which activities tended to be longest and when
	//encode answers in DOM
	$("#numberActivities").text("31");
	$("#firstMost").text("run");
	$("#secondMost").text("walk");
	$("#thirdMost").text("bike");
	$("#longestActivityType").text("bike");
	$("#shortestActivityType").text("walk");
	$("#weekdayOrWeekendLonger").text("weekends compared to weekdays");

}
//button with element id "aggregate" controls plot, alternates between distance and mean distance plots
function toggleAggregate() {
	//toggle visibility using jQuery
	$('#distanceVis').toggle();
	$('#distanceVisAggregated').toggle();
	if ($('#aggregate').text() == "Show means") {
		$('#aggregate').text("Show all activities");
	} else {
		$('#aggregate').text("Show means");
	}
}

//Wait for the DOM to load
$(document).ready(function() {
	loadSavedRunkeeperTweets().then(parseTweets);
});