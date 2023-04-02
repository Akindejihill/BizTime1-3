\c biztime

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
