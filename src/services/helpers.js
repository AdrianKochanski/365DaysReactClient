

const shortHash = (hash) => {
    return hash ? hash.slice(0, 5) + "..." + hash.slice(hash.length-4, hash.length) : "None";
}

const getOwner = (nft, account) =>{
    if(nft.owner.toLowerCase() === account.toLowerCase()) return "You";
    else return shortHash(nft.owner);
}

export {
    getOwner,
    shortHash
};