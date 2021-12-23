const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder()
		.setName('init')
		.setDescription('Initialize a new test.')
		.addStringOption(option => 
			option.setName('date')
				.setDescription('The date of the test')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('subject')
				.setDescription('The subject of the test')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('number')
				.setDescription('The number of the test')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('done')
		.setDescription('End of the survey.'),
	new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your grade')
		.addNumberOption(option => 
			option.setName('grade')
				.setDescription('Your grade')
				.setRequired(true))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();