const identiconLib = require("identicon");

// Asynchronous API
const identiconAsync = (id, size, ref) => {
  if (id == null) return;

  identiconLib.generate({ id, size }, (err, buffer) => {
    if (err) throw err;
    ref.current.src = buffer;
  });
};

// Synchronous API
const identicon = (id, size) => {
  return identiconLib.generateSync({ id, size });
};

export { identicon, identiconAsync };
