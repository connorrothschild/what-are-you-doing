// create a variable that will hold the loaded data
var csv;

// define all objects/vars/etc.
var selected_name;
var selected_race;
var selected_sex;
var selected_age;
var selected_marriage;
var selected_hispanic;
var today;
var time;
var data;
var currentHour;
var top_activities;
var numResults;
var applyFilter;
var yesFunction;
var noFunction;

// load the data
d3.csv(
	'./data/activity_data.csv',
	function(d) {
		return d;
	},
	function(error, datafile) {
		if (error) throw error;

		// put the original data in csv
		csv = datafile;
		console.log(csv);

		// call this whenever the submit button is clicked
		applyFilter = function() {
			// remove prior text boxes, if present
			d3.select('#response').html(function(d, i) {
				return null;
			});
			d3.select('#correct').html(function(d, i) {
				return null;
			});
			d3.select('#attempt2').html(function(d, i) {
				return null;
			});

			// make box visible
			document.getElementById('box').setAttribute('display', 'block');

			// filter the data
			selected_race = document.getElementById('raceInput');
			selected_sex = document.getElementById('sexInput');
			selected_age = document.getElementById('ageInput');
			selected_name = document.getElementById('nameInput');
			selected_marriage = document.getElementById('marriageInput');
			selected_hispanic = document.getElementById('hispanicInput');

			function formatAMPM(date) {
				var hours = date.getHours();
				var minutes = date.getMinutes();
				var ampm = hours >= 12 ? 'pm' : 'am';
				hours = hours % 12;
				hours = hours ? hours : 12; // the hour '0' should be '12'
				minutes = minutes < 10 ? '0' + minutes : minutes;
				var strTime = hours + ':' + minutes + ' ' + ampm;
				return strTime;
			}

			function returnHour(date) {
				var hour = date.getHours();
				return hour;
			}

			currentHour = returnHour(new Date());

			// test
			// data = csv.filter(function(d) {
			//   return d.race_general === "White only"
			//       && d.sex === "Female"
			//       && d.age_cat === "60 or over"
			//       && d.hour === "18"});

			// for real:
			data = csv.filter(function(d) {
				return (
					d.race_general === selected_race.value &&
					d.sex === selected_sex.value &&
					d.age_cat === selected_age.value &&
					d.hispanic === selected_hispanic.value &&
					d.marriage === selected_marriage.value &&
					+d.hour === +currentHour
				);
			});

			data = data.sort(function(a, b) {
				return d3.descending(+a.n, +b.n);
			});

			numResults = +data.length;
			top_activities = data.slice(0, 3);
			console.log(top_activities);
			console.log(data);

			var emptyName = function() {
				if (selected_name.value == '') {
					return 'friend';
				} else {
					return selected_name.value;
				}
			};

			var marriagePronoun = function(value) {
				if (selected_marriage.value == 'Unmarried') {
					return 'an ';
				} else {
					return 'a ';
				}
			};

			function toTitleCase(str) {
				return str.replace(/\w\S*/g, function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
			}

			d3.select('#introText').html(function(d, i) {
				if (numResults == 0) {
					return "I'm sorry. There is no data to compare you with. In other words, you're one of a kind!";
				} else {
					return (
						'Hi ' +
						toTitleCase(emptyName(selected_name.value)) +
						'!' +
						'<br><br>' +
						'You are ' +
						marriagePronoun(selected_marriage.value) +
						'<span style = "font-weight:500">' +
						selected_marriage.value.toLowerCase() +
						' ' +
						selected_race.value.toLowerCase() +
						' ' +
						selected_sex.value.toLowerCase() +
						'</span> between the ages of <span style = "font-weight:500">' +
						selected_age.value +
						"</span> (like you didn't know that already)." +
						'<br><br> The current time is <span style = "font-weight:500">' +
						formatAMPM(new Date()) +
						'</span>.' +
						'<hr>'
					);
				}
			});

			d3.select('#activity_general_intro').html(function(d, i) {
				if (numResults == 0) {
					return null;
				} else {
					return 'Are you currently doing something related to ';
				}
			});

			d3.select('#activity_specific_intro').html(function(d, i) {
				if (numResults == 0) {
					return null;
				} else {
					return 'More specifically, my best guess would be: ';
				}
			});

			d3.select('#activity_general').html(function(d, i) {
				if (numResults == 0) {
					return null;
				} else {
					return top_activities[0].activity_general.toLowerCase() + '?';
				}
			});

			d3.select('#activity_specific').html(function(d, i) {
				if (numResults == 0) {
					return null;
				} else {
					return top_activities[0].activity_specific.toLowerCase() + '.';
				}
			});

			d3.select('#correct').html(function(d, i) {
				if (numResults == 0) {
					return null;
				} else {
					return (
						'<br>Did I get it right? ' +
						'<button id="yesButton" class="button is-success" type = "button" onclick="yesFunction()">Yes!</button>' +
						'<button id="noButton" class="button is-danger" type = "button" onclick="noFunction()">No!</button>'
					);
				}
			});

			yesFunction = function() {
				d3.select('#response').html(function(d, i) {
					return "<span style = 'font-size:16px'>Great! Keep doing what you're doing. You're great at it!</span><br><span style = 'font-size:10px'>(Enough about you. Learn more about me on <a target='_blank' href = 'https://connorrothschild.github.io'>my personal website.</a>)</span>";
				});

				d3.select('#attempt2').html(function(d, i) {
					return null;
				});
			};

			noFunction = function() {
				d3.select('#response').html(function(d, i) {
					return (
						"<span style = 'font-size:16px'>I'm sorry. I'll try one more time.</span><hr>My next guess is that you're doing something related to <span class='has-text-weight-semibold'>" +
						top_activities[1].activity_general.toLowerCase() +
						'</span>.'
					);
				});

				d3.select('#attempt2').html(function(d, i) {
					return (
						'More specifically <span class="has-text-weight-semibold">' +
						top_activities[1].activity_specific.toLowerCase() +
						'</span>.' +
						'<br><br>Still wrong? Sorry. I actually still have <span style = "font-weight:400">' +
						(numResults - 2) +
						"</span> guesses, but I'll spare you those details!" +
						'<br><span style = "font-size:10px">(Enough about you. Learn more about me on <a target="_blank" href = "https://connorrothschild.github.io">my personal website.</a>)</span>'
					);
				});
			};
		};
	}
);
