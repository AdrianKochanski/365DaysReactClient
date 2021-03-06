import { ethers } from "ethers";

const shortHash = (hash) => {
  return hash
    ? hash.slice(0, 5) + "..." + hash.slice(hash.length - 4, hash.length)
    : "None";
};

const getOwner = (nft, account, showFull) => {
  if (nft.owner.toLowerCase() === account.toLowerCase()) return "You";
  else if (
    nft.owner.toLowerCase() ===
    process.env.REACT_APP_AUCTIONER_ADDRESS.toLowerCase()
  )
    return "On Auction";
  else if (showFull) return nft.owner;
  else return shortHash(nft.owner);
};

const checkWalletAddress = (wallet, user, showFull) => {
  if (wallet.toLowerCase() === user.toLowerCase()) return "You";
  else if (
    wallet.toLowerCase() ===
    process.env.REACT_APP_AUCTIONER_ADDRESS.toLowerCase()
  )
    return "Auction";
  else if (showFull) return wallet.toLowerCase();
  else return shortHash(wallet.toLowerCase());
};

const getDateFromMiliseconds = (miliseconds) => {
  const date = new Date(miliseconds);
  const monthString = "0" + (date.getMonth() + 1).toString();
  return (
    date.getDate() +
    "." +
    monthString.substring(monthString.length - 2) +
    "." +
    date.getFullYear() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes()
  );
};

const previewImage = (e, setPreview, setFile) => {
  const file = e.target.files[0];
  if (file) {
    setPreview(URL.createObjectURL(file));
    setFile(file);
  }
};

const getIpfsLink = (hash, filenmae) => {
  return `${process.env.REACT_APP_IPFS_ADDRESS}${hash}?filename=${filenmae}`;
};

const getBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(Buffer.from(reader.result));
    reader.onerror = (error) => reject(error);
  });
};

const getBufferFromJson = (fileJson) => {
  let json = JSON.stringify(fileJson);
  const blob = new Blob([json], { type: "application/json" });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onload = () => resolve(Buffer.from(reader.result));
    reader.onerror = (error) => reject(error);
  });
};

const getDefaultNft = (id) => {
  return {
    id: id,
    uri: "",
    name: "",
    description: "",
    image: "",
    location: "",
    temperature: 0,
    owner: ethers.constants.AddressZero,
    isLoading: false,
    wasInit: false,
    auction: getDefaultAuction(id),
  };
};

const getDefaultAuction = (id) => {
  return {
    nftId: id,
    owner: ethers.constants.AddressZero,
    timestamp: 0,
    price: 0,
    winner: ethers.constants.AddressZero,
    isWinner: false,
    isStarted: false,
    isEnded: false,
    isOwner: false,
    totalBid: 0,
    wasInit: false,
  };
};

const getMetadata = (name, description, image, location, temperature) => {
  return {
    name: name,
    description: description,
    image: image,
    attributes: [
      {
        trait_type: "location",
        value: location,
      },
      {
        trait_type: "temperature",
        value: temperature,
      },
    ],
  };
};

export {
  getOwner,
  shortHash,
  getIpfsLink,
  getBuffer,
  getBufferFromJson,
  previewImage,
  getDateFromMiliseconds,
  checkWalletAddress,
  getDefaultAuction,
  getDefaultNft,
  getMetadata,
};
