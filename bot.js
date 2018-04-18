'use strict';
const builder = require('botbuilder');
var data = require("./Demodata.js");

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
    logo: "https://www.waseef.qa/en/wp-content/themes/waseef/images/logo-1.png?w=640&h=330"

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
                    .alt('Waseef Logo')
            ])
            .buttons([ // session.gettext(MainOptions.tenant)
                builder.CardAction.imBack(session, "Tenant", session.gettext(MainOptions.tenant)),
                builder.CardAction.imBack(session, "Guest", MainOptions.visiting_guest)
            ]);


        session.send(new builder.Message(session)
            .addAttachment(welcomeCard));

        // Launch the getName dialog using beginDialog
        // When beginDialog completes, control will be passed
        // to the next function in the waterfall

        //  session.beginDialog('tenant');
    });

bot.recognizer(new builder.RegExpRecognizer("tenantIntent", /^(tenant|mosta2ger)/i));
bot.recognizer(new builder.RegExpRecognizer("maintenanceIntent", /^(Maintenance)/i));

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        }); //  test Node mon
    }
});



bot.dialog('tenant', [
    (session, args, next) => {
        // store reprompt flag
        if (args) {
            session.dialogData.isReprompt = args.isReprompt;
        }

        var msg = args.isReprompt ? "Please Re-Enter your Mobile Number  " : 'Please enter your mobile number';

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
            session.dialogData.mobileNumber = mobileNumber;
            next();

        }
    }, (session, results, next) => {

        // builder.Prompts.choice(session, "Which color?", "red|green|blue", { listStyle: builder.ListStyle.button });
        var tenant = data.find(x => x.mobileNumber == session.dialogData.mobileNumber)
        if (tenant) {
            var img = "data:image/png;base64,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";


            var card = createRichMessage(img, "NIce to see you again " + tenant.name + "!");
            var msg = new builder.Message(session)
                .addAttachment(card);
            session.send(msg);

        }

        session.sendTyping();
        setTimeout(function () {
            next();
        }, 3000);
       

    }, (session, results, next) => {

        builder.Prompts.choice(session, "How Can I Help You Today?", "Maintenance|Termination Letter", { listStyle: builder.ListStyle.button });

    }
    , (session, results, next) => {

        if (results.response.entity == "Maintenance")
            session.beginDialog("maintenanceDialog");
        else if (results.response.entity == "terminationDialog")
            session.beginDialog("terminationDialog");

    }
]).triggerAction({ matches: 'tenantIntent' });


bot.dialog('maintenanceDialog', [
    (session) => {

        // "https://docs.microsoft.com/en-us/aspnet/aspnet/overview/developing-apps-with-windows-azure/building-real-world-cloud-apps-with-windows-azure/data-storage-options/_static/image5.png"
        var choices = [
            {
                title: "Domestic Drianage System", subtitle: "Can you See Grease, Tree roots or Silted Drains ?",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Driange System"
            },

            {
                title: "Elevator System Problems", subtitle: "Power failure | Lights Off | Noisy bearings",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Elevator Problem"
            },

            {
                title: "irrigation System", subtitle: "No water coming | Zones Stopping | Sprinkles",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Irrigation"
            },

            {
                title: "Exhaust Fan", subtitle: "Motor Noise | Rattling | Power Failure | Moisture",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Exhaust Fan"
            },

            {
                title: "Water Heater Leakage", subtitle: "Can you see water Leaking from the Heater ?",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Water Leakage"
            },

            {
                title: "Water Heater Break Down", subtitle: "No Hot Water | Not Enough Water | Too Cold  ",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Water Heater"
            },

            {
                title: "Water Supply Cut", subtitle: "No water is coming from the water taps ?",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Water Cut"
            },

            {
                title: "LPG System", subtitle: "Offload the heavy lifting of LPG Systems",
                imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "LPG"
            }
        ];


        var cards = [];
        var stringChoices = []


        choices.forEach(element => {
            var card = new builder.HeroCard(session)
                .title(element.title)
                .subtitle(element.subtitle)
                .images([
                    builder.CardImage.create(session, element.imgUrl)
                ])
                .buttons([
                    builder.CardAction.imBack(session, element.msg, "Report")
                ]);

            cards.push(card);
            stringChoices.push(element.msg)


        });


        const msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel) // This works
            .attachments(cards)
            .text('Choose a card')

        builder.Prompts.choice(session, msg, stringChoices, {
            retryPrompt: msg
        })

    }
    , (session, results) => {
        session.dialogData.choice = results.response.entity;
        builder.Prompts.text(session, "Please Describe Your Problem");
    }, (session, results) => {
        session.send("PLease take a shot and send the picture to Me ");
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
        if (!session.privateConversationData.runningTotal) {
            message = `Give me the first number.`;
            session.privateConversationData.runningTotal = 0;
        } else {
            message = `Give me the next number, or say **total** to display the total.`;
        }
        builder.Prompts.number(session, message, { maxRetries: 3 });
    },
    (session, results, next) => {
        if (results.response) {
            session.privateConversationData.runningTotal += results.response;
            session.replaceDialog('AddNumber');
        } else {
            session.endConversation(`Sorry, I don't understand. Let's start over.`);
        }
    },
])
    .triggerAction({ matches: /^add$/i })
    .cancelAction('CancelAddNumber', 'Operation cancelled', {
        matches: /^cancel$/,
        onSelectAction: (session, args, next) => {
            session.endConversation(`Operation cancelled.`);
            next();
        },
        confirmPrompt: `Are you sure you wish to cancel?`
    })
    .beginDialogAction('Total', 'Total', { matches: /^total$/ })
    .beginDialogAction('HelpAddNumber', 'Help', { matches: /^help$/, dialogArgs: { action: 'AddNumber' } });

bot.dialog('Total', [
    (session, results, next) => {
        session.endConversation(`The total is ${session.privateConversationData.runningTotal}`);
    },
]);

bot.dialog('Help', [
    (session, args, next) => {
        session.send("Welcome to the Help Dialog :) ");

    }
]).triggerAction({
    matches: /^help/i,
    onSelectAction: (session, args) => {

        session.beginDialog(args.action, args);
    }
});

var createRichMessage = function (img, msg, title) {

    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': img || 'https://placeholdit.imgix.net/~text?txtsize=65&txt=Adaptive+Cards&w=300&h=300',
                                            'size': 'medium',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                        {
                                            'type': 'TextBlock',
                                            'text': title || '.',
                                            'weight': 'bolder',
                                            'isSubtle': true
                                        },
                                        {
                                            'type': 'TextBlock',
                                            'text': msg || 'Are you looking for a flight or a hotel?',
                                            'wrap': true
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]

        }
    };

    return card;
}

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


