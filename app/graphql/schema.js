exports.schema = [`
    scalar Date

    # Entry point to our application
    type Query {
        # List of all enventBundles
        eventBundles: [EventBundle]
        
        # List of all notifications
        notification: [Notification]
    }
    
    type EventBundle {
        name: String
        date: Date
        eventList: [Event]
    }
    
    type Event {
        headline: String
        description: String
        imageResource: String
        category: [EventCategory]
        date: String
        time: String
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
        messageArriveDateTime: Date
        messageProcessDateTime: Date
    }
`]