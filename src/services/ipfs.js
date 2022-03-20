const IPFS = require('ipfs-api');

const ipfs = new IPFS(process.env.REACT_APP_IPFS_CONNECT_URL, {protocol: 'https'});

export default ipfs;