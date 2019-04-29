/** TypesOfs and Config Tables */
INSERT INTO FilterType
    (id, code, name, description, createdAt, updatedAt)
VALUES
    (DEFAULT, 'VIOLENT_CONTENT', 'Violent Content', 'Violence Content.', NOW(), NOW());

INSERT INTO FilterType
    (id, code, name, description, createdAt, updatedAt)
VALUES
    (DEFAULT, 'SEXUAL_CONTENT', 'Sexual Content', 'Sexual Content.', NOW(), NOW());

INSERT INTO FilterType
    (id, code, name, description, createdAt, updatedAt)
VALUES
    (DEFAULT, 'DRUG_CONTENT', 'Drug & Alcohol Content', 'Drug & Alcohol Content.', NOW(), NOW());

INSERT INTO FilterType
    (id, code, name, description, createdAt, updatedAt)
VALUES
    (DEFAULT, 'OBJECTIONABLE_CONTENT', 'Objectionable Content', 'Objectionable Content.', NOW(), NOW());
