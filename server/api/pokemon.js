const Router = require('express').Router();
const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const pokemonDb = path.resolve(__dirname, '../../assets/pokemon_db.json');
const baseUrl = 'https://pokeapi.co/api/v2';
const filename = 'server/api/pokemon.js';

const GeneralHelper = require('../helpers/generalHelper');
const ValidationHelper = require('../helpers/validationHelper');

const getPokemonList = async ( req, res ) => {
    try {
        const url = '/pokemon'
        const response = await axios.get(`${baseUrl}${url}`);
        const pokemonList = response.data.results.map(pokemon => {
            return {
                name: pokemon.name,
                url: pokemon.url,
                nickname: pokemon.name
            }
        });

        const rawData = fs.readFileSync(pokemonDb);
        const data = JSON.parse(rawData);

        data.list.push(pokemonList);

        fs.writeFileSync(pokemonDb, JSON.stringify(data));

        return res.status(200).json({ status: "Success get pokemon list", results: pokemonList});
    } catch (error) {
        console.log([filename, 'list', 'ERROR'], { info: `${error}`});
        return res.send(GeneralHelper.errorResponse(error));
    };
};

const getPokemonDetail = async ( req, res ) => {
    try {
        const getParams = req.params["name"];
        const response = await axios.get(`${baseUrl}/pokemon/${getParams}`);
        return res.status(200).json({ status: "Success get pokemon list", results: response.data});
    } catch (error) {
        console.log([filename, 'detail', 'ERROR'], { info: error});
        return res.send(GeneralHelper.errorResponse(error));
    };
};

const catchPokemon = async ( req, res ) => {
    try {
        const getParams = req.params["name"];

        const rawData = fs.readFileSync(pokemonDb);
        const data = JSON.parse(rawData);

        var last = data.catch.length;
        console.log(last)

        const response = await axios.get(`${baseUrl}/pokemon/${getParams}`);
        console.log(response.data.name, 'name');

        const rand = Math.random()

        const probability = rand < 0.5;

        if(probability) {
            const pokemonData = {
                id: last + 1,
                name: response.data.name,
                nickname: response.data.name
            };  

            data.catch.push(pokemonData);

            fs.writeFileSync(pokemonDb, JSON.stringify(data));

            return res.status(200).json({ status: `Success catch ${response.data.name}`,  pokemon: pokemonData, probability: rand});
        } else {
            return res.status(200).json({ status: `Failed catch ${response.data.name}`, probability: rand});
        }
    } catch (error) {
        console.log([filename, 'catch', 'ERROR'], { info: error});
        return res.send(GeneralHelper.errorResponse(error));
    }
}

const getPokemonDb = async ( req, res ) => {
    try {
        fs.readFile(pokemonDb, (error, data) => {
            if (error) {
                console.log(error);

                throw error;
            }
            const pokemon = JSON.parse(data);

            return res.status(200).json({ status: "Success get pokemon list db json", results: pokemon});
        })
    } catch (error) {
        console.log([filename, 'list-db', 'ERROR'], { info: `${error}`});
        return res.send(GeneralHelper.errorResponse(error));
    };
};

function isPrime(number) {
    if ( number <= 1 ) {
        return false;
    };

    for(let i = 2; i < Math.sqrt(number); i++) {
        if ( number % i === 0 ) {
            return false;
        };
    };

    return true;
}

const releasePokemon = async ( req, res ) => {
    try {
        const getId = parseInt(req.params["id"]);

        const rawData = fs.readFileSync(pokemonDb);
        const data = JSON.parse(rawData);

        const pokemonToDelete = _.filter(data.catch, (pokemon) => pokemon.id === getId);

        if(_.isEmpty(pokemonToDelete)) {
            return res.status(404).json({ status: "Cant find that pokemon!" });
        }

        const rand = Math.floor(Math.random() * 100);

        const primeNUmber = isPrime(rand);

        if (primeNUmber) {
            data.catch.splice(pokemonToDelete.id - 1, 1);

            fs.writeFileSync(pokemonDb, JSON.stringify(data));

            return res.status(200).json({ status: "Success release pokemon!", number: rand });
        } else {
            return res.status(200).json({ status: "Release pokemon failed!", number: rand });
        }
    } catch (error) {
        console.log([filename, 'release', 'ERROR'], { info: `${error}`});
        return res.send(GeneralHelper.errorResponse(error));
    };
};

function fibonacci(num) {
    let sequence = [];
    let n1 = 0,
    n2 = 1,
    nextTerm;

    for (let i = 0; i <= num; i++) {
        // console.log(n1);
        sequence.push(n1);
        nextTerm = n1 + n2;
        n1 = n2;
        n2 = nextTerm;
    }

    return sequence[num];
}

const renamePokemon = async ( req, res ) => {
    try {
        const getId = parseInt(req.params['id']);
        const getNickname = req.body.nickname;

        const rawData = fs.readFileSync(pokemonDb);
        const data = JSON.parse(rawData);

        const pokemonData = _.filter(data.catch, (pokemon) => pokemon.id === getId);

        if(_.isEmpty(pokemonData)) {
            return res.status(404).json({ status: "Cant find that pokemon!" });
        }

        const exceptTarget = data?.catch.filter((pokemon) => {
            return pokemon.id !== getId;
          });
        
          const sameNickname = exceptTarget.reduce((result, pokemon) => {
            if (pokemon.nickname.includes(getNickname)) {
              result.push(pokemon);
            }
            return result;
          }, []);

          const countSame = sameNickname.length;

          const lastSeq = fibonacci(countSame);

          pokemonData[0].nickname = `${getNickname}-${lastSeq}`;

        fs.writeFileSync(pokemonDb, JSON.stringify(data));
        return res.status(200).json({ status: "Rename pokemon success!", pokemon: pokemonData });
    } catch (error) {
        console.log([filename, 'rename', 'ERROR'], { info: error} );
        return res.send(GeneralHelper.errorResponse(error));
    }
}

Router.get('/list', getPokemonList);
Router.get('/detail/:name', getPokemonDetail);
Router.get('/catch/:name', catchPokemon);
Router.get('/list-db', getPokemonDb);
Router.delete('/release/:id', releasePokemon);
Router.put('/rename/:id', renamePokemon);

module.exports = Router;