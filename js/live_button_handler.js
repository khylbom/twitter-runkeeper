$(document).ready(function() {
	//function-scope boolean to alter as the button switches state
	var liveTweets = false;
	
	//we only need to load these ONCE! here is a place we can do that --> faster loading times!
	var loadedLiveTweets = loadLiveRunkeeperTweets();
	var loadedSavedTweets = loadSavedRunkeeperTweets();

	//use jQuery to listen for a click event,
	//toggle the button text between "Switch to live tweets" and "Switch to saved tweets",
	$('#liveButton').click(function() {
		liveTweets = !liveTweets;
		if (liveTweets) {
			$('#liveButton').text("Switch to saved tweets");
			loadedLiveTweets.then(parseTweets).then(function() {
				try { forceReloadSearch(); } catch { /* do nothing */ }
			});
		} else {
			$('#liveButton').text("Switch to live tweets");
			loadedSavedTweets.then(parseTweets).then(function() {
				try { forceReloadSearch(); } catch { /* do nothing */ }
			});
		}
	});
});
