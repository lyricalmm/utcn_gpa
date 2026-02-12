const UNIVERSITY_DATA = {
    universities: [
        {
            id: 'utcn',
            name: 'Universitatea Tehnică din Cluj-Napoca',
            faculties: [
                {
                    id: 'iirmp',
                    name: 'Inginerie Industrială, Robotică și Managementul Producției',
                    specializations: [
                        {
                            id: 'robotica',
                            name: 'Robotică',
                            years: {
                                1: {
                                    1: [
                                        { name: 'Analiză Matematică', credits: 5 },
                                        { name: 'Algebră Liniară, Geometrie Analitică', credits: 5 },
                                        { name: 'Fizică', credits: 4 },
                                        { name: 'Chimie', credits: 4 },
                                        { name: 'Geometrie Descriptivă', credits: 4 },
                                        { name: 'Programarea Calculatoarelor I', credits: 5 },
                                        { name: 'Știința și Ingineria Materialelor I', credits: 4 },
                                        { name: 'Limbi Moderne I', credits: 2 },
                                        { name: 'Educație Fizică I', credits: 1 }
                                    ],
                                    2: [
                                        { name: 'Matematici Speciale', credits: 5 },
                                        { name: 'Mecanică I', credits: 5 },
                                        { name: 'Electrotehnică', credits: 5 },
                                        { name: 'Programarea Calculatoarelor II', credits: 4 },
                                        { name: 'Desen Tehnic și Infografică', credits: 4 },
                                        { name: 'Știința și Ingineria Materialelor II', credits: 4 },
                                        { name: 'Bazele Roboticii', credits: 4 },
                                        { name: 'Comunicare', credits: 2 },
                                        { name: 'Limbi Moderne II', credits: 2 },
                                        { name: 'Educație Fizică II', credits: 1 }
                                    ]
                                },
                                2: {
                                    1: [
                                        { name: 'Rezistența Materialelor I', credits: 5 },
                                        { name: 'Mecanică II', credits: 4 },
                                        { name: 'Bazele Sistemelor Automate', credits: 5 },
                                        { name: 'Toleranțe și Control Dimensional', credits: 4 },
                                        { name: 'Grafică Asistată de Calculator', credits: 4 },
                                        { name: 'Electronică și Automatizări', credits: 4 },
                                        { name: 'Management Industrial', credits: 2 },
                                        { name: 'Limbi Moderne III', credits: 2 }
                                    ],
                                    2: [
                                        { name: 'Mecanisme I', credits: 5 },
                                        { name: 'Mecanica Fluidelor', credits: 4 },
                                        { name: 'Electronică Aplicată pt Robotică', credits: 4 },
                                        { name: 'Acționarea Electrică a Roboților', credits: 5 },
                                        { name: 'Sisteme de Conducere în Robotică', credits: 4 },
                                        { name: 'Proiectare Asistată de Calculator I', credits: 4 },
                                        { name: 'Limbi Moderne Aplicată', credits: 2 },
                                        { name: 'Practică de Domeniu II', credits: 2 }
                                    ]
                                },
                                3: {
                                    1: [
                                        { name: 'Mecanisme II', credits: 5 },
                                        { name: 'Mașini Unelte și Echipamente', credits: 4 },
                                        { name: 'Tehnologii de Fabricație I', credits: 4 },
                                        { name: 'Sisteme de Achiziție Date', credits: 4 },
                                        { name: 'Proiectare Asistată de Calculator II', credits: 4 },
                                        { name: 'Programare în Java', credits: 4 },
                                        { name: 'Senzori și Sisteme Senzoriale', credits: 5 }
                                    ],
                                    2: [
                                        { name: 'Mecanica Roboților', credits: 5 },
                                        { name: 'Tehnologii de Fabricație II', credits: 4 },
                                        { name: 'Sisteme de Fabricație Flexibile I', credits: 4 },
                                        { name: 'Prelucrarea Datelor Experimentale', credits: 3 },
                                        { name: 'Viziune Artificială în Robotică', credits: 4 },
                                        { name: 'Comanda Numerică a Mașinilor Unelte', credits: 4 },
                                        { name: 'Sisteme Avansate de Comanda', credits: 5 }
                                    ]
                                },
                                4: {
                                    1: [
                                        { name: 'Sisteme CAD-CAE-CAM', credits: 4 },
                                        { name: 'Constructia Mecanică a Roboților II', credits: 5 },
                                        { name: 'Comanda și Programarea MUCN', credits: 4 },
                                        { name: 'Robotizarea Fabricației II', credits: 5 },
                                        { name: 'Roboți pentru Servicii I', credits: 4 },
                                        { name: 'Sisteme Flexibile de Fabricație II', credits: 4 },
                                        { name: 'Interfețe Om-Robot', credits: 4 }
                                    ],
                                    2: [
                                        { name: 'Elaborarea Proiectului de Diplomă', credits: 10 },
                                        { name: 'Practica pentru Proiectul de Diplomă', credits: 10 },
                                        { name: 'Etică și Integritate', credits: 2 },
                                        { name: 'Managementul Proiectelor', credits: 3 }
                                    ]
                                }
                            }
                        },
                        {
                            id: 'im',
                            name: 'Inginerie Managerială',
                            years: {
                                1: {
                                    1: [
                                        { name: 'Analiză Matematică', credits: 5 },
                                        { name: 'Chimie', credits: 4 },
                                        { name: 'Informatică Aplicată', credits: 5 },
                                        { name: 'Comunicare', credits: 2 }
                                    ],
                                    2: [
                                        { name: 'Matematici Speciale', credits: 5 },
                                        { name: 'Fizică', credits: 4 },
                                        { name: 'Bazele Managementului', credits: 5 }
                                    ]
                                }
                            }
                        },
                        {
                            id: 'tcm_en',
                            name: 'TCM (Engleză)',
                            years: {
                                4: {
                                    1: [
                                        { name: 'Tehnologii de prelucrare prin aschiere II', credits: 5 },
                                        { name: 'Tehnologii de prelucrare prin deformare plastica la rece', credits: 5 },
                                        { name: 'Proiectarea dispozitivelor', credits: 6 },
                                        { name: 'Tehnologii de prelucrare pe MUCN', credits: 4 },
                                        { name: 'Tehnologii de asamblare', credits: 4 },
                                        { name: 'Fabricatie asistata de calculator - sisteme CAM', credits: 3 },
                                        { name: 'Automatizarea proceselor tehnologice de prelucrare', credits: 3 }
                                    ],
                                    2: [
                                        { name: 'Ingineria fabricatiei', credits: 4 },
                                        { name: 'Ingineria fabricatiei - proiect', credits: 2 },
                                        { name: 'Fabricarea pieselor din mase plastice si compozite', credits: 3 },
                                        { name: 'Tehnologii si sisteme flexibile de fabricatie', credits: 4 },
                                        { name: 'Ingineria sistemelor de productie', credits: 3 },
                                        { name: 'Tehnologii criogenice', credits: 3 },
                                        { name: 'Programare CNC', credits: 3 },
                                        { name: 'Elaborarea proiectului de diploma', credits: 4 },
                                        { name: 'Practica pentru proiectul de diploma', credits: 4 }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
