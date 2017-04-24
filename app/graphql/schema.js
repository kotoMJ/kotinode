exports.schema = [`
    scalar DateTime

    # Entry point to our application
    type Query {
        login(email:String!, password: String!): AccessToken
    
        # List of all enventBundles
        eventBundles: [EventBundle]
        
        # List of all notifications
        notification: [Notification]
    }
    
    type AccessToken {
        token: String
        errorMessage: String
    }
    
    type EventBundle {
        name: String
        date: DateTime
        eventList: [Event]
    }
    
    type Event {
        headline: String
        description: String
        imageResource: String
        category: [EventCategory]
        date: DateTime
        time: DateTime
        location: [EventLocation]
        text: [String]
    }
    
    type EventCategory {
        name: String
    }
    
    type EventLocation {
        name: String
    }
    
    type Notification {
        sender: String
        tagList: [String]
        notificationType: String
        urgent: Boolean
        messageSubject: String
        messageBody: String
        messageArriveDateTime: DateTime
        messageProcessDateTime: DateTime
    }
`]