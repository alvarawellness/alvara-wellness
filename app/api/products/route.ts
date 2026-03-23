import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  // Put your real password in this string:
 const uri = process.env.MONGODB_URI as string;
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('alvara');
    const collection = database.collection('products');
    
    const products = await collection.find({}).toArray();
    await client.close();
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  } 
}