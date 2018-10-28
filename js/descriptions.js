var written_tweets = []; //array to store all tweets with written content

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	//filter to just the written tweets
	written_tweets = runkeeper_tweets
		.map(function(tweet) {
			return new Tweet(tweet.text, tweet.completed_at);
		})
		.filter(function(tweet) {
			return tweet.written;
		});
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	console.log("adding event handler for search...");
	// $.ajaxSetup({ cache: false });
	$('#textFilter').keyup(function() {
		forceReloadSearch();
	});
}

function forceReloadSearch() {
	$('#tweetTable').html(''); //clear 
	var searchField = $('#textFilter').val();
	console.log("updating search results for '" + searchField + "'");
	if (searchField == "") {
		$('#searchSummary').hide();
		return;
	}
	$('#searchSummary').show();
	//search the written text of tweets and display results as table rows
	var re = new RegExp(searchField, "i");
	var searchCount = 0;
	written_tweets.forEach(function(tweet) {
		if(tweet.writtenText.search(re) != -1) {
			searchCount++;
			$('#tweetTable').append(tweet.getHTMLTableRow(searchCount));
		}
		//show number of search results and search term used
		$('#searchCount').text(searchCount);
		$('#searchText').text(searchField);
	});
}

//Wait for the DOM to load
$(document).ready(function() {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});