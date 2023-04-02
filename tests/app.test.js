process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app")
const cRoutes = require("../routes/companies");
const iRoutes = require("../routes/invoices");
const db = require("../db")

beforeAll(async () => {
    await db.query(`
    DROP TABLE IF EXISTS industry_classification;
    DROP TABLE IF EXISTS industries;
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS companies;



    CREATE TABLE companies (
        code text PRIMARY KEY,
        name text NOT NULL UNIQUE,
        description text
    );

    CREATE TABLE invoices (
        id serial PRIMARY KEY,
        comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
        amt float NOT NULL,
        paid boolean DEFAULT false NOT NULL,
        add_date date DEFAULT CURRENT_DATE NOT NULL,
        paid_date date,
        CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
    );

    CREATE TABLE industries(
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
    );


    CREATE TABLE industry_classification (
        company text NOT NULL REFERENCES companies ON DELETE CASCADE,
        industry text NOT NULL REFERENCES industries ON DELETE CASCADE,
        PRIMARY KEY (company, industry)
    );

    INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
            ('ibm', 'IBM', 'Big blue.'),
            ('fcbk', 'Face Book', 'Home of Internet trolls');

    INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('apple', 100, false, null),
            ('apple', 200, false, null),
            ('apple', 300, true, '2018-01-01'),
            ('ibm', 400, false, null);

    INSERT INTO industries (code, name)
    VALUES  ('ce', 'consumer electronics' ),
            ('cevr', 'consumer electronics virtual reality' ),
            ('chs', 'computer hardware and software'),
            ('ccda', 'cloud computing and data analytics'),
            ('sm', 'social media'),
            ('sna', 'social network advertising');

    INSERT INTO industry_classification (company, industry)
    VALUES  ('apple', 'ce'),
            ('ibm', 'chs'),
            ('ibm', 'ccda'),
            ('fcbk', 'cevr'),
            ('fcbk', 'sm'),
            ('fcbk', 'sna');
`)
})



afterAll(() => {
     // close db connection
    db.end((err) => {
        if (err) console.error('Error closing connection', err.stack);
    });
});


describe("Company routes", () =>{
    test("Testing Get Companies", async () => {
        const resp = await request(app).get('/companies');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual([{"code": "apple", "name": "Apple Computer"}, {"code": "ibm", "name": "IBM"}, {"code": "fcbk", "name": "Face Book"}]);
    });


    test("Test getting a single company", async () => {
        const resp = await request(app).get('/companies/fcbk');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "company": {
                "code": "fcbk",
                "name": "Face Book",
                "description": "Home of Internet trolls",
                "invoices": []
            }
        });
    })



    test("POST new company", async () => {
        const resp = await request(app).post('/companies')
        .send(
            {"code" : "nf", "name" : "NetFlix", "description" : "Slayer of Blockbuster Video, champion of the people!"}
        );
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            "company": {
                "code": "ntflx",
                "name": "NetFlix",
                "description": "Slayer of Blockbuster Video, champion of the people!"
            }
        });
        
    });


    test("Update company", async () => {
        const resp = await request(app).put("/companies/fcbk").send({"name" : "Facebook", "description" : "Champion of the hoards of internet trolls"});
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "company": {
                "code": "fcbk",
                "name": "Facebook",
                "description": "Champion of the hoards of internet trolls"
            }
        })
    });




});



describe ("Invoice routes", () =>{

    test("Get Invoices", async () => {
        const resp = await request(app).get("/invoices");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "invoices": [
                {
                    "id": 1,
                    "amt": 100,
                    "paid": false,
                    "add_date": expect.any(String),
                    "paid_date": null,
                    "comp_code": "apple"
                },
                {
                    "id": 2,
                    "amt": 200,
                    "paid": false,
                    "add_date": expect.any(String),
                    "paid_date": null,
                    "comp_code": "apple"
                },
                {
                    "id": 3,
                    "amt": 300,
                    "paid": true,
                    "add_date": expect.any(String),
                    "paid_date": expect.any(String),
                    "comp_code": "apple"
                },
                {
                    "id": 4,
                    "amt": 400,
                    "paid": false,
                    "add_date": expect.any(String),
                    "paid_date": null,
                    "comp_code": "ibm"
                }
            ]
        })
    })


    test("Get single invoice", async () => {
        const resp = await request(app).get('/invoices/1');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "invoice": {
                "id": 1,
                "amt": 100,
                "paid": false,
                "add_date": expect.any(String),
                "paid_date": null,
                "company": {
                    "code": "apple",
                    "name": "Apple Computer",
                    "description": "Maker of OSX."
                }
            }
        });
    });


    test("POST a new invoice", async () => {
        const resp = await request(app).post("/invoices").send(
            {"comp_code" : "fcbk", "amt" : 54000000000}
        );
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            "invoice": {
                "comp_code": "fcbk",
                "amt": 54000000000,
                "paid": false,
                "add_date": expect.any(String),
                "paid_date": null
            }
        });
    })


    test("Update invoice", async () => {
        const resp = await request(app).put("/invoices/5").send({"comp_code" : "fcbk", "amt" : 540, "paid" : true, "paid_date" : null});
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "invoice": {
                "id": 5,
                "comp_code": "fcbk",
                "amt": 540,
                "paid": true,
                "add_date": expect.any(String),
                "paid_date": expect.any(String)
            }
        })
    });


});

describe("Testing delete routes", () => {
    test("Delete Invoice", async () => {
        const resp = await request(app).delete("/invoices/5");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "status": "deleted"
        });
    });

    test("Delete Company", async () => {
        const resp = await request(app).delete("/companies/ntflx");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "status": "deleted"
        });
    });
});