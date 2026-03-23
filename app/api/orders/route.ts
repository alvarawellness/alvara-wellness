import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  // Your actual connection string here:
const uri = process.env.MONGODB_URI as string;
  // ADD THIS LINE:
  console.log("THE SERVER IS USING THIS LINK FOR ORDERS: ", uri);
  try {
    // Read the order data sent from the frontend
    const orderData = await request.json();
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('alvara');
    // This will automatically create an 'orders' collection if it doesn't exist
    const collection = database.collection('orders');
    
    // Add a timestamp and status to the order
    const finalOrder = {
      ...orderData,
      status: 'New',
      createdAt: new Date(),
    };
    
    const result = await collection.insertOne(finalOrder);
    await client.close();
    
    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error) {
    console.error("Failed to save order:", error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  } 
}