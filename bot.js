'use strict';
const builder = require('botbuilder');
var data = require ("./Demodata.js");

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var MainOptions = {
    tenant: 'tenant',
    visiting_guest: 'visiting_guest'
};

var links = {
// https://placeholdit.imgix.net/~text?txtsize=56&txt=Contoso%20Flowers&w=640&h=330
    logo:"https://www.waseef.qa/en/wp-content/themes/waseef/images/logo-1.png?w=640&h=330"

}



// In a bot, a conversation can hold a collection of dialogs.

// Each dialog is designed to be a self-contained unit that can
// perform an action that might take multiple steps, such as collecting
// information from a user or performing an action on her behalf.

const bot = module.exports = new builder.UniversalBot(connector, 
    // this section becomes the root dialog
    // If a conversation hasn't been started, and the message
    // sent by the user doesn't match a pattern, the
    // conversation will start here
    (session, args, next) => {
        
        // This Line Keeps the Welcome card from reaching the top of the screen
        //session.send(" Hi from the root Dialog \n \n ");
        
        
        var welcomeCard = new builder.HeroCard(session)
        .title('welcome_title')
        .subtitle('welcome_subtitle')
        .images([
            new builder.CardImage(session)
                .url(links.logo)
                .alt('contoso_flowers')
        ])
        .buttons([ // session.gettext(MainOptions.tenant)
            builder.CardAction.imBack(session, "Tenant" , session.gettext(MainOptions.tenant) ),
            builder.CardAction.imBack(session, "Guest", MainOptions.visiting_guest)
        ]);


    session.send(new builder.Message(session)
        .addAttachment(welcomeCard));
        
        // Launch the getName dialog using beginDialog
        // When beginDialog completes, control will be passed
        // to the next function in the waterfall

        //  session.beginDialog('tenant');
    });

    bot.recognizer(new builder.RegExpRecognizer( "tenantIntent", /^(tenant|mosta2ger)/i ));
    bot.recognizer(new builder.RegExpRecognizer( "maintenanceIntent", /^(Maintenance)/i ));

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog( message.address,'/');
            }
        }); //  test Node mon
    }
});

// ## Code Fragments but not used in the actual implementation 

bot.dialog('tenant', [
    (session, args, next) => {
        // store reprompt flag
        if(args) {
            session.dialogData.isReprompt = args.isReprompt;
        }

        var msg = args.isReprompt ? "Please Re-Enter your Mobile Number  " : 'Please Enter Your Mobile Number' ;

        // prompt user
        builder.Prompts.text(session, msg);
    },
    (session, results, next) => {
        var mobileNumber = results.response;

        if (!mobileNumber || mobileNumber.trim().length < 8) {
            // Bad response. Logic for single re-prompt
            if (session.dialogData.isReprompt) {
                // Re-prompt ocurred
                // Send back empty string
                session.endDialogWithResult({ response: "We didn't recieve a valid Mobile Number" });
            } else {
                // Set the flag
                session.send('Sorry, Phone must be a valid mobile number (8 digits) ');

                // Call replaceDialog to start the dialog over
                // This will replace the active dialog on the stack
                // Send a flag to ensure we only reprompt once
                session.replaceDialog('tenant', { isReprompt: true });
            }
        } else {
            // Valid name received
            // Return control to calling dialog
            // Pass the name in the response property of results
            session.dialogData.mobileNumber = mobileNumber ;
            next();
         
        }
    }, (session,results,next) => {

                // builder.Prompts.choice(session, "Which color?", "red|green|blue", { listStyle: builder.ListStyle.button });
        var tenant = data.find(x => x.mobileNumber ==  session.dialogData.mobileNumber)
        if(tenant)
        session.send("Hello Mr: " + tenant.name);
        next();

    }, (session,results,next) => {

     builder.Prompts.choice(session, "How Can I Help You Today?", "Maintenance|Termination Letter", { listStyle: builder.ListStyle.button });

    }
    , (session,results,next) => {

       if(results.response.entity == "Maintenance")
       session.beginDialog("maintenanceDialog");
       else if (results.response.entity == "terminationDialog")
       session.beginDialog("terminationDialog");
       session.endDialogWithResult({parm:"XXX"});
       }
]).triggerAction({ matches: 'tenantIntent' });


bot.dialog('maintenanceDialog', [
    (session) => {
        var cards = getCardsAttachments();

        // create reply with Carousel AttachmentLayout
          var reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);
    
        session.send(reply);

            function getCardsAttachments(session) {
                return [
                    new builder.HeroCard(session)
                        .title('Azure Storage')
                        .subtitle('Offload the heavy lifting of data center management')
                        .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
                        .images([
                            builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/aspnet/aspnet/overview/developing-apps-with-windows-azure/building-real-world-cloud-apps-with-windows-azure/data-storage-options/_static/image5.png')
                        ])
                        .buttons([
                            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
                        ]),
            
                    new builder.ThumbnailCard(session)
                        .title('DocumentDB')
                        .subtitle('Blazing fast, planet-scale NoSQL')
                        .images([
                            builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/azure/documentdb/media/documentdb-introduction/json-database-resources1.png')
                        ])
                        .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
                        .buttons([
                            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
                        ]),
            
                    new builder.HeroCard(session)
                        .title('Azure Functions')
                        .subtitle('Process events with a serverless code architecture')
                        .text('An event-based serverless compute experience to accelerate your development. It can scale based on demand and you pay only for the resources you consume.')
                        .images([
                            builder.CardImage.create(session, 'https://msdnshared.blob.core.windows.net/media/2016/09/fsharp-functions2.png')
                        ])
                        .buttons([
                            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/functions/', 'Learn More')
                        ]),
            
                    new builder.ThumbnailCard(session)
                        .title('Cognitive Services')
                        .subtitle('Build powerful intelligence into your applications to enable natural and contextual interactions')
                        .text('Enable natural and contextual interaction with tools that augment users\' experiences using the power of machine-based intelligence. Tap into an ever-growing collection of powerful artificial intelligence algorithms for vision, speech, language, and knowledge.')
                        .images([
                            builder.CardImage.create(session, 'https://msdnshared.blob.core.windows.net/media/2017/03/Azure-Cognitive-Services-e1489079006258.png')
                        ])
                        .buttons([
                            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/cognitive-services/', 'Learn More')
                        ])
                ];
            }
       
    }
]).triggerAction({ matches: 'maintenanceIntent' });

