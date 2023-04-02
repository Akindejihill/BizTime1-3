const db = require("../db");
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const slugify = require('slugify');

    router.get("/", async function (req,res,next){

        try{

            const results = await db.query("SELECT code, name FROM companies");
            return res.status(200).json(results.rows);

        } catch (err) {
            return next(err);
        }
    });


    router.get('/:code', async function (req, res, next){
        try{
            const results = await db.query(
                `SELECT code, name, description 
                    FROM companies 
                    WHERE code = $1`,
                    [req.params.code]
            );
            
            if (results.rows.length){
                const iresults = await db.query(
                `SELECT id, amt, paid, add_date, paid_date, comp_code
                    FROM invoices 
                    WHERE comp_code = $1`,
                    [req.params.code]
                );

                    results.rows[0].invoices = iresults.rows;

                return res.json({company: results.rows[0]});
            }               
                
            else throw new ExpressError("That record does not exist.", 404);

        } catch(err){
            return next(err);
        }
    });


    router.post('/', async function (req, res, next){

        try{
            const {name, description} = req.body;
            const code = slugify(name, {lower:true, strict : true, remove : /[aeiou]/g})
            const result = await db.query(`INSERT INTO companies (code, name, description)
                    Values ($1, $2, $3)
                    RETURNING code, name, description`,
                    [code, name, description]
            );

            return res.status(201).json({company: result.rows[0]});
        } catch (err){
            return next(err);
        }
    });


    router.put('/:code', async function (req, res, next){
        try{
            const code = req.params.code;
            const {name, description} = req.body;
            const result = await db.query(
                `UPDATE companies 
                SET name = $1, description = $2
                WHERE code = $3
                RETURNING code, name, description`,
                [name, description, code]
            );

            return res.status(200).json({company : result.rows[0]});

        } catch (err){
            return next(err);
        }
    });

    router.delete('/:code', async function (req, res, next){
        try{

            const code = req.params.code;
            
            const check = await db.query(
                `SELECT code FROM companies
                WHERE code = $1`,
                [code]
            );

            if (check.rows.length === 0) return res.status(404).json({status : "404 record not found"});

            //return res.status(200);
            const result = await db.query(
                `DELETE FROM companies
                WHERE code = $1`,
                [code]   
            )

            return res.status(200).json({status : "deleted"});

        } catch (err){
            return next(err);
        }
    });


module.exports = router;