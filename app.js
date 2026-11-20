import { MongoClient, ObjectId } from "mongodb";

// Connection String
// connectionstring can be copied from Mongo Compass
const uri = "";

// Object that works with the database
const client = new MongoClient(uri, {
    // Connection timeout if db was never found
    serverSelectionTimeoutMS : 5000,
    connectTimeoutMS: 5000
});

// Async Method - A Blocking Operation:
// needs await
const connect = async () => {
    let connection;

    try{
        connection = await client.connect();
        console.log('Connection established');
    } catch (error) {
        console.log(error.message);
    } finally {
        if(!!connection){
            connection.close();
            console.log('Connection Closed');
        } else {
            console.log('Connection was never created');
        }
    }
}

const insertStudent = async (student) => {
    // Getting our database:
    // -Database will be created if it does not exist-
    const db = client.db('nbcc');
    
    // Gets our collection or creates if not exist
    const studentsCollection = db.collection('students');

    // Insert a student document
    const result = await studentsCollection.insertOne(student);

    if(!!result){
        console.log(`Student created with Id: ${result.insertedId}`);
    }
}

const insertStudents = async (students) => {
    const db = client.db('nbcc');
    const studentsCollection = db.collection('students');

    const results = await studentsCollection.insertMany(students);
    
    console.log(`Created ${results.insertedCount} students`);
}

const getStudents = async () => {
    const db = client.db('nbcc');
    const col = db.collection('students');
    
    // find to query documents
    // find take an object that is used as a filter "where" clause
    // the .toArray() call will convert docs to objects
    const studentList = await col.find().toArray();

    for(const student of studentList){
        console.log(student.firstName,
            student.lastName,
            student._id
        );
    }
}

const getStudent = async (id) => {
    const db = client.db('nbcc');
    const col = db.collection('students');
    const query = {
        _id: id
    }

    const result = await col.findOne(query);

    return result;
}

const updateStudent = async (student) => {
    const db = client.db('nbcc');
    const col = db.collection('students');
    const query = {
        _id:student._id
    }

    const studentUpdate = {
        $set: student
    }

    await col.updateOne(query, studentUpdate)
}

const deleteStudent = async (id) => {
    const db = client.db('nbcc');
    const col = db.collection('students');
    const query = {
        _id: id
    }
    const result = await col.deleteOne(query);
    console.log(`Deleted count: ${result.deletedCount}`);
    
}

const main = async() => {
    try {
        // console.log('Run our connection tester');
        // await connect();
        // console.log('Connection test completed');

        /*
        await insertStudent({
            firstName: 'Bruce',
            lastName: 'Wayne'
        });

        await insertStudent({
            firstName: 'Jane',
            lastName: 'Rogers',
            middleInitial: 'A'
        })
        */
        /*
        await insertStudents([
            {
                firstName: 'Bruce',
                lastName: 'Wayne'
            },
            {
                firstName: 'Jane',
                lastName: 'Rogers',
                middleInitial: 'A'
            }
        ]);
        */

        await getStudents();

        const id = new ObjectId(""); //id can be taken in mongo compass
        const student = await getStudent(id);

        if(!!student) {
            console.log(`Found student ${student.firstName} ${student.lastName}`);

            student.firstName = 'Kathleen';

            await updateStudent(student);

            let updatedStudent = await getStudent(student._id);
            console.log(updatedStudent);

            await deleteStudent(student._id);
            await getStudents();
            
        } else {
            console.log(`Student not found for id: ${id.toString()}`);
        }

        if(!!client){
            client.close();
        }
    } catch (error) {
        console.log(error.message);
    }
}

await main();