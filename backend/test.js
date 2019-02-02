const { sv } = require('ca-tools')('./ca-tools');

let clientes = [
    {id: 1, name: 'Felipe'},
    {id: 2, name: 'Antonio'},
]

sv.run('SimpleService', '8001', [ 
    { req: 'GET /clientes', rsp: clientes } ,
    { req: 'GET /clientes/1', rsp: clientes[0] } ,
    { req: 'GET /clientes/2', rsp: clientes[1] } ,
], false);
