const express = require('express');
const mysql = require('mysql2');
const morgan = require('morgan');
const logger = require('./logger');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');


const app = express();
const PORT = 3000;
const fechaActual = new Date();
const fechaYhora = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth()+1)).slice(-2)}-${('0' + fechaActual.getDate()).slice(-2)} ${('0' + fechaActual.getHours()).slice(-2)}:${('0' + fechaActual.getMinutes()).slice(-2)}:${('0' + fechaActual.getSeconds()).slice(-2)}`;


// Crea un pool de conexiones
const db = mysql.createPool({
    host: 'localhost',
    user: 'usuario',
    password: 'password',
    database: 'database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.set('trust proxy', true);
app.use(
    morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: (message) => {
          logger.info(message.trim());
        },
      },
    })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
function hashString(inputString) {
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
}

app.use(cors());

//registrar usuario
app.post('/register', (req, res) => {
    const { username, pass, email } = req.body;
    //cifrar password
    const password = hashString(pass);
    db.query(`INSERT INTO users (username, password, email, status) VALUES (?, ?, ?, ?)`, [username, password, email, 'A'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.error('El email ya existe:', err);
                res.status(409).send('El email ya existe');
            } else {
                console.error('Error registrando usuario:', err);
                res.status(500).send('Error registrando usuario');
            }
        } else {
            console.log(`Usuario registrado [${username}] ${fechaYhora}`);
            res.status(200).send('Usuario registrado');
        }
    });
});
//login usuario
app.post('/login', (req, res) => {
    const { email, pass } = req.body;
    const password = hashString(pass);
    db.query(`SELECT * FROM users WHERE email = ? AND password = ? AND status = 'A'`, [email, password], (err, result) => {
        if (err) {
            console.error('Error iniciando usuario:', err);
            res.status(500).send('Error iniciando usuario');
        } else {
            if (result.length > 0) {
                console.log(`Usuario iniciado [${email}] ${fechaYhora}`);
                res.json(result[0]);
            } else {
                console.log(`Usuario no encontrado [${email}] ${fechaYhora}`);
                res.status(404).send('Usuario no encontrado');
            }
        }
    });
});

//conectar a tabla de apis
app.get('/', (req, res) => {
    db.query('SELECT * FROM apis', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [apis] ${fechaYhora}`);
          res.json(results);
      }
    });
});
//conectar a tabla abilityscores
app.get('/abilityscores', (req, res) => {
    db.query('SELECT id, fullName FROM abilityscores', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [abilityscores] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una abilityscore específica por ID
app.get('/abilityscores/:id', (req, res) => {
    const abilityscore = req.params.id;
  
    db.query('SELECT * FROM abilityscores WHERE id = ?', [abilityscore], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ message: 'caracteristica no encontrada' });
      }
    });
});
//conectar a tabla actions
app.get('/actions', (req, res) => {
    db.query('SELECT id, name FROM actions', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [actions] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una action específica por ID
app.get('/actions/:id', (req, res) => {
    const actionId = req.params.id;
  
    db.query('SELECT * FROM actions WHERE id = ?', [actionId], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ message: 'accion no encontrada' });
      }
    });
  });
