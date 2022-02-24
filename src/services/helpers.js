

const shortHash = (hash) => {
    return hash ? hash.slice(0, 5) + "..." + hash.slice(hash.length-4, hash.length) : "None";
}

const getOwner = (nft, account, showFull) =>{
    if(nft.owner.toLowerCase() === account.toLowerCase())
        return "You";
    else if(showFull)
        return nft.owner;
    else
        return shortHash(nft.owner);
}

const previewImage = (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFile(file);
    }
}

function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
}

const getIpfsLink = (hash, filenmae) => {
    return `${process.env.REACT_APP_IPFS_ADDRESS}${hash}?filename=${filenmae}`;
}

const getBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(Buffer.from(reader.result));
      reader.onerror = error => reject(error);
    });
}

const getBufferFromJson = (fileJson) => {
    let json = JSON.stringify(fileJson);
    const blob = new Blob([json], {type:"application/json"});

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onload = () => resolve(Buffer.from(reader.result));
      reader.onerror = error => reject(error);
    });
}

export {
    getOwner,
    shortHash,
    getIpfsLink,
    getBuffer,
    getBufferFromJson,
    previewImage
};