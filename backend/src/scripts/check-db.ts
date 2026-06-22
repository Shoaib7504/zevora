import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('No MONGODB_URI'); process.exit(1); }

  // Connect WITHOUT a database name to see all databases
  const baseUri = uri.replace(/\/[^/?]+\?/, '/?');
  await mongoose.connect(baseUri);
  const db = mongoose.connection.db!;
  
  console.log('\n=== AVAILABLE DATABASES ===');
  const dbs = await db.admin().listDatabases();
  for (const d of dbs.databases) {
    console.log(` • ${d.name}`);
    // List collections in each database
    const tempDb = db.client.db(d.name);
    const cols = await tempDb.listCollections().toArray();
    for (const col of cols) {
      const count = await tempDb.collection(col.name).countDocuments();
      console.log(`     └─ ${col.name}  (${count} documents)`);
    }
  }
  
  process.exit(0);
}

checkDB().catch(e => { console.error(e); process.exit(1); });
