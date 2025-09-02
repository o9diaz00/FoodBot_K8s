//require('dotenv').config(); //initialize dotenv
//const cron = require('cron');
const { Client, Discord, Intents, TextChannel } = require('discord.js')
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;
const client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers'] });
const { exec } = require('child_process');
const os = require('os');
//client = new Client({ intents: 32767 });

let foodList = {
    general: [],
};

async function fetchMembers()
{
    const Guild = client.guilds.cache.get(guildId); // Getting the guild.
    const members = await Guild.members.fetch();
    members.forEach(member => {
        if (!member.user.bot)
        {
            let key = member.user.id;
            foodList[key] = [];
        }
    });
}

function removeItem(array, value, name, message)
{
    if (array.includes(value))
    {
        const index = array.indexOf(value);
        message.reply("Removed "+value+" from "+name+" list!");
        if (index > -1)
        { array.splice(index, 1); }
    }
    else
        { message.reply(msg+" is not in "+name+" list!"); }

    return array
}

function addItem(array, value, name, message)
{
    if (array.includes(value))
    { message.reply(""+value+" is already added to "+name+" list!"); }
    else
    {
        message.reply("Added "+value+" to "+name+" food list!");
        array.push(value);
    }
}

function clearArray(array, name, message)
{
    message.reply("Okay, I am removing all the items from "+name+" list");

    while (array.length > 0)
    { array.pop(); }
}

function listArray(array, name, message)
{
    if (array.length == 0)
    { message.reply("No items have been added to "+name+" list!"); }
    else
    { message.reply("These are the foods in "+name+" list:\n"+array.join("\r\n")); }
}

function selectRandomElement(array, name, message)
{
    if (array.length == 0)
    { message.reply("There are no choices in "+name+" list for me to choose from"); }
    else
    {
        const rand = Math.floor(Math.random() * array.length);
        message.reply("Choosing from the list, why not have you some ["+array[rand]+"] today");
    }
}

function importFoodList(array, name, message)
{
    if (foodList["general"].length == 0)
    { message.reply("There are no choices in the general list to copy over"); }
    else
    {
        for (i=0; i<foodList["general"].length; i+=1)
        {
            if (!array.includes(foodList["general"][i]))
            { array.push(foodList["general"][i]); }
        }
    message.reply("Added items from the general list into "+name+" list");
    }
}

function getManga(series, message)
{
    let cmd = "";
    const mangaList = {
        "onepiece": "tcbonepiecechapters.com/mangas/5/one-piece"
        }

    if (!mangaList[series])
    { message.reply("Sorry, this feature hasn't been implemented for "+series); return 1};
    if (os.type().includes("Linux"))
    { cmd = "curl -s -H 'Accept: application/json' -X GET https://"+mangaList[series]+" | grep -oP '/chapters/(.+?)-[0-9]+' | head -1"; }
    else
    { cmd = "bash -l -c \"curl -s https://"+mangaList[series]+" | grep -oP '/chapters/(.+?)-[0-9]+' | head -1 \""; }
    exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error("exec error: ${error}");
        return;
    }
    if (stderr) {
        console.error("stderr: ${stderr}");
        return;
    }
    try {
        let url = "";
        if (series == "onepiece")
        { url = mangaList[series].split("/")[0]; }
        message.reply("https://"+url+stdout);
    } catch (e) { console.error("Error parsing JSON", e); }
    });
}

client.once('ready', () => {
    fetchMembers();
});

client.on("messageCreate", (message) => {
    if (message.author.bot)
    { return false }

    if (message.author.username != "")

    if (message.content == '!removeAllFood')
    { clearArray(foodList[message.author.id], "["+message.author.username.toUpperCase()+"]'s", message); }

    if (message.content.startsWith('!addFood '))
    { addItem(foodList[message.author.id], message.content.split(" ")[1].toUpperCase(), "["+message.author.username.toUpperCase()+"]'s", message); }

    if (message.content.startsWith('!addFoodGeneral '))
    { addItem(foodList["general"], message.content.split(" ")[1].toUpperCase(), "the general food", message); }

    if (message.content.startsWith('!removeFood '))
    { foodList[message.author.id] = removeItem(foodList[message.author.id], message.content.split(" ")[1].toUpperCase(), "["+message.author.username.toUpperCase()+"]'s", message); }

    if (message.content.startsWith('!removeFoodGeneral '))
    { foodList["general"] = removeItem(foodList["general"], message.content.split(" ")[1].toUpperCase(), "the general food", message); }

    if (message.content == "!foodList")
    { listArray(foodList[message.author.id], "["+message.author.username.toUpperCase()+"]'s", message); }

    if (message.content == "!foodListGeneral")
    { listArray(foodList["general"], "the general food", message); }

    if (message.content == "!pickFood")
    { selectRandomElement(foodList[message.author.id], "["+message.author.username+"]'s", message); }

    if (message.content == "!pickFoodGeneral")
    { selectRandomElement(foodList["general"], "the general food", message); }

    if (message.content == "!import")
    { importFoodList(foodList[message.author.id], "["+message.author.username+"]'s", message); }

    if (message.content.startsWith('!manga '))
    { getManga(message.content.split(" ")[1].toLowerCase(), message); }

    if (message.content == "!foodHelp")
    {
    const reply = `These are the commands that currently work:
                   !foodHelp => Call this help menu
                   !addFood $food => Inserts an item into your personal food list
                   !addFoodGeneral $food => Inserts an item into the general food list
                   !removeFood $food => Removes an item from your personal food list
                   !removeFoodGeneral $food => Removes an item from the general food list
                   !foodList => Grabs the list of items in your personal list
                   !foodListGeneral => Grabs the list of items in the general list
                   !pickFood => Randomly selects an item from your personal list
                   !pickFoodGeneral => Randomly selects an item from the general food list
                   !import => Sets your list to the general food list
                   !manga $manga => Attempts to retrieve the latest chapter for the manga you specified (only works for onepiece right now)`
    message.reply(reply);
    }
});

client.login(token); //login bot using token