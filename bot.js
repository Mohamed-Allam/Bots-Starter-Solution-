'use strict';
const builder = require('botbuilder');
var data = require("./Demodata.js");
var Promise = require('bluebird');
var request = require('request-promise').defaults({ encoding: null });
var fs = require("fs");
const dateShortcode = require('date-shortcode')

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
    logo: "https://www.waseef.qa/en/wp-content/themes/waseef/images/logo-1.png?w=640&h=330",
    hintIcon: "https://cdn4.iconfinder.com/data/icons/sibcode-line-tech/512/light_on-512.png",
    hintIconGreen: "data:image/png;base64,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",
    welcomeIcon: "https://i.pinimg.com/736x/16/a2/c8/16a2c8deb445e2aa3ff5033a4ab2dd75--emoticon-emoji.jpg",
    wrongIcon: "https://s3.envato.com/files/58667950/3d%20small%20people%20-%20negative%20symbol%20pr.jpg",
    gearIcon: "http://superawesomevectors.com/wp-content/uploads/2014/08/3-black-gear-wheels-free-vector-icon-800x565.jpg",
    elevatorIcon: "https://thumb7.shutterstock.com/display_pic_with_logo/2945839/342308177/stock-vector-elevator-icon-or-lift-icon-vector-illustration-342308177.jpg",
    sadIcon: "https://i.pinimg.com/originals/5a/f5/49/5af549fb8335bf9a9f78f8572e16e9cf.jpg",
    byeIcon : "https://i.pinimg.com/originals/f1/61/94/f16194fb03829f449ba428e855d7af4c.png",
    helpIcon: "data:image/png;base64,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"

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


        session.sendTyping();
        setTimeout(function () {
            var card = createRichMessage(links.hintIconGreen, "  Type 'Help' or Cancel  at any Time ");
            session.send(new builder.Message(session)
                .addAttachment(card));
            next();
        }, 2500);



        // Launch the getName dialog using beginDialog
        // When beginDialog completes, control will be passed
        // to the next function in the waterfall

        //  session.beginDialog('tenant');
    });

bot.recognizer(new builder.RegExpRecognizer("tenantIntent", /^(tenant|mosta2ger|existing|existing tenant)/i));
bot.recognizer(new builder.RegExpRecognizer("maintenanceIntent", /^(Maintenance)/i));
bot.recognizer(new builder.RegExpRecognizer("terminationIntent", /^(termination|leaving|going home|termination letter|termination Letter)/i));

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
        var msg = args.isReprompt ? "Please Re-Enter your Mobile Number  " : 'Please enter your mobile number to get SMS verification code';

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
                session.send(" Sorry! We didn't recieve a valid Mobile Number");
                // session.endDialogWithResult({ response: "We didn't recieve a valid Mobile Number" });

                session.send('Please register first before using this service ');

                setTimeout(function () {
                    session.replaceDialog("/");
                }, 2000);

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
        session.userData.tenant = tenant;

        if (tenant) {
            var card = createRichMessage(links.welcomeIcon, "I am happy to serve you today", "Welcome " + tenant.name + "!");
            session.sendTyping();
            setTimeout(function () {
                var msg = new builder.Message(session)
                    .addAttachment(card);
                session.send(msg);
                next();
            }, 3000);
        }
        else {

            var card = createRichMessage(links.wrongIcon, "Please register first before using this service", "Number is not registered");
            session.sendTyping();
            setTimeout(function () {
                var msg = new builder.Message(session)
                    .addAttachment(card);
                session.send(msg);

                setTimeout(function () {

                    session.replaceDialog("/");
                }, 2500);


            }, 3000);


        }


    }, (session, results, next) => {

        builder.Prompts.choice(session, "Please select a service to start", "Maintenance|Termination Letter", { listStyle: builder.ListStyle.button });

    }
    , (session, results, next) => {

        if (results.response.entity == "Maintenance")
            session.beginDialog("maintenanceDialog");
        else if (results.response.entity == "Termination Letter")
            session.beginDialog("terminationDialog");

    }
]).triggerAction({ matches: 'tenantIntent' });


