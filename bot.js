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
                .alt('Waseef Logo')
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
       
       }
]).triggerAction({ matches: 'tenantIntent' });


bot.dialog('maintenanceDialog', [
    (session) => {

       // "https://docs.microsoft.com/en-us/aspnet/aspnet/overview/developing-apps-with-windows-azure/building-real-world-cloud-apps-with-windows-azure/data-storage-options/_static/image5.png"
        var choices = [
        {title: "Domestic Drianage System",subtitle:"Can you See Grease, Tree roots or Silted Drains ?",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"Driange System"}, 

        {title: "Elevator System Problems",subtitle:"Power failure | Lights Off | Noisy bearings",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"Elevator Problem"},

        {title: "irrigation System",subtitle:"No water coming | Zones Stopping | Sprinkles",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"Irrigation"},

        {title: "Exhaust Fan",subtitle:"Motor Noise | Rattling | Power Failure | Moisture",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"Exhaust Fan"},

        {title: "Water Heater Leakage",subtitle:"Can you see water Leaking from the Heater ?",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"Water Leakage"},

        {title: "Water Heater Break Down",subtitle:"No Hot Water | Not Enough Water | Too Cold  ",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"Water Heater"},

        {title: "Water Supply Cut",subtitle:"No water is coming from the water taps ?",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"Water Cut"},

        {title: "LPG System",subtitle:"Offload the heavy lifting of LPG Systems",
        imgUrl:"https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png",msg:"LPG"}
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
  
        builder.Prompts.choice(session, msg,stringChoices,{
          retryPrompt: msg
        })
             
    }
    , (session,results) => {
       session.dialogData.choice = results.response.entity;
     builder.Prompts.text(session,"Please Describe Your Problem");
    }  , (session,results) => {
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
       session.send("Welcome to the Help Dialog :) ") ;
       
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
