const dev = process.env.NODE_ENV === `development`;
const stargate =
  process.env.STARGATE ||
  (dev
    ? `https://lcd.kava-testnet-3000.bas.network`
    : `https://lcd.kava-testnet-3000.bas.network`);

const rpc =
  process.env.RPC ||
  (dev
    ? `https://rpc.kava-testnet-3000.bas.network`
    : `https://rpc.kava-testnet-3000.bas.network`);

const dbUri = `mongodb://localhost:27017/kava?replicaSet=replica01`;

const prefix = {
  bech32PrefixAccAddr: "kava", // Bech32PrefixAccAddr defines the Bech32 prefix of an account's address
  bech32PrefixAccPub: "kavapub", // Bech32PrefixAccPub defines the Bech32 prefix of an account's public key
  bech32PrefixValAddr: "kavavaloper", // Bech32PrefixValAddr defines the Bech32 prefix of a validator's operator address
  bech32PrefixValPub: "kavavaloperpub", // Bech32PrefixValPub defines the Bech32 prefix of a validator's operator public key
  bech32PrefixConsAddr: "kavavalcons", // Bech32PrefixConsAddr defines the Bech32 prefix of a consensus node address
  bech32PrefixConsPub: "kavavalconspub" // Bech32PrefixConsPub defines the Bech32 prefix of a consensus node public key
};

export default {
  development: dev,
  network: process.env.NETWORK || `kava-testnet-3000`,
  stargate,
  rpc,
  dbUri,
  enableGraphiQl: true,
  prefix
};