bot.dialog('terminationDialog', [
    (session, args, next) => {

        var tenant = session.userData.tenant;
        var card = createRichMessage(links.sadIcon, "it is unforunate to see you leaving", "We are Sad " + tenant.name + "!");
        var msg = new builder.Message(session)
            .addAttachment(card);
        session.send(msg);

        session.sendTyping();
        setTimeout(function () {
            next();
        }, 2000);
    },
    (session, results, next) => {

        builder.Prompts.choice(session, "Tell me about the reason please", "Leaving The Country|Work Termination|Other", { listStyle: builder.ListStyle.button });

    }, (session, results, next) => {


        

        if (results.response.entity == "Leaving The Country" || results.response.entity == "Work Termination")
            builder.Prompts.attachment(session, "Please attach the letter for us");
        else {
            builder.Prompts.text(session, "Please enter the reason")
        }

    }, (session, results, next) => {


        var card = createRichMessage(links.byeIcon, "Thank you for your Feedback!", "See you soon " + session.userData.tenant.name + "!");
        var msg = new builder.Message(session)
            .addAttachment(card);
        session.send(msg);


    }
]).triggerAction({ matches: 'terminationIntent',confirmPrompt : " This will cancel your current request, ok ?" });


bot.dialog('maintenanceDialog', [
    (session) => {

        // "https://docs.microsoft.com/en-us/aspnet/aspnet/overview/developing-apps-with-windows-azure/building-real-world-cloud-apps-with-windows-azure/data-storage-options/_static/image5.png"
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
            .text('Choose a category for the problem')

        builder.Prompts.choice(session, msg, stringChoices, {
            retryPrompt: msg
        })

    }
    , (session, results) => {

        // creating the ticket 
        session.dialogData.ticket = {};
        session.dialogData.ticket.category = results.response.entity;

        builder.Prompts.text(session, "Please describe your problem");
    }, (session, results, next) => {

        session.dialogData.ticket.description = results.response;

        builder.Prompts.attachment(session, "Please take a shot and send the picture to Me ");

    },
    (session, results) => {



        var msg = session.message;
        if (msg.attachments.length) {

            // Message with attachment, proceed to download it.
            // Skype & MS Teams attachment URLs are secured by a JwtToken, so we need to pass the token from our bot.
            var attachment = msg.attachments[0];
            var fileDownload = checkRequiresToken(msg)
                ? requestWithToken(attachment.contentUrl)
                : request(attachment.contentUrl);

            // using request module to write the image to the disk
            request(attachment.contentUrl).pipe(fs.createWriteStream('metro.png'));
            session.dialogData.ticket.picUrl = attachment.contentUrl;

            fileDownload.then(
                function (response) {

                    // Send reply with attachment type & size
                    var reply = new builder.Message(session)
                        .text('Attachment of %s type and  received.', attachment.contentType);
                    //  session.send(reply);

                }).catch(function (err) {
                    console.log('Error downloading attachment:', { statusCode: err.statusCode, message: err.response.statusMessage });
                });

        } else {

            // No attachments were sent
            var reply = new builder.Message(session)
                .text(" Hi " + session.userData.tenant.name + ' No attachment was sent to me. Please try again sending a new message with an attachment.');
            session.send(reply);
        }

        builder.Prompts.time(session, "What time would you like to schedule the visit?");

    }, (session, results) => {

        session.dialogData.ticket.time = builder.EntityRecognizer.resolveTime([results.response]);

        session.send(" Wait please until i book your visit!");

        session.sendTyping();
        setTimeout(function () {
            // session.replaceDialog("/");
        }, 2000);

        var getReceiptCard = function createThumbnailCard() {
            return new builder.ThumbnailCard()
                .title('Service Visit Confirmation')
                .subtitle('Name — ' + session.userData.tenant.name + "\n\n Date — " + session.dialogData.ticket.time.toString().split("G", 1))
                .text('**Ticket Confirmed** \n\n Address: ' + session.userData.tenant.property + " Building " + session.userData.tenant.building + ", Flat " + session.userData.tenant.flatNumber + " \n\n Description: " + session.dialogData.ticket.description)
                .images([ // https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg
                    // links.gearIcon
                    builder.CardImage.create(session, links.gearIcon)
                ])
                .buttons([
                    builder.CardAction.imBack(session, "confirmed", "Please confirm")
                ]);
        }


        var card = getReceiptCard();

        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
    }
]).triggerAction({ matches: 'maintenanceIntent' });


