// Require the necessary discord.js classes
const { Client, Intents, MessageEmbed } = require('discord.js');
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

//* Data of the program
let testData = {
	date: "",
	subject: "",
	number: ""
};
let grades = new Map(); // The notes with the ID of the student
const me = "635908615965900810";

//? Functions needed to do the math
function ranking(currentStudent) {
	const studentGrade = grades.get(currentStudent);
    let rank = 1;

    for (const [student, grade] of grades) {
        if (student !== currentStudent && grade > studentGrade) {
            rank++;
        }
    }

    return rank;
}

function standardDeviationCalculation() {
	let standardDeviation = 0;
	let variance = 0;
	let mean = 0;

	for (const [_, grade] of grades) {
		mean += grade;
	}

	mean /= grades.size;

	for (const [_, grade] of grades) {
		variance += (grade - mean) * (grade - mean);
	}

	variance /= grades.size;

	standardDeviation = Math.sqrt(variance);

	return standardDeviation;
}

function medianCalculation() {
    let median = 0;
    let gradeList = [];

    for (const [_, grade] of grades) {
        gradeList.push(grade);
    }

    gradeList.sort();

    if (grades.size % 2 === 0) {
        median = (gradeList[grades.size / 2 - 1] + gradeList[grades.size / 2]) / 2;
    } else {
    	median = gradeList[(grades.size - 1) / 2]
    }

    return median;
}

function formatMessage(rank, standardDeviation, median) {

	const finalMessage = new MessageEmbed()
		.setColor("#0099ff")
		.setTitle("Votre rang pour le DS numero " + testData.number + " de " + testData.subject + " fait le " + testData.date)
		.setAuthor('Ranking')
		.setDescription("Si quelque chose vous semble bizarre, merci de contacter mon développeur.")
		.addFields(
			{ name: "Votre rang", value: rank.toString() + "/" + grades.size.toString()},
			{ name: "L'écart-type", value: standardDeviation.toString()},
			{ name: "La médiane", value: median.toString()}
		)
		.setTimestamp()
		.setFooter("By C9H9NO2")

    return finalMessage
}
//?================================

// When the client is ready, run this code (only once)
client.once('ready', () => {
	// Set the status of the bot and the game it's playing
	client.user.setActivity('Dumb bot ranking smart people');

	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return; 

	const { commandName } = interaction;

	client.user.setActivity('Dumb bot ranking smart people');

	switch (commandName) {
		//? Passing the different information about the test to the bot.
		case 'init':
			if (interaction.user.id === me) {
				testData.date = interaction.options.getString('date');
				testData.subject = interaction.options.getString('subject');
				testData.number = interaction.options.getString('number');

				// This is the confirmation message that will be displayed
				const confirmationMessage = new MessageEmbed()
					.setColor('#000000')
					.setTitle('Test information')
					.setAuthor('Ranking')
					.setDescription('This is the information about the test as they were saved.')
					.addFields(
						{ name: 'Date of the test', value: testData.date },
						{ name: 'Subject of the test', value: testData.subject},
						{ name: 'Number of the test', value: testData.number},
					)
					.setTimestamp()
					.setFooter('By C8H9NO2');

				// The actual answer
				await interaction.reply({ embeds: [confirmationMessage] });
			} else {
				await interaction.reply("```diff\n- Vous n'avez pas la permission d'utiliser cette commande.\n```");
			}
			break;
		//? End of the collect of grades and sending of messages to everyone.
		case 'done':
			if (interaction.user.id === me) {
				
				for (const [student, _] of grades) {
					const rank = ranking(student);
					const standardDeviation = standardDeviationCalculation();
					const median = medianCalculation();

					const message = formatMessage(rank, Math.round(standardDeviation * 100) / 100, Math.round(median * 100) / 100);

					await student.send({ embeds: [message] });
				}

				await interaction.reply("```md\n> Les messages on bien été envoyés.\n```")
			} else {
				await interaction.reply("```diff\n- Vous n'avez pas la permission d'utiliser cette commande.\n```");
			}
			break;
		//? When a student enter his/her grade
		case 'register':
			const grade = interaction.options.getNumber('grade');

			if (grade >= 0 && grade <= 20) {
				grades.set(interaction.user, grade);
				// console.log(grades); //* This line is commented out because of obvious privacy reason.
				console.log("Size: ", grades.size);

				await interaction.reply("```md\n# Votre note a bien été enregistrée, nous vous enverrons le classement dès que nous aurons collectés assez de données.\n```");
			} else {
				await interaction.reply("```diff\n- Veuillez entrer une note comprise entre 0 et 20.\n```");
			}
			break;
	}
});

// Login to Discord with your client's token
client.login(token);