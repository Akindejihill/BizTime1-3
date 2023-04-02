const db = require("../db");
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const slugify = require('slugify');

    router.get("/", async function (req,res,next){
        try{
            const results = await db.query("SELECT code, name FROM industries");
            return res.status(200).json(results.rows);

        } catch (err) {
            return next(err);
        }
    });


    router.post('/', async function (req, res, next){

        try{
            const {name, description} = req.body;
            const code = slugify(name, {lower:true, strict : true, remove : /[aeiou]/g})
            const result = await db.query(`INSERT INTO industries (code, name, description)
                    Values ($1, $2, $3)
                    RETURNING code, name, description`,
                    [code, name, description]
            );

            return res.status(201).json({company: result.rows[0]});
        } catch (err){
            return next(err);
        }
    });


    router.post('/companies', async function (req, res, next){

        try{
            const {company, industry} = req.body;
            const result = await db.query(`INSERT INTO industry_classification (company, industry)
                    Values ($1, $2)
                    RETURNING company, industry`,
                    [company, industry]
            );

            return res.status(201).json({Classification: result.rows[0]});
        } catch (err){
            return next(err);
        }
    });


module.exports = router;