//conectar a tabla alignments
app.get('/alignments', (req, res) => {
    db.query('SELECT id, name FROM alignments', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [alignments] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una alignment específica por ID
app.get('/alignments/:id', (req, res) => {
    const alignmentId = req.params.id;

    db.query('SELECT * FROM alignments WHERE id = ?', [alignmentId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'alineamiento no encontrado' });
        }
    });
});
//conectar a tabla backgrounds
app.get('/backgrounds', (req, res) => {
    db.query('SELECT id, name FROM backgrounds', (err, results) => {
    if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    } else {
        console.log(`Conectado a la base de datos [backgrounds] ${fechaYhora}`);
        res.json(results);
    }
    });
});
// Ruta para obtener una background específica por ID
app.get('/backgrounds/:id', (req, res) => {
    const backgroundId = req.params.id;

    db.query('SELECT * FROM backgrounds WHERE id = ?', [backgroundId], (err, results) => {
        if (err) throw err;
        
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'trasfondo no encontrado' });
        }
    });
});
//conectar a tabla bestiary
app.get('/bestiary', (req, res) => {
    db.query('SELECT id, name FROM bestiary', (err, results) => {
        if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
        } else {
            console.log(`Conectado a la base de datos [bestiary] ${fechaYhora}`);
            res.json(results);
        }
    });
});
// Ruta para obtener una bestiary específica por ID
app.get('/bestiary/:id', (req, res) => {
    const bestiaryId = req.params.id;

    db.query('SELECT * FROM bestiary WHERE id = ?', [bestiaryId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'monstruo no encontrado' });
        }
    });
});
//conectar a tabla boons
app.get('/boons', (req, res) => {
    db.query('SELECT id, name FROM boons', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [boons] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una boons específica por ID
app.get('/boons/:id', (req, res) => {
    const boonId = req.params.id;

    db.query('SELECT * FROM boons WHERE id = ?', [boonId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'bendicion no encontrado' });
        }
    });
});
//conectar a tabla class
app.get('/class', (req, res) => {
    db.query('SELECT id, name FROM class', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [class] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una class específica por ID
app.get('/class/:id', (req, res) => {
    const classId = req.params.id;

    db.query('SELECT * FROM class WHERE id = ?', [classId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'clase no encontrado' });
        }
    });
});
//conectar a tabla conditionsdiseases
app.get('/conditionsdiseases', (req, res) => {
    db.query('SELECT id, name FROM conditionsdiseases', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [conditionsdiseases] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una conditionsdiseases específica por ID
app.get('/conditionsdiseases/:id', (req, res) => {
    const conDisId = req.params.id;

    db.query('SELECT * FROM conditionsdiseases WHERE id = ?', [conDisId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'condicion o enfermedad no encontrada' });
        }
    });
});
//conectar a tabla cults
app.get('/cults', (req, res) => {
    db.query('SELECT id, name FROM cults', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [cults] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una cults específica por ID
app.get('/cults/:id', (req, res) => {
    const cultId = req.params.id;

    db.query('SELECT * FROM cults WHERE id = ?', [cultId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'culto no encontrada' });
        }
    });
});
//conectar a tabla deities
app.get('/deities', (req, res) => {
    db.query('SELECT id, name FROM deities', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [deities] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una deities específica por ID
app.get('/deities/:id', (req, res) => {
    const deitieId = req.params.id;

    db.query('SELECT * FROM deities WHERE id = ?', [deitieId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'deidad no encontrada' });
        }
    });
});
//conectar a tabla encounters
app.get('/encounters', (req, res) => {
    db.query('SELECT id, name FROM encounters', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [encounters] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una encounters específica por ID
app.get('/encounters/:id', (req, res) => {
    const encounterId = req.params.id;

    db.query('SELECT * FROM encounters WHERE id = ?', [encounterId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'encuentro no encontrado' });
        }
    });
});
//conectar a tabla feats
app.get('/feats', (req, res) => {
    db.query('SELECT id, name FROM feats', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [feats] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una feats específica por ID
app.get('/feats/:id', (req, res) => {
    const featId = req.params.id;

    db.query('SELECT * FROM feats WHERE id = ?', [featId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'dote no encontrado' });
        }
    });
});
//conectar a tabla items
app.get('/items', (req, res) => {
    db.query('SELECT id, name FROM items', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [items] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una items específica por ID
app.get('/items/:id', (req, res) => {
    const itemId = req.params.id;

    db.query('SELECT * FROM items WHERE id = ?', [itemId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'objeto no encontrado' });
        }
    });
});
//conectar a tabla items_base
app.get('/items_base', (req, res) => {
    db.query('SELECT id, name FROM items_base', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [items_base] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una items_base específica por ID
app.get('/items_base/:id', (req, res) => {
    const objetoBaseId = req.params.id;

    db.query('SELECT * FROM items_base WHERE id = ?', [objetoBaseId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'objeto base no encontrado' });
        }
    });
});
//conectar a tabla languages
app.get('/languages', (req, res) => {
    db.query('SELECT id, name FROM languages', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [languages] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una languages específica por ID
app.get('/languages/:id', (req, res) => {
    const languageId = req.params.id;

    db.query('SELECT * FROM languages WHERE id = ?', [languageId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'idioma no encontrado' });
        }
    });
});
//conectar a tabla loot
app.get('/loot', (req, res) => {
    db.query('SELECT * FROM loot', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [loot] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener un campo de loot específica por campo
app.get('/loot/:campo', (req, res) => {
    const lootId = req.params.campo;

    db.query(`SELECT ${lootId} FROM loot limit 1`, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'recompensa no encontrada' });
        }
    });
});
//conectar a tabla magicvariants
app.get('/magicvariants', (req, res) => {
    db.query('SELECT id, name FROM magicvariants', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [magicvariants] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una magicvariants específica por ID
app.get('/magicvariants/:id', (req, res) => {
    const magicvariantId = req.params.id;

    db.query('SELECT * FROM magicvariants WHERE id = ?', [magicvariantId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'variante magica no encontrada' });
        }
    });
});
//conectar a tabla monsterfeatures
app.get('/monsterfeatures', (req, res) => {
    db.query('SELECT id, name FROM monsterfeatures', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [monsterfeatures] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una monsterfeatures específica por ID
app.get('/monsterfeatures/:id', (req, res) => {
    const monsterfeatureId = req.params.id;

    db.query('SELECT * FROM monsterfeatures WHERE id = ?', [monsterfeatureId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'caracteristicas del monstruo no encontrada' });
        }
    });
});
//conectar a tabla names
app.get('/names', (req, res) => {
    db.query('SELECT id, name FROM names', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [names] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una names específica por ID
app.get('/names/:id', (req, res) => {
    const nameId = req.params.id;

    db.query('SELECT * FROM names WHERE id = ?', [nameId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'nombre no encontrado' });
        }
    });
});
//conectar a tabla objects
app.get('/objects', (req, res) => {
    db.query('SELECT id, name FROM objects', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [objects] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una objects específica por ID
app.get('/objects/:id', (req, res) => {
    const objectId = req.params.id;

    db.query('SELECT * FROM objects WHERE id = ?', [objectId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'objeto no encontrado' });
        }
    });
});
//conectar a tabla races
app.get('/races', (req, res) => {
    db.query('SELECT id, name FROM races', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [races] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una races específica por ID
app.get('/races/:id', (req, res) => {
    const raceId = req.params.id;

    db.query('SELECT * FROM races WHERE id = ?', [raceId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'raza no encontrado' });
        }
    });
});
//conectar a tabla senses
app.get('/senses', (req, res) => {
    db.query('SELECT id, name FROM senses', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [senses] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una senses específica por ID
app.get('/senses/:id', (req, res) => {
    const senseId = req.params.id;

    db.query('SELECT * FROM senses WHERE id = ?', [senseId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'sentido no encontrado' });
        }
    });
});
//conectar a tabla skills
app.get('/skills', (req, res) => {
  db.query('SELECT id, name FROM skills', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
        console.log(`Conectado a la base de datos [skills] ${fechaYhora}`);
        res.json(results);
    }
  });
});
// Ruta para obtener una habilidad específica por ID
app.get('/skills/:id', (req, res) => {
    const skillId = req.params.id;
  
    db.query('SELECT * FROM skills WHERE id = ?', [skillId], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ message: 'Habilidad no encontrada' });
      }
    });
});
//conectar a tabla spells
app.get('/spells', (req, res) => {
  db.query('SELECT id, name FROM spells', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
        console.log(`Conectado a la base de datos [spells] ${fechaYhora}`);
        res.json(results);
    }
  });
});
// Ruta para obtener una spells específica por ID
app.get('/spells/:id', (req, res) => {
    const spellId = req.params.id;

    db.query('SELECT * FROM spells WHERE id = ?', [spellId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'hechizo no encontrado' });
        }
    });
});
//conectar a tabla subclass
app.get('/subclass', (req, res) => {
  db.query('SELECT id, name FROM subclass', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
        console.log(`Conectado a la base de datos [subclass] ${fechaYhora}`);
        res.json(results);
    }
  });
});
// Ruta para obtener una subclass específica por ID
app.get('/subclass/:id', (req, res) => {
    const subclassId = req.params.id;

    db.query('SELECT * FROM subclass WHERE id = ?', [subclassId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'sub clase no encontrada' });
        }
    });
});
//conectar a tabla subraces
app.get('/subraces', (req, res) => {
  db.query('SELECT id, name FROM subraces', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
        console.log(`Conectado a la base de datos [subraces] ${fechaYhora}`);
        res.json(results);
    }
  });
});
// Ruta para obtener una subraces específica por ID
app.get('/subraces/:id', (req, res) => {
    const subraceId = req.params.id;

    db.query('SELECT * FROM subraces WHERE id = ?', [subraceId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'sub raza no encontrada' });
        }
    });
});
//conectar a tabla tables
app.get('/tables', (req, res) => {
  db.query('SELECT id, name FROM tables', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
        console.log(`Conectado a la base de datos [tables] ${fechaYhora}`);
        res.json(results);
    }
  });
});
// Ruta para obtener una tables específica por ID
app.get('/tables/:id', (req, res) => {
    const tableId = req.params.id;

    db.query('SELECT * FROM tables WHERE id = ?', [tableId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'tabla no encontrada' });
        }
    });
});
//registrar contenido de usuario
app.post('/usuarioRegistraContenido', (req, res) => {
    const { idSesion, idContenido, tabla } = req.body;
    db.query(`INSERT INTO usuario_registra_${tabla} (idUsuario, idContenido) VALUES (?, ?)`, [idSesion, idContenido], (err, result) => {
        if (err) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.error('El contenido ya ha sido registrado:', err);
                    res.status(409).send('El contenido ya ha sido registrado');
                } else {
                    console.error('Error registrando contenido de usuario:', err);
                    res.status(500).send('Error registrando contenido de usuario');
                }
            }              
        } else {
            console.log(`Usuario registrado contenido de [${idSesion}] ${fechaYhora}`);
            res.status(200).send('Contenido registrado');
        }
    });
});
//registrar contenido de partida
app.post('/partidaRegistraContenido', (req, res) => {
    const { idPartida, idContenido, tabla } = req.body;
    db.query(`INSERT INTO partida_registra_${tabla} (idPartida, idContenido) VALUES (?, ?)`, [idPartida, idContenido], (err, result) => {
        if (err) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.error('El contenido ya ha sido registrado:', err);
                    res.status(409).send('El contenido ya ha sido registrado en esta partida');
                } else {
                    console.error('Error registrando contenido de partida:', err);
                    res.status(500).send('Error registrando contenido de partida');
                }
            }              
        } else {
            console.log(`Partida registrado contenido de [${idPartida}] ${fechaYhora}`);
            res.status(200).send('Contenido registrado');
        }
    });
});

