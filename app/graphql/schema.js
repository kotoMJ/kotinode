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
    }
    
    type Notification {
        messageSubject: String
    }
`]