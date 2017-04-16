exports.schema = [`
    # Entry point to our application
    type Query {
        # List of all enventBundles
        eventBundles: [EventBundle]
    }
    
    type EventBundle {
        name: String
    }
    
`]