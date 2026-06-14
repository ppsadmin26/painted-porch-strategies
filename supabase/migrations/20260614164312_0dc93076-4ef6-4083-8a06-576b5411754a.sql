UPDATE path_finder_offerings
SET name = 'The Pillars of Lasting Change',
    blurb = 'Culture, operations, and human capacity as one living system. Diagnoses and reinforces the three Pillars: Foundational Architecture, Operational Intelligence, and Human Capacity.'
WHERE offering_key = 'pillarsOfLastingChange';

DELETE FROM path_finder_offerings
WHERE offering_key = 'pillarsReinforcement';