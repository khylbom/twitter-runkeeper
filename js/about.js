function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	$('#numberTweets').text(tweet_array.length);
	$('#firstDate').text(earliestTweet(tweet_array).time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}));
	$('#lastDate').text(latestTweet(tweet_array).time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

	countTweets(tweet_array);
}

function earliestTweet(all_tweets) {
	var earliest_tweet = all_tweets[0];
	var earliest_date = new Date(earliest_tweet.time);
	all_tweets.forEach(function(tweet, index) {
		if (new Date(tweet.time) < earliest_date) {
			earliest_tweet = tweet;
			earliest_date = new Date(tweet.time);
		}
	});
	return earliest_tweet;
}

function latestTweet(all_tweets) {
	var latest_tweet = all_tweets[0];
	var latest_date = new Date(latest_tweet.time);
	all_tweets.forEach(function(tweet, index) {
		if (new Date(tweet.time) > latest_date) {
			latest_tweet = tweet;
			latest_date = new Date(tweet.time);
		}
	});
	return latest_tweet;
}

function countTweets(all_tweets) {
	//initialize array to store the tallies, set all to zero
	//index key: 0:completed, 1:live, 2:achievement, 3:miscellaneous, 4:written
	var category = [0, 0, 0, 0, 0];
	all_tweets.forEach(function(tweet) {
		//count tweets by source (category)
		switch(tweet.source) {
			case 'completed_event': category[0]++; break;
			case 'live_event': 		category[1]++; break;
			case 'achievement': 	category[2]++; break;
			case 'miscellaneous': 	category[3]++; break;
			default:
				console.log('error counting tweet by category: ' + tweet.text);
				break;
		}
		//keep running tally of tweets with written content
		if (tweet.written == true) {
			category[4]++;
		}
	});

	//edit DOM of index.html to display info about the Tweets in the dataset
	$('.completedEvents').text(category[0]);
	$('.liveEvents').text(category[1]);
	$('.achievements').text(category[2]);
	$('.miscellaneous').text(category[3]);
	$('.written').text(category[4]);
	//tweet counts to percentage of total tweets, formatted to 2 decimals
	var pctFormatted = category.map(function(count) {
		return math.format(count / all_tweets.length, formatPercent);
	});
	$('.completedEventsPct').text(pctFormatted[0]);
	$('.liveEventsPct').text(pctFormatted[1]);
	$('.achievementsPct').text(pctFormatted[2]);
	$('.miscellaneousPct').text(pctFormatted[3]);
	$('.writtenPct').text(pctFormatted[4]);
}

//returns value formatted as a percentage to 2 decimal places
function formatPercent(value) {
	return (value * 100).toFixed(2) + "%";
}

//Wait for the DOM to load
$(document).ready(function() {
	loadSavedRunkeeperTweets().then(parseTweets);
});