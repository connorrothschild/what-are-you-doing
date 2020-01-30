<style>
	.active {
		background-color: #ff3e00;
		color: white;
	}
</style>

<script>
	import { time } from './time.js';
	import Box from './Box.svelte';

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	});
	
	let name = "Timothy";
	
	//race 
	let raceOptions = ["Black", "White", "Asian", "Hispanic"];
	let race = "Black";
	
	// sex
	let sexOptions = ["man", "woman"];
	let sex = "man"
	
	// age
	let age = "21";
	
	//activities
	// let activities = "";
	let activities = ["reading", "studying", "sleeping"];
	
	let status = "";

	function tryAgain(status) {
		if (status == "Yes 🤠") {
		return "Awesome! Keep it up! I think you're great at " + activities[0] + " :)"
	} else if (status == "No 😔") {
			return "Oh man, I'm not very good at this... My other guesses (in order of confidence) are that you are: " 
		+ activities
		//+ activities.forEach(element => log(element));
	} else if (status == "") 
		{return "";}
	}
	
	let visible = false;
	
	function handleClick() {
		visible = true;
	}
	
	function toTitleCase(str) {
		return str.replace(
			/\w\S*/g,
			function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
	}

</script>

Could you tell me a little more information about yourself?	

<br><br>

My name is
<input type=text bind:value={name}>
and I am a...

<br>
<select bind:value={race}>
	{#each raceOptions as raceOption}
		<option value={raceOption}>{raceOption}</option> 
	{/each}
</select>

<select bind:value={sex}>
	{#each sexOptions as sexOption}
		<option value={sexOption}>{sexOption}</option> 
	{/each}
</select>
. I'm
<input type=number bind:value={age} min=0 max=100>
years old.
<br><br>

<div style = "text-align:center;">
<button on:click|once={handleClick}>	
	<strong>Do your magical calculations!</strong>
</button>
</div>

{#if visible}
<Box>
	<h2>{name !== "" ? "Hello " + toTitleCase(name) + "!" : "Hello!"}</h2>
	You are {race == "Asian" ? "an" : "a"} 
				{race == "White" ? race.toLowerCase() : race} 
				{sex.toLowerCase()}, and you are currently {age} years old.
	<p>
		The time is currently <strong>{formatter.format($time)}</strong> (I hope).
	</p>
	<p>
		Given those parameters, my prediction is that you are 
		<strong>
			{activities[1]}
		</strong> right now.
	</p>
	<p>
		Did I get it right?
	</p>
	<button class:active="{status === 'Yes 🤠'}"
	on:click="{() => status = 'Yes 🤠'}">
		Yes >
	</button>
	<button class:active="{status === 'No 😔'}"
	on:click="{() => status = 'No 😔'}">
		No =
	</button>
	<br><br>

	{tryAgain(status)}

</Box>
{/if}

