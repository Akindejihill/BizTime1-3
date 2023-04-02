const db = require("../db");
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');


router.get('/', async function (req, res, next){
    try{

        const results = await db.query("SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices");
        return res.json({invoices : results.rows});

    } catch (err) {
        return next(err);
    }
});


router.get('/:id', async function (req, res, next){
    try{
        const results = await db.query(
            `SELECT id, amt, paid, add_date, paid_date, comp_code
                FROM invoices 
                WHERE id = $1`,
                [req.params.id]
        );

        if (results.rows.length){
            const cresults = await db.query(`SELECT code, name, description FROM companies 
                                            WHERE code = $1`,
                                            [results.rows[0].comp_code]);
            results.rows[0].company = cresults.rows[0];
            delete results.rows[0].comp_code;
            return res.json({invoice : results.rows[0]});
        }
        else throw new ExpressError("That record does not exist.", 404);

    } catch(err){
        return next(err);
    }
});


router.post('/', async function (req, res, next){

    try{
        const {comp_code, amt, paid, add_date, paid_date} = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt)
                Values ($1, $2)
                RETURNING comp_code, amt, paid, add_date, paid_date`,
                [comp_code, amt]
        );

        return res.status(201).json({invoice: result.rows[0]});
    } catch (err){
        return next(err);
    }
});


router.put('/:id', async function(req, res, next){
    try{
        const id = req.params.id;
        const {amt, paid} = req.body;
        let paidDate = null;

        const currResult = await db.query(
              `SELECT paid
               FROM invoices
               WHERE id = $1`,
            [id]);
    
        if (currResult.rows.length === 0) {
          throw new ExpressError(`No such invoice: ${id}`, 404);
        }
    
        const currPaidDate = currResult.rows[0].paid_date;
    
        if (!currPaidDate && paid) {
          paidDate = new Date();
        } else if (!paid) {
          paidDate = null
        } else {
          paidDate = currPaidDate;
        }
    
        const result = await db.query(
              `UPDATE invoices
               SET amt=$1, paid=$2, paid_date=$3
               WHERE id=$4
               RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]);
    
        return res.json({"invoice": result.rows[0]});
      
    } catch (err){
        return next(err);
    }
});


router.delete('/:id', async function (req, res, next){
    try{

        const id = req.params.id;
        
        const check = await db.query(
            `SELECT id FROM invoices
            WHERE id = $1`,
            [id]
        );

        if (check.rows.length === 0) return res.status(404).json({status : "404 record not found"});

        //return res.status(200);
        const result = await db.query(
            `DELETE FROM invoices
            WHERE id = $1`,
            [id]   
        )

        return res.status(200).json({status : "deleted"});

    } catch (err){
        return next(err);
    }
});




module.exports = router;