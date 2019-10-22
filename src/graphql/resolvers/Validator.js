import * as bech32 from "bech32";
import config from "../../config";
import fetch from "node-fetch";
import { sha256 } from "js-sha256";
import Validator from "../../models/ValidatorModel";
import MissedBlock from "../../models/MissedBlockModel";
import mongoose from "mongoose";

const pubkeyToBech32 = (pubkey, prefix) => {
  // '1624DE6420' is ed25519 pubkey prefix
  let pubkeyAminoPrefix = Buffer.from("1624DE6420", "hex");
  let buffer = Buffer.alloc(37);
  pubkeyAminoPrefix.copy(buffer, 0);
  Buffer.from(pubkey.value, "base64").copy(buffer, pubkeyAminoPrefix.length);
  return bech32.encode(prefix, bech32.toWords(buffer));
};

const bech32PubkeyToAddress = consensus_pubkey => {
  // '1624DE6420' is ed25519 pubkey prefix
  let pubkeyAminoPrefix = Buffer.from("1624DE6420", "hex");
  let buffer = Buffer.from(
    bech32.fromWords(bech32.decode(consensus_pubkey).words)
  );
  let test = buffer.slice(pubkeyAminoPrefix.length).toString("base64");
  return sha256(Buffer.from(test, "base64"))
    .substring(0, 40)
    .toUpperCase();
};

const operatorAddrToAccoutAddr = (operatorAddr, prefix) => {
  const address = bech32.decode(operatorAddr);
  return bech32.encode(prefix, address.words);
};

const getTendermintValidators = () =>
  fetch(`${config.rpc}/validators`)
    .then(res => res.json())
    .then(res => res.result.validators);

const getValidators = () =>
  fetch(`${config.stargate}/staking/validators`)
    .then(res => res.json())
    .then(res => {
      if (res.result) return res.result;
      return res;
    });

const getValidatorsUnbonding = () =>
  fetch(`${config.stargate}/staking/validators?status=unbonding`)
    .then(res => res.json())
    .then(res => {
      if (res.result) return res.result;
      return res;
    });

const getValidator = validatorAddr =>
  fetch(`${config.stargate}/staking/validators/${validatorAddr}`)
    .then(res => res.json())
    .then(res => {
      if (res.result) return res.result;

      return res;
    });

const getDelegations = validatorAddr =>
  fetch(`${config.stargate}/staking/validators/${validatorAddr}/delegations`)
    .then(res => res.json())
    .then(res => {
      if (res.result) return res.result;

      return res;
    });

const getUnbondingDelegations = validatorAddr =>
  fetch(
    `${config.stargate}/staking/validators/${validatorAddr}/unbonding_delegations`
  )
    .then(res => res.json())
    .then(res => {
      if (res.error) throw res.error;

      return res.result;
    });

export default {
  Validator: {
    delegations: async validator => {
      return await getDelegations(validator.operator_address);
    },
    unbonding_delegations: async validator => {
      return await getUnbondingDelegations(validator.operator_address);
    },
    missed_blocks: async validator => {
      return await MissedBlock.find()
        .populate({
          path: "validators",
          match: { address: { $in: validator.address } }
        })
        .where("validators")
        .ne([]);
    }
  },
  Query: {
    allValidators: async (_, args) => {
      const query = {};
      const results = await Validator.paginate(query, {
        page: args.pagination.page,
        limit: args.pagination.limit,
        sort: {
          [args.sort.field]: args.sort.direction
        }
      });
      const tendermintValidators = await getTendermintValidators();
      let docs = results.docs.map(doc => {
        const tendermintData = tendermintValidators.find(
          v => v.address === bech32PubkeyToAddress(doc.consensus_pubkey)
        );

        return { ...doc._doc, ...tendermintData };
      });

      if (args.sort.field === "voting_power" && args.sort.direction === 1) {
        docs = docs.sort((a, b) => a.voting_power - b.voting_power);
      } else if (
        args.sort.field === "voting_power" &&
        args.sort.direction === -1
      ) {
        docs = docs.sort((a, b) => b.voting_power - a.voting_power);
      }

      return {
        docs: docs,
        pageInfo: {
          total: results.total,
          limit: results.limit,
          page: results.page,
          pages: results.pages
        }
      };
    },
    validator: async (root, args, context) => {
      try {
        const tendermintValidators = await getTendermintValidators();
        const validatorDetails = await getValidator(args.operatorAddress);
        const tendermintData = tendermintValidators.find(
          v =>
            v.address ===
            bech32PubkeyToAddress(validatorDetails.consensus_pubkey)
        );

        return {
          ...tendermintData,
          details: validatorDetails
        };
      } catch (err) {
        throw err;
      }
    }
  }
};