//Filtra el contenido guardado por el usuario
app.post('/usuarioFiltraContenido', (req, res) => {
    const { idSesion, tabla } = req.body;
    if (tabla === 'abilityscores') {
        query = `SELECT ${tabla}.id, ${tabla}.fullName FROM ${tabla} INNER JOIN usuario_registra_${tabla} ON ${tabla}.id = usuario_registra_${tabla}.idContenido WHERE usuario_registra_${tabla}.idUsuario = ?`;
    } else {
        query = `SELECT ${tabla}.id, ${tabla}.name FROM ${tabla} INNER JOIN usuario_registra_${tabla} ON ${tabla}.id = usuario_registra_${tabla}.idContenido WHERE usuario_registra_${tabla}.idUsuario = ?`;
    }
    db.query(query, [idSesion], (err, results) => {
        if (err) {
            console.error('Error filtrando contenido de usuario:', err);
            res.status(500).send('Error filtrando contenido de usuario');
        } else {
            console.log(`Usuario filtrado contenido de [${idSesion}] ${fechaYhora}`);
            res.json(results);
        }
    });
});
//Filtra el contenido guardado por la partida
app.post('/partidaFiltraContenido', (req, res) => {
    const { idPartida, tabla } = req.body;
    if (tabla === 'abilityscores') {
        query = `SELECT ${tabla}.id, ${tabla}.fullName FROM ${tabla} INNER JOIN usuario_registra_${tabla} ON ${tabla}.id = usuario_registra_${tabla}.idContenido WHERE usuario_registra_${tabla}.idPartida = ?`;
    } else {
        query = `SELECT ${tabla}.id, ${tabla}.name FROM ${tabla} INNER JOIN usuario_registra_${tabla} ON ${tabla}.id = usuario_registra_${tabla}.idContenido WHERE usuario_registra_${tabla}.idPartida = ?`;
    }
    db.query(query, [idPartida], (err, results) => {
        if (err) {
            console.error('Error filtrando contenido de partida:', err);
            res.status(500).send('Error filtrando contenido de partida');
        } else {
            console.log(`Partida filtrado contenido de [${idPartida}] ${fechaYhora}`);
            res.json(results);
        }
    });
});

