export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // Check if environment variable is set
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return res.status(500).json({ 
        success: false, 
        error: 'MONGODB_URI environment variable is not set',
        env: process.env.NODE_ENV
      });
    }
    
    // Test basic MongoDB connection
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(mongoUri);
    
    await client.connect();
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    await client.close();
    
    res.status(200).json({ 
      success: true, 
      message: 'MongoDB connection successful!',
      collections: collections.map(c => c.name),
      env: process.env.NODE_ENV,
      hasMongoUri: !!mongoUri,
      uriLength: mongoUri.length
    });
    
  } catch (error) {
    console.error('Debug Error:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      env: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI
    });
  }
}
