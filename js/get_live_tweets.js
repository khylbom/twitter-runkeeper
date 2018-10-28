//NOTE: the twitter proxy must ALREADY be running or the connection will be refused
//		in root directory, run: twitter-proxy twitter_proxy_config.json
function loadLiveRunkeeperTweets() {
	var query_url = "http://localhost:7890/1.1/search/tweets.json?q=%23Runkeeper&lang=en&count=100&result_type=recent";
	return new Promise(function(resolve, reject) {
		fetch(query_url)
			.then(function(response) {
				console.log("returning a response")
				return response.json();
			})
			.then(function(json) {
				resolve(json.statuses); //results contained in json as array statuses[]
			})
			.catch(function(error) {
				reject(error);
			});
	});
}