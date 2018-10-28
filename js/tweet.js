"use strict";
class Tweet {
    constructor(tweet_text, tweet_time) {
        this.text = tweet_text;
        this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
        var activity = this.parseActivity();
        this.activityType = this.getActivityType(activity);
        this.distance = this.getDistance(activity);
    }
    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source() {
        if (this.text.search("Just completed") == 0 || this.text.search("Just posted") == 0) {
            return "completed_event";
        }
        if (this.text.search("Watch") == 0) {
            return "live_event";
        }
        if (this.text.search("Achieved") == 0 || this.text.search("I just set a goal on") == 0) {
            return "achievement";
        }
        return "miscellaneous";
    }
    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written() {
        if (this.source == "miscellaneous" || this.text.search(" - ") >= 0) {
            return true;
        }
        return false;
    }
    //parses the written text from the tweet
    get writtenText() {
        if (!this.written) {
            return "";
        }
        //written text is between first '-' and URL
        var str = this.text, res;
        if (this.source != 'miscellaneous') {
            str = str.split('-', 2)[1];
        }
        str = str.split('https://t.co', 2)[0];
        return str.trim();
    }
    //parses the activity type from the text of the tweet
    getActivityType(activity) {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        if (activity && activity[0]) {
            return activity[0];
        }
        return "";
    }
    getDistance(activity) {
        if (this.source != 'completed_event') {
            return 0;
        }
        if (activity && activity[1]) {
            return activity[1];
        }
        return 0;
    }
    //parses activity information for completed events from the text of the tweet
    //returns [activity_type:string, distance_in_km:number] if valid pattern-match found, undefined otherwise
    parseActivity() {
        if (this.source != 'completed_event') {
            return undefined; //do not parse
        }
        //isolate the tokens that contain information about activity
        //format: Just <completed/posted> a <activity_info> - <writtenText>
        //        Just <completed/posted> a <activity_info> with <symbol>Runkeeper
        var str = this.text;
        var start_index = str.indexOf(" a") + 3; //starts after " a" or " an"
        var end_index = -1;
        if (this.written) {
            end_index = str.indexOf("-"); //ends after "-"
        }
        else {
            end_index = str.indexOf("with "); //alternative end
        }
        //check for index out of bounds
        if (start_index == -1 || end_index == -1) {
            console.error('unable to isolate activity info [type, distance]: ' + str);
            return undefined;
        }
        str = str.substring(start_index, end_index); //str = <activity_info>
        //tokenize activity information for pattern-matching
        //source: https://stackoverflow.com/questions/26425637/javascript-split-string-with-white-space/26425713
        var tokens = str.split(/(\s+)/).filter(function (token) {
            return token.trim().length > 0;
        });
        //use pattern-matching to extract activity type and distance
        var activity, distance, n;
        if ((n = tokens.indexOf('mi')) > -1) {
            //format: <distance> mi <activity>, where distance is number in miles
            distance = tokens[n - 1] * 1.609; //convert mi to km
            activity = tokens.slice(n + 1);
        }
        else if ((n = tokens.indexOf('km')) > -1) {
            // <distance> km <activity>, where distance is number in km
            distance = tokens[n - 1]; //already in km
            activity = tokens.slice(n + 1);
        }
        else if ((n = tokens.indexOf('in')) > -1) {
            //format: <activity> in <time_duration>, where time duration of form <hours>:<minutes>:<seconds>
            distance = 0; //distance not defined, measurement expressed as timestamp (duration)
            activity = tokens.slice(0, n);
            // console.log("tokens: " + tokens + " --> activity: " + activity);
        }
        else {
            console.warn("could not parse activity: " + this.text);
            return undefined; //could not find valid pattern-match
        }
        //format activity type as single string
        if (activity.length > 1) {
            activity = activity.join(" "); //activity type of multiple tokens
        }
        else {
            activity = activity[0]; //activity type of single token
        }
        return [activity, distance]; //as [string, number]
    }
    getHTMLTableRow(rowNumber) {
        var re = /\bhttps?:\/\/t.co\/\w+/gi;
        var str = this.text;
        var linkified_text = str.replace(re, function (url) {
            return '<a href="' + url + '">' + url + '</a>';
        });
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr><td>" + rowNumber + "</td><td>" + this.source + "</td><td>" + linkified_text + "</td></tr>";
    }
}