bot.dialog('Help', [
    (session, args, next) => {

        var txt = "\n\n***Help Dialog!*** \n\nWelcome to the Help Dialog \n\n You can use any of below command anytime"
        txt += "\n\n **Maintenance** to start the ticket opening process \n\n " +
                "\n\n **Termination** to start the contract termination process " + 
        "\n\n **Cancel** to stop and cancel any Request" + "\n\n **Help** to come back here"

        var card = createRichMessage(links.helpIcon, txt, ".");
        var msg = new builder.Message(session)
            .addAttachment(card);
        session.send(msg);
        
       builder.Prompts.text(session," Press any Key to exist")

    },(session,result)=>{

        session.replaceDialog("/");

    }
]).triggerAction({
    matches: /^help/i,
    onSelectAction: (session, args) => {

        session.beginDialog(args.action, args);
    }
});

bot.dialog('Cancel', [
    (session, args, next) => {
        session.send("Welcome to the cancel Dialog :) ");

    }
]).triggerAction({
    matches: /^cancel/i,
    onSelectAction: (session, args) => {

        session.beginDialog(args.action, args);
    }
});


var choices = [
    {
        title: "Domestic Drianage System", subtitle: "Can you See Grease, Tree roots or Silted Drains ?",
        imgUrl: "https://www.rpdnw.com/images/mains-icon-blue.png", msg: "Driange System"
    },

    {
        title: "Water Heater Break Down", subtitle: "No Hot Water | Not Enough Water | Too Cold  ",
        imgUrl: "https://actionplumbing.net/wp-content/uploads/2014/09/Heating-Icon.png", msg: "Water Heater"
    },

    {
        title: "Elevator System Problems", subtitle: "Power failure | Lights Off | Noisy bearings",
        imgUrl: "https://d30y9cdsu7xlg0.cloudfront.net/png/20556-200.png", msg: "Elevator Problem"
    },

    {
        title: "irrigation System", subtitle: "No water coming | Zones Stopping | Sprinkles",
        imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBkZkNcz7FvE4tjoYxVqUIdXl_6Zo_lAZGMQTVOwrcCqwzmLMP", msg: "Irrigation"
    },

    {
        title: "Exhaust Fan", subtitle: "Motor Noise | Rattling | Power Failure | Moisture",
        imgUrl: "https://marketplace.canva.com/MAB0h48dkxs/1/thumbnail/canva-blue-electric-fan-home-electrical-icon--MAB0h48dkxs.png", msg: "Exhaust Fan"
    },

    {
        title: "Water Supply Cut", subtitle: "No water is coming from the water taps ?",
        imgUrl: "https://images.cdn3.stockunlimited.net/clipart/tap-water_2004333.jpg", msg: "Water Cut"
    },

    {
        title: "Water Heater Leakage", subtitle: "Can you see water Leaking from the Heater ?",
        imgUrl: "https://static1.squarespace.com/static/59f88890914e6b2a2c51cd1b/t/59fb20da692670568435c34a/1509553690665/slab-leak-repair.png", msg: "Water Leakage"
    },





    {
        title: "LPG System", subtitle: "Offload the heavy lifting of LPG Systems",
        imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlVkdfKElXNTlClpcswbnp9eLOmOku0-irLFoxIfeYUszJVnj4", msg: "LPG"
    }
];


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

// Request file with Authentication Header
var requestWithToken = function (url) {
    return obtainToken().then(function (token) {
        return request({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/octet-stream'
            }
        });
    });
};

// Promise for obtaining JWT Token (requested once)
var obtainToken = Promise.promisify(connector.getAccessToken.bind(connector));

var checkRequiresToken = function (message) {
    return message.source === 'skype' || message.source === 'msteams';
};

