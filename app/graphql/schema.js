exports.schema = [`
    # Entry point to our application
    type Query {
        # List of all enventBundles
        eventBundles: [EventBundle]
        
        # List of all notifications
        notification: [Notification]
    }
    
    type EventBundle {
        name: String
        event: [Event]
    }
    
    type Event {
        headline: String
        description: String
    }
    
    type Notification {
        sender: String
        tagList: [String]
        notificationType: String
        urgent: Boolean
        messageSubject: String
        messageBody: String
        messageArriveDateTime: String
        messageProcessDateTime: String
    }
`]