//remueve contenido de usuario
app.post('/usuarioRemueveContenido', (req, res) => {
    const { idSesion, idContenido, tabla } = req.body;
    db.query(`DELETE FROM usuario_registra_${tabla} WHERE idUsuario = ? AND idContenido = ?`, [idSesion, idContenido], (err, result) => {
        if (err) {
            console.error('Error eliminando partida:', err);
            res.status(500).send('Error eliminando partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`Usuario removiendo contenido de [${idSesion}] ${fechaYhora}`);
                res.status(200).send('Contenido removido');
            } else {
                console.log(`No se encontraron registros para eliminar [${idSesion}] ${fechaYhora}`);
                res.status(404).send('No se encontraron registros para eliminar');
            }
        }
    });
});
//remueve contenido de partida
app.post('/partidaRemueveContenido', (req, res) => {
    const { idPartida, idContenido, tabla } = req.body;
    db.query(`DELETE FROM partida_registra_${tabla} WHERE idPartida = ? AND idContenido = ?`, [idPartida, idContenido], (err, result) => {
        if (err) {
            console.error('Error eliminando partida:', err);
            res.status(500).send('Error eliminando partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`Partida removiendo contenido de [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Contenido removido de la partida');
            } else {
                console.log(`No se encontraron registros de esta partida para eliminar [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se encontraron registros de esta partida para eliminar');
            }
        }
    });
});
//crear partida
app.post('/crearPartida', (req, res) => {
    const { nombrePartida, historia } = req.body;
    db.query(`INSERT INTO partidas (name, historia, estado) VALUES (?, ?, ?)`, [nombrePartida, historia, 'activa'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.error('El nombre de partida ya existe:', err);
                res.status(409).send('El nombre de partida ya existe');
            } else {
                console.error('Error registrando partida:', err);
                res.status(500).send('Error registrando partida');
            }
        } else {
            console.log(`Partida registrada [${nombrePartida}] ${fechaYhora}`);
            res.status(200).send('Partida registrada');
        }
    });
});
//crear relacion partida - usuario
app.post('/crearRelasionPartidaUsuario', (req, res) => {
    const { nombrePartida, idUser } = req.body;

    query = `INSERT INTO usuariofiltrapartida (idUser, idPartida, master, creador, estado) VALUES (?, (SELECT id FROM partidas WHERE name = ?), ?, ?, ?)`;
    db.query(query, [idUser, nombrePartida, 1, 1, 'en partida'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.error('La relación ya existe:', err);
                res.status(409).send('La relación ya existe');
            } else {
                console.error('Error registrando relasion partida creador:', err);
                res.status(500).send('Error registrando relasion partida creador');
            }
        } else {
            console.log(`Relasion registrada [${nombrePartida}] ${fechaYhora}`);
            res.status(200).send('Partida relasionada con creador');
        }
    });
});
//conectar a tabla partidas
app.get('/partidas', (req, res) => {
    db.query(`SELECT id, name FROM partidas WHERE estado != 'eliminado'`, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
          console.log(`Conectado a la base de datos [partidas] ${fechaYhora}`);
          res.json(results);
      }
    });
});
// Ruta para obtener una partida específica por ID de usuario para obtener las partidas en las que participa y sus roles
app.post('/partidasAtributosUser', (req, res) => {
    const { idUsuario, idPartida } = req.body;

    query = `SELECT 
    partidas.id AS id_partida,
    partidas.name AS name,
    partidas.historia AS historia,
    usuariofiltrapartida.master,
    usuariofiltrapartida.creador,
    usuariofiltrapartida.estado
    FROM 
        partidas
    LEFT JOIN 
        usuariofiltrapartida ON partidas.id = usuariofiltrapartida.idPartida 
                                AND usuariofiltrapartida.idUser = ?
    WHERE 
        partidas.id = ?
    `;
    db.query(query, [idUsuario, idPartida], (err, results) => {

        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'partida no encontrada' });
        }
    });
});
// Ruta para obtener una lista de usuarios en una partida
app.post('/partidaListaUser', (req, res) => {
    const { idPartida } = req.body;

    query = `SELECT 
    usuariofiltrapartida.idPartida,
    usuariofiltrapartida.master,
    usuariofiltrapartida.estado,
    users.id AS idUsuario,
    users.username AS username
    FROM 
        usuariofiltrapartida
    INNER JOIN 
        users ON usuariofiltrapartida.idUser = users.id
    WHERE 
        usuariofiltrapartida.idPartida = ? 
        AND users.status = 'A'
        AND usuariofiltrapartida.creador = 0
    `;

    db.query(query, [idPartida], (err, results) => {

        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'lista de usuarios en partida no encontrada' });
        }
    });
});
app.post('/JugadorEnPartidaAtributo', (req, res) => {
    const { idUser, idPartida } = req.body;

    query = `SELECT 
    usuariofiltrapartida.idPartida,
    usuariofiltrapartida.master,
    usuariofiltrapartida.estado,
    users.id AS idUsuario,
    users.email AS email,
    users.username AS username
    FROM 
        usuariofiltrapartida
    INNER JOIN 
        users ON usuariofiltrapartida.idUser = users.id
    WHERE 
        usuariofiltrapartida.idUser = ?
        AND usuariofiltrapartida.idPartida = ? 
        AND users.status = 'A'
        AND usuariofiltrapartida.creador = 0
    `;

    db.query(query, [idUser, idPartida], (err, results) => {

        if (err) throw err;

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ message: 'usuario en partida no encontrado' });
        }
    });
});
//Filtra las partidas en las que esta el usuario
app.post('/usuarioFiltraPartida', (req, res) => {
    const { idSesion } = req.body;
    query = `SELECT 
    partidas.id, 
    partidas.name,
    usuariofiltrapartida.master,
    usuariofiltrapartida.creador
    FROM 
        partidas 
    JOIN 
        usuariofiltrapartida ON partidas.id = usuariofiltrapartida.idPartida 
    WHERE usuariofiltrapartida.estado = 'en partida' 
        AND partidas.estado != 'eliminado' 
        AND usuariofiltrapartida.idUser = ?
    `;
    db.query(query, [idSesion], (err, results) => {
        if (err) {
            console.error('Error filtrando contenido de usuario:', err);
            res.status(500).send('Error filtrando contenido de usuario');
        } else {
            console.log(`Usuario filtrado partida de [${idSesion}] ${fechaYhora}`);
            res.json(results);
        }
    });
});
//elimina partida
app.post('/eliminarPartida', (req, res) => {
    const { idPartida } = req.body;
    db.query(`UPDATE partidas SET estado = 'eliminado' WHERE id = ?`, [idPartida], (err, result) => {
        if (err) {
            console.error('Error eliminando partida:', err);
            res.status(500).send('Error eliminando partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`Eliminando partida [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Partida eliminada');
            } else {
                console.log(`No se encontraron registros para eliminar [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se encontraron registros para eliminar');
            }
        }
    });
});
//salir de partida
app.post('/salirDePartida', (req, res) => {
    const { idUsuario, idPartida } = req.body;
    db.query(`DELETE FROM usuariofiltrapartida WHERE idUser = ? AND idPartida = ?`, [idUsuario, idPartida], (err, result) => {
        if (err) {
            console.error('Error saliendo de partida:', err);
            res.status(500).send('Error saliendo de partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`Saliendo de partida [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Saliendo de partida');
            } else {
                console.log(`No se encontraron partidas para salir [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se encontraron partidas para salir');
            }
        }
    });
});
// solicitar unirse a partida
app.post('/solicitarUnirsePartida', (req, res) => {
    const { idUsuario, idPartida } = req.body;
    db.query(`INSERT INTO usuariofiltrapartida (idUser, idPartida, master, creador, estado) VALUES (?, ?, 0, 0, 'pendiente')`, [idUsuario, idPartida], (err, result) => {
        if (err) {
            console.error('Error solicitando unirse a partida:', err);
            res.status(500).send('Error solicitando unirse a partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`Solicitud enviada [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Solicitud enviada');
            } else {
                console.log(`No se encontraron partidas para solicitar [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se encontraron partidas para solicitar');
            }
        }
    });
});

//incorporar jugador en partida
app.post('/incorporarEnPartida', (req, res) => {
    const { idUser, idPartida } = req.body;
    db.query(`UPDATE usuariofiltrapartida SET estado = 'en partida' WHERE idUser = ? AND idPartida = ?`, [idUser, idPartida], (err, result) => {
        if (err) {
            console.error('Error incorporando a partida:', err);
            res.status(500).send('Error eliminando partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`incorporando a partida [${idUser}] [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Jugador incorporado');
            } else {
                console.log(`No se encontraron jugadores para incorporar [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se jugador para incorporar');
            }
        }
    });
});
//expulsar jugador de partida
app.post('/expulsarDePartida', (req, res) => {
    const { idUser, idPartida } = req.body;
    db.query(`UPDATE usuariofiltrapartida SET estado = 'rechazada' WHERE idUser = ? AND idPartida = ?`, [idUser, idPartida], (err, result) => {
        if (err) {
            console.error('Error expulsando de partida:', err);
            res.status(500).send('Error expulsando de partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`Expulsando de la partida [${idUser}] [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Jugador expulsado');
            } else {
                console.log(`No se encontraron jugadores para expulsar [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se encontraron jugadores para expulsar');
            }
        }
    });
});
//convertir jugador en master de partida
app.post('/darMasterPartida', (req, res) => {
    const { idUser, idPartida } = req.body;
    db.query(`UPDATE usuariofiltrapartida SET master = 1 WHERE idUser = ? AND idPartida = ?`, [idUser, idPartida], (err, result) => {
        if (err) {
            console.error('Error convirtiendo en master de la partida:', err);
            res.status(500).send('Error convirtiendo en master de la partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`convirtiendo en master de la partida [${idUser}] [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Jugador convertido en master');
            } else {
                console.log(`No se encontraron jugadores para convertir en master [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se encontraron jugadores para convertir en master');
            }
        }
    });
});
//quitar privilegios master a jugador de partida
app.post('/quitarMasterPartida', (req, res) => {
    const { idUser, idPartida } = req.body;
    db.query(`UPDATE usuariofiltrapartida SET master = 0 WHERE idUser = ? AND idPartida = ?`, [idUser, idPartida], (err, result) => {
        if (err) {
            console.error('Error quitando de master de la partida:', err);
            res.status(500).send('Error quitando de master de la partida');
        } else {
            if (result.affectedRows > 0) {
                console.log(`quitando master de la partida [${idUser}] [${idPartida}] ${fechaYhora}`);
                res.status(200).send('Jugador quitado de master');
            } else {
                console.log(`No se encontraron jugadores para quitar privilegios de master [${idPartida}] ${fechaYhora}`);
                res.status(404).send('No se encontraron jugadores para quitar privilegios de master');
            }
        }
    });
});
//Filtra el contenido guardado por la partida
app.post('/filtrarContenidoPartida', (req, res) => {
    const { tabla, idPartida } = req.body;
    if (tabla === 'abilityscores') {
        // query = `SELECT partida_registra_${tabla}.id as id, partidas.id as idPartidas, partidas.name as nombrePartida, ${tabla}.fullName as fullName FROM ${tabla} INNER JOIN partida_registra_${tabla} ON partidas.id = partida_registra_${tabla}.idPartida WHERE partida_registra_${tabla}.idPartida = ?`;
        query = `SELECT ${tabla}.id, ${tabla}.fullName FROM ${tabla} INNER JOIN partida_registra_${tabla} ON ${tabla}.id = partida_registra_${tabla}.idContenido WHERE partida_registra_${tabla}.idPartida = ?`;
    } else {
        // query = `SELECT partida_registra_${tabla}.id as id, partidas.id as idPartidas, partidas.name as nombrePartida, ${tabla}.name as name FROM ${tabla} INNER JOIN partida_registra_${tabla} ON partidas.id = partida_registra_${tabla}.idPartida WHERE partida_registra_${tabla}.idPartida = ?`;
        query = `SELECT ${tabla}.id, ${tabla}.name FROM ${tabla} INNER JOIN partida_registra_${tabla} ON ${tabla}.id = partida_registra_${tabla}.idContenido WHERE partida_registra_${tabla}.idPartida = ?`;
    }
    db.query(query, [idPartida], (err, results) => {
        if (err) {
            console.error('Error filtrando contenido de partida:', err);
            res.status(500).send('Error filtrando contenido de partida');
        } else {
            console.log(`Usuario filtrado contenido de [${idPartida}] ${fechaYhora}`);
            res.json(results);
        }
    });
});
// Ruta para obtener las partidas de un usuario donde la partida este activa, el idUser sea el mismo que el pasado por parametro y el estado sea en partida
app.post('/partidasAtributosMaster', (req, res) => {
    const { idUsuario } = req.body;

    query = `SELECT 
    partidas.id AS id_partida,
    partidas.name AS name,
    usuariofiltrapartida.master,
    usuariofiltrapartida.estado
    FROM 
        partidas
    LEFT JOIN 
        usuariofiltrapartida ON partidas.id = usuariofiltrapartida.idPartida 
                                AND usuariofiltrapartida.idUser = ?
    WHERE 
        usuariofiltrapartida.estado = 'en partida'
        AND partidas.estado = 'activa'
        AND usuariofiltrapartida.master = 1
    `;
    db.query(query, [idUsuario], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
          } else {
              console.log(`Conectado a la base de datos [subraces] ${fechaYhora}`);
              res.json(results);
          }
    });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