bot.dialog('getAge', [
    (session, args, next) => {
        let name = session.dialogData.name = 'User';

        if (args) {
            // store reprompt flag
            session.dialogData.isReprompt = args.isReprompt;

            // retrieve name
            name = session.dialogData.name = args.name;
        }

        // prompt user
        builder.Prompts.number(session, `How old are you, ${name}?`);
    },
    (session, results, next) => {
        const age = results.response;

        // Basic validation - did we get a response?
        if (!age || age < 13 || age > 90) {
            // Bad response. Logic for single re-prompt
            if (session.dialogData.isReprompt) {
                // Re-prompt ocurred
                // Send back empty string
                session.endDialogWithResult({ response: '' });
            } else {
                // Set the flag
                session.dialogData.didReprompt = true;
                session.send(`Sorry, that doesn't look right.`);
                // Call replaceDialog to start the dialog over
                // This will replace the active dialog on the stack
                session.replaceDialog('getAge', 
                    { name: session.dialogData.name, isReprompt: true });
            }
        } else {
            // Valid age received
            // Return control to calling dialog
            // Pass the age in the response property of results
            session.endDialogWithResult({ response: age });
        }
    }
]);

bot.dialog('AddNumber', [
    (session, args, next) => {
        let message = null;
        if(!session.privateConversationData.runningTotal) {
            message = `Give me the first number.`;
            session.privateConversationData.runningTotal = 0;
        } else {
            message = `Give me the next number, or say **total** to display the total.`;
        }
        builder.Prompts.number(session, message, {maxRetries: 3});
    },
    (session, results, next) => {
        if(results.response) {
            session.privateConversationData.runningTotal += results.response;
            session.replaceDialog('AddNumber');
        } else {
            session.endConversation(`Sorry, I don't understand. Let's start over.`);
        }
    },
])
.triggerAction({matches: /^add$/i})
.cancelAction('CancelAddNumber', 'Operation cancelled', {
    matches: /^cancel$/,
    onSelectAction: (session, args, next) => {
        session.endConversation(`Operation cancelled.`);
        next();
    },
    confirmPrompt: `Are you sure you wish to cancel?`
})
.beginDialogAction('Total', 'Total', { matches: /^total$/})
.beginDialogAction('HelpAddNumber', 'Help', { matches: /^help$/, dialogArgs: {action: 'AddNumber'} });

bot.dialog('Total', [
    (session, results, next) => {
        session.endConversation(`The total is ${session.privateConversationData.runningTotal}`);
    },
]);

bot.dialog('Help', [
    (session, args, next) => {
        let message = '';
        switch(args.action) {
            case 'AddNumber':
                message = 'You can either type the next number, or use **total** to get the total.';
                break;
            default:
                message = 'You can type **add** to add numbers.';
                break;
        }
        session.endDialog(message);
    }
]).triggerAction({
    matches: /^help/i, 
    onSelectAction: (session, args) => {
        session.beginDialog(args.action, args);
    }
});


// The initial Water fall before using the intents 

// const bot = module.exports = new builder.UniversalBot(connector, [
//     // this section becomes the root dialog
//     // If a conversation hasn't been started, and the message
//     // sent by the user doesn't match a pattern, the
//     // conversation will start here
//     (session, args, next) => {
        
//         // This Line Keeps the Welcome card from reaching the top of the screen
//         session.send(" Hi from the root Dialog \n \n ");
        
        
//         var welcomeCard = new builder.HeroCard(session)
//         .title('welcome_title')
//         .subtitle('welcome_subtitle')
//         .images([
//             new builder.CardImage(session)
//                 .url(links.logo)
//                 .alt('contoso_flowers')
//         ])
//         .buttons([
//             builder.CardAction.imBack(session, session.gettext(MainOptions.Shop), MainOptions.Shop),
//             builder.CardAction.imBack(session, session.gettext(MainOptions.Support), MainOptions.Support)
//         ]);


//     session.send(new builder.Message(session)
//         .addAttachment(welcomeCard));
        
//         // Launch the getName dialog using beginDialog
//         // When beginDialog completes, control will be passed
//         // to the next function in the waterfall

//           session.beginDialog('tenant');
//     },
//     (session, results, next) => {
//         // executed when getName dialog completes
//         // results parameter contains the object passed into endDialogWithResults

//         // check for a response
//         if (results.response) {
//             const name = session.privateConversationData.name = results.response;

//             // When calling another dialog, you can pass arguments in the second parameter
//             session.beginDialog('getAge', { name: name });
//         } else {
//             // no valid response received - End the conversation
//             session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
//         }
//     },
//     (session, results, next) => {
//         // executed when getAge dialog completes
//         // results parameter contains the object passed into endDialogWithResults

//         // check for a response
//         if (results.response) {
//             const age = session.privateConversationData.age = results.response;
//             const name = session.privateConversationData.name;

//             session.endConversation(`Hello ${name}. You are ${age}`);
//         } else {
//             // no valid response received - End the conversation
//             session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
//         }
//     },
// ]);
