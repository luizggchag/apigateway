const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')

var http = require('http');
const httpProxy = require('express-http-proxy')
const helmet = require('helmet');

require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(helmet());

/**
 * 
 */

function verificaJWT(request, response, next) {
    const token = request.headers['x-access-token'];
    if (!token) {
        return response.status(401).json({ auth: false, message: 'Sem token!' });
    }

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            console.log(err);
            return response.status(500).json({ auth: false, message: 'Erro ao autenticar o token.' });
        }

        console.log(decoded);
        // request.userId = decoded.id;
        next();
    });
}

const login = (request, response, next) => {
    const { login, senha } = request.body;
    console.log(login, senha);

    pool.query('SELECT * FROM usuarios where login=$1 and senha=$2',
        [login, senha], (error, results) => {

            if (error || results.rowCount == 0) {
                return response.status(400).json({ auth: false, message: 'Login inválido' });
            } else {
                const userName = results.rows[0].login;

                const token = jwt.sign({ userName }, process.env.SECRET, {
                    expiresIn: 600 // expira em 10 min
                })

                return response.json({ auth: true, token: token })
            }
        },
    );
}

app.route("/login").post(login)

const ola = (request, response, next) => {
    response.status(200).json("TESTE");
}

app.route("/ola").get(verificaJWT, ola)


/**
 * 
 */

// const disciplinasServiceProxy = httpProxy('http://localhost:3002');
const disciplinasServiceProxy = httpProxy('disciplinas-api.herokuapp.com');

// const tarefasServiceProxy = httpProxy('http://localhost:3003');
const tarefasServiceProxy = httpProxy('tarefas-4pi.herokuapp.com');

app.all('/disciplinas(/*)?', verificaJWT, disciplinasServiceProxy);
app.all('/tarefas(/*)?', verificaJWT, tarefasServiceProxy);

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);